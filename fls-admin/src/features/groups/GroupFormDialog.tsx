import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { groupsApi } from '@/api/groups';
import { subjectsApi } from '@/api/subjects';
import { teachersApi } from '@/api/teachers';
import { StudyGroup, Level, SchoolClass, Subject, Teacher } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';
import { fullName } from '@/lib/format';
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/common/FormField';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const WEEKDAYS = [
  { value: 'lundi', label: 'Lundi' },
  { value: 'mardi', label: 'Mardi' },
  { value: 'mercredi', label: 'Mercredi' },
  { value: 'jeudi', label: 'Jeudi' },
  { value: 'vendredi', label: 'Vendredi' },
  { value: 'samedi', label: 'Samedi' },
  { value: 'dimanche', label: 'Dimanche' },
];

const studyTimeSlotSchema = z
  .object({
    weekday: z.string().min(1, 'Jour requis'),
    startTime: z.string().regex(timeRegex, 'Format heure invalide (HH:mm)'),
    endTime: z.string().regex(timeRegex, 'Format heure invalide (HH:mm)'),
  })
  .refine((val) => val.endTime > val.startTime, {
    message: "L'heure de fin doit être après l'heure de début",
    path: ['endTime'],
  });

const groupSchema = z.object({
  schoolClassId: z.string().min(1, 'Ce champ est obligatoire'),
  subjectId: z.string().min(1, 'Ce champ est obligatoire'),
  teacherId: z.string().min(1, 'Ce champ est obligatoire'),
  name: z.string().trim().max(100, '100 caractères maximum').optional(),
  isActive: z.boolean().default(true),
  studyTime: z.array(studyTimeSlotSchema).default([]),
});

type GroupFormValues = z.infer<typeof groupSchema>;

export interface GroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  levels: Level[];
  allClasses: SchoolClass[];
  initialData?: StudyGroup | null;
  defaultClassId?: string;
  defaultSubjectId?: string;
}

