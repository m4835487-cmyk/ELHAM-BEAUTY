import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  AdminDashboardData,
  Category,
  Order,
  PublicStorefrontData,
  SiteSettings,
  TeamApplication,
} from '../src/types.ts';

export interface StoreDatabase extends AdminDashboardData {
  adminPasswordHash: string | null;
}

export const DATA_DIR = path.resolve(process.cwd(), 'data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

function createInitialSettings(): SiteSettings {
  return {
    brandName: 'ELHAM BEAUTY',
    currencyCode: 'TRY',
    currencySymbol: '₺',
    heroImages: ['/src/assets/images/hero_elham_luxury_1794422796549.jpg'],
    promoBannerImage: '/src/assets/images/banner_perfumes_editorial_1794422796644.jpg',
    whyUsImage: '/src/assets/images/pillar_skincare_atelier_1794422796543.jpg',
    tiktokImage: '/src/assets/images/tiktok_studio_showcase_1794422797073.jpg',
    heroEyebrow: {
      ar: 'دار العطور وكريمات البشرة وسيرومات الشعر والتجميل',
      tr: 'Parfüm, Yüz Kremi, Saç Serumu & Güzellik Evi',
      en: 'Fragrance, Face Creams, Hair Serums & Beauty House',
    },
    heroTitle: {
      ar: 'ELHAM BEAUTY',
      tr: 'ELHAM BEAUTY',
      en: 'ELHAM BEAUTY',
    },
    heroSubtitle: {
      ar: 'تشكيلة نسائية متكاملة تجمع بين العطور الفاخرة، كريمات الوجه والعناية بالبشرة، سيرومات الشعر المغذية، ومنتجات التضخيم والتنحيف المختارة بعناية لجمالك.',
      tr: 'Lüks parfümler, yüz bakım kremleri, besleyici saç serumları ve vücut şekillendirme ürünleriyle kadın güzelliğine özel eksiksiz koleksiyon.',
      en: 'A complete feminine beauty collection bringing together luxury perfumes, face creams, nourishing hair serums, and curated body shaping & slimming care.',
    },
    heroCta: {
      ar: 'تسوقي الآن',
      tr: 'Alışverişe Başla',
      en: 'Shop Now',
    },
    bestSellersTitle: {
      ar: 'المنتجات الأكثر مبيعاً',
      tr: 'En Çok Tercih Edilenler',
      en: 'Best Sellers',
    },
    bestSellersSubtitle: {
      ar: 'اختيارات عميلاتنا المفضلة من العطور، كريمات الوجه، سيرومات الشعر ومنتجات العناية.',
      tr: 'Müşterilerimizin en beğendiği parfümler, yüz kremleri, saç serumları ve bakım ürünleri.',
      en: 'Client favorites across our perfumes, face creams, hair serums, and body care.',
    },
    latestTitle: {
      ar: 'أحدث المنتجات',
      tr: 'Yeni Gelenler',
      en: 'Latest Arrivals',
    },
    latestSubtitle: {
      ar: 'إصدارات جديدة للعناية بالبشرة والشعر والجسم والعطور تضاف باستمرار.',
      tr: 'Cilt, saç, vücut bakımı ve parfüm koleksiyonumuza eklenen en yeni seçkiler.',
      en: 'Newly curated skincare, hair serum, body care, and perfume additions.',
    },
    offersTitle: {
      ar: 'العروض الخاصة',
      tr: 'Özel Fırsatlar',
      en: 'Special Offers',
    },
    offersSubtitle: {
      ar: 'باقات موسمية وخصومات حصرية على مختارات إلهام بيوتي.',
      tr: 'Elham Beauty seçkilerinde sezonluk setler ve ayrıcalıklı indirimler.',
      en: 'Seasonal sets and exclusive savings across curated ELHAM BEAUTY editions.',
    },
    whyTitle: {
      ar: 'لماذا تختارين ELHAM BEAUTY؟',
      tr: 'Neden ELHAM BEAUTY?',
      en: 'Why Choose ELHAM BEAUTY?',
    },
    whySubtitle: {
      ar: 'نهتم بأدق التفاصيل لتصلك تجربة جمال وعناية متكاملة تجمع بين النقاء والفخامة.',
      tr: 'Saflığı ve zarafeti bir araya getiren kusursuz bir güzellik deneyimi için her detaya özen gösteriyoruz.',
      en: 'Every detail is crafted to deliver purity, grace, and enduring beauty care.',
    },
    reviewsTitle: {
      ar: 'آراء العملاء',
      tr: 'Müşteri Yorumları',
      en: 'Customer Reviews',
    },
    reviewsSubtitle: {
      ar: 'كلمات وتجارب حقيقية لعميلات إلهام بيوتي.',
      tr: 'Elham Beauty deneyimini yaşayan müşterilerimizin gerçek yorumları.',
      en: 'Authentic impressions shared by ELHAM BEAUTY clients.',
    },
    tiktokTitle: {
      ar: 'تابعي عالمنا على TikTok',
      tr: 'TikTok Dünyamızı Keşfedin',
      en: 'Follow Our World on TikTok',
    },
    tiktokSubtitle: {
      ar: 'شاهدي أحدث الإصدارات، تنسيقات العطور، روتين كريمات الوجه وسيرومات الشعر عبر حسابنا الرسمي.',
      tr: 'Yeni ürünleri, yüz kremi ve saç serumu rutinlerini resmi TikTok hesabımızdan takip edin.',
      en: 'Explore unboxing moments, skincare rituals, hair serums, and fragrance pairings on our official TikTok.',
    },
    joinTeamTitle: {
      ar: 'انضم معنا بفريق الهام بيوتي',
      tr: 'ELHAM BEAUTY Ekibine Katılın',
      en: 'Join the ELHAM BEAUTY Team',
    },
    joinTeamSubtitle: {
      ar: 'هل تطمحين للانضمام إلى عائلة ELHAM BEAUTY؟ عبي الاستمارة التالية من أي مدينة كانت، وفور إرسالها سيتم تحويلك مباشرة إلى واتساب إلهام بيوتي للتواصل الفوري.',
      tr: 'ELHAM BEAUTY ailesine katılmak ister misiniz? Hangi şehirde olursanız olun formu doldurun; gönderdiğinizde bilgilerinizle birlikte anında ELHAM BEAUTY WhatsApp hattına yönlendirilirsiniz.',
      en: 'Interested in joining the ELHAM BEAUTY team? Fill out this application from any city and you will be connected directly to ELHAM BEAUTY WhatsApp with your details.',
    },
    joinTeamCta: {
      ar: 'إرسال الاستمارة والانتقال إلى واتساب',
      tr: "Formu Gönder ve WhatsApp'a Geç",
      en: 'Submit & Continue to WhatsApp',
    },
    contactTitle: {
      ar: 'تواصل معنا',
      tr: 'İletişim',
      en: 'Contact Us',
    },
    contactSubtitle: {
      ar: 'يسعد فريقنا بمساعدتك في اختيار العطور أو كريمات البشرة أو سيرومات الشعر أو منتجات التضخيم والتنحيف ومتابعة طلباتك مباشرة.',
      tr: 'Size en uygun parfüm, yüz kremi, saç serumu ve bakım ürünlerini seçmeniz için ekibimizle doğrudan iletişime geçebilirsiniz.',
      en: 'Reach our team directly for guidance on perfumes, skincare creams, hair serums, body care, and order support.',
    },
    newsletterTitle: {
      ar: 'اشتركي في نشرة إلهام بيوتي',
      tr: 'ELHAM BEAUTY Bültenine Katılın',
      en: 'Join the ELHAM BEAUTY List',
    },
    newsletterSubtitle: {
      ar: 'كوني أول من يعلم عن العطور الجديدة، كريمات البشرة، سيرومات الشعر والعروض الموسمية.',
      tr: 'Yeni parfümler, cilt bakım kremleri, saç serumları ve sezonluk fırsatlardan ilk siz haberdar olun.',
      en: 'Be first to receive new perfume launches, skincare, hair serums, and promotional updates.',
    },
    footerTagline: {
      ar: 'علامة نسائية متخصصة في العطور الفاخرة، كريمات الوجه والبشرة، سيرومات الشعر، ومنتجات التضخيم والتنحيف والتجميل.',
      tr: 'Lüks parfümler, yüz kremleri, saç serumları, vücut bakımı ve kozmetik alanında zarif kadın markası.',
      en: 'A feminine beauty house devoted to perfumes, face creams, hair serums, body sculpting care, and cosmetics.',
    },
    whyPillars: [
      {
        id: 'pillar-1',
        title: {
          ar: 'منتجات شاملة للبشرة والشعر والجسم',
          tr: 'Cilt, Saç ve Vücut İçin Kapsamlı Seçki',
          en: 'Complete Skin, Hair & Body Care',
        },
        description: {
          ar: 'نوفر لك العطور، كريمات الوجه، سيرومات الشعر، ومستحضرات التضخيم والتنحيف المختارة بعناية.',
          tr: 'Parfümler, yüz kremleri, saç serumları ve vücut şekillendirme ürünlerini bir arada sunuyoruz.',
          en: 'Bringing together perfumes, facial creams, hair serums, and targeted body shaping formulas.',
        },
      },
      {
        id: 'pillar-2',
        title: {
          ar: 'هوية أنثوية ناعمة وفاخرة',
          tr: 'Zarif ve Feminen Sunum',
          en: 'Refined Feminine Presentation',
        },
        description: {
          ar: 'تغليف أنيق وتفاصيل وردية ناعمة تجعل كل طلب هدية راقية لنفسك أو لمن تحبين.',
          tr: 'İncelikle hazırlanan pembe ve beyaz detaylarla her sipariş özel bir hediye hissi verir.',
          en: 'Delicate pink-and-white presentation makes every order feel like a bespoke gift.',
        },
      },
      {
        id: 'pillar-3',
        title: {
          ar: 'خدمة عملاء واستشارة شخصية',
          tr: 'Kişisel Güzellik Danışmanlığı',
          en: 'Personal Beauty Guidance',
        },
        description: {
          ar: 'مرافقة مباشرة عبر الهاتف وواتساب ومستشارة ذكية لاقتراح الروتين والعطر والمنتج الأنسب لك.',
          tr: 'WhatsApp ve akıllı güzellik danışmanımızla cildinize ve zevkinize en uygun seçimi yapın.',
          en: 'Direct client care alongside an intelligent advisor tailored to your skin, hair, and scent needs.',
        },
      },
      {
        id: 'pillar-4',
        title: {
          ar: 'طلب سهل وتوصيل لجميع المدن',
          tr: 'Kolay Sipariş ve Tüm Şehirlere Gönderim',
          en: 'Effortless Orders to Every City',
        },
        description: {
          ar: 'نموذج طلب واضح ومباشر مع تأكيد فوري وتواصل سريع لتجهيز طلبك من أي مدينة.',
          tr: 'Net sipariş formu ve anında WhatsApp onayı ile siparişiniz her şehirden hızla hazırlanır.',
          en: 'Simple checkout with instant order confirmation and attentive delivery follow-up across cities.',
        },
      },
    ],
    phone: '905385047543',
    tiktokUrl: 'https://www.tiktok.com/@hanan_sy_25',
    instagramUrl: '',
    facebookUrl: '',
  };
}

function createInitialCategories(): Category[] {
  return [
    {
      id: 'cat-perfumes',
      slug: 'perfumes',
      name: {
        ar: 'العطور الفاخرة',
        tr: 'Lüks Parfümler',
        en: 'Luxury Perfumes',
      },
      sortOrder: 1,
    },
    {
      id: 'cat-face-skincare',
      slug: 'face-skincare',
      name: {
        ar: 'كريمات الوجه والبشرة',
        tr: 'Yüz Kremleri ve Cilt Bakımı',
        en: 'Face Creams & Skincare',
      },
      sortOrder: 2,
    },
    {
      id: 'cat-hair-serums',
      slug: 'hair-serums',
      name: {
        ar: 'سيرومات والعناية بالشعر',
        tr: 'Saç Serumları ve Bakımı',
        en: 'Hair Serums & Care',
      },
      sortOrder: 3,
    },
    {
      id: 'cat-body-sculpting',
      slug: 'body-sculpting',
      name: {
        ar: 'منتجات التضخيم والتنحيف',
        tr: 'Şekillendirme ve Zayıflama',
        en: 'Weight Gain & Slimming Care',
      },
      sortOrder: 4,
    },
    {
      id: 'cat-cosmetics',
      slug: 'cosmetics',
      name: {
        ar: 'مستحضرات التجميل',
        tr: 'Kozmetik',
        en: 'Cosmetics',
      },
      sortOrder: 5,
    },
  ];
}

function createInitialDatabase(): StoreDatabase {
  return {
    settings: createInitialSettings(),
    categories: createInitialCategories(),
    products: [],
    offers: [],
    reviews: [],
    orders: [],
    subscribers: [],
    teamApplications: [],
    adminPasswordHash: null,
  };
}

let writeQueue: Promise<void> = Promise.resolve();
let memoryCache: StoreDatabase | null = null;

async function ensureDirs(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

export async function readDatabase(): Promise<StoreDatabase> {
  if (memoryCache) return memoryCache;
  await ensureDirs();
  try {
    const raw = await fs.readFile(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoreDatabase>;
    const defaults = createInitialDatabase();
    memoryCache = {
      settings: { ...defaults.settings, ...(parsed.settings || {}) },
      categories: Array.isArray(parsed.categories) ? parsed.categories : defaults.categories,
      products: Array.isArray(parsed.products) ? parsed.products : [],
      offers: Array.isArray(parsed.offers) ? parsed.offers : [],
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
      teamApplications: Array.isArray(parsed.teamApplications) ? parsed.teamApplications : [],
      adminPasswordHash:
        typeof parsed.adminPasswordHash === 'string' ? parsed.adminPasswordHash : null,
    };
    return memoryCache;
  } catch {
    const initial = createInitialDatabase();
    await persistDatabase(initial);
    return initial;
  }
}

export async function persistDatabase(nextDb: StoreDatabase): Promise<void> {
  memoryCache = nextDb;
  writeQueue = writeQueue.then(async () => {
    await ensureDirs();
    const tmpFile = `${STORE_FILE}.${crypto.randomUUID()}.tmp`;
    await fs.writeFile(tmpFile, JSON.stringify(nextDb, null, 2), 'utf8');
    await fs.rename(tmpFile, STORE_FILE);
  });
  await writeQueue;
}

export async function updateDatabase(
  mutator: (db: StoreDatabase) => StoreDatabase | Promise<StoreDatabase>
): Promise<StoreDatabase> {
  const current = await readDatabase();
  const cloned = structuredClone(current);
  const updated = await mutator(cloned);
  await persistDatabase(updated);
  return updated;
}

export function toPublicStorefront(db: StoreDatabase): PublicStorefrontData {
  return {
    settings: db.settings,
    categories: [...db.categories].sort((a, b) => a.sortOrder - b.sortOrder),
    products: [...db.products].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    offers: db.offers.filter((offer) => offer.isActive),
    reviews: db.reviews.filter((review) => review.isVisible),
  };
}

export function toAdminDashboard(db: StoreDatabase): AdminDashboardData {
  return {
    settings: db.settings,
    categories: [...db.categories].sort((a, b) => a.sortOrder - b.sortOrder),
    products: [...db.products].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    offers: [...db.offers].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    reviews: [...db.reviews].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    orders: [...db.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    subscribers: [...db.subscribers].sort(
      (a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
    ),
    teamApplications: [...db.teamApplications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  };
}

export function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function generateOrderNumber(existingOrders: Order[]): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const seq = String(existingOrders.length + 101).padStart(4, '0');
  return `EB-${datePart}-${seq}`;
}

export function generateApplicationNumber(existingApps: TeamApplication[]): string {
  const seq = String(existingApps.length + 101).padStart(4, '0');
  return `EB-TEAM-${seq}`;
}
