import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { InitialsAvatar } from '@/components/common/InitialsAvatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SearchStudent {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  schoolClass?: { name: string } | null;
}

interface SearchTeacher {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
}

export const GlobalSearch: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<SearchStudent[]>([]);
  const [teachers, setTeachers] = useState<SearchTeacher[]>([]);

  // Focus with '/' shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (
        e.key === '/' &&
        activeTag !== 'INPUT' &&
        activeTag !== 'TEXTAREA' &&
        !document.activeElement?.getAttribute('contenteditable')
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setStudents([]);
      setTeachers([]);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        const [studentsRes, teachersRes] = await Promise.all([
          api.get<{ data: SearchStudent[] }>('/students', {
            params: { search: trimmed, limit: 5 },
          }),
          api.get<{ data: SearchTeacher[] }>('/teachers', {
            params: { search: trimmed, limit: 5 },
          }),
        ]);

        if (active) {
          setStudents(studentsRes.data.data || []);
          setTeachers(teachersRes.data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setIsLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  const hasResults = students.length > 0 || teachers.length > 0;

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-[420px]', className)}>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen && e.target.value.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder="Rechercher un élève, un professeur... (Tapez /)"
          className="w-full h-11 pl-10 pr-9 rounded-xl bg-white/80 backdrop-blur-xs border-0 text-sm text-ink placeholder:text-muted shadow-xs transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
        {isLoading && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted animate-spin" />
        )}
      </div>

      {/* Popover results */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-line/60 shadow-xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="max-h-[360px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="space-y-3 p-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !hasResults ? (
              <div className="py-6 text-center text-sm text-muted">
                Aucun résultat pour « {query} »
              </div>
            ) : (
              <div className="space-y-3">
                {/* Students Group */}
                {students.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted px-3 py-1">
                      Élèves
                    </div>
                    {students.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => handleSelect(`/eleves/${student.id}`)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-brand-50 cursor-pointer transition-colors"
                      >
                        <InitialsAvatar
                          firstName={student.firstName}
                          lastName={student.lastName}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-ink truncate">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-xs text-muted truncate">
                            {student.email || student.phone || student.schoolClass?.name || 'Élève'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Teachers Group */}
                {teachers.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted px-3 py-1">
                      Professeurs
                    </div>
                    {teachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        onClick={() => handleSelect(`/profs/${teacher.id}`)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-brand-50 cursor-pointer transition-colors"
                      >
                        <InitialsAvatar
                          firstName={teacher.firstName}
                          lastName={teacher.lastName}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-ink truncate">
                            {teacher.firstName} {teacher.lastName}
                          </div>
                          <div className="text-xs text-muted truncate">
                            {teacher.phone || teacher.email || 'Professeur'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
