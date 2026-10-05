import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { subjectsApi } from '@/api/subjects';
import { Subject, Level, SchoolClass } from '@/types/api';
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

const subjectSchema = z.object({
  levelId: z.string().min(1, 'Ce champ est obligatoire'),
  schoolClassId: z.string().min(1, 'Ce champ est obligatoire'),
  name: z.string().trim().min(1, 'Ce champ est obligatoire').max(100, '100 caractères maximum'),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

export interface SubjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  levels: Level[];
  allClasses: SchoolClass[];
  initialData?: Subject | null;
  defaultClassId?: string;
}

export const SubjectFormDialog: React.FC<SubjectFormDialogProps> = ({
  open,
  onOpenChange,
  levels,
  allClasses,
  initialData,
  defaultClassId,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const [selectedLevelId, setSelectedLevelId] = useState<string>('');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      levelId: '',
      schoolClassId: defaultClassId || '',
      name: '',
    },
  });

  // Filter classes by selected level
  const filteredClasses = React.useMemo(() => {
    if (!selectedLevelId) return [];
    return allClasses.filter((c) => {
      const lvlId =
        typeof c.level === 'object' && c.level
          ? ((c.level as any).id || (c.level as any)._id)
          : String(c.level || '');
      return lvlId === selectedLevelId;
    });
  }, [allClasses, selectedLevelId]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        const clsObj =
          typeof initialData.schoolClass === 'object' && initialData.schoolClass
            ? initialData.schoolClass
            : allClasses.find((c) => c.id === initialData.schoolClass);

        let lvlId = '';
        if (clsObj && typeof clsObj.level === 'object' && clsObj.level) {
          lvlId = (clsObj.level as any).id || (clsObj.level as any)._id;
        } else if (clsObj && clsObj.level) {
          lvlId = String(clsObj.level);
        }

        setSelectedLevelId(lvlId);
        reset({
          levelId: lvlId,
          schoolClassId: clsObj ? clsObj.id : String(initialData.schoolClass || ''),
          name: initialData.name,
        });
      } else {
        let initialLvlId = '';
        let initialClsId = '';
        if (defaultClassId) {
          const found = allClasses.find((c) => c.id === defaultClassId);
          if (found) {
            initialClsId = found.id;
            initialLvlId =
              typeof found.level === 'object' && found.level
                ? ((found.level as any).id || (found.level as any)._id)
                : String(found.level || '');
          }
        } else if (levels.length > 0) {
          initialLvlId = levels[0].id;
        }

        setSelectedLevelId(initialLvlId);
        reset({
          levelId: initialLvlId,
          schoolClassId: initialClsId,
          name: '',
        });
      }
    }
  }, [open, initialData, defaultClassId, levels, allClasses, reset]);

  const mutation = useMutation({
    mutationFn: async (values: SubjectFormValues) => {
      if (isEditing && initialData) {
        return subjectsApi.update(initialData.id, {
          schoolClassId: values.schoolClassId,
          name: values.name,
        });
      }
      return subjectsApi.create({
        schoolClassId: values.schoolClassId,
        name: values.name,
      });
    },
    onSuccess: () => {
      toast.success(
        isEditing ? 'Matière modifiée avec succès' : 'Matière ajoutée avec succès'
      );
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const onSubmit = (values: SubjectFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg p-6 bg-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-ink">
            {isEditing ? 'Modifier la matière' : 'Ajouter une matière'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted">
            {isEditing
              ? 'Mettez à jour les informations de la matière.'
              : 'Associez une nouvelle matière à une classe.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-3">
          {/* Level Select (UI Helper) */}
          <FormField label="Niveau" required error={errors.levelId?.message}>
            <Controller
              name="levelId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setSelectedLevelId(val);
                    setValue('schoolClassId', ''); // clear class on level change
                  }}
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

          {/* Class Select (Dependent) */}
          <FormField label="Classe" required error={errors.schoolClassId?.message}>
            <Controller
              name="schoolClassId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedLevelId}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-white border-line text-sm">
                    <SelectValue
                      placeholder={
                        !selectedLevelId
                          ? "Choisir d'abord un niveau"
                          : 'Sélectionnez une classe'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          {/* Subject Name */}
          <FormField label="Nom de la matière" required error={errors.name?.message}>
            <Input
              placeholder="Nom de la matière"
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

export default SubjectFormDialog;
