import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { createServer as createViteServer } from 'vite';
import type {
  Category,
  Language,
  LocalizedList,
  LocalizedText,
  Offer,
  Order,
  OrderStatus,
  Product,
  Review,
  SiteSettings,
  TeamApplication,
  TeamApplicationStatus,
} from './src/types.ts';
import {
  UPLOADS_DIR,
  generateApplicationNumber,
  generateId,
  generateOrderNumber,
  readDatabase,
  toAdminDashboard,
  toPublicStorefront,
  updateDatabase,
} from './server/store.ts';
import {
  hashPassword,
  isPasswordConfigured,
  issueAdminToken,
  requireAdmin,
  verifyAdminPassword,
} from './server/auth.ts';
import { mapAiError, runAdminCopywriter, runBeautyConcierge } from './server/ai.ts';

function normalizeLocalizedText(input: unknown, fallback = ''): LocalizedText {
  const obj = (typeof input === 'object' && input !== null ? input : {}) as Partial<LocalizedText>;
  return {
    ar: typeof obj.ar === 'string' ? obj.ar.trim() : fallback,
    tr: typeof obj.tr === 'string' ? obj.tr.trim() : fallback,
    en: typeof obj.en === 'string' ? obj.en.trim() : fallback,
  };
}

function normalizeLocalizedList(input: unknown): LocalizedList {
  const obj = (typeof input === 'object' && input !== null ? input : {}) as Partial<LocalizedList>;
  const cleanArr = (arr: unknown): string[] =>
    Array.isArray(arr)
      ? arr.map((x) => String(x).trim()).filter((x) => x.length > 0)
      : [];
  return {
    ar: cleanArr(obj.ar),
    tr: cleanArr(obj.tr),
    en: cleanArr(obj.en),
  };
}

function sanitizeImageList(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((u) => String(u).trim())
    .filter((u) => u.length > 0 && u.length <= 2000);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `cat-${crypto.randomUUID().slice(0, 6)}`;
}

