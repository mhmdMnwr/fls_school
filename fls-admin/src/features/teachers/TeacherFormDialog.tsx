import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { teachersApi, CreateTeacherInput } from '@/api/teachers';
import { Teacher } from '@/types/api';
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

const teacherSchema = z.object({
  firstName: z.string().trim().min(1, 'Ce champ est obligatoire').max(100, '100 caractères maximum'),
  lastName: z.string().trim().min(1, 'Ce champ est obligatoire').max(100, '100 caractères maximum'),
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

type TeacherFormValues = z.infer<typeof teacherSchema>;

export interface TeacherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Teacher | null;
}

export const TeacherFormDialog: React.FC<TeacherFormDialogProps> = ({
  open,
  onOpenChange,
  initialData,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      isActive: true,
    },
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          phone: initialData.phone || '',
          email: initialData.email || '',
          isActive: initialData.isActive,
        });
      } else {
        reset({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          isActive: true,
        });
      }
    }
  }, [open, initialData, reset]);

  const mutation = useMutation({
    mutationFn: async (values: TeacherFormValues) => {
      const payload: CreateTeacherInput = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || undefined,
        email: values.email || undefined,
        isActive: values.isActive,
      };

      if (isEditing && initialData) {
        return teachersApi.update(initialData.id, payload);
      }
      return teachersApi.create(payload);
    },
    onSuccess: () => {
      toast.success(
        isEditing
          ? 'Professeur modifié avec succès'
          : 'Professeur ajouté avec succès'
      );
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['teacher'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const onSubmit = (values: TeacherFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg p-6 bg-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-ink">
            {isEditing ? 'Modifier le professeur' : 'Ajouter un professeur'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted">
            {isEditing
              ? 'Mettez à jour les coordonnées de l’enseignant.'
              : 'Enregistrez un nouveau membre de l’équipe pédagogique.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Prénom" required error={errors.firstName?.message}>
              <Input
                placeholder="ex. Karim"
                className="h-10 rounded-xl"
                {...register('firstName')}
              />
            </FormField>

            <FormField label="Nom" required error={errors.lastName?.message}>
              <Input
                placeholder="ex. Mansouri"
                className="h-10 rounded-xl"
                {...register('lastName')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Téléphone" error={errors.phone?.message}>
              <Input
                placeholder="0555 12 34 56"
                className="h-10 rounded-xl"
                {...register('phone')}
              />
            </FormField>

            <FormField label="Email" error={errors.email?.message}>
              <Input
                type="email"
                placeholder="prof@fls.school"
                className="h-10 rounded-xl"
                {...register('email')}
              />
            </FormField>
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-page-bg/60 border border-line-soft">
            <Label htmlFor="isActive" className="text-sm font-medium text-ink cursor-pointer">
              Professeur actif
            </Label>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  id="isActive"
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

export default TeacherFormDialog;
