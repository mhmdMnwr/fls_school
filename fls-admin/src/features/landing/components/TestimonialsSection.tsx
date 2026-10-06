import React from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { PublicTestimonial, PublicTestimonialSummary } from '@/api/public';

export interface TestimonialsSectionProps {
  testimonials?: PublicTestimonial[];
  summary?: PublicTestimonialSummary | null;
}

const DEFAULT_TESTIMONIALS = [
  {
    authorName: 'Mme. Belkacem',
    message:
      'Une école exceptionnelle ! Mon fils a beaucoup progressé depuis qu’il a rejoint cet établissement. L’équipe est très professionnelle et attentive.',
    rating: 5,
  },
  {
    authorName: 'M. Rahmani',
    message:
      'Un cadre idéal pour l’apprentissage. Ma fille est toujours heureuse d’aller à l’école. Merci pour tout !',
    rating: 5,
  },
  {
    authorName: 'Mme. Khelifi',
    message:
      'Une équipe pédagogique au top, très à l’écoute des élèves et des parents. Je recommande vivement cet établissement !',
    rating: 5,
  },
];

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials = [],
  summary,
}) => {
  // Use backend testimonials if present, otherwise default fallback (NO images)
  const cards = testimonials.length > 0
    ? testimonials.map((item) => ({
        authorName: item.authorName,
        message: item.message,
        rating: item.rating,
      }))
    : DEFAULT_TESTIMONIALS;

  return (
    <section id="avis" className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-100 scroll-mt-20 overflow-x-hidden w-full max-w-full">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 min-w-0">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1.5 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] tracking-tight">
              Avis des parents
            </h2>
            <p className="text-sm text-slate-500">
              La satisfaction de nos parents est notre plus grande fierté.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-[#0B2545] hover:border-[#0B2545] transition-colors"
              aria-label="Avis précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-[#0B2545] hover:border-[#0B2545] transition-colors"
              aria-label="Avis suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Cards (NO images as requested) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col justify-between space-y-5 hover:shadow-xl transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 text-[#F5A623] flex items-center justify-center shrink-0">
                  <Quote className="w-5 h-5 fill-[#F5A623]/20" />
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  "{item.message}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-[#0B2545]">
                  — {item.authorName}
                </div>
                <div className="flex items-center gap-0.5 text-[#F5A623]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= item.rating
                          ? 'fill-[#F5A623] text-[#F5A623]'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
