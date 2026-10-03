import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { levelsApi } from '@/api/levels';
import { Level } from '@/types/api';
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
import { FormField } from '@/components/common/FormField';

const levelSchema = z.object({
  name: z.string().trim().min(1, 'Ce champ est obligatoire').max(100, '100 caractères maximum'),
  position: z.coerce.number().min(0, 'La position doit être supérieure ou égale à 0'),
});

type LevelFormValues = z.infer<typeof levelSchema>;

export interface LevelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Level | null;
  defaultPosition?: number;
}

export const LevelFormDialog: React.FC<LevelFormDialogProps> = ({
  open,
  onOpenChange,
  initialData,
  defaultPosition = 0,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LevelFormValues>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      name: '',
      position: defaultPosition,
    },
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          position: initialData.position,
        });
      } else {
        reset({
          name: '',
          position: defaultPosition,
        });
      }
    }
  }, [open, initialData, defaultPosition, reset]);

  const mutation = useMutation({
    mutationFn: async (values: LevelFormValues) => {
      if (isEditing && initialData) {
        return levelsApi.update(initialData.id, values);
      }
      return levelsApi.create(values);
    },
    onSuccess: () => {
      toast.success(
        isEditing ? 'Niveau modifié avec succès' : 'Niveau ajouté avec succès'
      );
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const onSubmit = (values: LevelFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg p-6 bg-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-ink">
            {isEditing ? 'Modifier le niveau' : 'Ajouter un niveau'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted">
            {isEditing
              ? 'Mettez à jour les informations du cycle d’enseignement.'
              : 'Créez un nouveau cycle d’enseignement (ex. Primaire, CEM, Lycée).'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-3">
          <FormField
            label="Nom du niveau"
            required
            error={errors.name?.message}
          >
            <Input
              placeholder="ex. Secondaire"
              className="h-10 rounded-xl"
              {...register('name')}
            />
          </FormField>

          <FormField
            label="Ordre d'affichage"
            error={errors.position?.message}
            helperText="Numéro déterminant la position dans les listes (0 en premier)"
          >
            <Input
              type="number"
              min={0}
              className="h-10 rounded-xl"
              {...register('position')}
            />
          </FormField>

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

export default LevelFormDialog;
