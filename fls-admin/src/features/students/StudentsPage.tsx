import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Users, MoreHorizontal, Eye, Pencil, Trash2, KeyRound, Check } from 'lucide-react';
import { studentsApi } from '@/api/students';
import { levelsApi } from '@/api/levels';
import { classesApi } from '@/api/classes';
import { Student, Level, SchoolClass, Paginated } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';
import { formatDate, fullName } from '@/lib/format';
import { toast } from 'sonner';
import { useListParams } from '@/hooks/useListParams';
import { useDebounce } from '@/hooks/useDebounce';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { DataTable, Column } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { InitialsAvatar } from '@/components/common/InitialsAvatar';
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
import StudentFormDialog from './StudentFormDialog';
import ValidateRegistrationDialog from './ValidateRegistrationDialog';
import ParentAccountDialog from './ParentAccountDialog';

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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
  } = useListParams<{ levelId: string; classId: string; isActive: string; origin: string }>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [validateStudent, setValidateStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [parentAccountStudent, setParentAccountStudent] = useState<Student | null>(null);

  useEffect(() => {
    document.title = 'Élèves · FLS School';
  }, []);

  // Check ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingStudent(null);
      setDialogOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('new');
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch levels and classes
  const { data: levels = [] } = useQuery<Level[]>({
    queryKey: ['levels'],
    queryFn: levelsApi.getAll,
  });

  const { data: allClasses = [] } = useQuery<SchoolClass[]>({
    queryKey: ['classes'],
    queryFn: () => classesApi.getAll(),
  });

  const levelIdFilter = filters.levelId || 'all';
  const classIdFilter = filters.classId || 'all';
  const isActiveFilter = filters.isActive || 'all';
  const originFilter = filters.origin || 'all';

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

  const debouncedSearch = useDebounce(search, 400);

  // Fetch students
  const {
    data: studentsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery<Paginated<Student>>({
    queryKey: [
      'students',
      {
        page,
        limit,
        search: debouncedSearch,
        levelId: levelIdFilter,
        classId: classIdFilter,
        isActive: isActiveFilter,
        origin: originFilter,
      },
    ],
    queryFn: () =>
      studentsApi.getAll({
        page,
        limit,
        search: debouncedSearch || undefined,
        levelId: levelIdFilter === 'all' ? undefined : levelIdFilter,
        classId: classIdFilter === 'all' ? undefined : classIdFilter,
        isActive: isActiveFilter === 'all' ? undefined : isActiveFilter,
        origin: originFilter === 'all' ? undefined : (originFilter as 'ADMIN' | 'WEBSITE'),
      }),
    placeholderData: keepPreviousData,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentsApi.remove(id),
    onSuccess: () => {
      toast.success('Élève supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      if (err?.response?.status === 409) {
        toast.error('Suppression impossible : cet élève possède des paiements. Désactivez-le plutôt.');
      } else {
        toast.error(`Suppression impossible : ${getErrorMessage(err)}`);
      }
      setDeleteTarget(null);
    },
  });

  const columns: Column<Student>[] = [
    {
      key: 'name',
      header: 'Nom et prénom',
      render: (row) => (
        <div className="flex items-center gap-3">
          <InitialsAvatar firstName={row.firstName} lastName={row.lastName} size="sm" />
          <div className="min-w-0">
            <Link
              to={`/eleves/${row.id}`}
              className="font-semibold text-ink hover:text-brand-600 transition-colors block truncate"
            >
              {fullName(row)}
            </Link>
            {row.email && (
              <span className="text-xs text-muted block truncate">{row.email}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'schoolClass',
      header: 'Classe',
      render: (row) => (
        <span className="text-xs font-medium text-ink">
          {row.schoolClass?.name || '—'}
        </span>
      ),
    },
    {
      key: 'groupsCount',
      header: 'Groupes',
      render: (row) => (
        <StatusBadge variant="brand">
          {(row.groupsCount ?? 0) === 0
            ? '0 groupe'
            : `${row.groupsCount} ${row.groupsCount === 1 ? 'groupe' : 'groupes'}`}
        </StatusBadge>
      ),
    },
    {
      key: 'phone',
      header: 'Téléphone',
      render: (row) => <span>{row.phone || '—'}</span>,
    },
    {
      key: 'createdAt',
      header: "Date d'inscription",
      render: (row) => <span>{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'isActive',
      header: 'Statut',
      render: (row) =>
        row.origin === 'WEBSITE' && !row.isActive ? (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Pré-inscrit
          </span>
        ) : (
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
          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-md bg-white">
            <DropdownMenuItem
              onClick={() => navigate(`/eleves/${row.id}`)}
              className="rounded-lg text-xs py-2 cursor-pointer hover:bg-brand-50"
            >
              <Eye className="w-3.5 h-3.5 mr-2 text-muted" />
              Voir
            </DropdownMenuItem>
            {row.origin === 'WEBSITE' && !row.isActive && (
              <DropdownMenuItem
                onClick={() => setValidateStudent(row)}
                className="rounded-lg text-xs py-2 cursor-pointer hover:bg-amber-50 text-amber-700 font-semibold"
              >
                <Check className="w-3.5 h-3.5 mr-2 text-amber-600" />
                Valider l'inscription
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => setParentAccountStudent(row)}
              className="rounded-lg text-xs py-2 cursor-pointer hover:bg-brand-50 text-[#4338CA]"
            >
              <KeyRound className="w-3.5 h-3.5 mr-2 text-[#4338CA]" />
              Accès Parent
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditingStudent(row);
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
        title="Élèves"
        subtitle="Gérez les élèves inscrits dans votre établissement"
        actionLabel="Ajouter un élève"
        onAction={() => {
          setEditingStudent(null);
          setDialogOpen(true);
        }}
      />

      {/* FilterBar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par nom, téléphone..."
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      >
        {/* Niveau Select */}
        <Select
          value={levelIdFilter}
          onValueChange={(val) => {
            setFilters({ levelId: val, classId: undefined });
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

        {/* Statut Select */}
        <Select
          value={isActiveFilter}
          onValueChange={(val) => setFilter('isActive', val)}
        >
          <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-xl bg-white border-line text-sm">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="true">Actif</SelectItem>
            <SelectItem value="false">Inactif</SelectItem>
          </SelectContent>
        </Select>

        {/* Origine Select */}
        <Select
          value={originFilter}
          onValueChange={(val) => setFilter('origin', val)}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl bg-white border-line text-sm">
            <SelectValue placeholder="Toutes les origines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les origines</SelectItem>
            <SelectItem value="ADMIN">Administration</SelectItem>
            <SelectItem value="WEBSITE">Site web (pré-inscrits)</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      {/* Table & Pagination Card */}
      <div className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden">
        <DataTable
          columns={columns}
          data={studentsResponse?.data || []}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyState={
            <EmptyState
              icon={Users}
              title="Aucun élève trouvé"
              description={
                hasActiveFilters
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par inscrire un élève dans votre école.'
              }
              actionLabel={hasActiveFilters ? undefined : 'Ajouter un élève'}
              onAction={
                hasActiveFilters
                  ? undefined
                  : () => {
                      setEditingStudent(null);
                      setDialogOpen(true);
                    }
              }
            />
          }
        />

        {studentsResponse && studentsResponse.meta.total > 0 && (
          <Pagination
            total={studentsResponse.meta.total}
            page={studentsResponse.meta.page}
            limit={studentsResponse.meta.limit}
            totalPages={studentsResponse.meta.totalPages}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        )}
      </div>

      {/* Student Form Dialog */}
      <StudentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingStudent}
        allClasses={allClasses}
        levels={levels}
      />

      {/* Validate Registration Dialog */}
      <ValidateRegistrationDialog
        open={!!validateStudent}
        onOpenChange={(open) => !open && setValidateStudent(null)}
        studentId={validateStudent?.id || ''}
        studentName={fullName(validateStudent)}
        initialClassId={
          typeof validateStudent?.schoolClass === 'object' && validateStudent?.schoolClass
            ? validateStudent.schoolClass.id
            : undefined
        }
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Supprimer cet élève ?"
        description={
          deleteTarget
            ? `Voulez-vous vraiment supprimer l'élève ${fullName(deleteTarget)} ? Cette action est irréversible.`
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

      {/* Parent Account Dialog */}
      <ParentAccountDialog
        open={!!parentAccountStudent}
        onOpenChange={(open) => !open && setParentAccountStudent(null)}
        studentId={parentAccountStudent?.id || ''}
        studentName={fullName(parentAccountStudent)}
      />
    </div>
  );
}
