import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import { studentsApi } from '@/api/students';
import { enrollmentsApi } from '@/api/enrollments';
import { Student } from '@/types/api';
import { fullName } from '@/lib/format';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
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
import { Checkbox } from '@/components/ui/checkbox';
import { InitialsAvatar } from '@/components/common/InitialsAvatar';

export interface AddStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  classId?: string;
  enrolledStudentIds: string[];
}

export const AddStudentsDialog: React.FC<AddStudentsDialogProps> = ({
  open,
  onOpenChange,
  groupId,
  enrolledStudentIds,
}) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const debouncedSearch = useDebounce(search, 300);

  // Fetch available active students
  const { data: studentsResponse, isLoading } = useQuery({
    queryKey: ['students', { isActive: 'true', limit: 100, search: debouncedSearch }],
    queryFn: () =>
      studentsApi.getAll({
        isActive: 'true',
        limit: 100,
        search: debouncedSearch || undefined,
      }),
    enabled: open,
  });

  const availableStudents = React.useMemo(() => {
    const list = studentsResponse?.data || [];
    return list.filter((s: Student) => !enrolledStudentIds.includes(s.id));
  }, [studentsResponse, enrolledStudentIds]);

  React.useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedIds([]);
    }
  }, [open]);

  const toggleSelect = (studentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === availableStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(availableStudents.map((s) => s.id));
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      let successCount = 0;
      const failures: string[] = [];

      for (const studentId of selectedIds) {
        try {
          await enrollmentsApi.create({ studentId, groupId });
          successCount++;
        } catch {
          const s = availableStudents.find((stud) => stud.id === studentId);
          failures.push(s ? fullName(s) : studentId);
        }
      }

      return { successCount, failures };
    },
    onSuccess: ({ successCount, failures }) => {
      if (successCount > 0) {
        toast.success(
          `${successCount} élève${successCount > 1 ? 's' : ''} inscrit${successCount > 1 ? 's' : ''} avec succès`
        );
      }
      if (failures.length > 0) {
        toast.error(`Échec d'inscription pour : ${failures.join(', ')}`);
      }
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg p-6 bg-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-ink">
            Ajouter des élèves au groupe
          </DialogTitle>
          <DialogDescription className="text-sm text-muted">
            Sélectionnez les élèves à inscrire au groupe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Search field */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom..."
              className="pl-9 h-10 rounded-xl"
            />
          </div>

          {/* Student list */}
          <div className="border border-line-soft rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-[#F8F9FD] border-b border-line-soft text-xs text-muted">
              <span>{availableStudents.length} élève(s) disponible(s)</span>
              {availableStudents.length > 0 && (
                <button
                  type="button"
                  onClick={selectAll}
                  className="font-semibold text-brand-600 hover:text-brand-700"
                >
                  {selectedIds.length === availableStudents.length
                    ? 'Tout désélectionner'
                    : 'Tout sélectionner'}
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-line-soft p-1">
              {isLoading ? (
                <div className="flex items-center justify-center p-8 text-xs text-muted gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                  Chargement des élèves...
                </div>
              ) : availableStudents.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted">
                  Aucun élève disponible à inscrire.
                </div>
              ) : (
                availableStudents.map((s) => {
                  const isChecked = selectedIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleSelect(s.id)}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-brand-50/60 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleSelect(s.id)}
                        className="rounded"
                      />
                      <InitialsAvatar firstName={s.firstName} lastName={s.lastName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-ink truncate">
                          {fullName(s)}
                        </div>
                        {s.email && (
                          <div className="text-xs text-muted truncate">{s.email}</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 flex flex-row items-center justify-end gap-3 sm:gap-3.5">
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
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || selectedIds.length === 0}
            className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium"
          >
            {mutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Inscrire ({selectedIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentsDialog;