export const GroupFormDialog: React.FC<GroupFormDialogProps> = ({
  open,
  onOpenChange,
  levels,
  allClasses,
  initialData,
  defaultClassId,
  defaultSubjectId,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      schoolClassId: defaultClassId || '',
      subjectId: defaultSubjectId || '',
      teacherId: '',
      name: '',
      isActive: true,
      studyTime: [{ weekday: 'samedi', startTime: '08:00', endTime: '10:00' }],
    },
  });

  const {
    fields: studyTimeFields,
    append: appendSlot,
    remove: removeSlot,
  } = useFieldArray({
    control,
    name: 'studyTime',
  });

  // Group classes by level
  const classesByLevel = useMemo(() => {
    const map = new Map<string, { levelName: string; classes: SchoolClass[] }>();
    const sortedLevels = [...levels].sort((a, b) => a.position - b.position);

    for (const lvl of sortedLevels) {
      map.set(lvl.id, { levelName: lvl.name, classes: [] });
    }

    for (const cls of allClasses) {
      const lvlId =
        typeof cls.level === 'object' && cls.level
          ? ((cls.level as any).id || (cls.level as any)._id)
          : String(cls.level || '');
      if (map.has(lvlId)) {
        map.get(lvlId)!.classes.push(cls);
      } else {
        map.set(lvlId, { levelName: 'Autre', classes: [cls] });
      }
    }

    return Array.from(map.values()).filter((g) => g.classes.length > 0);
  }, [levels, allClasses]);

  // Fetch subjects for the chosen class
  const { data: subjectsResponse, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['subjects', { classId: selectedClassId, limit: 100 }],
    queryFn: () => subjectsApi.getAll({ classId: selectedClassId, limit: 100 }),
    enabled: open && !!selectedClassId,
  });

  const availableSubjects = subjectsResponse?.data || [];

  // Fetch active teachers
  const { data: teachersResponse } = useQuery({
    queryKey: ['teachers', { isActive: 'true', limit: 100 }],
    queryFn: () => teachersApi.getAll({ isActive: 'true', limit: 100 }),
    enabled: open,
  });

  const availableTeachers = teachersResponse?.data || [];

  useEffect(() => {
    if (open) {
      if (initialData) {
        const clsId =
          typeof initialData.subject === 'object' &&
          initialData.subject &&
          typeof initialData.subject.schoolClass === 'object' &&
          initialData.subject.schoolClass
            ? initialData.subject.schoolClass.id
            : '';
        const subId =
          typeof initialData.subject === 'object' && initialData.subject
            ? initialData.subject.id
            : String(initialData.subject || '');
        const teaId =
          typeof initialData.teacher === 'object' && initialData.teacher
            ? initialData.teacher.id
            : String(initialData.teacher || '');

        setSelectedClassId(clsId);
        reset({
          schoolClassId: clsId,
          subjectId: subId,
          teacherId: teaId,
          name: initialData.name || '',
          isActive: initialData.isActive,
          studyTime: (initialData.studyTime || []).map((st) => ({
            weekday: st.weekday,
            startTime: st.startTime || (st as any).start || '08:00',
            endTime: st.endTime || (st as any).end || '10:00',
          })),
        });
      } else {
        const initialCls = defaultClassId || (allClasses[0]?.id ?? '');
        setSelectedClassId(initialCls);
        reset({
          schoolClassId: initialCls,
          subjectId: defaultSubjectId || '',
          teacherId: '',
          name: '',
          isActive: true,
          studyTime: [{ weekday: 'samedi', startTime: '08:00', endTime: '10:00' }],
        });
      }
    }
  }, [open, initialData, defaultClassId, defaultSubjectId, allClasses, reset]);

  const mutation = useMutation({
    mutationFn: async (values: GroupFormValues) => {
      if (isEditing && initialData) {
        return groupsApi.update(initialData.id, {
          teacherId: values.teacherId,
          name: values.name || '',
          isActive: values.isActive,
          studyTime: values.studyTime || [],
        });
      }
      return groupsApi.create({
        subjectId: values.subjectId,
        teacherId: values.teacherId,
        name: values.name || '',
        isActive: values.isActive,
        studyTime: values.studyTime || [],
      });
    },
    onSuccess: () => {
      toast.success(
        isEditing ? 'Groupe modifié avec succès' : 'Groupe créé avec succès'
      );
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      if (err?.response?.status === 409) {
        toast.error('Un groupe identique existe déjà.');
      } else {
        toast.error(getErrorMessage(err));
      }
    },
  });

  const onSubmit = (values: GroupFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg md:max-w-xl p-6 md:p-8 bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-ink">
            {isEditing ? 'Modifier le groupe' : 'Créer un groupe'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted">
            {isEditing
              ? 'Mettez à jour l’enseignant ou le nom du groupe.'
              : 'Associez une matière à un professeur pour créer une session d’enseignement.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-3">
          {/* Classe Select (Locked on edit) */}
          <FormField label="Classe" required error={errors.schoolClassId?.message}>
            {isEditing ? (
              <Input
                value={
                  typeof initialData?.subject === 'object' &&
                  initialData?.subject?.schoolClass &&
                  typeof initialData.subject.schoolClass === 'object'
                    ? initialData.subject.schoolClass.name
                    : 'Classe verrouillée'
                }
                disabled
                className="h-10 rounded-xl bg-page-bg/50 border-line text-ink font-medium"
              />
            ) : (
              <Controller
                name="schoolClassId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setSelectedClassId(val);
                      setValue('subjectId', ''); // clear dependent subject
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-white border-line text-sm">
                      <SelectValue placeholder="Sélectionnez une classe" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {classesByLevel.map((group) => (
                        <SelectGroup key={group.levelName}>
                          <SelectLabel className="text-xs font-bold text-brand-700 bg-brand-50/50 px-2 py-1">
                            {group.levelName}
                          </SelectLabel>
                          {group.classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>

          {/* Matière Select (Dependent on class, Locked on edit) */}
          <FormField label="Matière" required error={errors.subjectId?.message}>
            {isEditing ? (
              <Input
                value={
                  typeof initialData?.subject === 'object' && initialData?.subject
                    ? initialData.subject.name
                    : 'Matière verrouillée'
                }
                disabled
                className="h-10 rounded-xl bg-page-bg/50 border-line text-ink font-medium"
              />
            ) : (
              <Controller
                name="subjectId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedClassId || isLoadingSubjects}
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-white border-line text-sm">
                      <SelectValue
                        placeholder={
                          isLoadingSubjects
                            ? 'Chargement des matières...'
                            : !selectedClassId
                            ? "Choisir d'abord une classe"
                            : 'Sélectionnez une matière'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {availableSubjects.map((sub: Subject) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>

          {/* Professeur Select */}
          <FormField label="Professeur" required error={errors.teacherId?.message}>
            <Controller
              name="teacherId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 rounded-xl bg-white border-line text-sm">
                    <SelectValue placeholder="Sélectionnez un enseignant" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {availableTeachers.map((tea: Teacher) => (
                      <SelectItem key={tea.id} value={tea.id}>
                        {fullName(tea)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          {/* Nom du groupe */}
          <FormField
            label="Nom du groupe (optionnel)"
            error={errors.name?.message}
            helperText="Permet de distinguer plusieurs groupes de la même matière"
          >
            <Input
              placeholder="ex. Samedi 10:00"
              className="h-10 rounded-xl"
              {...register('name')}
            />
          </FormField>

          {/* Horaires d'étude (studyTime) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-ink">
                  Horaires d'étude ({studyTimeFields.length})
                </Label>
                <p className="text-xs text-muted">
                  Créneaux habituels du groupe (utilisés pour pré-remplir les séances).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendSlot({
                    weekday: 'samedi',
                    startTime: '08:00',
                    endTime: '10:00',
                  })
                }
                className="h-8 rounded-xl text-xs gap-1.5 border-line hover:bg-brand-50 hover:text-brand-700 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter un horaire
              </Button>
            </div>

            {studyTimeFields.length === 0 ? (
              <div className="p-3 text-center rounded-xl bg-page-bg/50 border border-dashed border-line text-xs text-muted">
                Aucun horaire défini. Cliquez sur « Ajouter un horaire » pour en ajouter.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {studyTimeFields.map((fieldItem, index) => (
                  <div
                    key={fieldItem.id}
                    className="p-2.5 rounded-xl bg-page-bg/40 border border-line/60 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      {/* Weekday select */}
                      <div className="w-36 shrink-0">
                        <Controller
                          name={`studyTime.${index}.weekday`}
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="h-9 rounded-lg bg-white border-line text-xs">
                                <SelectValue placeholder="Jour" />
                              </SelectTrigger>
                              <SelectContent>
                                {WEEKDAYS.map((d) => (
                                  <SelectItem key={d.value} value={d.value} className="text-xs">
                                    {d.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      {/* Start Time */}
                      <div className="flex-1">
                        <Input
                          type="time"
                          className="h-9 rounded-lg bg-white border-line text-xs px-2"
                          {...register(`studyTime.${index}.startTime`)}
                        />
                      </div>

                      <span className="text-xs text-muted">à</span>

                      {/* End Time */}
                      <div className="flex-1">
                        <Input
                          type="time"
                          className="h-9 rounded-lg bg-white border-line text-xs px-2"
                          {...register(`studyTime.${index}.endTime`)}
                        />
                      </div>

                      {/* Delete */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSlot(index)}
                        className="h-8 w-8 p-0 rounded-lg text-muted hover:text-danger hover:bg-danger/10 shrink-0"
                        title="Supprimer cet horaire"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {errors.studyTime?.[index]?.endTime && (
                      <p className="text-[11px] text-danger pl-1">
                        {errors.studyTime[index]?.endTime?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Switch actif */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-page-bg/60 border border-line-soft">
            <Label htmlFor="group-isActive" className="text-sm font-medium text-ink cursor-pointer">
              Groupe actif
            </Label>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  id="group-isActive"
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
              {isEditing ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GroupFormDialog;
