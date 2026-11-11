import { useState, type FormEvent } from 'react';
import { Check, CheckCircle2, Copy, MapPin, MessageCircle, Users } from 'lucide-react';
import type { Language, SiteSettings, TeamApplication } from '../types.ts';
import {
  UI_STRINGS,
  buildWhatsAppTeamApplicationUrl,
  formatTeamApplicationMessage,
  pickText,
} from '../lib/i18n.ts';
import { submitTeamApplication } from '../lib/api.ts';

interface JoinTeamSectionProps {
  settings: SiteSettings;
  lang: Language;
}

function redirectToWhatsApp(waUrl: string): void {
  const link = document.createElement('a');
  link.href = waUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function JoinTeamSection({ settings, lang }: JoinTeamSectionProps) {
  const t = UI_STRINGS[lang].joinTeam;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [interestIndex, setInterestIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState<{
    app: TeamApplication;
    waUrl: string;
    formattedMessage: string;
  } | null>(null);

  const selectedInterest = t.interestOptions[interestIndex] ?? t.interestOptions[0];

  function handleFormatAndRedirect(application: TeamApplication): {
    waUrl: string;
    formattedMessage: string;
  } {
    const payload = {
      applicationNumber: application.applicationNumber,
      fullName: application.fullName,
      phone: application.phone,
      country: application.country,
      city: application.city,
      interestArea: application.interestArea,
      notes: application.notes,
      lang,
    };

    const formattedMessage = formatTeamApplicationMessage(payload);
    const waUrl = buildWhatsAppTeamApplicationUrl({
      storePhone: settings.phone,
      ...payload,
    });

    redirectToWhatsApp(waUrl);
    return { waUrl, formattedMessage };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !country.trim() || !city.trim()) {
      setErrorMsg(t.requiredError);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setCopied(false);
    try {
      const res = await submitTeamApplication({
        fullName: fullName.trim(),
        phone: phone.trim(),
        country: country.trim(),
        city: city.trim(),
        interestArea: selectedInterest,
        notes: notes.trim(),
        language: lang,
      });

      const { waUrl, formattedMessage } = handleFormatAndRedirect(res.application);
      setSubmitted({ app: res.application, waUrl, formattedMessage });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t.requiredError);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyMessage() {
    if (!submitted) return;
    try {
      await navigator.clipboard.writeText(submitted.formattedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard may be blocked in restricted contexts
    }
  }

  function resetForm() {
    setSubmitted(null);
    setFullName('');
    setPhone('');
    setCountry('');
    setCity('');
    setInterestIndex(0);
    setNotes('');
    setErrorMsg('');
    setCopied(false);
  }

  return (
    <section id="join-team" className="bg-[#FFF7FA] border-b border-[#F8E6EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="bg-white border border-[#F4DAE4] rounded-2xl p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Editorial Invitation Column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#9D2F5A]">
              <Users className="w-4 h-4 text-[#CC4B7C]" />
              <span>{t.badge}</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#2A1620] text-balance">
              {pickText(settings.joinTeamTitle, lang)}
            </h2>

            <p className="text-sm sm:text-base text-[#6E515E] leading-relaxed">
              {pickText(settings.joinTeamSubtitle, lang)}
            </p>

            <div className="pt-3 border-t border-[#F8E6EE] space-y-3 text-sm text-[#2A1620]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#CC4B7C] shrink-0 mt-0.5" />
                <span>
                  {lang === 'ar'
                    ? 'متاح للتقديم من جميع المدن والدول'
                    : lang === 'tr'
                    ? 'Tüm şehirlerden ve ülkelerden başvuruya açık'
                    : 'Open to applicants from any city or country'}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#CC4B7C] shrink-0 mt-0.5" />
                <span>
                  {lang === 'ar'
                    ? 'تحويل فوري بعد تعبئة الاستمارة إلى واتساب ELHAM BEAUTY'
                    : lang === 'tr'
                    ? "Form gönderiminden hemen sonra ELHAM BEAUTY WhatsApp'a aktarım"
                    : 'Instant transfer to ELHAM BEAUTY WhatsApp upon submission'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Application Form Column */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="space-y-6 py-2">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#FCE8F0] text-[#CC4B7C] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-[#9D2F5A] tabular-nums">
                      {t.appNumberLabel}: {submitted.app.applicationNumber}
                    </div>
                    <h3 className="font-display text-2xl font-bold text-[#2A1620]">
                      {t.successTitle}
                    </h3>
                    <p className="text-sm text-[#6E515E] leading-relaxed">
                      {t.successDesc}
                    </p>
                  </div>
                </div>

                <div className="py-4 border-y border-[#F8E6EE] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#6E515E]">
                  <div>
                    <strong className="text-[#2A1620]">{t.fullName}:</strong>{' '}
                    {submitted.app.fullName}
                  </div>
                  <div>
                    <strong className="text-[#2A1620]">{t.phone}:</strong>{' '}
                    <span dir="ltr">{submitted.app.phone}</span>
                  </div>
                  <div>
                    <strong className="text-[#2A1620]">{t.city}:</strong>{' '}
                    {submitted.app.country} — {submitted.app.city}
                  </div>
                  {submitted.app.interestArea && (
                    <div>
                      <strong className="text-[#2A1620]">{t.interestArea}:</strong>{' '}
                      {submitted.app.interestArea}
                    </div>
                  )}
                  {submitted.app.notes && (
                    <div className="sm:col-span-2">
                      <strong className="text-[#2A1620]">{t.notes}:</strong>{' '}
                      {submitted.app.notes}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#9D2F5A]">
                    {t.messagePreviewLabel}
                  </div>
                  <p className="text-xs sm:text-sm text-[#6E515E] whitespace-pre-line leading-relaxed bg-[#FFF7FA] rounded-xl p-4">
                    {submitted.formattedMessage}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-1">
                  <a
                    href={submitted.waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[46px] px-6 py-2.5 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>{t.openWhatsappNow}</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="min-h-[46px] px-4 py-2.5 bg-white hover:bg-[#FCE8F0] border border-[#F4DAE4] text-[#2A1620] text-sm font-medium rounded-lg inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-[#CC4B7C] shrink-0" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#CC4B7C] shrink-0" />
                    )}
                    <span>{copied ? t.copiedMessage : t.copyMessage}</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="min-h-[46px] px-5 py-2.5 bg-white hover:bg-[#FCE8F0] border border-[#F4DAE4] text-[#2A1620] text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {t.applyAgain}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="join-full-name"
                      className="block text-xs font-semibold text-[#2A1620] mb-1.5"
                    >
                      {t.fullName} *
                    </label>
                    <input
                      id="join-full-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="join-phone"
                      className="block text-xs font-semibold text-[#2A1620] mb-1.5"
                    >
                      {t.phone} *
                    </label>
                    <input
                      id="join-phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="join-country"
                      className="block text-xs font-semibold text-[#2A1620] mb-1.5"
                    >
                      {t.country} *
                    </label>
                    <input
                      id="join-country"
                      type="text"
                      required
                      autoComplete="country-name"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="join-city"
                      className="block text-xs font-semibold text-[#2A1620] mb-1.5"
                    >
                      {t.city} *
                    </label>
                    <input
                      id="join-city"
                      type="text"
                      required
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={t.cityPlaceholder}
                      className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] placeholder:text-[#9C7D8B] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="join-interest"
                    className="block text-xs font-semibold text-[#2A1620] mb-1.5"
                  >
                    {t.interestArea}
                  </label>
                  <select
                    id="join-interest"
                    value={interestIndex}
                    onChange={(e) => setInterestIndex(Number(e.target.value))}
                    className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
                  >
                    {t.interestOptions.map((opt, idx) => (
                      <option key={idx} value={idx}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="join-notes"
                    className="block text-xs font-semibold text-[#2A1620] mb-1.5"
                  >
                    {t.notes}
                  </label>
                  <textarea
                    id="join-notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-[#FFF7FA] border border-[#CC4B7C] rounded-lg text-xs text-[#9D2F5A]">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full min-h-[48px] px-6 py-3 bg-[#CC4B7C] hover:bg-[#B43A69] disabled:opacity-60 text-white text-sm sm:text-base font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {submitting ? t.submitting : pickText(settings.joinTeamCta, lang)}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
