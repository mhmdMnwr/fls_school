import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Cake,
  Phone,
  Mail,
  CalendarCheck,
  Pencil,
  Trash2,
  Power,
  UsersRound,
  CalendarDays,
  Wallet,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Percent,
  KeyRound,
  AlertCircle,
  Check,
  GraduationCap,
} from 'lucide-react';
import { studentsApi } from '@/api/students';
import { parentAccountsApi } from '@/api/parentAccounts';
import { enrollmentsApi } from '@/api/enrollments';
import { absencesApi, AttendanceItem } from '@/api/absences';
import { paymentsApi } from '@/api/payments';
import {
  StudentDetail,
  Enrollment,
  StudentAbsenceSummary,
  StudentPaymentSummary,
  Payment,
  Paginated,
  StudyGroup,
} from '@/types/api';
import {
  formatDate,
  fullNameNatural,
  fullName,
  ageFromBirthDate,
  formatMoney,
  formatTimeRange,
} from '@/lib/format';
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
import { Pagination } from '@/components/common/Pagination';
import { DetailPageSkeleton } from '@/components/common/PageSkeletons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StudentFormDialog from './StudentFormDialog';
import ValidateRegistrationDialog from './ValidateRegistrationDialog';
import EnrollStudentDialog from './EnrollStudentDialog';
import PaymentFormDialog from '@/features/payments/PaymentFormDialog';
import ParentAccountDialog from './ParentAccountDialog';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('groupes');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [parentAccountDialogOpen, setParentAccountDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletePaymentTarget, setDeletePaymentTarget] = useState<Payment | null>(null);
  const [removeEnrollmentTarget, setRemoveEnrollmentTarget] = useState<Enrollment | null>(null);

  // Pagination for absences tab
  const [absencePage, setAbsencePage] = useState(1);

  // Fetch parent account status
  const { data: parentAccount } = useQuery({
    queryKey: ['parent-account', id],
    queryFn: () => parentAccountsApi.getByStudent(id!),
    enabled: !!id,
  });

  // Fetch student details
  const {
    data: student,
    isLoading,
    isError,
    refetch,
  } = useQuery<StudentDetail>({
    queryKey: ['student', id],
    queryFn: () => studentsApi.getOne(id!),
    enabled: !!id,
  });



  // Fetch enrollments
  const { data: enrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ['enrollments', { studentId: id }],
    queryFn: () => enrollmentsApi.getAll({ studentId: id }),
    enabled: !!id,
  });

  // Fetch absences summary
  const { data: absenceSummary } = useQuery<StudentAbsenceSummary>({
    queryKey: ['absences', 'summary', id],
    queryFn: () => absencesApi.getStudentSummary(id!),
    enabled: !!id,
  });

  // Fetch student absences table
  const { data: absencesResponse } = useQuery<Paginated<AttendanceItem>>({
    queryKey: ['absences', 'student', id, absencePage],
    queryFn: () => absencesApi.getStudentAbsences(id!, { page: absencePage, limit: 10 }),
    enabled: !!id,
  });

  // Fetch student payments summary
  const { data: paymentSummary } = useQuery<StudentPaymentSummary>({
    queryKey: ['payments', 'summary', id],
    queryFn: () => paymentsApi.getStudentSummary(id!),
    enabled: !!id,
  });

  // Fetch student payments table
  const { data: studentPayments = [] } = useQuery<Payment[]>({
    queryKey: ['payments', 'student', id],
    queryFn: () => paymentsApi.getByStudent(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (student) {
      document.title = `${fullNameNatural(student)} · FLS School`;
    }
  }, [student]);

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: () =>
      studentsApi.update(id!, {
        isActive: !student?.isActive,
      }),
    onSuccess: (updated) => {
      toast.success(
        updated.isActive
          ? 'Élève activé avec succès'
          : 'Élève désactivé avec succès'
      );
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  // Delete student mutation
  const deleteMutation = useMutation({
    mutationFn: () => studentsApi.remove(id!),
    onSuccess: () => {
      toast.success('Élève supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/eleves');
    },
    onError: (err: any) => {
      if (err?.response?.status === 409) {
        toast.error('Suppression impossible : cet élève possède des paiements. Désactivez-le plutôt.');
      } else {
        toast.error(`Suppression impossible : ${getErrorMessage(err)}`);
      }
      setDeleteDialogOpen(false);
    },
  });

  // Toggle enrollment active mutation
  const toggleEnrollmentMutation = useMutation({
    mutationFn: ({ enrollmentId, isActive }: { enrollmentId: string; isActive: boolean }) =>
      enrollmentsApi.update(enrollmentId, { isActive }),
    onSuccess: () => {
      toast.success('Statut de l’inscription mis à jour');
      queryClient.invalidateQueries({ queryKey: ['enrollments', { studentId: id }] });
      queryClient.invalidateQueries({ queryKey: ['student', id] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  // Remove enrollment mutation
  const removeEnrollmentMutation = useMutation({
    mutationFn: (enrollmentId: string) => enrollmentsApi.remove(enrollmentId),
    onSuccess: () => {
      toast.success('Inscription retirée avec succès');
      queryClient.invalidateQueries({ queryKey: ['enrollments', { studentId: id }] });
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      setRemoveEnrollmentTarget(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setRemoveEnrollmentTarget(null);
    },
  });

  // Delete payment mutation
  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => paymentsApi.remove(paymentId),
    onSuccess: () => {
      toast.success('Paiement supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      setDeletePaymentTarget(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setDeletePaymentTarget(null);
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
            { label: 'Élèves', to: '/eleves' },
            { label: 'Erreur' },
          ]}
        />
        <div className="bg-white rounded-2xl border border-line/60 shadow-xs">
          <ErrorState onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Accueil', to: '/' },
            { label: 'Élèves', to: '/eleves' },
            { label: 'Introuvable' },
          ]}
        />
        <div className="bg-white rounded-2xl border border-line/60 shadow-xs">
          <EmptyState
            title="Élève introuvable"
            description="L'élève demandé n'existe pas ou a été supprimé."
            actionLabel="Retour à la liste"
            onAction={() => navigate('/eleves')}
          />
        </div>
      </div>
    );
  }

  const enrolledGroupIds = enrollments.map((e) =>
    typeof e.group === 'object' && e.group ? e.group.id : String(e.group)
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Accueil', to: '/' },
          { label: 'Élèves', to: '/eleves' },
          { label: fullNameNatural(student) },
        ]}
      />

      {/* Website Pre-registration Alert */}
      {student.origin === 'WEBSITE' && !student.isActive && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-950">
                Élève pré-inscrit depuis le site web
              </h2>
              <p className="text-xs text-amber-800 mt-1">
                Veuillez contacter la famille au{' '}
                <span className="font-bold underline">{student.phone || 'numéro non renseigné'}</span>{' '}
                puis lui affecter une classe pour valider l'inscription.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setValidateDialogOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-10 px-5 font-semibold text-xs shrink-0 shadow-xs"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Valider l'inscription
          </Button>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-line/60 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <InitialsAvatar
              firstName={student.firstName}
              lastName={student.lastName}
              size="xl"
            />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-ink">
                  {fullNameNatural(student)}
                </h1>
                <StatusBadge variant="brand">
                  {enrollments.length} {enrollments.length === 1 ? 'groupe' : 'groupes'}
                </StatusBadge>
                {student.origin === 'WEBSITE' && !student.isActive ? (
                  <StatusBadge variant="warning">Pré-inscrit</StatusBadge>
                ) : (
                  <StatusBadge variant={student.isActive ? 'success' : 'neutral'}>
                    {student.isActive ? 'Actif' : 'Inactif'}
                  </StatusBadge>
                )}
                {parentAccount && (
                  <button
                    onClick={() => setParentAccountDialogOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                  >
                    <KeyRound className="w-3 h-3 text-indigo-600" />
                    Accès parent actif
                  </button>
                )}
              </div>

              {/* 3-column / 5-item info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 text-xs sm:text-sm text-muted">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-muted shrink-0" />
                  <span>
                    {typeof student.schoolClass === 'object' && student.schoolClass
                      ? student.schoolClass.name
                      : 'Sans classe'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Cake className="w-4 h-4 text-muted shrink-0" />
                  <span>
                    {formatDate(student.birthDate)} ({ageFromBirthDate(student.birthDate)})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted shrink-0" />
                  <span>{student.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted shrink-0" />
                  <span className="truncate">{student.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-muted shrink-0" />
                  <span>Inscrit le {formatDate(student.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch lg:self-auto justify-end">
            <Button
              variant="outline"
              onClick={() => setParentAccountDialogOpen(true)}
              className="rounded-xl h-10 px-3.5 gap-1.5 text-xs sm:text-sm font-medium text-[#4338CA] border-[#4338CA]/30 hover:bg-[#EEF2FF]"
            >
              <KeyRound className="w-4 h-4" />
              Accès Parent
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(true)}
              className="rounded-xl h-10 px-3.5 gap-1.5 text-xs sm:text-sm font-medium"
            >
              <Pencil className="w-4 h-4" />
              Modifier
            </Button>
            <Button
              variant="outline"
              onClick={() => toggleActiveMutation.mutate()}
              disabled={toggleActiveMutation.isPending}
              className="rounded-xl h-10 px-3.5 gap-1.5 text-xs sm:text-sm font-medium"
            >
              <Power className="w-4 h-4" />
              {student.isActive ? 'Désactiver' : 'Activer'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="rounded-xl h-10 px-3.5 gap-1.5 text-xs sm:text-sm font-medium text-danger border-danger/30 hover:bg-danger/10 hover:text-danger"
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
            value="groupes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-600 data-[state=active]:text-brand-600 data-[state=active]:shadow-none px-2 py-3 text-sm font-semibold gap-2"
          >
            <UsersRound className="w-4 h-4" />
            Groupes ({enrollments.length})
          </TabsTrigger>
          <TabsTrigger
            value="presences"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-600 data-[state=active]:text-brand-600 data-[state=active]:shadow-none px-2 py-3 text-sm font-semibold gap-2"
          >
            <CalendarDays className="w-4 h-4" />
            Présences
          </TabsTrigger>
          <TabsTrigger
            value="paiements"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-600 data-[state=active]:text-brand-600 data-[state=active]:shadow-none px-2 py-3 text-sm font-semibold gap-2"
          >
            <Wallet className="w-4 h-4" />
            Paiements ({studentPayments.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. Groupes Tab */}
        <TabsContent value="groupes" className="space-y-4 mt-0">
          <div className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-line-soft flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">Groupes d'étude</h2>
              <Button
                size="sm"
                onClick={() => setEnrollDialogOpen(true)}
                className="rounded-xl h-9 bg-brand-600 hover:bg-brand-700 text-white gap-1.5 text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Inscrire à un groupe
              </Button>
            </div>

            {enrollments.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={UsersRound}
                  title="Aucun groupe"
                  description="Cet élève n'est encore inscrit à aucun groupe."
                  actionLabel="Inscrire à un groupe"
                  onAction={() => setEnrollDialogOpen(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="h-11 bg-[#F8F9FD] border-b border-line-soft text-xs font-medium text-muted">
                      <th className="px-5">Matière</th>
                      <th className="px-5">Professeur</th>
                      <th className="px-5">Groupe</th>
                      <th className="px-5">Inscrit le</th>
                      <th className="px-5">Statut</th>
                      <th className="px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((e) => {
                      const grp = (typeof e.group === 'object' && e.group ? e.group : null) as StudyGroup | null;
                      const teacherName =
                        grp?.teacher && typeof grp.teacher === 'object'
                          ? fullName(grp.teacher)
                          : '—';

                      return (
                        <tr
                          key={e.id}
                          className="h-14 border-b border-line-soft hover:bg-[#F8F9FF] text-body transition-colors"
                        >
                          <td className="px-5 font-semibold text-ink">
                            {grp?.subject?.name || '—'}
                          </td>
                          <td className="px-5">{teacherName}</td>
                          <td className="px-5">{grp?.name || 'Principal'}</td>
                          <td className="px-5">{formatDate(e.enrolledOn)}</td>
                          <td className="px-5">
                            <StatusBadge variant={e.isActive ? 'success' : 'neutral'}>
                              {e.isActive ? 'Actif' : 'Inactif'}
                            </StatusBadge>
                          </td>
                          <td className="px-5 text-right">
                            <div className="inline-flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toggleEnrollmentMutation.mutate({
                                    enrollmentId: e.id,
                                    isActive: !e.isActive,
                                  })
                                }
                                className="h-8 text-xs font-medium"
                              >
                                {e.isActive ? 'Désactiver' : 'Activer'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRemoveEnrollmentTarget(e)}
                                className="h-8 text-xs text-danger hover:bg-danger/10 hover:text-danger"
                              >
                                Retirer
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* 2. Présences Tab */}
        <TabsContent value="presences" className="space-y-5 mt-0">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-line/60 p-4 shadow-xs">
              <div className="text-xs text-muted font-medium">Séances totales</div>
              <div className="text-2xl font-bold text-ink mt-1">
                {absenceSummary?.totalSessions ?? 0}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-line/60 p-4 shadow-xs">
              <div className="text-xs text-success font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Présences
              </div>
              <div className="text-2xl font-bold text-success mt-1">
                {absenceSummary?.present ?? 0}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-line/60 p-4 shadow-xs">
              <div className="text-xs text-danger font-medium flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                Absences
              </div>
              <div className="text-2xl font-bold text-danger mt-1">
                {absenceSummary?.absent ?? 0}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-line/60 p-4 shadow-xs">
              <div className="text-xs text-muted font-medium flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" />
                Taux d'absence
              </div>
              <div className="text-2xl font-bold text-ink mt-1">
                {absenceSummary?.absenceRate ?? 0}%
              </div>
            </div>
          </div>

          {/* Absences Table */}
          <div className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-line-soft">
              <h2 className="text-base font-bold text-ink">Historique des séances</h2>
            </div>

            {!absencesResponse || absencesResponse.data.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={CalendarDays}
                  title="Aucune présence enregistrée"
                  description="L'appel n'a pas encore été fait pour les séances de cet élève."
                />
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="h-11 bg-[#F8F9FD] border-b border-line-soft text-xs font-medium text-muted">
                        <th className="px-5">Date</th>
                        <th className="px-5">Matière</th>
                        <th className="px-5">Horaire</th>
                        <th className="px-5">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {absencesResponse.data.map((rec) => {
                        const sessionDate = rec.sessionDate || rec.session?.date;
                        const subjectName = rec.subjectName || rec.session?.group?.subject?.name || '—';
                        const startTime = rec.startTime || rec.session?.startTime;
                        const endTime = rec.endTime || rec.session?.endTime;
                        const timeRange =
                          startTime && endTime
                            ? formatTimeRange(startTime, endTime)
                            : startTime || '—';

                        return (
                          <tr
                            key={rec.id}
                            className="h-14 border-b border-line-soft hover:bg-[#F8F9FF] text-body transition-colors"
                          >
                            <td className="px-5 font-semibold text-ink">
                              {formatDate(sessionDate)}
                            </td>
                            <td className="px-5">{subjectName}</td>
                            <td className="px-5 font-medium text-ink">{timeRange}</td>
                            <td className="px-5">
                              <StatusBadge variant={rec.isPresent ? 'success' : 'danger'}>
                                {rec.isPresent ? 'Présent' : 'Absent'}
                              </StatusBadge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {absencesResponse.meta.total > 0 && (
                  <Pagination
                    total={absencesResponse.meta.total}
                    page={absencesResponse.meta.page}
                    limit={absencesResponse.meta.limit}
                    totalPages={absencesResponse.meta.totalPages}
                    onPageChange={setAbsencePage}
                  />
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* 3. Paiements Tab */}
        <TabsContent value="paiements" className="space-y-5 mt-0">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-line/60 p-4 shadow-xs">
              <div className="text-xs text-muted font-medium">Total payé</div>
              <div className="text-2xl font-bold text-ink mt-1">
                {formatMoney(paymentSummary?.totalPaid ?? student.totalPaid)}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-line/60 p-4 shadow-xs">
              <div className="text-xs text-muted font-medium">Nombre de versements</div>
              <div className="text-2xl font-bold text-ink mt-1">
                {paymentSummary?.count ?? paymentSummary?.paymentsCount ?? studentPayments.length}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-line/60 p-4 shadow-xs">
              <div className="text-xs text-muted font-medium">Dernier paiement</div>
              <div className="text-2xl font-bold text-ink mt-1">
                {paymentSummary?.lastPaymentDate
                  ? formatDate(paymentSummary.lastPaymentDate)
                  : '—'}
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-line-soft flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">Historique des paiements</h2>
              <Button
                size="sm"
                onClick={() => {
                  setEditingPayment(null);
                  setPaymentDialogOpen(true);
                }}
                className="rounded-xl h-9 bg-brand-600 hover:bg-brand-700 text-white gap-1.5 text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter un paiement
              </Button>
            </div>

            {studentPayments.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Wallet}
                  title="Aucun paiement"
                  description="Aucun versement n'a été enregistré pour cet élève."
                  actionLabel="Ajouter un paiement"
                  onAction={() => {
                    setEditingPayment(null);
                    setPaymentDialogOpen(true);
                  }}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="h-11 bg-[#F8F9FD] border-b border-line-soft text-xs font-medium text-muted">
                      <th className="px-5">Date</th>
                      <th className="px-5">Montant</th>
                      <th className="px-5">Description</th>
                      <th className="px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentPayments.map((p) => (
                      <tr
                        key={p.id}
                        className="h-14 border-b border-line-soft hover:bg-[#F8F9FF] text-body transition-colors"
                      >
                        <td className="px-5 font-semibold text-ink">
                          {formatDate(p.paidOn)}
                        </td>
                        <td className="px-5 font-bold text-ink">
                          {formatMoney(p.amount)}
                        </td>
                        <td className="px-5 text-muted max-w-[240px] truncate">
                          {p.description || '—'}
                        </td>
                        <td className="px-5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg text-muted hover:text-ink"
                                aria-label="Actions de paiement"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 rounded-xl p-1 shadow-md bg-white">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingPayment(p);
                                  setPaymentDialogOpen(true);
                                }}
                                className="rounded-lg text-xs py-2 cursor-pointer hover:bg-brand-50"
                              >
                                <Pencil className="w-3.5 h-3.5 mr-2 text-muted" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1 bg-line-soft" />
                              <DropdownMenuItem
                                onClick={() => setDeletePaymentTarget(p)}
                                className="rounded-lg text-xs py-2 text-danger hover:bg-danger/10 cursor-pointer focus:text-danger focus:bg-danger/10"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2 text-danger" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Edit Student Dialog */}
      <StudentFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        initialData={student}
      />

      {/* Enroll Student Dialog */}
      <EnrollStudentDialog
        open={enrollDialogOpen}
        onOpenChange={setEnrollDialogOpen}
        studentId={student.id}
        enrolledGroupIds={enrolledGroupIds}
      />

      {/* Payment Form Dialog */}
      <PaymentFormDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        initialData={editingPayment}
        initialStudentId={student.id}
        initialStudentName={fullName(student)}
        lockStudent={true}
      />

      {/* Delete Student Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer cet élève ?"
        description={`Voulez-vous vraiment supprimer l'élève ${fullName(student)} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />

      {/* Remove Enrollment Confirmation */}
      <ConfirmDialog
        open={!!removeEnrollmentTarget}
        onOpenChange={(open) => !open && setRemoveEnrollmentTarget(null)}
        title="Retirer du groupe ?"
        description="Voulez-vous vraiment retirer cet élève du groupe sélectionné ?"
        confirmLabel="Retirer"
        isLoading={removeEnrollmentMutation.isPending}
        onConfirm={() => {
          if (removeEnrollmentTarget) {
            removeEnrollmentMutation.mutate(removeEnrollmentTarget.id);
          }
        }}
      />

      {/* Delete Payment Confirmation */}
      <ConfirmDialog
        open={!!deletePaymentTarget}
        onOpenChange={(open) => !open && setDeletePaymentTarget(null)}
        title="Supprimer ce paiement ?"
        description={
          deletePaymentTarget
            ? `Supprimer ce paiement de ${formatMoney(deletePaymentTarget.amount)} pour ${fullName(student)} ?`
            : ''
        }
        confirmLabel="Supprimer"
        isLoading={deletePaymentMutation.isPending}
        onConfirm={() => {
          if (deletePaymentTarget) {
            deletePaymentMutation.mutate(deletePaymentTarget.id);
          }
        }}
      />

      {/* Parent Account Dialog */}
      <ParentAccountDialog
        open={parentAccountDialogOpen}
        onOpenChange={setParentAccountDialogOpen}
        studentId={student.id}
        studentName={fullName(student)}
      />

      {/* Validate Registration Dialog */}
      <ValidateRegistrationDialog
        open={validateDialogOpen}
        onOpenChange={setValidateDialogOpen}
        studentId={student.id}
        studentName={fullNameNatural(student)}
        initialClassId={
          typeof student.schoolClass === 'object' && student.schoolClass
            ? student.schoolClass.id
            : undefined
        }
      />
    </div>
  );
}
