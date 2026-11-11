import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type { Language } from '../src/types.ts';
import { readDatabase, toPublicStorefront } from './store.ts';

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function mapAiError(err: unknown): { status: number; message: string; code: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw === 'GEMINI_API_KEY_MISSING') {
    return {
      status: 503,
      code: 'GEMINI_API_KEY_MISSING',
      message: 'Gemini API key is not configured yet. Please select an API key in Settings > Secrets.',
    };
  }
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      code: 'QUOTA_OR_PAID_REQUIRED',
      message:
        'This reasoning model (gemini-4-carbon) requires a billing-enabled API key or has reached quota. Update your key in Settings > Secrets.',
    };
  }
  if (raw.includes('403') || raw.includes('PERMISSION_DENIED') || raw.includes('API_KEY_INVALID')) {
    return {
      status: 403,
      code: 'API_KEY_INVALID',
      message: 'Please verify your Gemini API key in Settings > Secrets.',
    };
  }
  return {
    status: 500,
    code: 'AI_ERROR',
    message: raw || 'Unable to reach AI advisor right now.',
  };
}

export async function runBeautyConcierge(params: {
  message: string;
  language: Language;
  history?: Array<{ role: 'user' | 'assistant'; text: string }>;
}): Promise<{ reply: string }> {
  const ai = getClient();
  const db = await readDatabase();
  const storefront = toPublicStorefront(db);

  const catalogSnapshot = storefront.products.map((p) => ({
    id: p.id,
    categoryId: p.categoryId,
    name: p.name,
    description: p.description,
    features: p.features,
    howToUse: p.howToUse,
    priceTRY: p.price,
    originalPriceTRY: p.originalPrice,
    discountPercent: p.discountPercent,
    inStock: p.inStock,
  }));

  const categoriesSnapshot = storefront.categories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const offersSnapshot = storefront.offers.map((o) => ({
    title: o.title,
    discountLabel: o.discountLabel,
    description: o.description,
  }));

  const langLabel =
    params.language === 'ar'
      ? 'Arabic (العربية)'
      : params.language === 'tr'
      ? 'Turkish (Türkçe)'
      : 'English';

  const systemInstruction = `You are the private luxury Beauty & Fragrance Advisor for ELHAM BEAUTY (الهام بيوتي), a feminine haute-couture brand specializing in perfumes, face creams & skincare, hair serums & hair care, body shaping/weight-gain & slimming products, and cosmetics.

Respond strictly in ${langLabel} with a warm, refined, knowledgeable, feminine luxury tone.

LIVE STORE CONTEXT:
- Currency: Turkish Lira (₺ TRY)
- Contact WhatsApp / Phone: ${storefront.settings.phone}
- Official TikTok: ${storefront.settings.tiktokUrl}
- Categories: ${JSON.stringify(categoriesSnapshot)}
- Live Products Catalog: ${JSON.stringify(catalogSnapshot)}
- Active Special Offers: ${JSON.stringify(offersSnapshot)}

CRITICAL ACCURACY RULES:
1. NEVER invent, fabricate, or pretend a store product exists if the Live Products Catalog above is empty or does not contain it.
2. If Live Products Catalog has matching items, recommend them specifically by exact name and current TRY (₺) price and explain why they fit the client's skin type, fragrance notes, or occasion.
3. If Live Products Catalog is currently empty, transparently let the client know that new signature pieces are being curated right now, while still delivering deeply thoughtful, expert guidance on fragrance notes, skincare ingredients, layering rituals, and routines tailored to their needs—and invite them to check back or message our WhatsApp (${storefront.settings.phone}) for bespoke assistance.`;

  const historyLines = (params.history || [])
    .slice(-8)
    .map((m) => `${m.role === 'user' ? 'Client' : 'Advisor'}: ${m.text}`)
    .join('\n');

  const prompt = historyLines
    ? `Conversation so far:\n${historyLines}\n\nClient: ${params.message}`
    : params.message;

  const response = await ai.models.generateContent({
    model: 'gemini-4-carbon',
    contents: prompt,
    config: {
      systemInstruction,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
    },
  });

  return {
    reply: response.text?.trim() || '',
  };
}

