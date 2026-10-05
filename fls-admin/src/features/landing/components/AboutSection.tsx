import React from 'react';
import {
  Users,
  GraduationCap,
  Star,
  Shield,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { SiteSettings } from '@/types/api';

export interface AboutSectionProps {
  settings?: SiteSettings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings }) => {
  const title = settings?.aboutTitle || 'À propos de notre école';
  const text1 =
    settings?.aboutText1 ||
    "FLS School est un établissement privé qui offre un enseignement de qualité, dans un environnement sain et sécurisé. Notre objectif est de développer les compétences de chaque élève, tout en favorisant leur épanouissement personnel et leur réussite.";
  const text2 =
    settings?.aboutText2 ||
    "Nos équipes pédagogiques expérimentées appliquent des méthodes innovantes favorisant l'autonomie, la curiosité et l'épanouissement scolaire de nos élèves.";

  return (
    <section id="a-propos" className="py-16 sm:py-20 bg-white border-b border-slate-100 scroll-mt-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Column 1: School Building Photo as in reference */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-100 aspect-[4/3] lg:aspect-auto lg:h-[320px] group">
              <img
                src="/images/school-building.jpg"
                alt="Bâtiment et campus de FLS School"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Column 2: Presentation & 3 key features */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] tracking-tight">
                {title}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {text1}
              </p>
              {text2 && (
                <p className="text-xs text-slate-500 leading-relaxed">
                  {text2}
                </p>
              )}
            </div>

            {/* 3 bullet features matching reference: icons in circles */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="w-9 h-9 rounded-full bg-[#0B2545] text-white flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                  <GraduationCap className="w-4 h-4 text-[#F5A623]" />
                </div>
                <div className="text-xs font-bold text-[#0B2545] leading-tight">
                  Un enseignement
                </div>
                <div className="text-[11px] text-slate-500">de qualité</div>
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <div className="w-9 h-9 rounded-full bg-[#0B2545] text-white flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                  <Users className="w-4 h-4 text-[#F5A623]" />
                </div>
                <div className="text-xs font-bold text-[#0B2545] leading-tight">
                  Un encadrement
                </div>
                <div className="text-[11px] text-slate-500">bienveillant</div>
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <div className="w-9 h-9 rounded-full bg-[#0B2545] text-white flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                  <Star className="w-4 h-4 text-[#F5A623]" />
                </div>
                <div className="text-xs font-bold text-[#0B2545] leading-tight">
                  Des résultats
                </div>
                <div className="text-[11px] text-slate-500">concrets</div>
              </div>
            </div>
          </div>

          {/* Column 3: Light pastel blue card with 3 features as in reference */}
          <div className="lg:col-span-3">
            <div className="bg-[#F0F5FA] rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white text-[#0B2545] flex items-center justify-center shrink-0 shadow-xs border border-slate-200/60">
                  <Users className="w-5 h-5 text-[#0B2545]" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#0B2545] leading-tight">
                    Classes à effectif réduit
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    pour un meilleur suivi individuel
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white text-[#0B2545] flex items-center justify-center shrink-0 shadow-xs border border-slate-200/60">
                  <Sparkles className="w-5 h-5 text-[#F5A623]" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#0B2545] leading-tight">
                    Activités extra-scolaires
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    sportives, artistiques et culturelles
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white text-[#0B2545] flex items-center justify-center shrink-0 shadow-xs border border-slate-200/60">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#0B2545] leading-tight">
                    Environnement sécurisé
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    moderne, équipé et surveillé
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
