import React, { useState } from 'react';
import { Layers, School, BookOpen } from 'lucide-react';
import { PublicLevel } from '@/api/public';

export interface ProgramsSectionProps {
  levels?: PublicLevel[];
}

export const ProgramsSection: React.FC<ProgramsSectionProps> = ({ levels = [] }) => {
  const [selectedLevelId, setSelectedLevelId] = useState<string>(
    levels.length > 0 ? levels[0].id : ''
  );

  const activeLevel = levels.find((l) => l.id === selectedLevelId) || levels[0];

  if (levels.length === 0) {
    return null;
  }

  return (
    <section id="programme" className="py-16 sm:py-20 bg-white border-b border-slate-100 scroll-mt-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="inline-block px-3.5 py-1 rounded-full bg-slate-100 text-xs font-bold uppercase tracking-wider text-[#0B2545]">
            Cursus Pédagogique
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] tracking-tight">
            Niveaux, Classes & Matières
          </h2>
          <p className="text-sm text-slate-500">
            Découvrez nos cycles d'enseignement, l'ensemble des classes proposées et les matières enseignées dans chaque classe.
          </p>
        </div>

        {/* Level Switcher Tabs */}
        {levels.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {levels.map((level) => {
              const isSelected = (activeLevel?.id || selectedLevelId) === level.id;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setSelectedLevelId(level.id)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-[#0B2545] text-white shadow-md scale-[1.02]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{level.name}</span>
                  <span className="ml-2 text-xs opacity-75">
                    ({level.classesCount} {level.classesCount > 1 ? 'classes' : 'classe'})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected Level: Grid of Classes and their Subjects */}
        {activeLevel && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B2545] text-[#F5A623] flex items-center justify-center shadow-sm">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0B2545]">
                    {activeLevel.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeLevel.classes?.length || 0} classe(s) disponible(s) dans ce cycle
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-[#0B2545]">
                {activeLevel.subjectsCount} matière(s) au total
              </span>
            </div>

            {/* Grid of Classes in this Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeLevel.classes?.map((cls) => (
                <div
                  key={cls.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0B2545] flex items-center justify-center">
                          <School className="w-4 h-4" />
                        </div>
                        <h4 className="text-base font-bold text-[#0B2545]">{cls.name}</h4>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {cls.subjects?.length || 0} matière(s)
                      </span>
                    </div>

                    {/* List of Subjects for this specific class */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Matières enseignées dans cette classe :
                      </span>
                      {cls.subjects && cls.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {cls.subjects.map((sub) => (
                            <span
                              key={sub.id}
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium hover:border-[#0B2545] transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-[#0B2545]" />
                              <span>{sub.name}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Matières en cours d'organisation</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Groupes à effectif réduit</span>
                    <span className="font-semibold text-[#0B2545]">Inscriptions ouvertes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