export async function runAdminCopywriter(params: {
  mode: 'product' | 'offer' | 'siteText';
  prompt: string;
  sourceLang: Language;
}): Promise<Record<string, unknown>> {
  const ai = getClient();

  if (params.mode === 'product') {
    const response = await ai.models.generateContent({
      model: 'gemini-4-carbon',
      contents: `Create refined, luxury feminine beauty e-commerce product copy in Arabic, Turkish, and English based on this brief (source language: ${params.sourceLang}):\n\n${params.prompt}`,
      config: {
        systemInstruction:
          'You are a luxury beauty copywriter for ELHAM BEAUTY. Write natural, elegant, non-cliché marketing copy across Arabic, Turkish, and English without exaggerated claims.',
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.OBJECT,
              properties: {
                ar: { type: Type.STRING },
                tr: { type: Type.STRING },
                en: { type: Type.STRING },
              },
              required: ['ar', 'tr', 'en'],
            },
            description: {
              type: Type.OBJECT,
              properties: {
                ar: { type: Type.STRING },
                tr: { type: Type.STRING },
                en: { type: Type.STRING },
              },
              required: ['ar', 'tr', 'en'],
            },
            features: {
              type: Type.OBJECT,
              properties: {
                ar: { type: Type.ARRAY, items: { type: Type.STRING } },
                tr: { type: Type.ARRAY, items: { type: Type.STRING } },
                en: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['ar', 'tr', 'en'],
            },
            howToUse: {
              type: Type.OBJECT,
              properties: {
                ar: { type: Type.STRING },
                tr: { type: Type.STRING },
                en: { type: Type.STRING },
              },
              required: ['ar', 'tr', 'en'],
            },
          },
          required: ['name', 'description', 'features', 'howToUse'],
        },
      },
    });
    return JSON.parse((response.text ?? '{}').trim()) as Record<string, unknown>;
  }

  if (params.mode === 'offer') {
    const response = await ai.models.generateContent({
      model: 'gemini-4-carbon',
      contents: `Write luxury promotional offer copy in Arabic, Turkish, and English for ELHAM BEAUTY based on this brief (source language: ${params.sourceLang}):\n\n${params.prompt}`,
      config: {
        systemInstruction:
          'You are a luxury beauty campaign writer for ELHAM BEAUTY. Keep copy refined, feminine, concise, and natural in Arabic, Turkish, and English.',
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.OBJECT,
              properties: {
                ar: { type: Type.STRING },
                tr: { type: Type.STRING },
                en: { type: Type.STRING },
              },
              required: ['ar', 'tr', 'en'],
            },
            description: {
              type: Type.OBJECT,
              properties: {
                ar: { type: Type.STRING },
                tr: { type: Type.STRING },
                en: { type: Type.STRING },
              },
              required: ['ar', 'tr', 'en'],
            },
            discountLabel: {
              type: Type.OBJECT,
              properties: {
                ar: { type: Type.STRING },
                tr: { type: Type.STRING },
                en: { type: Type.STRING },
              },
              required: ['ar', 'tr', 'en'],
            },
          },
          required: ['title', 'description', 'discountLabel'],
        },
      },
    });
    return JSON.parse((response.text ?? '{}').trim()) as Record<string, unknown>;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-4-carbon',
    contents: `Translate and refine this luxury brand copy into natural Arabic, Turkish, and English for ELHAM BEAUTY (source language: ${params.sourceLang}):\n\n${params.prompt}`,
    config: {
      systemInstruction:
        'You are an editorial brand translator for ELHAM BEAUTY. Produce refined Arabic, Turkish, and English versions preserving brand warmth and clarity.',
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ar: { type: Type.STRING },
          tr: { type: Type.STRING },
          en: { type: Type.STRING },
        },
        required: ['ar', 'tr', 'en'],
      },
    },
  });
  return JSON.parse((response.text ?? '{}').trim()) as Record<string, unknown>;
}

export { mapAiError };
