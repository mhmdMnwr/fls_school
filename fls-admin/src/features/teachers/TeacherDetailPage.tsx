import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Phone,
  Mail,
  Pencil,
  Trash2,
  UsersRound,
} from 'lucide-react';
import { teachersApi } from '@/api/teachers';
import { TeacherDetail } from '@/types/api';
import { fullNameNatural, fullName } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { InitialsAvatar } from '@/components/common/InitialsAvatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DetailPageSkeleton } from '@/components/common/PageSkeletons';
import TeacherFormDialog from './TeacherFormDialog';

export default function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: teacher,
    isLoading,
    isError,
    refetch,
  } = useQuery<TeacherDetail>({
    queryKey: ['teacher', id],
    queryFn: () => teachersApi.getOne(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (teacher) {
      document.title = `${fullNameNatural(teacher)} · FLS School`;
    }
  }, [teacher]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => teachersApi.remove(id!),
    onSuccess: () => {
      toast.success('Professeur supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/profs');
    },
    onError: (err: any) => {
      const msg = getErrorMessage(err);
      toast.error(`Suppression impossible : ${msg}`);
      setDeleteDialogOpen(false);
    },
  });

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Accueil', to: '/' },
            { label: 'Professeurs', to: '/profs' },
            { label: 'Erreur' },
          ]}
        />
        <div className="bg-white rounded-2xl border border-line/60 shadow-xs">
          <ErrorState onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Accueil', to: '/' },
            { label: 'Professeurs', to: '/profs' },
            { label: 'Introuvable' },
          ]}
        />
        <div className="bg-white rounded-2xl border border-line/60 shadow-xs">
          <EmptyState
            title="Professeur introuvable"
            description="Le professeur demandé n'existe pas ou a été supprimé."
            actionLabel="Retour à la liste"
            onAction={() => navigate('/profs')}
          />
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Accueil', to: '/' },
    { label: 'Professeurs', to: '/profs' },
    { label: fullNameNatural(teacher) },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-line/60 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <InitialsAvatar
              firstName={teacher.firstName}
              lastName={teacher.lastName}
              size="xl"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-ink">
                  {fullNameNatural(teacher)}
                </h1>
                <StatusBadge variant={teacher.isActive ? 'success' : 'neutral'}>
                  {teacher.isActive ? 'Actif' : 'Inactif'}
                </StatusBadge>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs sm:text-sm text-muted">
                {teacher.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-muted" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
                {teacher.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-muted" />
                    <span>{teacher.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(true)}
              className="rounded-xl h-10 px-4 gap-2 text-sm font-medium"
            >
              <Pencil className="w-4 h-4" />
              Modifier
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="rounded-xl h-10 px-4 gap-2 text-sm font-medium text-danger border-danger/30 hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      {/* Managed Groups Card */}
      <div className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-line-soft">
          <h2 className="text-base font-bold text-ink">Groupes gérés</h2>
        </div>

        {teacher.groups && teacher.groups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="h-11 bg-[#F8F9FD] border-b border-line-soft text-xs font-medium text-muted">
                  <th className="px-5">Matière</th>
                  <th className="px-5">Classe</th>
                  <th className="px-5">Groupe</th>
                  <th className="px-5">Statut</th>
                </tr>
              </thead>
              <tbody>
                {teacher.groups.map((group) => (
                  <tr
                    key={group.id}
                    onClick={() => navigate(`/groupes/${group.id}`)}
                    className="h-14 border-b border-line-soft hover:bg-[#F8F9FF] text-body cursor-pointer transition-colors"
                  >
                    <td className="px-5 font-semibold text-ink">
                      {group.subject?.name || '—'}
                    </td>
                    <td className="px-5">{group.class?.name || '—'}</td>
                    <td className="px-5">{group.name || 'Principal'}</td>
                    <td className="px-5">
                      <StatusBadge variant={group.isActive ? 'success' : 'neutral'}>
                        {group.isActive ? 'Actif' : 'Inactif'}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={UsersRound}
              title="Aucun groupe géré"
              description="Ce professeur ne gère aucun groupe pour le moment."
            />
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <TeacherFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        initialData={teacher}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer ce professeur ?"
        description={`Voulez-vous vraiment supprimer le professeur ${fullName(teacher)} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
