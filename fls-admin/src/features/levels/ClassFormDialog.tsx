import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { classesApi } from '@/api/classes';
import { SchoolClass, Level } from '@/types/api';
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
import { FormField } from '@/components/common/FormField';

const classSchema = z.object({
  levelId: z.string().min(1, 'Ce champ est obligatoire'),
  name: z.string().trim().min(1, 'Ce champ est obligatoire').max(100, '100 caractères maximum'),
});

type ClassFormValues = z.infer<typeof classSchema>;

export interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  levels: Level[];
  initialData?: SchoolClass | null;
  defaultLevelId?: string;
  lockLevel?: boolean;
}

export const ClassFormDialog: React.FC<ClassFormDialogProps> = ({
  open,
  onOpenChange,
  levels,
  initialData,
  defaultLevelId,
  lockLevel = false,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      levelId: defaultLevelId || '',
      name: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        const lvlId =
          typeof initialData.level === 'object' && initialData.level
            ? ((initialData.level as any).id || (initialData.level as any)._id)
            : String(initialData.level || '');
        reset({
          levelId: lvlId,
          name: initialData.name,
        });
      } else {
        reset({
          levelId: defaultLevelId || (levels[0]?.id ?? ''),
          name: '',
        });
      }
    }
  }, [open, initialData, defaultLevelId, levels, reset]);

  const mutation = useMutation({
    mutationFn: async (values: ClassFormValues) => {
      if (isEditing && initialData) {
        return classesApi.update(initialData.id, values);
      }
      return classesApi.create(values);
    },
    onSuccess: () => {
      toast.success(
        isEditing ? 'Classe modifiée avec succès' : 'Classe ajoutée avec succès'
      );
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const onSubmit = (values: ClassFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg p-6 bg-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-ink">
            {isEditing ? 'Modifier la classe' : 'Ajouter une classe'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted">
            {isEditing
              ? 'Mettez à jour le nom ou le niveau de la classe.'
              : 'Ajoutez une nouvelle classe dans le niveau sélectionné.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-3">
          <FormField
            label="Niveau"
            required
            error={errors.levelId?.message}
          >
            <Controller
              name="levelId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={lockLevel}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-white border-line text-sm">
                    <SelectValue placeholder="Sélectionnez un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((lvl) => (
                      <SelectItem key={lvl.id} value={lvl.id}>
                        {lvl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField
            label="Nom de la classe"
            required
            error={errors.name?.message}
          >
            <Input
              placeholder="Nom de la classe"
              className="h-10 rounded-xl"
              {...register('name')}
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

export default ClassFormDialog;
