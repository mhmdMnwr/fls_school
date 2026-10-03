import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  CalendarDays,
  Wallet,
  BookOpen,
  CheckCircle2,
  XCircle,
  Gift,
  CalendarCheck,
  User,
  UsersRound,
} from 'lucide-react';
import {
  parentPortalApi,
  ParentProfile,
  TimetableSlot,
  ParentAttendanceResponse,
  ParentPaymentsResponse,
} from '@/api/parentPortal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate, formatMoney, formatTimeRange } from '@/lib/format';

const WEEKDAYS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

export default function ParentDashboardPage() {
  const [activeTab, setActiveTab] = useState('emploi');
  const [attendancePage, setAttendancePage] = useState(1);

  const { data: profile, isLoading: isProfileLoading } = useQuery<ParentProfile>({
    queryKey: ['parent', 'profile'],
    queryFn: parentPortalApi.getProfile,
  });

  const { data: timetable, isLoading: isTimetableLoading } = useQuery<
    Record<string, TimetableSlot[]>
  >({
    queryKey: ['parent', 'timetable'],
    queryFn: parentPortalApi.getTimetable,
  });

  const { data: attendanceData, isLoading: isAttendanceLoading } =
    useQuery<ParentAttendanceResponse>({
      queryKey: ['parent', 'attendance', attendancePage],
      queryFn: () => parentPortalApi.getAttendance(attendancePage, 10),
    });

  const { data: paymentsData, isLoading: isPaymentsLoading } =
    useQuery<ParentPaymentsResponse>({
      queryKey: ['parent', 'payments'],
      queryFn: parentPortalApi.getPayments,
    });

  useEffect(() => {
    if (profile) {
      document.title = `${profile.firstName} ${profile.lastName} · Espace Parent · FLS School`;
    }
  }, [profile]);

  const hasTimetableSlots =
    timetable && WEEKDAYS.some((day) => (timetable[day] || []).length > 0);

  return (
    <div className="space-y-6">
      {/* Student Banner */}
      <div className="bg-white rounded-2xl border border-line/60 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#312E81] to-[#4338CA] text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {profile ? `${profile.firstName[0]}${profile.lastName[0]}` : <User className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-ink">
                  {profile ? `${profile.firstName} ${profile.lastName}` : 'Chargement...'}
                </h1>
                <StatusBadge variant="brand">
                  <UsersRound className="w-3.5 h-3.5 mr-1" />
                  {profile?.groups?.length ?? 0} {profile?.groups?.length === 1 ? 'groupe' : 'groupes'}
                </StatusBadge>
                {profile && (
                  <StatusBadge variant={profile.isActive ? 'success' : 'neutral'}>
                    {profile.isActive ? 'Inscrit actif' : 'Inactif'}
                  </StatusBadge>
                )}
              </div>
              <p className="text-xs text-muted mt-1">
                Espace dédié au suivi pédagogique et financier de l'élève
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted bg-[#F8F9FD] px-3.5 py-2 rounded-xl border border-line-soft">
            <CalendarCheck className="w-4 h-4 text-[#4338CA]" />
            <span>Année scolaire en cours</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-transparent border-b border-line-soft p-0 rounded-none w-full justify-start h-auto gap-8">
          <TabsTrigger
            value="emploi"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#4338CA] data-[state=active]:text-[#4338CA] data-[state=active]:shadow-none px-2 py-3 text-sm font-semibold gap-2"
          >
            <Clock className="w-4 h-4" />
            Emploi du temps
          </TabsTrigger>
          <TabsTrigger
            value="presences"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#4338CA] data-[state=active]:text-[#4338CA] data-[state=active]:shadow-none px-2 py-3 text-sm font-semibold gap-2"
          >
            <CalendarDays className="w-4 h-4" />
            Présences & Absences
          </TabsTrigger>
          <TabsTrigger
            value="paiements"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#4338CA] data-[state=active]:text-[#4338CA] data-[state=active]:shadow-none px-2 py-3 text-sm font-semibold gap-2"
          >
            <Wallet className="w-4 h-4" />
            Historique des paiements ({paymentsData?.count ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* ─── 1. TAB EMPLOI DU TEMPS (suit les horaires des groupes) ─── */}
        <TabsContent value="emploi" className="space-y-4 mt-0">
          <div className="bg-white rounded-2xl border border-line/60 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-line-soft">
              <div>
                <h2 className="text-base font-bold text-ink">Horaires réguliers des cours</h2>
                <p className="text-xs text-muted mt-0.5">
                  Planning hebdomadaire fixé pour chaque groupe d'étude dans lequel l'élève est inscrit.
                </p>
              </div>
            </div>

            {isTimetableLoading ? (
              <div className="py-12 text-center text-sm text-muted animate-pulse">
                Chargement de l'emploi du temps...
              </div>
            ) : !hasTimetableSlots ? (
              <div className="py-10">
                <EmptyState
                  icon={Clock}
                  title="Aucun horaire défini"
                  description="Les horaires réguliers n'ont pas encore été configurés pour les groupes de votre enfant."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {WEEKDAYS.filter((day) => (timetable?.[day] || []).length > 0).map((day) => (
                  <div
                    key={day}
                    className="rounded-xl border border-line/70 overflow-hidden bg-white shadow-2xs"
                  >
                    <div className="bg-[#F8F9FD] px-4 py-2.5 border-b border-line-soft flex items-center justify-between">
                      <span className="font-bold text-sm text-ink">{day}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#4338CA]">
                        {timetable![day].length} cours
                      </span>
                    </div>
                    <div className="divide-y divide-line-soft">
                      {timetable![day].map((slot, index) => (
                        <div key={index} className="p-4 hover:bg-[#FAFAFF] transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-[#4338CA] shrink-0" />
                                <span className="font-bold text-sm text-ink">
                                  {slot.subjectName}
                                </span>
                              </div>
                              <div className="text-xs text-muted flex items-center gap-3">
                                <span>Groupe : <strong className="text-ink font-medium">{slot.groupName}</strong></span>
                                {slot.teacherName && (
                                  <span>&bull; Prof : <strong className="text-ink font-medium">{slot.teacherName}</strong></span>
                                )}
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-page-bg border border-line text-ink">
                                <Clock className="w-3 h-3 text-muted" />
                                {formatTimeRange(slot.startTime, slot.endTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── 2. TAB PRÉSENCES & ABSENCES ─── */}
        <TabsContent value="presences" className="space-y-5 mt-0">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-line/60 p-4 shadow-xs">
              <div className="text-xs text-muted font-medium">Séances totales</div>
              <div className="text-2xl font-bold text-ink mt-1">
                {attendanceData?.summary.total ?? 0}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-line/60 p-4 shadow-xs">
              <div className="text-xs text-success font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Présences
              </div>
              <div className="text-2xl font-bold text-success mt-1">
                {attendanceData?.summary.present ?? 0}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-line/60 p-4 shadow-xs">
              <div className="text-xs text-danger font-medium flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                Absences
              </div>
              <div className="text-2xl font-bold text-danger mt-1">
                {attendanceData?.summary.absent ?? 0}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-line/60 p-4 shadow-xs">
              <div className="text-xs text-muted font-medium">Taux d'absence</div>
              <div className="text-2xl font-bold text-ink mt-1">
                {attendanceData?.summary.absenceRate ?? 0}%
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-line-soft">
              <h2 className="text-base font-bold text-ink">Historique des séances</h2>
              <p className="text-xs text-muted mt-0.5">
                Relevé séance par séance avec mention des séances d'essai gratuites
              </p>
            </div>

            {isAttendanceLoading ? (
              <div className="py-12 text-center text-sm text-muted animate-pulse">
                Chargement de l'historique...
              </div>
            ) : !attendanceData || attendanceData.data.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={CalendarDays}
                  title="Aucune présence enregistrée"
                  description="L'appel n'a pas encore été enregistré pour les séances de cet élève."
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
                        <th className="px-5">Type de séance</th>
                        <th className="px-5">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.data.map((rec) => (
                        <tr
                          key={rec.id}
                          className="h-14 border-b border-line-soft hover:bg-[#F8F9FF] text-body transition-colors"
                        >
                          <td className="px-5 font-semibold text-ink">
                            {formatDate(rec.sessionDate)}
                          </td>
                          <td className="px-5">
                            <span className="font-medium text-ink">{rec.subjectName || '—'}</span>
                            {rec.groupName && (
                              <span className="text-xs text-muted block">{rec.groupName}</span>
                            )}
                          </td>
                          <td className="px-5 font-medium text-ink font-mono text-xs">
                            {formatTimeRange(rec.startTime, rec.endTime)}
                          </td>
                          <td className="px-5">
                            {rec.isFreeTrial ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Gift className="w-3.5 h-3.5 text-emerald-600" />
                                Séance d'essai gratuite
                              </span>
                            ) : (
                              <span className="text-xs text-muted">Séance normale</span>
                            )}
                          </td>
                          <td className="px-5">
                            <StatusBadge variant={rec.isPresent ? 'success' : 'danger'}>
                              {rec.isPresent ? (
                                <span className="inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Présent
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Absent
                                </span>
                              )}
                            </StatusBadge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {attendanceData.meta.totalPages > 1 && (
                  <Pagination
                    total={attendanceData.meta.total}
                    page={attendanceData.meta.page}
                    limit={attendanceData.meta.limit}
                    totalPages={attendanceData.meta.totalPages}
                    onPageChange={setAttendancePage}
                  />
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── 3. TAB PAIEMENTS ─── */}
        <TabsContent value="paiements" className="space-y-5 mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-line/60 p-4 shadow-xs">
              <div className="text-xs text-muted font-medium">Total payé à ce jour</div>
              <div className="text-2xl font-bold text-ink mt-1">
                {formatMoney(paymentsData?.totalPaid ?? 0)}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-line/60 p-4 shadow-xs">
              <div className="text-xs text-muted font-medium">Nombre total de versements</div>
              <div className="text-2xl font-bold text-ink mt-1">
                {paymentsData?.count ?? 0}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-line-soft">
              <h2 className="text-base font-bold text-ink">Relevé des versements</h2>
              <p className="text-xs text-muted mt-0.5">
                Historique des paiements de scolarité enregistrés par l'administration
              </p>
            </div>

            {isPaymentsLoading ? (
              <div className="py-12 text-center text-sm text-muted animate-pulse">
                Chargement des paiements...
              </div>
            ) : !paymentsData || paymentsData.payments.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Wallet}
                  title="Aucun paiement"
                  description="Aucun paiement n'a encore été enregistré pour cet élève."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="h-11 bg-[#F8F9FD] border-b border-line-soft text-xs font-medium text-muted">
                      <th className="px-5">Date du versement</th>
                      <th className="px-5">Montant</th>
                      <th className="px-5">Motif / Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsData.payments.map((p) => (
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
                        <td className="px-5 text-muted max-w-[320px] truncate">
                          {p.description || 'Règlement des cours'}
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
    </div>
  );
}
