import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@/api/groups';
import { enrollmentsApi } from '@/api/enrollments';
import { StudyGroup } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
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
import { FormField } from '@/components/common/FormField';

export interface EnrollStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentClassId?: string;
  enrolledGroupIds: string[];
}

export const EnrollStudentDialog: React.FC<EnrollStudentDialogProps> = ({
  open,
  onOpenChange,
  studentId,
  enrolledGroupIds,
}) => {
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState('');

  // Fetch all active groups
  const { data: groupsResponse, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['groups', { isActive: 'true', limit: 100 }],
    queryFn: () =>
      groupsApi.getAll({
        isActive: 'true',
        limit: 100,
      }),
    enabled: open,
  });

  const availableGroups = React.useMemo(() => {
    const all = groupsResponse?.data || [];
    return all.filter((g: StudyGroup) => !enrolledGroupIds.includes(g.id));
  }, [groupsResponse, enrolledGroupIds]);

  React.useEffect(() => {
    if (open) {
      setSelectedGroupId('');
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      enrollmentsApi.create({
        studentId,
        groupId: selectedGroupId,
      }),
    onSuccess: () => {
      toast.success('Élève inscrit au groupe avec succès');
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) {
      toast.error('Veuillez sélectionner un groupe');
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg p-6 bg-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-ink">
            Inscrire à un groupe
          </DialogTitle>
          <DialogDescription className="text-sm text-muted">
            Choisissez un groupe d'étude pour cet élève.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <FormField label="Groupe d'étude" required>
            {isLoadingGroups ? (
              <div className="flex items-center gap-2 h-10 px-3 text-xs text-muted">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                Chargement des groupes...
              </div>
            ) : availableGroups.length === 0 ? (
              <p className="text-sm text-muted py-2">
                Aucun groupe disponible (l'élève est déjà inscrit à tous les groupes existants).
              </p>
            ) : (
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger className="h-10 rounded-xl bg-white border-line text-sm">
                  <SelectValue placeholder="Sélectionnez un groupe" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableGroups.map((g: StudyGroup) => {
                    const subjectName = g.subject?.name || 'Matière';
                    const className =
                      g.subject?.schoolClass && typeof g.subject.schoolClass === 'object'
                        ? g.subject.schoolClass.name
                        : '';
                    const teacherName = g.teacher
                      ? `${g.teacher.firstName} ${g.teacher.lastName}`
                      : 'Professeur';
                    const groupLabel = `${className ? `[${className}] ` : ''}${subjectName} — ${teacherName}${g.name ? ` (${g.name})` : ''}`;

                    return (
                      <SelectItem key={g.id} value={g.id}>
                        {groupLabel}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
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
              disabled={mutation.isPending || !selectedGroupId}
              className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium"
            >
              {mutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Inscrire
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollStudentDialog;