async function startServer() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await readDatabase();

  const app = express();
  app.use(express.json({ limit: '4mb' }));

  const brandAssetsDir = path.resolve(process.cwd(), 'src/assets/images');
  app.use('/src/assets/images', express.static(brandAssetsDir));
  app.use('/uploads', express.static(UPLOADS_DIR));

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
      const safeExt = allowed.includes(ext) ? ext : '.jpg';
      cb(null, `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${safeExt}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed.'));
      }
    },
  });

  // Public Storefront Read
  app.get('/api/storefront', async (_req, res) => {
    try {
      const db = await readDatabase();
      res.json(toPublicStorefront(db));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to load store.' });
    }
  });

  // Public Order Submission
  app.post('/api/orders', async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const fullName = String(body.fullName || '').trim();
      const phone = String(body.phone || '').trim();
      const country = String(body.country || '').trim();
      const governorate = String(body.governorate || '').trim();
      const city = String(body.city || '').trim();
      const district = String(body.district || '').trim();
      const detailedAddress = String(body.detailedAddress || '').trim();
      const productId = String(body.productId || '').trim();
      const productNameInput = String(body.productName || '').trim();
      const notes = String(body.notes || '').trim();
      const quantityNum = Math.max(1, Math.min(999, Math.floor(Number(body.quantity) || 1)));

      if (
        !fullName ||
        !phone ||
        !country ||
        !governorate ||
        !city ||
        !district ||
        !detailedAddress ||
        (!productId && !productNameInput)
      ) {
        res.status(400).json({ error: 'All required order fields must be filled.' });
        return;
      }

      let createdOrder: Order | null = null;
      await updateDatabase((db) => {
        const matchedProduct = db.products.find((p) => p.id === productId);
        const unitPrice = matchedProduct ? matchedProduct.price : 0;
        const resolvedProductName = matchedProduct
          ? matchedProduct.name.ar || matchedProduct.name.en || matchedProduct.name.tr
          : productNameInput;

        createdOrder = {
          id: generateId('ord'),
          orderNumber: generateOrderNumber(db.orders),
          fullName: fullName.slice(0, 120),
          phone: phone.slice(0, 40),
          country: country.slice(0, 80),
          governorate: governorate.slice(0, 80),
          city: city.slice(0, 80),
          district: district.slice(0, 80),
          detailedAddress: detailedAddress.slice(0, 400),
          productId: matchedProduct ? matchedProduct.id : '',
          productName: resolvedProductName.slice(0, 180),
          unitPrice,
          quantity: quantityNum,
          totalPrice: Number((unitPrice * quantityNum).toFixed(2)),
          notes: notes.slice(0, 600),
          status: 'new',
          createdAt: new Date().toISOString(),
        };

        db.orders.unshift(createdOrder);
        return db;
      });

      res.status(201).json({ order: createdOrder });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Order creation failed.' });
    }
  });

  // Public Newsletter Signup
  app.post('/api/newsletter', async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const rawEmail = String(body.email || '').trim().toLowerCase();
      const langRaw = String(body.language || 'ar');
      const language: Language = langRaw === 'tr' || langRaw === 'en' ? langRaw : 'ar';

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!rawEmail || rawEmail.length > 180 || !emailRegex.test(rawEmail)) {
        res.status(400).json({ error: 'Please provide a valid email address.' });
        return;
      }

      let status: 'subscribed' | 'already_subscribed' = 'subscribed';
      let subscriber: { id: string; email: string; language: Language; subscribedAt: string } | null =
        null;

      await updateDatabase((db) => {
        const existing = db.subscribers.find((s) => s.email === rawEmail);
        if (existing) {
          status = 'already_subscribed';
          subscriber = existing;
          return db;
        }
        subscriber = {
          id: generateId('sub'),
          email: rawEmail,
          language,
          subscribedAt: new Date().toISOString(),
        };
        db.subscribers.unshift(subscriber);
        return db;
      });

      res.status(status === 'subscribed' ? 201 : 200).json({ status, subscriber });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Failed to subscribe to newsletter.',
      });
    }
  });

  // Public Team Application Submission ("انضم معنا بفريق الهام بيوتي")
  app.post('/api/team-applications', async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const fullName = String(body.fullName || '').trim();
      const phone = String(body.phone || '').trim();
      const country = String(body.country || '').trim();
      const city = String(body.city || '').trim();
      const interestArea = String(body.interestArea || '').trim();
      const notes = String(body.notes || '').trim();
      const langRaw = String(body.language || 'ar');
      const language: Language = langRaw === 'tr' || langRaw === 'en' ? langRaw : 'ar';

      if (!fullName || !phone || !country || !city) {
        res.status(400).json({ error: 'Name, phone, country, and city are required.' });
        return;
      }

      let created: TeamApplication | null = null;
      await updateDatabase((db) => {
        created = {
          id: generateId('team'),
          applicationNumber: generateApplicationNumber(db.teamApplications),
          fullName: fullName.slice(0, 120),
          phone: phone.slice(0, 40),
          country: country.slice(0, 80),
          city: city.slice(0, 100),
          interestArea: interestArea.slice(0, 160),
          notes: notes.slice(0, 800),
          language,
          status: 'new',
          createdAt: new Date().toISOString(),
        };
        db.teamApplications.unshift(created);
        return db;
      });

      res.status(201).json({ application: created });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Failed to submit team application.',
      });
    }
  });

  // Public AI Beauty & Fragrance Advisor
  app.post('/api/ai/concierge', async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const message = String(body.message || '').trim();
      const langRaw = String(body.language || 'ar');
      const language: Language = langRaw === 'tr' || langRaw === 'en' ? langRaw : 'ar';
      const history = Array.isArray(body.history)
        ? (body.history as Array<{ role: 'user' | 'assistant'; text: string }>)
        : [];

      if (!message) {
        res.status(400).json({ error: 'Message is required.' });
        return;
      }

      const result = await runBeautyConcierge({
        message: message.slice(0, 1500),
        language,
        history,
      });
      res.json(result);
    } catch (err) {
      const mapped = mapAiError(err);
      res.status(mapped.status).json({ error: mapped.message, code: mapped.code });
    }
  });

  // Admin Auth Routes
  app.get('/api/admin/auth-status', async (_req, res) => {
    try {
      const configured = await isPasswordConfigured();
      res.json({ hasPasswordConfigured: configured });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Auth status error.' });
    }
  });

  app.post('/api/admin/setup-password', async (req, res) => {
    try {
      const configured = await isPasswordConfigured();
      if (configured) {
        res.status(409).json({ error: 'Admin password is already configured.' });
        return;
      }
      const password = String((req.body as { password?: string }).password || '').trim();
      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters.' });
        return;
      }
      await updateDatabase((db) => {
        db.adminPasswordHash = hashPassword(password);
        return db;
      });
      const token = await issueAdminToken();
      res.status(201).json({ token });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Setup failed.' });
    }
  });

  app.post('/api/admin/login', async (req, res) => {
    try {
      const configured = await isPasswordConfigured();
      if (!configured) {
        res.status(409).json({ error: 'No admin password configured yet.' });
        return;
      }
      const password = String((req.body as { password?: string }).password || '');
      const valid = await verifyAdminPassword(password);
      if (!valid) {
        res.status(401).json({ error: 'Incorrect password.' });
        return;
      }
      const token = await issueAdminToken();
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Login failed.' });
    }
  });

  app.post('/api/admin/change-password', requireAdmin, async (req, res) => {
    try {
      const newPassword = String((req.body as { newPassword?: string }).newPassword || '').trim();
      if (newPassword.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters.' });
        return;
      }
      await updateDatabase((db) => {
        db.adminPasswordHash = hashPassword(newPassword);
        return db;
      });
      const token = await issueAdminToken();
      res.json({ token, success: true });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Password change failed.' });
    }
  });

  // Protected Admin Dashboard Snapshot
  app.get('/api/admin/dashboard', requireAdmin, async (_req, res) => {
    try {
      const db = await readDatabase();
      res.json(toAdminDashboard(db));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Dashboard load failed.' });
    }
  });

  // Protected Admin Image Upload
  app.post('/api/admin/upload', requireAdmin, upload.single('image'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'No image file uploaded.' });
      return;
    }
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });

  // Protected Admin AI Copywriter
  app.post('/api/ai/copywriter', requireAdmin, async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const modeRaw = String(body.mode || 'product');
      const mode: 'product' | 'offer' | 'siteText' =
        modeRaw === 'offer' || modeRaw === 'siteText' ? modeRaw : 'product';
      const prompt = String(body.prompt || '').trim();
      const langRaw = String(body.sourceLang || 'ar');
      const sourceLang: Language = langRaw === 'tr' || langRaw === 'en' ? langRaw : 'ar';

      if (!prompt) {
        res.status(400).json({ error: 'Prompt brief is required.' });
        return;
      }

      const generated = await runAdminCopywriter({ mode, prompt: prompt.slice(0, 2000), sourceLang });
      res.json({ generated });
    } catch (err) {
      const mapped = mapAiError(err);
      res.status(mapped.status).json({ error: mapped.message, code: mapped.code });
    }
  });

  // Protected Categories CRUD
  app.post('/api/admin/categories', requireAdmin, async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const name = normalizeLocalizedText(body.name);
      if (!name.ar && !name.tr && !name.en) {
        res.status(400).json({ error: 'Category name is required in at least one language.' });
        return;
      }
      const nextDb = await updateDatabase((db) => {
        const cat: Category = {
          id: generateId('cat'),
          slug: slugify(name.en || name.tr || name.ar),
          name,
          sortOrder: Number(body.sortOrder) || db.categories.length + 1,
        };
        db.categories.push(cat);
        return db;
      });
      res.status(201).json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Category save failed.' });
    }
  });

  app.put('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const body = req.body as Record<string, unknown>;
      const name = normalizeLocalizedText(body.name);
      const nextDb = await updateDatabase((db) => {
        const idx = db.categories.findIndex((c) => c.id === id);
        if (idx === -1) return db;
        db.categories[idx] = {
          ...db.categories[idx],
          name,
          slug: slugify(name.en || name.tr || db.categories[idx].slug),
          sortOrder:
            typeof body.sortOrder === 'number' ? body.sortOrder : db.categories[idx].sortOrder,
        };
        return db;
      });
      res.json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Category update failed.' });
    }
  });

  app.delete('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const nextDb = await updateDatabase((db) => {
        db.categories = db.categories.filter((c) => c.id !== id);
        return db;
      });
      res.json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Category delete failed.' });
    }
  });

  // Protected Products CRUD
  app.post('/api/admin/products', requireAdmin, async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const name = normalizeLocalizedText(body.name);
      if (!name.ar && !name.tr && !name.en) {
        res.status(400).json({ error: 'Product name is required.' });
        return;
      }
      const price = Math.max(0, Number(body.price) || 0);
      const originalRaw =
        body.originalPrice !== null && body.originalPrice !== '' && Number(body.originalPrice) > 0
          ? Number(body.originalPrice)
          : null;
      const originalPrice = originalRaw && originalRaw > price ? originalRaw : null;
      const computedDiscount =
        originalPrice && price < originalPrice
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : Math.max(0, Math.min(99, Math.round(Number(body.discountPercent) || 0)));

      const nextDb = await updateDatabase((db) => {
        const product: Product = {
          id: generateId('prod'),
          categoryId: String(body.categoryId || db.categories[0]?.id || ''),
          images: sanitizeImageList(body.images),
          name,
          description: normalizeLocalizedText(body.description),
          features: normalizeLocalizedList(body.features),
          howToUse: normalizeLocalizedText(body.howToUse),
          price,
          originalPrice,
          discountPercent: computedDiscount,
          isBestSeller: Boolean(body.isBestSeller),
          isLatest: body.isLatest !== undefined ? Boolean(body.isLatest) : true,
          inStock: body.inStock !== undefined ? Boolean(body.inStock) : true,
          createdAt: new Date().toISOString(),
        };
        db.products.unshift(product);
        return db;
      });
      res.status(201).json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Product save failed.' });
    }
  });

  app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const body = req.body as Record<string, unknown>;
      const price = Math.max(0, Number(body.price) || 0);
      const originalRaw =
        body.originalPrice !== null && body.originalPrice !== '' && Number(body.originalPrice) > 0
          ? Number(body.originalPrice)
          : null;
      const originalPrice = originalRaw && originalRaw > price ? originalRaw : null;
      const computedDiscount =
        originalPrice && price < originalPrice
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : Math.max(0, Math.min(99, Math.round(Number(body.discountPercent) || 0)));

      const nextDb = await updateDatabase((db) => {
        const idx = db.products.findIndex((p) => p.id === id);
        if (idx === -1) return db;
        db.products[idx] = {
          ...db.products[idx],
          categoryId: String(body.categoryId || db.products[idx].categoryId),
          images: sanitizeImageList(body.images),
          name: normalizeLocalizedText(body.name),
          description: normalizeLocalizedText(body.description),
          features: normalizeLocalizedList(body.features),
          howToUse: normalizeLocalizedText(body.howToUse),
          price,
          originalPrice,
          discountPercent: computedDiscount,
          isBestSeller: Boolean(body.isBestSeller),
          isLatest: Boolean(body.isLatest),
          inStock: Boolean(body.inStock),
        };
        return db;
      });
      res.json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Product update failed.' });
    }
  });

  app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const nextDb = await updateDatabase((db) => {
        db.products = db.products.filter((p) => p.id !== id);
        return db;
      });
      res.json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Product delete failed.' });
    }
  });

  // Protected Offers CRUD
  app.post('/api/admin/offers', requireAdmin, async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const title = normalizeLocalizedText(body.title);
      if (!title.ar && !title.tr && !title.en) {
        res.status(400).json({ error: 'Offer title is required.' });
        return;
      }
      const nextDb = await updateDatabase((db) => {
        const offer: Offer = {
          id: generateId('off'),
          title,
          description: normalizeLocalizedText(body.description),
          discountLabel: normalizeLocalizedText(body.discountLabel),
          image: String(body.image || '').trim(),
          linkedCategoryId: String(body.linkedCategoryId || '').trim(),
          linkedProductId: String(body.linkedProductId || '').trim(),
          isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
          createdAt: new Date().toISOString(),
        };
        db.offers.unshift(offer);
        return db;
      });
      res.status(201).json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Offer save failed.' });
    }
  });

  app.put('/api/admin/offers/:id', requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const body = req.body as Record<string, unknown>;
      const nextDb = await updateDatabase((db) => {
        const idx = db.offers.findIndex((o) => o.id === id);
        if (idx === -1) return db;
        db.offers[idx] = {
          ...db.offers[idx],
          title: normalizeLocalizedText(body.title),
          description: normalizeLocalizedText(body.description),
          discountLabel: normalizeLocalizedText(body.discountLabel),
          image: String(body.image || '').trim(),
          linkedCategoryId: String(body.linkedCategoryId || '').trim(),
          linkedProductId: String(body.linkedProductId || '').trim(),
          isActive: Boolean(body.isActive),
        };
        return db;
      });
      res.json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Offer update failed.' });
    }
  });

  app.delete('/api/admin/offers/:id', requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const nextDb = await updateDatabase((db) => {
        db.offers = db.offers.filter((o) => o.id !== id);
        return db;
      });
      res.json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Offer delete failed.' });
    }
  });

  // Protected Reviews CRUD
  app.post('/api/admin/reviews', requireAdmin, async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const customerName = String(body.customerName || '').trim();
      const comment = String(body.comment || '').trim();
      const rating = Math.max(1, Math.min(5, Math.round(Number(body.rating) || 5)));

      if (!customerName || !comment) {
        res.status(400).json({ error: 'Customer name and review comment are required.' });
        return;
      }

      const nextDb = await updateDatabase((db) => {
        const review: Review = {
          id: generateId('rev'),
          customerName: customerName.slice(0, 120),
          rating,
          comment: comment.slice(0, 1200),
          isVisible: body.isVisible !== undefined ? Boolean(body.isVisible) : true,
          createdAt: new Date().toISOString(),
        };
        db.reviews.unshift(review);
        return db;
      });
      res.status(201).json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Review save failed.' });
    }
  });

  app.put('/api/admin/reviews/:id', requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const body = req.body as Record<string, unknown>;
      const nextDb = await updateDatabase((db) => {
        const idx = db.reviews.findIndex((r) => r.id === id);
        if (idx === -1) return db;
        db.reviews[idx] = {
          ...db.reviews[idx],
          customerName: String(body.customerName || db.reviews[idx].customerName).trim(),
          rating: Math.max(1, Math.min(5, Math.round(Number(body.rating) || 5))),
          comment: String(body.comment || db.reviews[idx].comment).trim(),
          isVisible: body.isVisible !== undefined ? Boolean(body.isVisible) : db.reviews[idx].isVisible,
        };
        return db;
      });
      res.json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Review update failed.' });
    }
  });

  app.delete('/api/admin/reviews/:id', requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const nextDb = await updateDatabase((db) => {
        db.reviews = db.reviews.filter((r) => r.id !== id);
        return db;
      });
      res.json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Review delete failed.' });
    }
  });

  // Protected Site Settings Update
  app.put('/api/admin/settings', requireAdmin, async (req, res) => {
    try {
      const incoming = req.body as Partial<SiteSettings>;
      const nextDb = await updateDatabase((db) => {
        const prev = db.settings;
        db.settings = {
          ...prev,
          brandName: typeof incoming.brandName === 'string' && incoming.brandName.trim()
            ? incoming.brandName.trim()
            : prev.brandName,
          currencyCode: 'TRY',
          currencySymbol: '₺',
          heroImages: Array.isArray(incoming.heroImages)
            ? sanitizeImageList(incoming.heroImages)
            : prev.heroImages,
          promoBannerImage:
            typeof incoming.promoBannerImage === 'string'
              ? incoming.promoBannerImage.trim()
              : prev.promoBannerImage,
          whyUsImage:
            typeof incoming.whyUsImage === 'string'
              ? incoming.whyUsImage.trim()
              : prev.whyUsImage,
          tiktokImage:
            typeof incoming.tiktokImage === 'string'
              ? incoming.tiktokImage.trim()
              : prev.tiktokImage,
          heroEyebrow: incoming.heroEyebrow
            ? normalizeLocalizedText(incoming.heroEyebrow)
            : prev.heroEyebrow,
          heroTitle: incoming.heroTitle ? normalizeLocalizedText(incoming.heroTitle) : prev.heroTitle,
          heroSubtitle: incoming.heroSubtitle
            ? normalizeLocalizedText(incoming.heroSubtitle)
            : prev.heroSubtitle,
          heroCta: incoming.heroCta ? normalizeLocalizedText(incoming.heroCta) : prev.heroCta,
          bestSellersTitle: incoming.bestSellersTitle
            ? normalizeLocalizedText(incoming.bestSellersTitle)
            : prev.bestSellersTitle,
          bestSellersSubtitle: incoming.bestSellersSubtitle
            ? normalizeLocalizedText(incoming.bestSellersSubtitle)
            : prev.bestSellersSubtitle,
          latestTitle: incoming.latestTitle
            ? normalizeLocalizedText(incoming.latestTitle)
            : prev.latestTitle,
          latestSubtitle: incoming.latestSubtitle
            ? normalizeLocalizedText(incoming.latestSubtitle)
            : prev.latestSubtitle,
          offersTitle: incoming.offersTitle
            ? normalizeLocalizedText(incoming.offersTitle)
            : prev.offersTitle,
          offersSubtitle: incoming.offersSubtitle
            ? normalizeLocalizedText(incoming.offersSubtitle)
            : prev.offersSubtitle,
          whyTitle: incoming.whyTitle ? normalizeLocalizedText(incoming.whyTitle) : prev.whyTitle,
          whySubtitle: incoming.whySubtitle
            ? normalizeLocalizedText(incoming.whySubtitle)
            : prev.whySubtitle,
          reviewsTitle: incoming.reviewsTitle
            ? normalizeLocalizedText(incoming.reviewsTitle)
            : prev.reviewsTitle,
          reviewsSubtitle: incoming.reviewsSubtitle
            ? normalizeLocalizedText(incoming.reviewsSubtitle)
            : prev.reviewsSubtitle,
          tiktokTitle: incoming.tiktokTitle
            ? normalizeLocalizedText(incoming.tiktokTitle)
            : prev.tiktokTitle,
          tiktokSubtitle: incoming.tiktokSubtitle
            ? normalizeLocalizedText(incoming.tiktokSubtitle)
            : prev.tiktokSubtitle,
          joinTeamTitle: incoming.joinTeamTitle
            ? normalizeLocalizedText(incoming.joinTeamTitle)
            : prev.joinTeamTitle,
          joinTeamSubtitle: incoming.joinTeamSubtitle
            ? normalizeLocalizedText(incoming.joinTeamSubtitle)
            : prev.joinTeamSubtitle,
          joinTeamCta: incoming.joinTeamCta
            ? normalizeLocalizedText(incoming.joinTeamCta)
            : prev.joinTeamCta,
          contactTitle: incoming.contactTitle
            ? normalizeLocalizedText(incoming.contactTitle)
            : prev.contactTitle,
          contactSubtitle: incoming.contactSubtitle
            ? normalizeLocalizedText(incoming.contactSubtitle)
            : prev.contactSubtitle,
          newsletterTitle: incoming.newsletterTitle
            ? normalizeLocalizedText(incoming.newsletterTitle)
            : prev.newsletterTitle,
          newsletterSubtitle: incoming.newsletterSubtitle
            ? normalizeLocalizedText(incoming.newsletterSubtitle)
            : prev.newsletterSubtitle,
          footerTagline: incoming.footerTagline
            ? normalizeLocalizedText(incoming.footerTagline)
            : prev.footerTagline,
          whyPillars: Array.isArray(incoming.whyPillars)
            ? incoming.whyPillars.map((p, i) => ({
                id: p.id || `pillar-${i + 1}`,
                title: normalizeLocalizedText(p.title),
                description: normalizeLocalizedText(p.description),
              }))
            : prev.whyPillars,
          phone: typeof incoming.phone === 'string' ? incoming.phone.trim() : prev.phone,
          tiktokUrl:
            typeof incoming.tiktokUrl === 'string' ? incoming.tiktokUrl.trim() : prev.tiktokUrl,
          instagramUrl:
            typeof incoming.instagramUrl === 'string'
              ? incoming.instagramUrl.trim()
              : prev.instagramUrl,
          facebookUrl:
            typeof incoming.facebookUrl === 'string'
              ? incoming.facebookUrl.trim()
              : prev.facebookUrl,
        };
        return db;
      });
      res.json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Settings update failed.' });
    }
  });

  // Protected Orders Status & Delete
  app.patch('/api/admin/orders/:id', requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const statusRaw = String((req.body as { status?: string }).status || '');
      const validStatuses: OrderStatus[] = [
        'new',
        'processing',
        'shipped',
        'completed',
        'cancelled',
      ];
      if (!validStatuses.includes(statusRaw as OrderStatus)) {
        res.status(400).json({ error: 'Invalid order status.' });
        return;
      }
      const nextDb = await updateDatabase((db) => {
        const idx = db.orders.findIndex((o) => o.id === id);
        if (idx !== -1) {
          db.orders[idx].status = statusRaw as OrderStatus;
        }
        return db;
      });
      res.json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Order update failed.' });
    }
  });

  app.delete('/api/admin/orders/:id', requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const nextDb = await updateDatabase((db) => {
        db.orders = db.orders.filter((o) => o.id !== id);
        return db;
      });
      res.json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Order delete failed.' });
    }
  });

  // Protected Newsletter Subscribers Delete
  app.delete('/api/admin/subscribers/:id', requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const nextDb = await updateDatabase((db) => {
        db.subscribers = db.subscribers.filter((s) => s.id !== id);
        return db;
      });
      res.json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Subscriber remove failed.' });
    }
  });

  // Protected Team Applications Update & Delete
  app.patch('/api/admin/team-applications/:id', requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const statusRaw = String((req.body as { status?: string }).status || '');
      const valid: TeamApplicationStatus[] = ['new', 'reviewed', 'accepted', 'archived'];
      if (!valid.includes(statusRaw as TeamApplicationStatus)) {
        res.status(400).json({ error: 'Invalid status.' });
        return;
      }
      const nextDb = await updateDatabase((db) => {
        const idx = db.teamApplications.findIndex((a) => a.id === id);
        if (idx !== -1) {
          db.teamApplications[idx].status = statusRaw as TeamApplicationStatus;
        }
        return db;
      });
      res.json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Status update failed.' });
    }
  });

  app.delete('/api/admin/team-applications/:id', requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const nextDb = await updateDatabase((db) => {
        db.teamApplications = db.teamApplications.filter((a) => a.id !== id);
        return db;
      });
      res.json(toAdminDashboard(nextDb));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Application delete failed.' });
    }
  });

  // Vite middleware in dev / static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`ELHAM BEAUTY server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ELHAM BEAUTY server:', err);
  process.exit(1);
});
