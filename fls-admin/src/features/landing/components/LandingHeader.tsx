import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  UserPlus,
  BookOpen,
} from 'lucide-react';
import { SiteSettings } from '@/types/api';
import { APP_NAME } from '@/config/brand';

export interface LandingHeaderProps {
  settings?: SiteSettings;
}

const NAV_LINKS = [
  { href: '#hero', label: 'Accueil' },
  { href: '#a-propos', label: 'À propos' },
  { href: '#professeurs', label: 'Nos professeurs' },
  { href: '#programme', label: 'Niveaux & Matières' },
  { href: '#avis', label: 'Avis' },
  { href: '#inscription', label: 'Inscription' },
  { href: '#contact', label: 'Contact' },
];

export const LandingHeader: React.FC<LandingHeaderProps> = ({ settings }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 h-[78px] bg-white/98 backdrop-blur-md border-b border-slate-100 transition-all duration-200 ${
          isScrolled ? 'shadow-md shadow-slate-200/50' : ''
        }`}
      >
        <div className="max-w-[1280px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Logo & School Name */}
          <a
            href="#hero"
            onClick={(e) => scrollToSection(e, '#hero')}
            className="flex items-center gap-2.5 sm:gap-3 min-w-0 group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200 overflow-hidden group-hover:scale-105 transition-transform duration-200 p-1 shrink-0">
              <img
                src="/images/fls-logo.png"
                alt="FLS School Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="text-lg sm:text-xl font-black text-[#0B2545] leading-tight block tracking-tight">
                {APP_NAME}
              </span>
              <span className="text-[11px] text-slate-500 font-bold hidden sm:block truncate">
                Apprendre aujourd'hui, réussir demain
              </span>
            </div>
          </a>

          {/* Desktop Nav Links with bold crisp font weight */}
          <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-[13.5px] font-extrabold text-slate-800 hover:text-[#0B2545] hover:scale-[1.03] transition-all py-2 tracking-wide"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action: Inscription Button Only */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="#inscription"
              onClick={(e) => scrollToSection(e, '#inscription')}
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-bold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#0B2545] hover:bg-[#13335A] text-white shadow-md transition-all hover:scale-105"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>Inscription</span>
            </a>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[#0B2545] hover:bg-slate-100 transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#0B2545]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 w-[85%] max-w-[340px] bg-white shadow-2xl flex flex-col justify-between p-6 z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden shadow-xs p-0.5">
                    <img
                      src="/images/fls-logo.png"
                      alt="FLS School Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-base font-bold text-[#0B2545] block leading-tight">{APP_NAME}</span>
                    <span className="text-[11px] text-slate-500 font-semibold">École Privée</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-[#0B2545] hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-4">
                <ul className="space-y-1">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        onClick={(e) => scrollToSection(e, link.href)}
                        className="h-11 px-3 flex items-center text-sm font-extrabold text-slate-800 hover:text-[#0B2545] hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <a
                href="#inscription"
                onClick={(e) => scrollToSection(e, '#inscription')}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-full text-xs font-bold text-[#0B2545] bg-[#F5A623] hover:bg-[#E59819] shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Inscription</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
