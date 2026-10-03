import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { UsersRound, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { groupsApi } from '@/api/groups';
import { levelsApi } from '@/api/levels';
import { classesApi } from '@/api/classes';
import { subjectsApi } from '@/api/subjects';
import { teachersApi } from '@/api/teachers';
import { StudyGroup, Level, SchoolClass, Subject, Teacher, Paginated } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';
import { fullName } from '@/lib/format';
import { toast } from 'sonner';
import { useListParams } from '@/hooks/useListParams';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { DataTable, Column } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { IconTile } from '@/components/common/IconTile';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import GroupFormDialog from './GroupFormDialog';

export default function GroupsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    page,
    limit,
    filters,
    setPage,
    setLimit,
    setFilter,
    setFilters,
    resetFilters,
    hasActiveFilters,
  } = useListParams<{
    levelId: string;
    classId: string;
    subjectId: string;
    teacherId: string;
    isActive: string;
  }>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<StudyGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudyGroup | null>(null);

  useEffect(() => {
    document.title = 'Groupes · FLS School';
  }, []);

  // Check ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingGroup(null);
      setDialogOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('new');
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch filter dropdown options
  const { data: levels = [] } = useQuery<Level[]>({
    queryKey: ['levels'],
    queryFn: levelsApi.getAll,
  });

  const { data: allClasses = [] } = useQuery<SchoolClass[]>({
    queryKey: ['classes'],
    queryFn: () => classesApi.getAll(),
  });

  const { data: allTeachers = [] } = useQuery<Teacher[]>({
    queryKey: ['teachers', 'all'],
    queryFn: async () => {
      const res = await teachersApi.getAll({ limit: 100 });
      return res.data;
    },
  });

  const levelIdFilter = filters.levelId || 'all';
  const classIdFilter = filters.classId || 'all';
  const subjectIdFilter = filters.subjectId || 'all';
  const teacherIdFilter = filters.teacherId || 'all';
  const isActiveFilter = filters.isActive || 'all';

  // Classes filtered by level
  const filterableClasses = useMemo(() => {
    if (levelIdFilter === 'all') return allClasses;
    return allClasses.filter((c) => {
      const lvlId =
        typeof c.level === 'object' && c.level
          ? ((c.level as any).id || (c.level as any)._id)
          : String(c.level || '');
      return lvlId === levelIdFilter;
    });
  }, [allClasses, levelIdFilter]);

  // Subjects filtered by class
  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects', { classId: classIdFilter, limit: 100 }],
    queryFn: () => subjectsApi.getAll({ classId: classIdFilter, limit: 100 }),
    enabled: classIdFilter !== 'all',
  });

  const filterableSubjects = classIdFilter !== 'all' ? subjectsResponse?.data || [] : [];

  // Fetch groups
  const {
    data: groupsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery<Paginated<StudyGroup>>({
    queryKey: [
      'groups',
      {
        page,
        limit,
        classId: classIdFilter,
        subjectId: subjectIdFilter,
        teacherId: teacherIdFilter,
        isActive: isActiveFilter,
      },
    ],
    queryFn: () =>
      groupsApi.getAll({
        page,
        limit,
        classId: classIdFilter === 'all' ? undefined : classIdFilter,
        subjectId: subjectIdFilter === 'all' ? undefined : subjectIdFilter,
        teacherId: teacherIdFilter === 'all' ? undefined : teacherIdFilter,
        isActive: isActiveFilter === 'all' ? undefined : isActiveFilter,
      }),
    placeholderData: keepPreviousData,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => groupsApi.remove(id),
    onSuccess: () => {
      toast.success('Groupe supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(`Suppression impossible : ${getErrorMessage(err)}`);
      setDeleteTarget(null);
    },
  });

  const columns: Column<StudyGroup>[] = [
    {
      key: 'group',
      header: 'Groupe',
      render: (row) => (
        <div className="flex items-center gap-3">
          <IconTile icon={UsersRound} variant="indigo" size="sm" />
          <div className="min-w-0">
            <Link
              to={`/groupes/${row.id}`}
              className="font-semibold text-ink hover:text-brand-600 transition-colors block truncate"
            >
              {row.subject?.name || 'Matière'}
            </Link>
            {row.name && (
              <span className="text-xs text-muted block truncate">{row.name}</span>
            )}
            {row.studyTime && row.studyTime.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {row.studyTime.slice(0, 2).map((st, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded capitalize"
                  >
                    {st.weekday} {st.startTime}-{st.endTime}
                  </span>
                ))}
                {row.studyTime.length > 2 && (
                  <span className="text-[11px] text-muted font-medium self-center">
                    +{row.studyTime.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'schoolClass',
      header: 'Classe',
      render: (row) => {
        const sc = row.subject?.schoolClass;
        const clsName =
          sc && typeof sc === 'object'
            ? sc.name
            : allClasses.find((c) => c.id === sc)?.name || '—';
        return <span>{clsName}</span>;
      },
    },
    {
      key: 'teacher',
      header: 'Professeur',
      render: (row) => (
        <span>
          {row.teacher ? fullName(row.teacher) : '—'}
        </span>
      ),
    },
    {
      key: 'studentsCount',
      header: 'Élèves',
      render: (row) => (
        <span className="font-medium text-body">
          {row.studentsCount ?? 0}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Statut',
      render: (row) => (
        <StatusBadge variant={row.isActive ? 'success' : 'neutral'}>
          {row.isActive ? 'Actif' : 'Inactif'}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg text-muted hover:text-ink"
              aria-label="Actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 shadow-md bg-white">
            <DropdownMenuItem
              onClick={() => navigate(`/groupes/${row.id}`)}
              className="rounded-lg text-xs py-2 cursor-pointer hover:bg-brand-50"
            >
              <Eye className="w-3.5 h-3.5 mr-2 text-muted" />
              Voir
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditingGroup(row);
                setDialogOpen(true);
              }}
              className="rounded-lg text-xs py-2 cursor-pointer hover:bg-brand-50"
            >
              <Pencil className="w-3.5 h-3.5 mr-2 text-muted" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-line-soft" />
            <DropdownMenuItem
              onClick={() => setDeleteTarget(row)}
              className="rounded-lg text-xs py-2 text-danger hover:bg-danger/10 cursor-pointer focus:text-danger focus:bg-danger/10"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2 text-danger" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Groupes"
        subtitle="Associez un professeur à une matière pour former un groupe"
        actionLabel="Créer un groupe"
        onAction={() => {
          setEditingGroup(null);
          setDialogOpen(true);
        }}
      />

      {/* FilterBar */}
      <FilterBar
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      >
        {/* Niveau Select */}
        <Select
          value={levelIdFilter}
          onValueChange={(val) => {
            setFilters({ levelId: val, classId: undefined, subjectId: undefined });
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-xl bg-white border-line text-sm">
            <SelectValue placeholder="Tous les niveaux" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les niveaux</SelectItem>
            {levels.map((lvl) => (
              <SelectItem key={lvl.id} value={lvl.id}>
                {lvl.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Classe Select (Dependent) */}
        <Select
          value={classIdFilter}
          onValueChange={(val) => {
            setFilters({ classId: val, subjectId: undefined });
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-xl bg-white border-line text-sm">
            <SelectValue placeholder="Toutes les classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les classes</SelectItem>
            {filterableClasses.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Matière Select (Dependent on class) */}
        <Select
          value={subjectIdFilter}
          onValueChange={(val) => setFilter('subjectId', val)}
          disabled={classIdFilter === 'all'}
        >
          <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-xl bg-white border-line text-sm">
            <SelectValue placeholder="Toutes les matières" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les matières</SelectItem>
            {filterableSubjects.map((sub: Subject) => (
              <SelectItem key={sub.id} value={sub.id}>
                {sub.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Professeur Select */}
        <Select
          value={teacherIdFilter}
          onValueChange={(val) => setFilter('teacherId', val)}
        >
          <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-xl bg-white border-line text-sm">
            <SelectValue placeholder="Tous les profs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les professeurs</SelectItem>
            {allTeachers.map((tea) => (
              <SelectItem key={tea.id} value={tea.id}>
                {fullName(tea)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Statut Select */}
        <Select
          value={isActiveFilter}
          onValueChange={(val) => setFilter('isActive', val)}
        >
          <SelectTrigger className="w-full sm:w-[140px] h-10 rounded-xl bg-white border-line text-sm">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="true">Actif</SelectItem>
            <SelectItem value="false">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      {/* Table & Pagination Card */}
      <div className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden">
        <DataTable
          columns={columns}
          data={groupsResponse?.data || []}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyState={
            <EmptyState
              icon={UsersRound}
              title="Aucun groupe trouvé"
              description={
                hasActiveFilters
                  ? 'Essayez de modifier vos critères de filtrage.'
                  : 'Associez un enseignant à une matière pour créer votre premier groupe.'
              }
              actionLabel={hasActiveFilters ? undefined : 'Créer un groupe'}
              onAction={
                hasActiveFilters
                  ? undefined
                  : () => {
                      setEditingGroup(null);
                      setDialogOpen(true);
                    }
              }
            />
          }
        />

        {groupsResponse && groupsResponse.meta.total > 0 && (
          <Pagination
            total={groupsResponse.meta.total}
            page={groupsResponse.meta.page}
            limit={groupsResponse.meta.limit}
            totalPages={groupsResponse.meta.totalPages}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        )}
      </div>

      {/* Group Form Dialog */}
      <GroupFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        levels={levels}
        allClasses={allClasses}
        initialData={editingGroup}
        defaultClassId={classIdFilter !== 'all' ? classIdFilter : undefined}
        defaultSubjectId={subjectIdFilter !== 'all' ? subjectIdFilter : undefined}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Supprimer ce groupe ?"
        description={
          deleteTarget
            ? `Voulez-vous vraiment supprimer le groupe « ${deleteTarget.subject?.name || ''} » ? Les séances associées seront également supprimées.`
            : ''
        }
        confirmLabel="Supprimer"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
          }
        }}
      />
    </div>
  );
}
