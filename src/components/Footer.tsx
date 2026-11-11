import { useState, type FormEvent } from 'react';
import { CheckCircle2, Info, Lock, Mail, Phone, Send } from 'lucide-react';
import type { Language, SiteSettings } from '../types.ts';
import { UI_STRINGS, cleanPhoneForWhatsApp, pickText } from '../lib/i18n.ts';
import { subscribeNewsletter } from '../lib/api.ts';

interface FooterProps {
  settings: SiteSettings;
  lang: Language;
  onNavigateHome: (sectionId?: string) => void;
  onNavigateProducts: () => void;
  onNavigateAdmin: () => void;
}

export function Footer({
  settings,
  lang,
  onNavigateHome,
  onNavigateProducts,
  onNavigateAdmin,
}: FooterProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'already' | 'error';
    message: string;
  } | null>(null);

  const t = UI_STRINGS[lang];
  const waPhone = cleanPhoneForWhatsApp(settings.phone);

  async function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
    if (!validEmail) {
      setFeedback({ type: 'error', message: t.newsletter.invalidEmail });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await subscribeNewsletter(trimmed, lang);
      if (res.status === 'already_subscribed') {
        setFeedback({ type: 'already', message: t.newsletter.alreadyMsg });
      } else {
        setFeedback({ type: 'success', message: t.newsletter.successMsg });
        setEmail('');
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : t.newsletter.invalidEmail,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="bg-[#FFF7FA] border-t border-[#F4DAE4] text-[#2A1620]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand Summary & Socials */}
          <div className="md:col-span-4 space-y-4">
            <div className="font-display text-2xl font-bold tracking-[0.08em] text-[#2A1620]">
              {settings.brandName || 'ELHAM BEAUTY'}
            </div>
            <p className="text-sm text-[#6E515E] leading-relaxed max-w-sm">
              {pickText(settings.footerTagline, lang)}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {settings.phone && (
                <a
                  href={`https://wa.me/${waPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white border border-[#F4DAE4] rounded-lg text-[#2A1620] hover:border-[#CC4B7C] hover:text-[#CC4B7C] transition-colors tabular-nums"
                >
                  <Phone className="w-3.5 h-3.5 text-[#CC4B7C]" />
                  <span dir="ltr">{settings.phone}</span>
                </a>
              )}
              {settings.tiktokUrl && (
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white border border-[#F4DAE4] rounded-lg text-[#2A1620] hover:border-[#CC4B7C] hover:text-[#CC4B7C] transition-colors"
                >
                  <span>TikTok</span>
                </a>
              )}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white border border-[#F4DAE4] rounded-lg text-[#2A1620] hover:border-[#CC4B7C] hover:text-[#CC4B7C] transition-colors"
                >
                  <span>Instagram</span>
                </a>
              )}
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white border border-[#F4DAE4] rounded-lg text-[#2A1620] hover:border-[#CC4B7C] hover:text-[#CC4B7C] transition-colors"
                >
                  <span>Facebook</span>
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-[#9D2F5A]">
              {settings.brandName || 'ELHAM BEAUTY'}
            </h3>
            <ul className="space-y-2 text-sm text-[#6E515E]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateHome('hero')}
                  className="hover:text-[#CC4B7C] transition-colors cursor-pointer"
                >
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onNavigateProducts}
                  className="hover:text-[#CC4B7C] transition-colors cursor-pointer"
                >
                  {t.nav.products}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateHome('offers')}
                  className="hover:text-[#CC4B7C] transition-colors cursor-pointer"
                >
                  {t.nav.offers}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateHome('reviews')}
                  className="hover:text-[#CC4B7C] transition-colors cursor-pointer"
                >
                  {t.nav.reviews}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateHome('join-team')}
                  className="hover:text-[#CC4B7C] transition-colors cursor-pointer"
                >
                  {t.joinTeam.navLabel}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateHome('contact')}
                  className="hover:text-[#CC4B7C] transition-colors cursor-pointer"
                >
                  {t.nav.contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup Form */}
          <div className="md:col-span-5 space-y-3">
            <h3 className="font-display text-xl font-semibold text-[#2A1620]">
              {pickText(settings.newsletterTitle, lang)}
            </h3>
            <p className="text-sm text-[#6E515E] leading-relaxed">
              {pickText(settings.newsletterSubtitle, lang)}
            </p>
            <form onSubmit={handleSubscribe} className="pt-1 flex flex-col sm:flex-row gap-2.5" noValidate>
              <label htmlFor="footer-newsletter-email" className="sr-only">
                {t.newsletter.emailPlaceholder}
              </label>
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-[#CC4B7C] absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                <input
                  id="footer-newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.newsletter.emailPlaceholder}
                  disabled={submitting}
                  className="w-full min-h-[44px] ps-10 pe-3.5 py-2.5 bg-white border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] placeholder:text-[#9C7D8B] focus:outline-none focus:border-[#CC4B7C] focus:ring-2 focus:ring-[#FCE8F0]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="min-h-[44px] px-5 py-2.5 bg-[#CC4B7C] hover:bg-[#B43A69] disabled:opacity-60 text-white text-sm font-medium rounded-lg inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? t.newsletter.subscribing : t.newsletter.subscribe}</span>
              </button>
            </form>

            {feedback && (
              <div
                role="status"
                className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border ${
                  feedback.type === 'error'
                    ? 'bg-white border-[#D64571] text-[#9D2F5A]'
                    : 'bg-white border-[#F4DAE4] text-[#2A1620]'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#CC4B7C] shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-[#CC4B7C] shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Copyright & Admin Link */}
        <div className="mt-12 pt-6 border-t border-[#F4DAE4] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6E515E]">
          <span>
            © {new Date().getFullYear()} {settings.brandName || 'ELHAM BEAUTY'}
          </span>
          <button
            type="button"
            onClick={onNavigateAdmin}
            className="inline-flex items-center gap-1.5 text-[#6E515E] hover:text-[#CC4B7C] transition-colors cursor-pointer py-1"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t.nav.admin}</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
