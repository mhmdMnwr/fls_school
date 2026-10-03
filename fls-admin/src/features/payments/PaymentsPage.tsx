import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Wallet, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { paymentsApi } from '@/api/payments';
import { studentsApi } from '@/api/students';
import { Payment, Paginated, Student } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';
import { formatDate, formatMoney, fullName } from '@/lib/format';
import { useListParams } from '@/hooks/useListParams';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { DataTable, Column } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { InitialsAvatar } from '@/components/common/InitialsAvatar';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { AsyncCombobox, ComboboxOption } from '@/components/common/AsyncCombobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PaymentFormDialog } from './PaymentFormDialog';

type PaymentStudent = Pick<Student, 'id' | 'firstName' | 'lastName'>;

function paymentStudent(p: Payment): PaymentStudent | null {
  return typeof p.student === 'object' && p.student ? p.student : null;
}

function truncate(text: string, max = 60): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const { page, limit, filters, setPage, setLimit, setFilter, resetFilters, hasActiveFilters } =
    useListParams<{ studentId: string; studentName: string; from: string; to: string }>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);

  useEffect(() => {
    document.title = 'Paiements · FLS School';
  }, []);

  // ?new=1 opens the creation dialog
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditing(null);
      setDialogOpen(true);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('new');
          return next;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);

  const studentId = filters.studentId || '';
  const studentName = filters.studentName || '';
  const from = filters.from || '';
  const to = filters.to || '';

  const { data, isLoading, isError, refetch } = useQuery<Paginated<Payment>>({
    queryKey: ['payments', { page, limit, studentId, from, to }],
    queryFn: () =>
      paymentsApi.getAll({
        page,
        limit,
        studentId: studentId || undefined,
        from: from || undefined,
        to: to || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const loadStudentOptions = useCallback(async (q: string): Promise<ComboboxOption[]> => {
    const res = await studentsApi.getAll({ search: q, limit: 10 });
    return res.data.map((s) => ({
      value: s.id,
      label: fullName(s),
      sublabel: s.phone || s.email || undefined,
      avatar: <InitialsAvatar firstName={s.firstName} lastName={s.lastName} size="sm" />,
    }));
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentsApi.remove(id),
    onSuccess: () => {
      toast.success('Paiement supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['student'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(`Suppression impossible : ${getErrorMessage(err)}`);
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const columns: Column<Payment>[] = [
    {
      key: 'paidOn',
      header: 'Date',
      render: (row) => <span className="font-medium text-ink">{formatDate(row.paidOn)}</span>,
    },
    {
      key: 'student',
      header: 'Élève',
      render: (row) => {
        const s = paymentStudent(row);
        if (!s) return <span className="text-muted">—</span>;
        return (
          <Link to={`/eleves/${s.id}`} className="flex items-center gap-3 group">
            <InitialsAvatar firstName={s.firstName} lastName={s.lastName} size="md" />
            <span className="font-semibold text-ink group-hover:text-brand-600">{fullName(s)}</span>
          </Link>
        );
      },
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) =>
        row.description ? (
          <span title={row.description}>{truncate(row.description)}</span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: 'amount',
      header: 'Montant',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-bold text-ink whitespace-nowrap">{formatMoney(row.amount)}</span>
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
              onClick={() => {
                setEditing(row);
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

  const editingStudent = editing ? paymentStudent(editing) : null;
  const deleteStudent = deleteTarget ? paymentStudent(deleteTarget) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        subtitle="Historique des paiements des élèves"
        actionLabel="Ajouter un paiement"
        onAction={openCreate}
      />

      <FilterBar hasActiveFilters={hasActiveFilters} onResetFilters={resetFilters}>
        <AsyncCombobox
          key={studentId || 'none'}
          value={studentId}
          onChange={(val, option) => {
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                if (val) {
                  next.set('studentId', val);
                  next.set('studentName', option?.label || '');
                } else {
                  next.delete('studentId');
                  next.delete('studentName');
                }
                next.delete('page');
                return next;
              },
              { replace: true }
            );
          }}
          loadOptions={loadStudentOptions}
          placeholder="Tous les élèves"
          selectedOption={studentId && studentName ? { value: studentId, label: studentName } : undefined}
          className="w-full sm:w-[240px]"
        />
        <div className="flex items-center gap-2">
          <Label htmlFor="payments-from" className="text-sm text-muted">
            Du
          </Label>
          <Input
            id="payments-from"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => setFilter('from', e.target.value)}
            className="w-[160px] h-10 rounded-xl bg-white border-line text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="payments-to" className="text-sm text-muted">
            Au
          </Label>
          <Input
            id="payments-to"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => setFilter('to', e.target.value)}
            className="w-[160px] h-10 rounded-xl bg-white border-line text-sm"
          />
        </div>
      </FilterBar>

      <div className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyState={
            <EmptyState
              icon={Wallet}
              title="Aucun paiement trouvé"
              description={
                hasActiveFilters
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Enregistrez le premier paiement d\u2019un élève.'
              }
              actionLabel={hasActiveFilters ? undefined : 'Ajouter un paiement'}
              onAction={hasActiveFilters ? undefined : openCreate}
            />
          }
        />
        {data && data.meta.total > 0 && (
          <Pagination
            total={data.meta.total}
            page={data.meta.page}
            limit={data.meta.limit}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        )}
      </div>

      <PaymentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editing}
        initialStudentId={editingStudent?.id || (!editing && studentId ? studentId : undefined)}
        initialStudentName={
          editingStudent ? fullName(editingStudent) : !editing && studentName ? studentName : undefined
        }
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Supprimer cet élément ?"
        description={
          deleteTarget
            ? `Supprimer ce paiement de ${formatMoney(deleteTarget.amount)} pour ${
                deleteStudent ? fullName(deleteStudent) : 'cet élève'
              } ?`
            : ''
        }
        confirmLabel="Supprimer"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
