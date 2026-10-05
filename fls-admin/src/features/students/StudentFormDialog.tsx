import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { studentsApi, CreateStudentInput } from '@/api/students';
import { classesApi } from '@/api/classes';
import { Student, Level, SchoolClass } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/components/common/FormField';

const phoneRegex = /^[0-9+\s().-]{8,20}$/;

const studentSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'Ce champ est obligatoire')
      .max(100, '100 caractères maximum'),
    lastName: z
      .string()
      .trim()
      .min(1, 'Ce champ est obligatoire')
      .max(100, '100 caractères maximum'),
    birthDate: z
      .string()
      .min(1, 'Ce champ est obligatoire')
      .refine(
        (val) => {
          const d = new Date(val);
          return !isNaN(d.getTime()) && d < new Date();
        },
        {
          message: 'La date doit être dans le passé',
        }
      ),
    gender: z.enum(['MALE', 'FEMALE'], {
      required_error: 'Veuillez sélectionner le sexe',
    }),
    schoolClassId: z.string().optional(),
    phone: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || phoneRegex.test(val), {
        message: 'Numéro de téléphone invalide',
      }),
    email: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || z.string().email().safeParse(val).success, {
        message: 'Adresse email invalide',
      }),
    isActive: z.boolean().default(false),
  });

type StudentFormValues = z.infer<typeof studentSchema>;


export interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  levels?: Level[];
  allClasses?: SchoolClass[];
  initialData?: Student | null;
  defaultClassId?: string;
}

export const StudentFormDialog: React.FC<StudentFormDialogProps> = ({
  open,
  onOpenChange,
  allClasses: propClasses,
  initialData,
  defaultClassId,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Fallback query for classes if not passed as prop
  const { data: fetchedClasses = [] } = useQuery<SchoolClass[]>({
    queryKey: ['classes'],
    queryFn: () => classesApi.getAll(),
    enabled: open && (!propClasses || propClasses.length === 0),
  });

  const classes = propClasses && propClasses.length > 0 ? propClasses : fetchedClasses;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: undefined,
      schoolClassId: defaultClassId || 'none',
      phone: '',
      email: '',
      isActive: false,
    },
  });

  const isActiveValue = watch('isActive');

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        let birth = '';
        if (initialData.birthDate) {
          try {
            birth = format(new Date(initialData.birthDate), 'yyyy-MM-dd');
          } catch {
            birth = initialData.birthDate.slice(0, 10);
          }
        }

        const classId =
          typeof initialData.schoolClass === 'object' && initialData.schoolClass
            ? initialData.schoolClass.id
            : initialData.schoolClass || 'none';

        reset({
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          birthDate: birth,
          gender: initialData.gender || 'MALE',
          schoolClassId: classId || 'none',
          phone: initialData.phone || '',
          email: initialData.email || '',
          isActive: initialData.isActive,
        });
      } else {
        reset({
          firstName: '',
          lastName: '',
          birthDate: '',
          gender: undefined,
          schoolClassId: defaultClassId || 'none',
          phone: '',
          email: '',
          isActive: false,
        });
      }
    }
  }, [open, initialData, defaultClassId, reset]);

  const mutation = useMutation({
    mutationFn: async (values: StudentFormValues) => {
      const selectedClass =
        values.schoolClassId && values.schoolClassId !== 'none'
          ? values.schoolClassId
          : undefined;

      const payload: CreateStudentInput = {
        firstName: values.firstName,
        lastName: values.lastName,
        birthDate: values.birthDate,
        gender: values.gender,
        schoolClassId: selectedClass,
        phone: values.phone || undefined,
        email: values.email || undefined,
        isActive: values.isActive,
      };

      if (isEditing && initialData) {
        return studentsApi.update(initialData.id, payload);
      }
      return studentsApi.create(payload);
    },
    onSuccess: () => {
      toast.success(
        isEditing ? 'Élève modifié avec succès' : 'Élève ajouté avec succès'
      );
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const onSubmit = (values: StudentFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg p-6 md:p-8 bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-ink">
            {isEditing ? "Modifier l'élève" : 'Ajouter un élève'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted">
            {isEditing
              ? "Modifiez les informations personnelles de l'élève."
              : 'Remplissez le formulaire ci-dessous pour inscrire un nouvel élève.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-3">
          {/* Row 1: Prénom | Nom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Prénom" required error={errors.firstName?.message}>
              <Input
                placeholder="Prénom"
                className="h-10 rounded-xl"
                {...register('firstName')}
              />
            </FormField>

            <FormField label="Nom" required error={errors.lastName?.message}>
              <Input
                placeholder="Nom"
                className="h-10 rounded-xl"
                {...register('lastName')}
              />
            </FormField>
          </div>

          {/* Row 2: Date de naissance | Sexe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Date de naissance"
              required
              error={errors.birthDate?.message}
            >
              <Input
                type="date"
                max={todayStr}
                className="h-10 rounded-xl"
                {...register('birthDate')}
              />
            </FormField>

            <FormField label="Sexe" required error={errors.gender?.message}>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue placeholder="Sélectionner le sexe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Garçon</SelectItem>
                      <SelectItem value="FEMALE">Fille</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          {/* Row 3: Classe (Required if active) */}
          <FormField
            label={isActiveValue ? 'Classe (obligatoire pour un élève actif)' : 'Classe (optionnel)'}
            required={isActiveValue}
            error={errors.schoolClassId?.message}
          >
            <Controller
              name="schoolClassId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || 'none'}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="Sélectionner une classe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune classe</SelectItem>
                    {classes.map((cls) => {
                      const levelName =
                        typeof cls.level === 'object' && cls.level
                          ? (cls.level as any).name
                          : '';
                      return (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} {levelName ? `(${levelName})` : ''}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          {/* Row 4: Téléphone | Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Téléphone" error={errors.phone?.message}>
              <Input
                placeholder="Téléphone"
                className="h-10 rounded-xl"
                {...register('phone')}
              />
            </FormField>

            <FormField label="Email" error={errors.email?.message}>
              <Input
                type="email"
                placeholder="Email"
                className="h-10 rounded-xl"
                {...register('email')}
              />
            </FormField>
          </div>

          {/* Row 5: Statut Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-page-bg/60 border border-line-soft">
            <div>
              <Label
                htmlFor="student-isActive"
                className="text-sm font-medium text-ink cursor-pointer"
              >
                Élève actif
              </Label>
              <p className="text-xs text-muted">
                Un élève inactif n'apparaît pas dans les listes des cours actifs
              </p>
            </div>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  id="student-isActive"
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

export default StudentFormDialog;
