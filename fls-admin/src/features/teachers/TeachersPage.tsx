import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { GraduationCap, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { teachersApi } from '@/api/teachers';
import { Teacher, Paginated } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';
import { fullName } from '@/lib/format';
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
import TeacherFormDialog from './TeacherFormDialog';

export default function TeachersPage() {
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
    resetFilters,
    hasActiveFilters,
  } = useListParams<{ isActive: string }>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  useEffect(() => {
    document.title = 'Professeurs · FLS School';
  }, []);

  // Check ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingTeacher(null);
      setDialogOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('new');
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const debouncedSearch = useDebounce(search, 400);

  // Fetch teachers
  const {
    data: teachersResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery<Paginated<Teacher>>({
    queryKey: [
      'teachers',
      {
        page,
        limit,
        search: debouncedSearch,
        isActive: filters.isActive,
      },
    ],
    queryFn: () =>
      teachersApi.getAll({
        page,
        limit,
        search: debouncedSearch || undefined,
        isActive: filters.isActive === 'all' ? undefined : filters.isActive,
      }),
    placeholderData: keepPreviousData,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => teachersApi.remove(id),
    onSuccess: () => {
      toast.success('Professeur supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      const msg = getErrorMessage(err);
      toast.error(`Suppression impossible : ${msg}`);
      setDeleteTarget(null);
    },
  });

  const columns: Column<Teacher>[] = [
    {
      key: 'name',
      header: 'Nom et prénom',
      render: (row) => (
        <div className="flex items-center gap-3">
          <InitialsAvatar firstName={row.firstName} lastName={row.lastName} size="sm" />
          <Link
            to={`/profs/${row.id}`}
            className="font-semibold text-ink hover:text-brand-600 transition-colors"
          >
            {fullName(row)}
          </Link>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Téléphone',
      render: (row) => <span>{row.phone || '—'}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => <span>{row.email || '—'}</span>,
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
              onClick={() => navigate(`/profs/${row.id}`)}
              className="rounded-lg text-xs py-2 cursor-pointer hover:bg-brand-50"
            >
              <Eye className="w-3.5 h-3.5 mr-2 text-muted" />
              Voir
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditingTeacher(row);
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
        title="Professeurs"
        subtitle="Gérez votre équipe pédagogique"
        actionLabel="Ajouter un professeur"
        onAction={() => {
          setEditingTeacher(null);
          setDialogOpen(true);
        }}
      />

      {/* FilterBar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par nom, email, téléphone..."
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      >
        <Select
          value={filters.isActive || 'all'}
          onValueChange={(val) => setFilter('isActive', val)}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl bg-white border-line text-sm">
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
          data={teachersResponse?.data || []}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyState={
            <EmptyState
              icon={GraduationCap}
              title="Aucun professeur trouvé"
              description={
                hasActiveFilters
                  ? 'Essayez de modifier vos filtres de recherche.'
                  : 'Commencez par ajouter un professeur à votre équipe.'
              }
              actionLabel={hasActiveFilters ? undefined : 'Ajouter un professeur'}
              onAction={
                hasActiveFilters
                  ? undefined
                  : () => {
                      setEditingTeacher(null);
                      setDialogOpen(true);
                    }
              }
            />
          }
        />

        {teachersResponse && teachersResponse.meta.total > 0 && (
          <Pagination
            total={teachersResponse.meta.total}
            page={teachersResponse.meta.page}
            limit={teachersResponse.meta.limit}
            totalPages={teachersResponse.meta.totalPages}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        )}
      </div>

      {/* Teacher Form Dialog */}
      <TeacherFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingTeacher}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Supprimer ce professeur ?"
        description={
          deleteTarget
            ? `Voulez-vous vraiment supprimer le professeur ${fullName(deleteTarget)} ? Cette action est irréversible.`
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
