import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { subjectsApi } from '@/api/subjects';
import { classesApi } from '@/api/classes';
import { levelsApi } from '@/api/levels';
import { Subject, Level, SchoolClass, Paginated } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';
import { toast } from 'sonner';
import { useListParams } from '@/hooks/useListParams';
import { useDebounce } from '@/hooks/useDebounce';
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
import SubjectFormDialog from './SubjectFormDialog';

export default function SubjectsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    page,
    limit,
    search,
    filters,
    setPage,
    setLimit,
    setSearch,
    setFilter,
    setFilters,
    resetFilters,
    hasActiveFilters,
  } = useListParams<{ classId: string; levelId: string }>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  useEffect(() => {
    document.title = 'Matières · FLS School';
  }, []);

  // Check ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingSubject(null);
      setDialogOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('new');
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch levels and classes for filter dropdowns and dialog
  const { data: levels = [] } = useQuery<Level[]>({
    queryKey: ['levels'],
    queryFn: levelsApi.getAll,
  });

  const { data: allClasses = [] } = useQuery<SchoolClass[]>({
    queryKey: ['classes'],
    queryFn: () => classesApi.getAll(),
  });

  // Filtered classes by selected level in filters
  const levelIdFilter = filters.levelId || 'all';
  const classIdFilter = filters.classId || 'all';

  const filterableClasses = React.useMemo(() => {
    if (levelIdFilter === 'all') return allClasses;
    return allClasses.filter((c) => {
      const lvlId =
        typeof c.level === 'object' && c.level
          ? ((c.level as any).id || (c.level as any)._id)
          : String(c.level || '');
      return lvlId === levelIdFilter;
    });
  }, [allClasses, levelIdFilter]);

  const debouncedSearch = useDebounce(search, 400);

  // Fetch subjects with pagination & filters
  const {
    data: subjectsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery<Paginated<Subject>>({
    queryKey: [
      'subjects',
      {
        page,
        limit,
        search: debouncedSearch,
        classId: classIdFilter === 'all' ? undefined : classIdFilter,
      },
    ],
    queryFn: () =>
      subjectsApi.getAll({
        page,
        limit,
        search: debouncedSearch || undefined,
        classId: classIdFilter === 'all' ? undefined : classIdFilter,
      }),
    placeholderData: keepPreviousData,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => subjectsApi.remove(id),
    onSuccess: () => {
      toast.success('Matière supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      const msg = getErrorMessage(err);
      toast.error(`Suppression impossible : ${msg}`);
      setDeleteTarget(null);
    },
  });

  const columns: Column<Subject>[] = [
    {
      key: 'name',
      header: 'Matière',
      render: (row) => (
        <div className="flex items-center gap-3">
          <IconTile icon={BookOpen} variant="purple" size="sm" />
          <span className="font-semibold text-ink">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'schoolClass',
      header: 'Classe',
      render: (row) => {
        const cls =
          typeof row.schoolClass === 'object' && row.schoolClass
            ? row.schoolClass
            : allClasses.find((c) => c.id === row.schoolClass);
        return <span>{cls?.name || '—'}</span>;
      },
    },
    {
      key: 'level',
      header: 'Niveau',
      render: (row) => {
        const cls =
          typeof row.schoolClass === 'object' && row.schoolClass
            ? row.schoolClass
            : allClasses.find((c) => c.id === row.schoolClass);
        let levelName = '—';
        if (cls) {
          if (typeof cls.level === 'object' && cls.level) {
            levelName = cls.level.name;
          } else {
            const lvl = levels.find((l) => l.id === cls.level);
            if (lvl) levelName = lvl.name;
          }
        }
        return <StatusBadge variant="brand">{levelName}</StatusBadge>;
      },
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
              onClick={() => {
                setEditingSubject(row);
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
        title="Matières"
        subtitle="Les matières enseignées pour chaque classe"
        actionLabel="Ajouter une matière"
        onAction={() => {
          setEditingSubject(null);
          setDialogOpen(true);
        }}
      />

      {/* FilterBar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une matière..."
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      >
        {/* Niveau Select */}
        <Select
          value={levelIdFilter}
          onValueChange={(val) => {
            setFilters({ levelId: val, classId: undefined }); // reset dependent class
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl bg-white border-line text-sm">
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
          onValueChange={(val) => setFilter('classId', val)}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl bg-white border-line text-sm">
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
      </FilterBar>

      {/* Table & Pagination Card */}
      <div className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden">
        <DataTable
          columns={columns}
          data={subjectsResponse?.data || []}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyState={
            <EmptyState
              icon={BookOpen}
              title="Aucune matière trouvée"
              description={
                hasActiveFilters
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par créer une matière pour une classe.'
              }
              actionLabel={hasActiveFilters ? undefined : 'Ajouter une matière'}
              onAction={
                hasActiveFilters
                  ? undefined
                  : () => {
                      setEditingSubject(null);
                      setDialogOpen(true);
                    }
              }
            />
          }
        />

        {subjectsResponse && subjectsResponse.meta.total > 0 && (
          <Pagination
            total={subjectsResponse.meta.total}
            page={subjectsResponse.meta.page}
            limit={subjectsResponse.meta.limit}
            totalPages={subjectsResponse.meta.totalPages}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        )}
      </div>

      {/* Subject Form Dialog */}
      <SubjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        levels={levels}
        allClasses={allClasses}
        initialData={editingSubject}
        defaultClassId={classIdFilter !== 'all' ? classIdFilter : undefined}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Supprimer cette matière ?"
        description={
          deleteTarget
            ? `Voulez-vous vraiment supprimer la matière « ${deleteTarget.name} » ? Cette action est irréversible.`
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
