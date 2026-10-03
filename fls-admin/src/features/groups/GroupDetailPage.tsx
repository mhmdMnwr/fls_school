import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  CalendarDays,
  Pencil,
  Trash2,
  Plus,
  BookOpen,
  ClipboardCheck,
  MoreHorizontal,
  Clock,
} from 'lucide-react';
import { groupsApi } from '@/api/groups';
import { sessionsApi } from '@/api/sessions';
import { levelsApi } from '@/api/levels';
import { classesApi } from '@/api/classes';
import { enrollmentsApi } from '@/api/enrollments';
import { StudyGroupDetail, Session, Level, SchoolClass, Paginated } from '@/types/api';
import { formatDate, fullName, formatTimeRange } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { InitialsAvatar } from '@/components/common/InitialsAvatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DetailPageSkeleton } from '@/components/common/PageSkeletons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import GroupFormDialog from './GroupFormDialog';
import AddStudentsDialog from './AddStudentsDialog';
import SessionFormDialog from '@/features/sessions/SessionFormDialog';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('eleves');
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [deleteGroupOpen, setDeleteGroupOpen] = useState(false);

  const [addStudentsOpen, setAddStudentsOpen] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deleteSessionTarget, setDeleteSessionTarget] = useState<Session | null>(null);
  const [removeStudentTarget, setRemoveStudentTarget] = useState<{
    enrollmentId: string;
    studentName: string;
  } | null>(null);

  // Fetch group detail
  const {
    data: group,
    isLoading,
    isError,
    refetch,
  } = useQuery<StudyGroupDetail>({
    queryKey: ['group', id],
    queryFn: () => groupsApi.getOne(id!),
    enabled: !!id,
  });

  // Fetch levels and classes for edit dialog
  const { data: levels = [] } = useQuery<Level[]>({
    queryKey: ['levels'],
    queryFn: levelsApi.getAll,
  });

  const { data: allClasses = [] } = useQuery<SchoolClass[]>({
    queryKey: ['classes'],
    queryFn: () => classesApi.getAll(),
  });

  // Fetch sessions for this group
  const { data: sessionsResponse } = useQuery<Paginated<Session>>({
    queryKey: ['sessions', { groupId: id, limit: 100 }],
    queryFn: () => sessionsApi.getAll({ groupId: id, limit: 100 }),
    enabled: !!id,
  });

  const sessions = sessionsResponse?.data || [];

  useEffect(() => {
    if (group) {
      const title = group.name
        ? `${group.subject?.name} (${group.name})`
        : group.subject?.name || 'Détail groupe';
      document.title = `${title} · FLS School`;
    }
  }, [group]);

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: () => groupsApi.remove(id!),
    onSuccess: () => {
      toast.success('Groupe supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/groupes');
    },
    onError: (err) => {
      toast.error(`Suppression impossible : ${getErrorMessage(err)}`);
      setDeleteGroupOpen(false);
    },
  });

  // Remove student enrollment mutation
  const removeStudentMutation = useMutation({
    mutationFn: (enrollmentId: string) => enrollmentsApi.remove(enrollmentId),
    onSuccess: () => {
      toast.success('Élève retiré du groupe avec succès');
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setRemoveStudentTarget(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setRemoveStudentTarget(null);
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => sessionsApi.remove(sessionId),
    onSuccess: () => {
      toast.success('Séance supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteSessionTarget(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setDeleteSessionTarget(null);
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
            { label: 'Groupes', to: '/groupes' },
            { label: 'Erreur' },
          ]}
        />
        <div className="bg-white rounded-2xl border border-line/60 shadow-xs">
          <ErrorState onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Accueil', to: '/' },
            { label: 'Groupes', to: '/groupes' },
            { label: 'Introuvable' },
          ]}
        />
        <div className="bg-white rounded-2xl border border-line/60 shadow-xs">
          <EmptyState
            title="Groupe introuvable"
            description="Le groupe demandé n'existe pas ou a été supprimé."
            actionLabel="Retour à la liste"
            onAction={() => navigate('/groupes')}
          />
        </div>
      </div>
    );
  }

  const groupLabel = group.name
    ? `${group.subject?.name} (${group.name})`
    : group.subject?.name || 'Groupe';

  const classObj = group.subject?.schoolClass;
  const classId =
    classObj && typeof classObj === 'object' ? classObj.id : String(classObj || '');
  const className =
    classObj && typeof classObj === 'object' ? classObj.name : '—';

  const enrolledStudentIds = (group.students || []).map((s) => s.id);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Accueil', to: '/' },
          { label: 'Groupes', to: '/groupes' },
          { label: groupLabel },
        ]}
      />

      {/* Info Card */}
      <div className="bg-white rounded-2xl border border-line/60 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0">
              <BookOpen className="w-8 h-8 text-brand-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-ink">
                  {group.subject?.name || 'Matière'}
                </h1>
                {group.name && (
                  <span className="text-sm font-semibold bg-brand-50 text-brand-700 px-3 py-0.5 rounded-full">
                    {group.name}
                  </span>
                )}
                <StatusBadge variant={group.isActive ? 'success' : 'neutral'}>
                  {group.isActive ? 'Actif' : 'Inactif'}
                </StatusBadge>
              </div>

              <div className="flex flex-wrap items-center gap-6 mt-3 text-xs sm:text-sm text-muted">
                <div>
                  <span className="text-muted/80">Classe : </span>
                  <span className="font-semibold text-ink">{className}</span>
                </div>
                <div>
                  <span className="text-muted/80">Professeur : </span>
                  {group.teacher && typeof group.teacher === 'object' ? (
                    <Link
                      to={`/profs/${group.teacher.id}`}
                      className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      {fullName(group.teacher)}
                    </Link>
                  ) : (
                    <span className="font-semibold text-ink">—</span>
                  )}
                </div>
                <div>
                  <span className="text-muted/80">Élèves inscrits : </span>
                  <span className="font-semibold text-ink">
                    {group.students?.length || 0}
                  </span>
                </div>
              </div>

              {group.studyTime && group.studyTime.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-line/60">
                  <span className="text-xs font-semibold text-muted">Créneaux habituels :</span>
                  {group.studyTime.map((st, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-page-bg text-xs font-medium text-ink border border-line/60"
                    >
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      <span className="capitalize">{st.weekday}</span> {st.startTime} - {st.endTime}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch lg:self-auto justify-end">
            <Button
              variant="outline"
              onClick={() => setEditGroupOpen(true)}
              className="rounded-xl h-10 px-4 gap-2 text-sm font-medium"
            >
              <Pencil className="w-4 h-4" />
              Modifier
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteGroupOpen(true)}
              className="rounded-xl h-10 px-4 gap-2 text-sm font-medium text-danger border-danger/30 hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-transparent border-b border-line-soft p-0 rounded-none w-full justify-start h-auto gap-8">
          <TabsTrigger
            value="eleves"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-600 data-[state=active]:text-brand-600 data-[state=active]:shadow-none px-2 py-3 text-sm font-semibold gap-2"
          >
            <Users className="w-4 h-4" />
            Élèves ({group.students?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="seances"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-600 data-[state=active]:text-brand-600 data-[state=active]:shadow-none px-2 py-3 text-sm font-semibold gap-2"
          >
            <CalendarDays className="w-4 h-4" />
            Séances ({sessions.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Élèves */}
        <TabsContent value="eleves" className="space-y-4 mt-0">
          <div className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-line-soft flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">Liste des élèves inscrits</h2>
              <Button
                size="sm"
                onClick={() => setAddStudentsOpen(true)}
                className="rounded-xl h-9 bg-brand-600 hover:bg-brand-700 text-white gap-1.5 text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter des élèves
              </Button>
            </div>

            {!group.students || group.students.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Users}
                  title="Aucun élève inscrit"
                  description="Inscrivez les élèves de la classe à ce groupe pour commencer."
                  actionLabel="Ajouter des élèves"
                  onAction={() => setAddStudentsOpen(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="h-11 bg-[#F8F9FD] border-b border-line-soft text-xs font-medium text-muted">
                      <th className="px-5">Nom et prénom</th>
                      <th className="px-5">Téléphone</th>
                      <th className="px-5">Statut élève</th>
                      <th className="px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.students.map((student) => (
                      <tr
                        key={student.id}
                        className="h-14 border-b border-line-soft hover:bg-[#F8F9FF] text-body transition-colors"
                      >
                        <td className="px-5">
                          <div className="flex items-center gap-3">
                            <InitialsAvatar
                              firstName={student.firstName}
                              lastName={student.lastName}
                              size="sm"
                            />
                            <Link
                              to={`/eleves/${student.id}`}
                              className="font-semibold text-ink hover:text-brand-600 transition-colors"
                            >
                              {fullName(student)}
                            </Link>
                          </div>
                        </td>
                        <td className="px-5 text-muted">{student.phone || '—'}</td>
                        <td className="px-5">
                          <StatusBadge variant={student.isActive ? 'success' : 'neutral'}>
                            {student.isActive ? 'Actif' : 'Inactif'}
                          </StatusBadge>
                        </td>
                        <td className="px-5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setRemoveStudentTarget({
                                enrollmentId: student.enrollmentId,
                                studentName: fullName(student),
                              })
                            }
                            className="h-8 text-xs text-danger hover:bg-danger/10 hover:text-danger font-medium"
                          >
                            Retirer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Séances */}
        <TabsContent value="seances" className="space-y-4 mt-0">
          <div className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-line-soft flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">Séances planifiées</h2>
              <Button
                size="sm"
                onClick={() => {
                  setEditingSession(null);
                  setSessionDialogOpen(true);
                }}
                className="rounded-xl h-9 bg-brand-600 hover:bg-brand-700 text-white gap-1.5 text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Planifier une séance
              </Button>
            </div>

            {sessions.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={CalendarDays}
                  title="Aucune séance planifiée"
                  description="Planifiez un cours pour ce groupe afin d'enregistrer les feuilles d'appel."
                  actionLabel="Planifier une séance"
                  onAction={() => {
                    setEditingSession(null);
                    setSessionDialogOpen(true);
                  }}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="h-11 bg-[#F8F9FD] border-b border-line-soft text-xs font-medium text-muted">
                      <th className="px-5">Date</th>
                      <th className="px-5">Horaire</th>
                      <th className="px-5">Type</th>
                      <th className="px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((sess) => (
                      <tr
                        key={sess.id}
                        className="h-14 border-b border-line-soft hover:bg-[#F8F9FF] text-body transition-colors"
                      >
                        <td className="px-5 font-semibold text-ink">
                          {formatDate(sess.date)}
                        </td>
                        <td className="px-5 font-medium text-body">
                          {formatTimeRange(sess.startTime, sess.endTime)}
                        </td>
                        <td className="px-5">
                          <StatusBadge variant={sess.isFreeTrial ? 'warning' : 'neutral'}>
                            {sess.isFreeTrial ? 'Essai gratuit' : 'Régulière'}
                          </StatusBadge>
                        </td>
                        <td className="px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => navigate(`/seances/${sess.id}`)}
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
                                    setEditingSession(sess);
                                    setSessionDialogOpen(true);
                                  }}
                                  className="rounded-lg text-xs py-2 cursor-pointer hover:bg-brand-50"
                                >
                                  <Pencil className="w-3.5 h-3.5 mr-2 text-muted" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 bg-line-soft" />
                                <DropdownMenuItem
                                  onClick={() => setDeleteSessionTarget(sess)}
                                  className="rounded-lg text-xs py-2 text-danger hover:bg-danger/10 cursor-pointer focus:text-danger focus:bg-danger/10"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2 text-danger" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Group Dialog */}
      <GroupFormDialog
        open={editGroupOpen}
        onOpenChange={setEditGroupOpen}
        levels={levels}
        allClasses={allClasses}
        initialData={group}
      />

      {/* Add Students Dialog */}
      <AddStudentsDialog
        open={addStudentsOpen}
        onOpenChange={setAddStudentsOpen}
        groupId={group.id}
        classId={classId}
        enrolledStudentIds={enrolledStudentIds}
      />

      {/* Plan Session Dialog */}
      <SessionFormDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        initialData={editingSession}
        lockedGroupId={group.id}
        lockedGroupName={groupLabel}
      />

      {/* Delete Group Confirmation */}
      <ConfirmDialog
        open={deleteGroupOpen}
        onOpenChange={setDeleteGroupOpen}
        title="Supprimer ce groupe ?"
        description={`Voulez-vous vraiment supprimer le groupe « ${groupLabel} » ? Cette action est irréversible et supprimera également les séances et inscriptions.`}
        confirmLabel="Supprimer"
        isLoading={deleteGroupMutation.isPending}
        onConfirm={() => deleteGroupMutation.mutate()}
      />

      {/* Remove Student Confirmation */}
      <ConfirmDialog
        open={!!removeStudentTarget}
        onOpenChange={(open) => !open && setRemoveStudentTarget(null)}
        title="Retirer l'élève du groupe ?"
        description={
          removeStudentTarget
            ? `Voulez-vous vraiment retirer ${removeStudentTarget.studentName} de ce groupe ?`
            : ''
        }
        confirmLabel="Retirer"
        isLoading={removeStudentMutation.isPending}
        onConfirm={() => {
          if (removeStudentTarget) {
            removeStudentMutation.mutate(removeStudentTarget.enrollmentId);
          }
        }}
      />

      {/* Delete Session Confirmation */}
      <ConfirmDialog
        open={!!deleteSessionTarget}
        onOpenChange={(open) => !open && setDeleteSessionTarget(null)}
        title="Supprimer cette séance ?"
        description="Voulez-vous vraiment supprimer cette séance ? Les enregistrements de présence associés seront également supprimés."
        confirmLabel="Supprimer"
        isLoading={deleteSessionMutation.isPending}
        onConfirm={() => {
          if (deleteSessionTarget) {
            deleteSessionMutation.mutate(deleteSessionTarget.id);
          }
        }}
      />
    </div>
  );
}
