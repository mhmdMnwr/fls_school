import React from 'react';
import { BookOpen, Award } from 'lucide-react';
import { PublicTeacher } from '@/api/public';

export interface TeachersSectionProps {
  teachers?: PublicTeacher[];
}

export const TeachersSection: React.FC<TeachersSectionProps> = ({ teachers = [] }) => {
  // If teachers from backend are available, use them, otherwise fallback list
  const displayTeachers = teachers.length > 0
    ? teachers
    : [
        { id: '1', firstName: 'Amina', lastName: 'Benali', subjects: ['Français'] },
        { id: '2', firstName: 'Karim', lastName: 'Ait Hamouda', subjects: ['Mathématiques'] },
        { id: '3', firstName: 'Salima', lastName: 'Saidi', subjects: ['Sciences de la Vie et de la Terre'] },
        { id: '4', firstName: 'Mohamed', lastName: 'Khaled', subjects: ['Anglais'] },
      ];

  return (
    <section id="professeurs" className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-100 scroll-mt-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] tracking-tight">
            Nos professeurs
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Une équipe pédagogique qualifiée et passionnée, au service de la réussite de nos élèves.
          </p>
        </div>

        {/* Teacher Cards Grid (NO photos as requested) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayTeachers.map((teacher: any, idx: number) => {
            const initials = `${teacher.firstName.charAt(0)}${teacher.lastName.charAt(0)}`.toUpperCase();

            return (
              <div
                key={teacher.id || idx}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-slate-100 transition-all duration-300 flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#0B2545] text-[#F5A623] font-bold text-base flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-[#0B2545] truncate">
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      Professeur certifié
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Matière(s) enseignée(s) :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.subjects && teacher.subjects.length > 0 ? (
                      teacher.subjects.map((sub: string, sIdx: number) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/80"
                        >
                          <BookOpen className="w-3 h-3 text-[#0B2545]" />
                          <span>{sub}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Matières générales</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
