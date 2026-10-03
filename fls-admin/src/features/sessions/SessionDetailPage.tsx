import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, CalendarDays, Clock, GraduationCap, Loader2, School, Users } from 'lucide-react';
import { toast } from 'sonner';
import { sessionsApi } from '@/api/sessions';
import { absencesApi } from '@/api/absences';
import { groupsApi } from '@/api/groups';
import { SessionDetail, StudyGroupDetail } from '@/types/api';
import { formatDate, formatLongDate, formatTimeRange, fullName } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { InitialsAvatar } from '@/components/common/InitialsAvatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { DetailPageSkeleton } from '@/components/common/PageSkeletons';
import { Button } from '@/components/ui/button';

type AttendanceMap = Record<string, boolean>;

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: session, isLoading, isError, refetch } = useQuery<SessionDetail>({
    queryKey: ['session', id],
    queryFn: () => sessionsApi.getOne(id!),
    enabled: !!id,
  });

  const groupRef = session?.group;
  const sessionGroupId = groupRef && typeof groupRef === 'object' ? groupRef.id : (groupRef as string | undefined);

  // Active enrollments of the group (students enrolled after the session was created have no record yet)
  const { data: groupDetail, isLoading: groupLoading } = useQuery<StudyGroupDetail>({
    queryKey: ['group', sessionGroupId],
    queryFn: () => groupsApi.getOne(sessionGroupId!),
    enabled: !!sessionGroupId,
  });

  // Students listed on the sheet: existing records + enrolled students without a record (default present)
  const rows = useMemo(() => {
    const enrolledIds = groupDetail ? new Set(groupDetail.students.map((s) => s.id)) : null;
    const list = (session?.attendance || [])
      .filter((a) => a.student)
      .map((a) => ({
        studentId: a.student!.id,
        student: a.student!,
        isPresent: a.isPresent,
        hasRecord: true,
        enrolled: enrolledIds ? enrolledIds.has(a.student!.id) : true,
      }));
    const known = new Set(list.map((r) => r.studentId));
    (groupDetail?.students || []).forEach((s) => {
      if (!known.has(s.id)) {
        list.push({
          studentId: s.id,
          student: { id: s.id, firstName: s.firstName, lastName: s.lastName },
          isPresent: true,
          hasRecord: false,
          enrolled: true,
        });
      }
    });
    return list.sort((a, b) => fullName(a.student).localeCompare(fullName(b.student), 'fr'));
  }, [session, groupDetail]);

  const initial = useMemo<AttendanceMap>(() => {
    const m: AttendanceMap = {};
    rows.forEach((r) => {
      m[r.studentId] = r.isPresent;
    });
    return m;
  }, [rows]);

  const [values, setValues] = useState<AttendanceMap>({});

  useEffect(() => {
    setValues(initial);
  }, [initial]);

  const isDirty = rows.some(
    (r) => r.enrolled && (!r.hasRecord || values[r.studentId] !== initial[r.studentId])
  );
  const presentCount = rows.filter((r) => values[r.studentId] ?? r.isPresent).length;
  const absentCount = rows.length - presentCount;

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const subjectName = session?.group?.subject?.name || 'Séance';

  useEffect(() => {
    if (session) {
      document.title = `${subjectName} - ${formatDate(session.date)} · FLS School`;
    } else {
      document.title = "Feuille d'appel · FLS School";
    }
  }, [session, subjectName]);

  const saveMutation = useMutation({
    mutationFn: () =>
      absencesApi.saveSessionAttendance(
        id!,
        rows
          .filter((r) => r.enrolled)
          .map((r) => ({ studentId: r.studentId, isPresent: values[r.studentId] ?? r.isPresent }))
      ),
    onSuccess: async () => {
      toast.success('Appel enregistré');
      await queryClient.invalidateQueries({ queryKey: ['session', id] });
      queryClient.invalidateQueries({ queryKey: ['absences'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const setAll = (isPresent: boolean) => {
    const m: AttendanceMap = {};
    rows.forEach((r) => {
      m[r.studentId] = r.enrolled ? isPresent : (values[r.studentId] ?? r.isPresent);
    });
    setValues(m);
  };

  if (isLoading || (sessionGroupId && groupLoading)) return <DetailPageSkeleton />;

  if (isError || !session) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Séances', to: '/seances' }, { label: isError ? 'Erreur' : 'Introuvable' }]} />
        <div className="bg-white rounded-2xl border border-line/60 shadow-xs">
          {isError ? (
            <ErrorState onRetry={refetch} />
          ) : (
            <EmptyState
              title="Séance introuvable"
              description="La séance demandée n'existe pas ou a été supprimée."
              actionLabel="Retour à la liste"
              onAction={() => navigate('/seances')}
            />
          )}
        </div>
      </div>
    );
  }

  const group = session.group;
  const classObj = group?.subject?.schoolClass;
  const className = classObj && typeof classObj === 'object' ? classObj.name : '—';
  const teacher = group?.teacher && typeof group.teacher === 'object' ? group.teacher : null;
  const groupId = group && typeof group === 'object' ? group.id : String(group || '');

  const infoItems = [
    { icon: BookOpen, label: 'Matière', value: subjectName },
    { icon: School, label: 'Classe', value: className },
    {
      icon: GraduationCap,
      label: 'Professeur',
      value: teacher ? (
        <Link to={`/profs/${teacher.id}`} className="text-brand-600 hover:underline">
          {fullName(teacher)}
        </Link>
      ) : (
        '—'
      ),
    },
    { icon: CalendarDays, label: 'Date', value: formatLongDate(session.date) },
    { icon: Clock, label: 'Horaire', value: formatTimeRange(session.startTime, session.endTime) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: 'Séances', to: '/seances' },
            { label: `${subjectName} - ${formatDate(session.date)}` },
          ]}
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-ink">{subjectName}</h1>
          {session.isFreeTrial ? (
            <StatusBadge variant="warning">Essai gratuit</StatusBadge>
          ) : (
            <StatusBadge variant="neutral">Régulière</StatusBadge>
          )}
        </div>
        {group?.name && <p className="text-sm text-muted mt-1">Groupe : {group.name}</p>}
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl border border-line/60 shadow-xs p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {infoItems.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">{label}</p>
                <div className="text-sm font-semibold text-ink truncate">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance sheet */}
      <div className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-line">
          <h2 className="text-base font-semibold text-ink">Feuille d'appel</h2>
          {rows.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge variant="success">Présents {presentCount}</StatusBadge>
              <StatusBadge variant="danger">Absents {absentCount}</StatusBadge>
              <Button variant="outline" size="sm" onClick={() => setAll(true)}>
                Tout marquer présent
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAll(false)}>
                Tout marquer absent
              </Button>
            </div>
          )}
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={Users} title="Aucun élève inscrit à ce groupe">
            {groupId && (
              <Link to={`/groupes/${groupId}`} className="text-sm font-medium text-brand-600 hover:underline">
                Gérer les élèves du groupe
              </Link>
            )}
          </EmptyState>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted bg-page-bg/60">
                    <th className="px-5 py-3 font-semibold">Élève</th>
                    <th className="px-5 py-3 font-semibold text-right">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const present = values[r.studentId] ?? r.isPresent;
                    const set = (v: boolean) => setValues((prev) => ({ ...prev, [r.studentId]: v }));
                    return (
                      <tr key={r.studentId} className="border-t border-line-soft">
                        <td className="px-5 py-3">
                          <Link to={`/eleves/${r.studentId}`} className="flex items-center gap-3 group">
                            <InitialsAvatar
                              firstName={r.student.firstName}
                              lastName={r.student.lastName}
                              size="md"
                            />
                            <span className="font-medium text-ink group-hover:text-brand-600">
                              {fullName(r.student)}
                            </span>
                            {!r.enrolled && <span className="text-xs text-muted">(plus inscrit)</span>}
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <div
                            role="radiogroup"
                            aria-label={`Statut de ${fullName(r.student)}`}
                            className="ml-auto inline-flex rounded-lg border border-line p-0.5 bg-page-bg float-right"
                          >
                            <button
                              type="button"
                              role="radio"
                              aria-checked={present}
                              onClick={() => set(true)}
                              disabled={!r.enrolled}
                              className={cn(
                                'px-3 py-1.5 rounded-md text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                                present ? 'bg-[#DCFCE7] text-[#15803D]' : 'text-muted hover:text-body'
                              )}
                            >
                              Présent
                            </button>
                            <button
                              type="button"
                              role="radio"
                              aria-checked={!present}
                              onClick={() => set(false)}
                              disabled={!r.enrolled}
                              className={cn(
                                'px-3 py-1.5 rounded-md text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                                !present ? 'bg-[#FEE2E2] text-[#B91C1C]' : 'text-muted hover:text-body'
                              )}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-line px-5 py-4 flex items-center justify-end gap-4">
              {isDirty && <span className="text-xs font-medium text-[#B45309]">Modifications non enregistrées</span>}
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={!isDirty || saveMutation.isPending}
              >
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enregistrer l'appel
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
