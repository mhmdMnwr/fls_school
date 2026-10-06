import React from 'react';
import {
  UserPlus,
  Play,
} from 'lucide-react';
import { SiteSettings } from '@/types/api';
import { PublicSiteInfo } from '@/api/public';

export interface HeroSectionProps {
  settings?: SiteSettings;
  siteInfo?: PublicSiteInfo;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings, siteInfo }) => {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const tagline =
    settings?.heroTagline ||
    settings?.tagline ||
    "Un cadre d'apprentissage moderne pour un avenir meilleur";

  const description =
    settings?.heroDescription ||
    "Nous accompagnons chaque élève dans son parcours scolaire avec une équipe pédagogique qualifiée et bienveillante.";

  return (
    <section
      id="hero"
      className="bg-[#0B2545] text-white py-14 lg:py-18 scroll-mt-20 relative overflow-hidden w-full max-w-full"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading, Tagline, Buttons & Numbers */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-block">
              <span className="text-xs uppercase tracking-widest font-bold text-slate-300">
                ÉCOLE PRIVÉE
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                <span>FLS </span>
                <span className="text-[#F5A623]">School</span>
              </h1>
              <p className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                {tagline}
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
              {description}
            </p>

            {/* The Two Main Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                type="button"
                onClick={() => scrollTo('#inscription')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#F5A623] hover:bg-[#E59819] text-[#0B2545] font-extrabold text-sm shadow-xl shadow-black/20 transition-all hover:scale-105"
              >
                <UserPlus className="w-4 h-4" />
                <span>Inscription maintenant</span>
              </button>
              <button
                type="button"
                onClick={() => scrollTo('#a-propos')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-transparent hover:bg-white/10 border border-white/40 text-white font-semibold text-sm transition-all"
              >
                <Play className="w-4 h-4 text-white" />
                <span>Découvrir l'école</span>
              </button>
            </div>

            {/* The Numbers directly under the two buttons */}
            <div className="pt-6 border-t border-white/15">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left bg-white/5 lg:bg-transparent p-2.5 lg:p-0 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-black text-[#F5A623] leading-none">
                    {siteInfo?.levelsCount ?? (siteInfo as any)?.levels ?? 4}
                  </div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">Niveaux</div>
                </div>

                <div className="text-center lg:text-left bg-white/5 lg:bg-transparent p-2.5 lg:p-0 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-black text-[#F5A623] leading-none">
                    {siteInfo?.classesCount ?? (siteInfo as any)?.classes ?? 7}
                  </div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">Classes</div>
                </div>

                <div className="text-center lg:text-left bg-white/5 lg:bg-transparent p-2.5 lg:p-0 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-black text-[#F5A623] leading-none">
                    {siteInfo?.subjectsCount ?? (siteInfo as any)?.subjects ?? 27}
                  </div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">Matières</div>
                </div>

                <div className="text-center lg:text-left bg-white/5 lg:bg-transparent p-2.5 lg:p-0 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-black text-[#F5A623] leading-none">
                    {siteInfo?.teachersCount ?? (siteInfo as any)?.teachers ?? 4}
                  </div>
                  <div className="text-xs text-slate-300 font-semibold mt-1 truncate">Professeurs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: ONLY THE IMAGE (All overlays deleted as requested) */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border-4 border-white/10 aspect-[16/11]">
              <img
                src="/images/school-hero.jpg"
                alt="Campus de FLS School"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
