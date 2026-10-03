import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { paymentsApi } from '@/api/payments';
import { studentsApi } from '@/api/students';
import { Payment } from '@/types/api';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/common/FormField';
import { AsyncCombobox, ComboboxOption } from '@/components/common/AsyncCombobox';
import { InitialsAvatar } from '@/components/common/InitialsAvatar';

const paymentSchema = z.object({
  studentId: z.string().min(1, 'Ce champ est obligatoire'),
  paidOn: z
    .string()
    .min(1, 'Ce champ est obligatoire')
    .refine((val) => {
      const d = new Date(val);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return !isNaN(d.getTime()) && d < tomorrow;
    }, {
      message: 'La date ne peut pas être dans le futur',
    }),
  amount: z.coerce
    .number()
    .min(0.01, 'Montant invalide (doit être supérieur à 0)')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'Maximum 2 décimales autorisées',
    }),
  description: z.string().trim().max(255, '255 caractères maximum').optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Payment | null;
  initialStudentId?: string;
  initialStudentName?: string;
  lockStudent?: boolean;
}

export const PaymentFormDialog: React.FC<PaymentFormDialogProps> = ({
  open,
  onOpenChange,
  initialData,
  initialStudentId,
  initialStudentName,
  lockStudent = false,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [descriptionCharCount, setDescriptionCharCount] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      studentId: initialStudentId || '',
      paidOn: todayStr,
      amount: 0,
      description: '',
    },
  });

  const descriptionValue = watch('description') || '';
  useEffect(() => {
    setDescriptionCharCount(descriptionValue.length);
  }, [descriptionValue]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        let dateStr = todayStr;
        if (initialData.paidOn) {
          try {
            dateStr = format(new Date(initialData.paidOn), 'yyyy-MM-dd');
          } catch {
            dateStr = initialData.paidOn.slice(0, 10);
          }
        }
        const sId =
          typeof initialData.student === 'object' && initialData.student
            ? initialData.student.id
            : String(initialData.student || '');

        reset({
          studentId: sId,
          paidOn: dateStr,
          amount: initialData.amount,
          description: initialData.description || '',
        });
      } else {
        reset({
          studentId: initialStudentId || '',
          paidOn: todayStr,
          amount: 0,
          description: '',
        });
      }
    }
  }, [open, initialData, initialStudentId, todayStr, reset]);

  const mutation = useMutation({
    mutationFn: async (values: PaymentFormValues) => {
      const payload = {
        studentId: values.studentId,
        paidOn: values.paidOn,
        amount: values.amount,
        description: values.description || undefined,
      };

      if (isEditing && initialData) {
        return paymentsApi.update(initialData.id, payload);
      }
      return paymentsApi.create(payload);
    },
    onSuccess: () => {
      toast.success(
        isEditing
          ? 'Paiement modifié avec succès'
          : 'Paiement enregistré avec succès'
      );
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['student'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const onSubmit = (values: PaymentFormValues) => {
    mutation.mutate(values);
  };

  const loadStudentOptions = async (q: string): Promise<ComboboxOption[]> => {
    const res = await studentsApi.getAll({ search: q, limit: 10 });
    return (res.data || []).map((s) => ({
      value: s.id,
      label: fullName(s),
      sublabel: s.phone || s.email || undefined,
      avatar: <InitialsAvatar firstName={s.firstName} lastName={s.lastName} size="sm" />,
    }));
  };

  const defaultSelectedOption: ComboboxOption | undefined =
    initialStudentId && initialStudentName
      ? {
          value: initialStudentId,
          label: initialStudentName,
        }
      : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg p-6 md:p-8 bg-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-ink">
            {isEditing ? 'Modifier le paiement' : 'Ajouter un paiement'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted">
            {isEditing
              ? 'Mettez à jour les détails du reçu de paiement.'
              : 'Enregistrez un nouveau versement pour un élève.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-3">
          {/* Student selection */}
          <FormField label="Élève" required error={errors.studentId?.message}>
            <Controller
              name="studentId"
              control={control}
              render={({ field }) => (
                <AsyncCombobox
                  value={field.value}
                  onChange={field.onChange}
                  loadOptions={loadStudentOptions}
                  placeholder="Rechercher un élève..."
                  disabled={lockStudent}
                  selectedOption={defaultSelectedOption}
                />
              )}
            />
          </FormField>

          {/* Date & Montant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Date du paiement" required error={errors.paidOn?.message}>
              <Input
                type="date"
                max={todayStr}
                className="h-10 rounded-xl"
                {...register('paidOn')}
              />
            </FormField>

            <FormField label="Montant" required error={errors.amount?.message}>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="h-10 rounded-xl pr-12 text-ink font-semibold"
                  {...register('amount')}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted pointer-events-none">
                  DA
                </span>
              </div>
            </FormField>
          </div>

          {/* Description */}
          <FormField
            label="Description"
            error={errors.description?.message}
            helperText={`${descriptionCharCount} / 255 caractères`}
          >
            <Textarea
              placeholder="ex. Frais d'inscription 1er trimestre..."
              rows={3}
              maxLength={255}
              className="rounded-xl resize-none text-sm"
              {...register('description')}
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
              {isEditing ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentFormDialog;
