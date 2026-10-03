import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ClipboardCheck,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
} from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { sessionsApi } from '@/api/sessions';
import { groupsApi } from '@/api/groups';
import { Session, StudyGroup, Paginated } from '@/types/api';
import { formatDate, formatTimeRange, fullName } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
import { toast } from 'sonner';
import { useListParams } from '@/hooks/useListParams';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { DataTable, Column } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Input } from '@/components/ui/input';
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
import SessionFormDialog from './SessionFormDialog';

export default function SessionsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const now = new Date();
  const defaultMonday = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const defaultSunday = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');

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
    from: string;
    to: string;
    groupId: string;
    isFreeTrial: string;
  }>({
    defaultFilters: {
      from: defaultMonday,
      to: defaultSunday,
    },
  });

  const fromDate = filters.from ?? defaultMonday;
  const toDate = filters.to ?? defaultSunday;
  const groupIdFilter = filters.groupId || 'all';
  const isFreeTrialFilter = filters.isFreeTrial || 'all';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null);

  useEffect(() => {
    document.title = 'Séances · FLS School';
  }, []);

  // Check ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingSession(null);
      setDialogOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('new');
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch groups for filter
  const { data: groupsResponse } = useQuery({
    queryKey: ['groups', { limit: 100 }],
    queryFn: () => groupsApi.getAll({ limit: 100 }),
  });

  const allGroups = groupsResponse?.data || [];

  // Fetch sessions
  const {
    data: sessionsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery<Paginated<Session>>({
    queryKey: [
      'sessions',
      {
        page,
        limit,
        from: fromDate,
        to: toDate,
        groupId: groupIdFilter,
        isFreeTrial: isFreeTrialFilter,
      },
    ],
    queryFn: () =>
      sessionsApi.getAll({
        page,
        limit,
        from: fromDate || undefined,
        to: toDate || undefined,
        groupId: groupIdFilter === 'all' ? undefined : groupIdFilter,
        isFreeTrial: isFreeTrialFilter === 'all' ? undefined : isFreeTrialFilter,
      }),
    placeholderData: keepPreviousData,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => sessionsApi.remove(id),
    onSuccess: () => {
      toast.success('Séance supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(`Suppression impossible : ${getErrorMessage(err)}`);
      setDeleteTarget(null);
    },
  });

  const setThisWeek = () => {
    // Absent from/to params fall back to the current week
    setFilters({ from: undefined, to: undefined });
  };

  const columns: Column<Session>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (row) => {
        const d = new Date(row.date);
        let weekday = '';
        try {
          weekday = format(d, 'EEEE', { locale: fr });
          weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
        } catch {
          weekday = '';
        }

        return (
          <div>
            <div className="font-semibold text-ink">{formatDate(row.date)}</div>
            {weekday && <div className="text-xs text-muted">{weekday}</div>}
          </div>
        );
      },
    },
    {
      key: 'time',
      header: 'Horaire',
      render: (row) => (
        <span className="font-medium text-body">
          {formatTimeRange(row.startTime, row.endTime)}
        </span>
      ),
    },
    {
      key: 'subject',
      header: 'Matière',
      render: (row) => (
        <span className="font-semibold text-ink">
          {row.group?.subject?.name || '—'}
        </span>
      ),
    },
    {
      key: 'class',
      header: 'Classe',
      render: (row) => {
        const cls = row.group?.subject?.schoolClass;
        return <span>{(cls && typeof cls === 'object' ? cls.name : '') || '—'}</span>;
      },
    },
    {
      key: 'groupTeacher',
      header: 'Groupe / Enseignant',
      render: (row) => {
        const teacherName = row.group?.teacher
          ? fullName(row.group.teacher)
          : '—';
        return (
          <div>
            <div className="font-medium text-ink">
              {row.group?.name || 'Principal'}
            </div>
            <div className="text-xs text-muted">{teacherName}</div>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <StatusBadge variant={row.isFreeTrial ? 'warning' : 'neutral'}>
          {row.isFreeTrial ? 'Essai gratuit' : 'Régulière'}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <div className="inline-flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate(`/seances/${row.id}`)}
            className="h-8 px-3 rounded-lg text-xs bg-brand-50 text-brand-700 hover:bg-brand-100 font-semibold gap-1.5 border border-brand-200/50 shadow-none"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            Faire l'appel
          </Button>

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
            <DropdownMenuContent align="end" className="w-36 rounded-xl p-1 shadow-md bg-white">
              <DropdownMenuItem
                onClick={() => {
                  setEditingSession(row);
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
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Séances"
        subtitle="Planifiez les cours et faites l'appel"
        actionLabel="Planifier une séance"
        onAction={() => {
          setEditingSession(null);
          setDialogOpen(true);
        }}
      />

      {/* FilterBar */}
      <FilterBar
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      >
        {/* Date Du */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted font-medium">Du</span>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFilter('from', e.target.value)}
            className="w-[145px] h-10 rounded-xl bg-white border-line text-xs"
          />
        </div>

        {/* Date Au */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted font-medium">Au</span>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setFilter('to', e.target.value)}
            className="w-[145px] h-10 rounded-xl bg-white border-line text-xs"
          />
        </div>

        {/* Bouton Cette Semaine */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={setThisWeek}
          className="h-10 rounded-xl text-xs gap-1.5 font-medium border-line text-ink hover:bg-brand-50"
        >
          <Calendar className="w-3.5 h-3.5 text-muted" />
          Cette semaine
        </Button>

        {/* Groupe Select */}
        <Select
          value={groupIdFilter}
          onValueChange={(val) => setFilter('groupId', val)}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl bg-white border-line text-sm">
            <SelectValue placeholder="Tous les groupes" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="all">Tous les groupes</SelectItem>
            {allGroups.map((g: StudyGroup) => (
              <SelectItem key={g.id} value={g.id}>
                {g.subject?.name} {g.name ? `(${g.name})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type Select */}
        <Select
          value={isFreeTrialFilter}
          onValueChange={(val) => setFilter('isFreeTrial', val)}
        >
          <SelectTrigger className="w-full sm:w-[150px] h-10 rounded-xl bg-white border-line text-sm">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="false">Régulière</SelectItem>
            <SelectItem value="true">Essai gratuit</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      {/* Table & Pagination Card */}
      <div className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden">
        <DataTable
          columns={columns}
          data={sessionsResponse?.data || []}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyState={
            <EmptyState
              icon={CalendarDays}
              title="Aucune séance trouvée"
              description="Aucun cours n'est planifié pour les critères sélectionnés."
              actionLabel="Planifier une séance"
              onAction={() => {
                setEditingSession(null);
                setDialogOpen(true);
              }}
            />
          }
        />

        {sessionsResponse && sessionsResponse.meta.total > 0 && (
          <Pagination
            total={sessionsResponse.meta.total}
            page={sessionsResponse.meta.page}
            limit={sessionsResponse.meta.limit}
            totalPages={sessionsResponse.meta.totalPages}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        )}
      </div>

      {/* Session Form Dialog */}
      <SessionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingSession}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Supprimer cette séance ?"
        description="Voulez-vous vraiment supprimer cette séance ? Les enregistrements d'appel associés seront également supprimés."
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
