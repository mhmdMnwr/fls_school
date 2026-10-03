import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Layers,
  Pencil,
  Trash2,
  ChevronDown,
  Plus,
  BookOpen,
} from 'lucide-react';
import { levelsApi } from '@/api/levels';
import { classesApi } from '@/api/classes';
import { Level, SchoolClass } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { IconTile } from '@/components/common/IconTile';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ListPageSkeleton } from '@/components/common/PageSkeletons';
import LevelFormDialog from './LevelFormDialog';
import ClassFormDialog from './ClassFormDialog';

export default function LevelsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // State for forms & dialogs
  const [levelDialogOpen, setLevelDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [classDefaultLevelId, setClassDefaultLevelId] = useState<string | undefined>();

  // State for deletes
  const [deleteLevelTarget, setDeleteLevelTarget] = useState<Level | null>(null);
  const [deleteClassTarget, setDeleteClassTarget] = useState<SchoolClass | null>(null);

  // Accordion open levels
  const [openLevelIds, setOpenLevelIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.title = 'Niveaux et classes · FLS School';
  }, []);

  // Check ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setSelectedLevel(null);
      setLevelDialogOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('new');
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch levels and classes
  const {
    data: levels,
    isLoading: isLoadingLevels,
    isError: isLevelsError,
    refetch: refetchLevels,
  } = useQuery<Level[]>({
    queryKey: ['levels'],
    queryFn: levelsApi.getAll,
  });

  const {
    data: classes,
    isLoading: isLoadingClasses,
    isError: isClassesError,
    refetch: refetchClasses,
  } = useQuery<SchoolClass[]>({
    queryKey: ['classes'],
    queryFn: () => classesApi.getAll(),
  });

  // Open first level card by default when levels load
  useEffect(() => {
    if (levels && levels.length > 0 && Object.keys(openLevelIds).length === 0) {
      setOpenLevelIds({ [levels[0].id]: true });
    }
  }, [levels, openLevelIds]);

  const toggleLevel = (levelId: string) => {
    setOpenLevelIds((prev) => ({
      ...prev,
      [levelId]: !prev[levelId],
    }));
  };

  // Group classes by levelId
  const classesByLevel = React.useMemo(() => {
    const map: Record<string, SchoolClass[]> = {};
    if (!classes) return map;
    for (const cls of classes) {
      const lvlId =
        typeof cls.level === 'object' && cls.level
          ? ((cls.level as any).id || (cls.level as any)._id)
          : String(cls.level || '');
      if (!map[lvlId]) map[lvlId] = [];
      map[lvlId].push(cls);
    }
    return map;
  }, [classes]);

  // Delete level mutation
  const deleteLevelMutation = useMutation({
    mutationFn: (id: string) => levelsApi.remove(id),
    onSuccess: () => {
      toast.success('Niveau supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteLevelTarget(null);
    },
    onError: (err: any) => {
      const msg = getErrorMessage(err);
      toast.error(`Suppression impossible : ${msg}`);
      setDeleteLevelTarget(null);
    },
  });

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: (id: string) => classesApi.remove(id),
    onSuccess: () => {
      toast.success('Classe supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteClassTarget(null);
    },
    onError: (err: any) => {
      const msg = getErrorMessage(err);
      toast.error(`Suppression impossible : ${msg}`);
      setDeleteClassTarget(null);
    },
  });

  if (isLoadingLevels || isLoadingClasses) {
    return <ListPageSkeleton />;
  }

  if (isLevelsError || isClassesError) {
    return (
      <ErrorState
        onRetry={() => {
          refetchLevels();
          refetchClasses();
        }}
      />
    );
  }

  const sortedLevels = [...(levels || [])].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Niveaux et classes"
        subtitle="Organisez les niveaux scolaires et leurs classes"
        actionLabel="Ajouter un niveau"
        onAction={() => {
          setSelectedLevel(null);
          setLevelDialogOpen(true);
        }}
      />

      {sortedLevels.length === 0 ? (
        <div className="bg-white rounded-2xl border border-line/60 shadow-xs">
          <EmptyState
            icon={Layers}
            title="Aucun niveau créé"
            description="Commencez par ajouter un cycle d'enseignement (ex. Primaire, CEM, Lycée)."
            actionLabel="Ajouter un niveau"
            onAction={() => {
              setSelectedLevel(null);
              setLevelDialogOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {sortedLevels.map((level) => {
            const isOpen = !!openLevelIds[level.id];
            const levelClasses = classesByLevel[level.id] || [];
            const classesCount = level.classesCount ?? levelClasses.length;
            const studentsCount = level.studentsCount ?? 0;

            return (
              <div
                key={level.id}
                className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden transition-all duration-150"
              >
                {/* Level Card Header */}
                <div
                  className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-[#F8F9FD] select-none transition-colors"
                  onClick={() => toggleLevel(level.id)}
                >
                  <div className="flex items-center gap-3.5">
                    <IconTile icon={Layers} variant="green" size="sm" />
                    <div>
                      <h2 className="text-base font-bold text-ink leading-tight">
                        {level.name}
                      </h2>
                      <p className="text-xs text-muted mt-0.5">
                        {classesCount} classe{classesCount !== 1 ? 's' : ''} ·{' '}
                        {studentsCount} élève{studentsCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLevel(level);
                        setLevelDialogOpen(true);
                      }}
                      className="p-2 rounded-xl text-muted hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="Modifier le niveau"
                      aria-label="Modifier le niveau"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteLevelTarget(level)}
                      className="p-2 rounded-xl text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                      title="Supprimer le niveau"
                      aria-label="Supprimer le niveau"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLevel(level.id)}
                      className="p-2 rounded-xl text-muted hover:text-ink transition-transform duration-200"
                      aria-label={isOpen ? 'Replier' : 'Déplier'}
                    >
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform duration-200',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Level Card Body (Classes List) */}
                {isOpen && (
                  <div className="border-t border-line-soft bg-white p-4 sm:p-6 space-y-4">
                    {levelClasses.length === 0 ? (
                      <p className="text-sm text-muted py-2 italic">
                        Aucune classe dans ce niveau.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-line-soft">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="h-10 bg-[#F8F9FD] border-b border-line-soft text-xs font-medium text-muted">
                              <th className="px-4">Classe</th>
                              <th className="px-4">Élèves</th>
                              <th className="px-4">Matières</th>
                              <th className="px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {levelClasses.map((cls) => (
                              <tr
                                key={cls.id}
                                className="h-12 border-b border-line-soft hover:bg-[#F8F9FF] text-body transition-colors"
                              >
                                <td className="px-4 font-semibold text-ink">
                                  {cls.name}
                                </td>
                                <td className="px-4 text-muted">
                                  {cls.studentsCount ?? 0} élève
                                  {(cls.studentsCount ?? 0) > 1 ? 's' : ''}
                                </td>
                                <td className="px-4">
                                  <Link
                                    to={`/matieres?classId=${cls.id}`}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                                  >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    Voir les matières
                                  </Link>
                                </td>
                                <td className="px-4 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedClass(cls);
                                        setClassDefaultLevelId(level.id);
                                        setClassDialogOpen(true);
                                      }}
                                      className="p-1.5 rounded-lg text-muted hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                      title="Modifier la classe"
                                      aria-label="Modifier la classe"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteClassTarget(cls)}
                                      className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                                      title="Supprimer la classe"
                                      aria-label="Supprimer la classe"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClass(null);
                          setClassDefaultLevelId(level.id);
                          setClassDialogOpen(true);
                        }}
                        className="rounded-xl text-xs gap-1.5 h-9 font-medium hover:bg-brand-50 hover:text-brand-700 hover:border-brand-500/30"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter une classe
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Level Form Dialog */}
      <LevelFormDialog
        open={levelDialogOpen}
        onOpenChange={setLevelDialogOpen}
        initialData={selectedLevel}
        defaultPosition={sortedLevels.length}
      />

      {/* Class Form Dialog */}
      <ClassFormDialog
        open={classDialogOpen}
        onOpenChange={setClassDialogOpen}
        levels={sortedLevels}
        initialData={selectedClass}
        defaultLevelId={classDefaultLevelId}
        lockLevel={!!classDefaultLevelId && !selectedClass}
      />

      {/* Delete Level Confirmation */}
      <ConfirmDialog
        open={!!deleteLevelTarget}
        onOpenChange={(open) => !open && setDeleteLevelTarget(null)}
        title="Supprimer ce niveau ?"
        description={
          deleteLevelTarget
            ? `Voulez-vous vraiment supprimer le niveau « ${deleteLevelTarget.name} » ? Cette action est irréversible.`
            : ''
        }
        confirmLabel="Supprimer"
        isLoading={deleteLevelMutation.isPending}
        onConfirm={() => {
          if (deleteLevelTarget) {
            deleteLevelMutation.mutate(deleteLevelTarget.id);
          }
        }}
      />

      {/* Delete Class Confirmation */}
      <ConfirmDialog
        open={!!deleteClassTarget}
        onOpenChange={(open) => !open && setDeleteClassTarget(null)}
        title="Supprimer cette classe ?"
        description={
          deleteClassTarget
            ? `Voulez-vous vraiment supprimer la classe « ${deleteClassTarget.name} » ? Cette action est irréversible.`
            : ''
        }
        confirmLabel="Supprimer"
        isLoading={deleteClassMutation.isPending}
        onConfirm={() => {
          if (deleteClassTarget) {
            deleteClassMutation.mutate(deleteClassTarget.id);
          }
        }}
      />
    </div>
  );
}
