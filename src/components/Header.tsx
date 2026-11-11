import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { Language } from '../types.ts';
import { UI_STRINGS } from '../lib/i18n.ts';

export type RouteView = 'home' | 'products' | 'product' | 'admin';

interface HeaderProps {
  brandName: string;
  lang: Language;
  onChangeLang: (lang: Language) => void;
  onNavigateHome: (sectionId?: string) => void;
  onNavigateProducts: () => void;
  activeView: RouteView;
  activeSection?: string;
}

export function Header({
  brandName,
  lang,
  onChangeLang,
  onNavigateHome,
  onNavigateProducts,
  activeView,
  activeSection,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = UI_STRINGS[lang].nav;

  const navItems: Array<{ id: string; label: string; action: () => void; active: boolean }> = [
    {
      id: 'home',
      label: t.home,
      action: () => onNavigateHome('hero'),
      active: activeView === 'home' && (!activeSection || activeSection === 'hero'),
    },
    {
      id: 'products',
      label: t.products,
      action: () => onNavigateProducts(),
      active: activeView === 'products' || activeView === 'product',
    },
    {
      id: 'offers',
      label: t.offers,
      action: () => onNavigateHome('offers'),
      active: activeView === 'home' && activeSection === 'offers',
    },
    {
      id: 'reviews',
      label: t.reviews,
      action: () => onNavigateHome('reviews'),
      active: activeView === 'home' && activeSection === 'reviews',
    },
    {
      id: 'contact',
      label: t.contact,
      action: () => onNavigateHome('contact'),
      active: activeView === 'home' && activeSection === 'contact',
    },
  ];

  const langOptions: Array<{ code: Language; label: string }> = [
    { code: 'ar', label: 'العربية' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'en', label: 'English' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F4DAE4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            setMobileOpen(false);
            onNavigateHome('hero');
          }}
          className="font-display text-xl sm:text-2xl font-bold tracking-[0.08em] text-[#2A1620] hover:text-[#CC4B7C] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CC4B7C] rounded-sm"
        >
          {brandName || 'ELHAM BEAUTY'}
        </a>

        {/* Zone 2: 5 Concise Single-Line Nav Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#6E515E]"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={`relative py-1.5 whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CC4B7C] rounded-sm ${
                item.active
                  ? 'text-[#CC4B7C] font-semibold'
                  : 'text-[#6E515E] hover:text-[#2A1620]'
              }`}
            >
              {item.label}
              {item.active && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-[#CC4B7C] rounded-full"
                />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Language Switcher + Mobile Menu Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            role="group"
            aria-label="Language Switcher"
            className="hidden sm:flex items-center p-1 bg-[#FFF5F8] border border-[#F4DAE4] rounded-lg"
          >
            {langOptions.map((opt) => {
              const selected = lang === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => onChangeLang(opt.code)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CC4B7C] ${
                    selected
                      ? 'bg-[#CC4B7C] text-white'
                      : 'text-[#6E515E] hover:text-[#2A1620] hover:bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-[#F4DAE4] bg-[#FFF9FB] text-[#2A1620] hover:bg-[#FCE8F0] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#F4DAE4] bg-white px-4 py-4 space-y-3 shadow-sm">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  item.action();
                }}
                className={`w-full text-start px-3 min-h-[44px] flex items-center rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-[#FCE8F0] text-[#9D2F5A] font-semibold'
                    : 'text-[#2A1620] hover:bg-[#FFF7FA]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-2 border-t border-[#F8E6EE]">
            <div
              role="group"
              aria-label="Mobile Language Switcher"
              className="grid grid-cols-3 gap-1.5 p-1 bg-[#FFF5F8] border border-[#F4DAE4] rounded-lg"
            >
              {langOptions.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    onChangeLang(opt.code);
                    setMobileOpen(false);
                  }}
                  className={`min-h-[40px] text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    lang === opt.code
                      ? 'bg-[#CC4B7C] text-white'
                      : 'text-[#6E515E] hover:bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
