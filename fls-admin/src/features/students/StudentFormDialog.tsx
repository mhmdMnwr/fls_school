import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { studentsApi, CreateStudentInput } from '@/api/students';
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
import { FormField } from '@/components/common/FormField';

const phoneRegex = /^[0-9+\s().-]{8,20}$/;

const studentSchema = z.object({
  firstName: z.string().trim().min(1, 'Ce champ est obligatoire').max(100, '100 caractères maximum'),
  lastName: z.string().trim().min(1, 'Ce champ est obligatoire').max(100, '100 caractères maximum'),
  birthDate: z
    .string()
    .min(1, 'Ce champ est obligatoire')
    .refine((val) => {
      const d = new Date(val);
      return !isNaN(d.getTime()) && d < new Date();
    }, {
      message: 'La date doit être dans le passé',
    }),
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
  isActive: z.boolean().default(true),
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
  initialData,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      phone: '',
      email: '',
      isActive: true,
    },
  });

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

        reset({
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          birthDate: birth,
          phone: initialData.phone || '',
          email: initialData.email || '',
          isActive: initialData.isActive,
        });
      } else {
        reset({
          firstName: '',
          lastName: '',
          birthDate: '',
          phone: '',
          email: '',
          isActive: true,
        });
      }
    }
  }, [open, initialData, reset]);

  const mutation = useMutation({
    mutationFn: async (values: StudentFormValues) => {
      const payload: CreateStudentInput = {
        firstName: values.firstName,
        lastName: values.lastName,
        birthDate: values.birthDate,
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
      <DialogContent className="rounded-2xl max-w-lg p-6 md:p-8 bg-white shadow-xl">
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
                placeholder="ex. Amina"
                className="h-10 rounded-xl"
                {...register('firstName')}
              />
            </FormField>

            <FormField label="Nom" required error={errors.lastName?.message}>
              <Input
                placeholder="ex. Benali"
                className="h-10 rounded-xl"
                {...register('lastName')}
              />
            </FormField>
          </div>

          {/* Row 2: Date de naissance | Téléphone */}
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

            <FormField label="Téléphone" error={errors.phone?.message}>
              <Input
                placeholder="0555 12 34 56"
                className="h-10 rounded-xl"
                {...register('phone')}
              />
            </FormField>
          </div>

          {/* Row 3: Email */}
          <FormField label="Email" error={errors.email?.message}>
            <Input
              type="email"
              placeholder="eleve@domaine.com"
              className="h-10 rounded-xl"
              {...register('email')}
            />
          </FormField>

          {/* Row 4: Statut Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-page-bg/60 border border-line-soft">
            <Label htmlFor="student-isActive" className="text-sm font-medium text-ink cursor-pointer">
              Élève actif
            </Label>
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
