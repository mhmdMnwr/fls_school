import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { sessionsApi, CreateSessionInput } from '@/api/sessions';
import { groupsApi } from '@/api/groups';
import { Session, StudyGroup } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/common/FormField';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const sessionSchema = z
  .object({
    groupId: z.string().min(1, 'Ce champ est obligatoire'),
    date: z.string().min(1, 'Ce champ est obligatoire'),
    startTime: z.string().regex(timeRegex, 'Format heure invalide (HH:mm)'),
    endTime: z.string().regex(timeRegex, 'Format heure invalide (HH:mm)'),
    isFreeTrial: z.boolean().default(false),
  })
  .refine((val) => val.endTime > val.startTime, {
    message: "L'heure de fin doit être après l'heure de début",
    path: ['endTime'],
  });

type SessionFormValues = z.infer<typeof sessionSchema>;

export interface SessionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Session | null;
  lockedGroupId?: string;
  lockedGroupName?: string;
}

export const SessionFormDialog: React.FC<SessionFormDialogProps> = ({
  open,
  onOpenChange,
  initialData,
  lockedGroupId,
  lockedGroupName,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Fetch groups for the select
  const { data: groupsResponse } = useQuery({
    queryKey: ['groups', { isActive: 'true', limit: 100 }],
    queryFn: () => groupsApi.getAll({ isActive: 'true', limit: 100 }),
    enabled: open,
  });

  const { data: lockedGroupData } = useQuery({
    queryKey: ['group', lockedGroupId],
    queryFn: () => groupsApi.getOne(lockedGroupId!),
    enabled: open && !!lockedGroupId,
  });

  const groups = React.useMemo(() => groupsResponse?.data || [], [groupsResponse?.data]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      groupId: lockedGroupId || '',
      date: todayStr,
      startTime: '09:00',
      endTime: '10:30',
      isFreeTrial: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        let dateVal = todayStr;
        if (initialData.date) {
          try {
            dateVal = format(new Date(initialData.date), 'yyyy-MM-dd');
          } catch {
            dateVal = initialData.date.slice(0, 10);
          }
        }
        const gId =
          typeof initialData.group === 'object' && initialData.group
            ? ((initialData.group as any).id || (initialData.group as any)._id)
            : String(initialData.group || '');

        reset({
          groupId: gId,
          date: dateVal,
          startTime: initialData.startTime || '09:00',
          endTime: initialData.endTime || '10:30',
          isFreeTrial: initialData.isFreeTrial ?? false,
        });
      } else {
        const initialGId = lockedGroupId || groups[0]?.id || '';
        const grp =
          (lockedGroupId ? lockedGroupData : null) ||
          groups.find((g: StudyGroup) => g.id === initialGId);
        const firstSlot = grp?.studyTime?.[0];

        reset({
          groupId: initialGId,
          date: todayStr,
          startTime: firstSlot?.startTime || '09:00',
          endTime: firstSlot?.endTime || '10:30',
          isFreeTrial: false,
        });
      }
    }
  }, [open, initialData, lockedGroupId, lockedGroupData, groups, todayStr, reset]);

  // If locked group details finish loading, update start/end times if not editing
  useEffect(() => {
    if (open && !initialData && lockedGroupData?.studyTime && lockedGroupData.studyTime.length > 0) {
      const firstSlot = lockedGroupData.studyTime[0];
      setValue('startTime', firstSlot.startTime);
      setValue('endTime', firstSlot.endTime);
    }
  }, [open, initialData, lockedGroupData, setValue]);

  const mutation = useMutation({
    mutationFn: async (values: SessionFormValues) => {
      const payload: CreateSessionInput = {
        groupId: values.groupId,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        isFreeTrial: values.isFreeTrial,
      };

      if (isEditing && initialData) {
        return sessionsApi.update(initialData.id, payload);
      }
      return sessionsApi.create(payload);
    },
    onSuccess: () => {
      toast.success(
        isEditing
          ? 'Séance modifiée avec succès'
          : 'Séance planifiée avec succès'
      );
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      if (err?.response?.status === 409) {
        toast.error('Une séance existe déjà pour ce groupe à cette date et cette heure.');
      } else {
        toast.error(getErrorMessage(err));
      }
    },
  });

  const onSubmit = (values: SessionFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg p-6 md:p-8 bg-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-ink">
            {isEditing ? 'Modifier la séance' : 'Planifier une séance'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted">
            {isEditing
              ? 'Mettez à jour les horaires ou informations du cours.'
              : 'Les élèves inscrits au groupe seront automatiquement ajoutés à la feuille d’appel.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-3">
          {/* Groupe Select */}
          <FormField label="Groupe d'étude" required error={errors.groupId?.message}>
            {lockedGroupId ? (
              <Input
                value={lockedGroupName || 'Groupe sélectionné'}
                disabled
                className="h-10 rounded-xl bg-page-bg/50 border-line text-ink font-medium"
              />
            ) : (
              <Controller
                name="groupId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      const chosenGroup = groups.find((g: StudyGroup) => g.id === val);
                      if (chosenGroup?.studyTime && chosenGroup.studyTime.length > 0) {
                        const firstSlot = chosenGroup.studyTime[0];
                        setValue('startTime', firstSlot.startTime);
                        setValue('endTime', firstSlot.endTime);
                      }
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-white border-line text-sm">
                      <SelectValue placeholder="Sélectionnez un groupe" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {groups.map((g: StudyGroup) => {
                        const subjectName = g.subject?.name || 'Matière';
                        const teacherName = g.teacher
                          ? `${g.teacher.firstName} ${g.teacher.lastName}`
                          : 'Professeur';
                        const label = g.name
                          ? `${subjectName} — ${teacherName} (${g.name})`
                          : `${subjectName} — ${teacherName}`;

                        return (
                          <SelectItem key={g.id} value={g.id}>
                            {label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>

          {/* Date */}
          <FormField label="Date du cours" required error={errors.date?.message}>
            <Input
              type="date"
              className="h-10 rounded-xl"
              {...register('date')}
            />
          </FormField>

          {/* Start and End Time */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Heure de début"
              required
              error={errors.startTime?.message}
            >
              <Input
                type="time"
                className="h-10 rounded-xl"
                {...register('startTime')}
              />
            </FormField>

            <FormField
              label="Heure de fin"
              required
              error={errors.endTime?.message}
            >
              <Input
                type="time"
                className="h-10 rounded-xl"
                {...register('endTime')}
              />
            </FormField>
          </div>

          {/* Essai gratuit Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-page-bg/60 border border-line-soft">
            <div>
              <Label htmlFor="session-isFreeTrial" className="text-sm font-medium text-ink cursor-pointer">
                Séance d'essai gratuit
              </Label>
              <p className="text-xs text-muted">
                Séance ouverte ou offerte sans comptabilisation de paiement habituel.
              </p>
            </div>
            <Controller
              name="isFreeTrial"
              control={control}
              render={({ field }) => (
                <Switch
                  id="session-isFreeTrial"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-3 sm:gap-3.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
              className="rounded-xl"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium"
            >
              {mutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isEditing ? 'Enregistrer' : 'Planifier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SessionFormDialog;
