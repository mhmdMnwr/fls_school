import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { studentsApi } from '@/api/students';
import { classesApi } from '@/api/classes';
import { SchoolClass } from '@/types/api';
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

export interface ValidateRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  initialClassId?: string;
}

export const ValidateRegistrationDialog: React.FC<ValidateRegistrationDialogProps> = ({
  open,
  onOpenChange,
  studentId,
  studentName,
  initialClassId,
}) => {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId || '');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { data: classes = [] } = useQuery<SchoolClass[]>({
    queryKey: ['classes'],
    queryFn: () => classesApi.getAll(),
    enabled: open,
  });

  React.useEffect(() => {
    if (open) {
      setSelectedClassId(initialClassId || '');
      setIsActive(true);
      setError(null);
    }
  }, [open, initialClassId]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: any = { isActive };
      if (selectedClassId && selectedClassId !== 'none') {
        payload.schoolClassId = selectedClassId;
      }
      return studentsApi.update(studentId, payload);
    },
    onSuccess: () => {
      toast.success("L'inscription de l'élève a été validée avec succès !");
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      setError(getErrorMessage(err));
      toast.error(getErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-md p-6 bg-white shadow-xl">
        <DialogHeader>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <DialogTitle className="text-xl font-bold text-ink">
            Valider l'inscription
          </DialogTitle>
          <DialogDescription className="text-sm text-muted">
            Confirmez l'inscription de <strong className="text-ink">{studentName}</strong> et son passage au statut actif.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <FormField label="Classe (facultatif / indicatif)" error={error || undefined}>
            <Select
              value={selectedClassId || 'none'}
              onValueChange={(val) => {
                setSelectedClassId(val === 'none' ? '' : val);
                setError(null);
              }}
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Aucune classe fixe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune classe fixe (distinction par matière)</SelectItem>
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
          </FormField>


          <div className="flex items-center justify-between p-3.5 rounded-xl bg-page-bg/60 border border-line-soft">
            <div>
              <Label
                htmlFor="validate-isActive"
                className="text-sm font-medium text-ink cursor-pointer"
              >
                Activer l'élève
              </Label>
              <p className="text-xs text-muted">
                L'élève sera immédiatement compté comme actif dans l'école
              </p>
            </div>
            <Switch
              id="validate-isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-3">
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
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              {mutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Confirmer l'inscription
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ValidateRegistrationDialog;
