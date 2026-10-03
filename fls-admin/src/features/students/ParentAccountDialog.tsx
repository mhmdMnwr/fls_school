import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { parentAccountsApi, ParentAccountInfo } from '@/api/parentAccounts';
import { getErrorMessage } from '@/lib/errors';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
}

export default function ParentAccountDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
}: Props) {
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const {
    data: account,
    isLoading,
    refetch,
  } = useQuery<ParentAccountInfo | null>({
    queryKey: ['parent-account', studentId],
    queryFn: () => parentAccountsApi.getByStudent(studentId),
    enabled: open && !!studentId,
  });

  const createMutation = useMutation({
    mutationFn: () => parentAccountsApi.createForStudent(studentId),
    onSuccess: (data) => {
      toast.success('Compte parent créé avec succès');
      queryClient.setQueryData(['parent-account', studentId], data);
      queryClient.invalidateQueries({ queryKey: ['parent-account', studentId] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => parentAccountsApi.resetPassword(studentId),
    onSuccess: (data) => {
      toast.success('Nouveau mot de passe généré');
      queryClient.setQueryData(['parent-account', studentId], data);
      setConfirmResetOpen(false);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setConfirmResetOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => parentAccountsApi.removeForStudent(studentId),
    onSuccess: () => {
      toast.success('Compte parent supprimé');
      queryClient.setQueryData(['parent-account', studentId], null);
      setConfirmDeleteOpen(false);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setConfirmDeleteOpen(false);
    },
  });

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copié dans le presse-papiers`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAllCredentials = () => {
    if (!account) return;
    const parentUrl = `${window.location.origin}/parent`;
    const message = `Bonjour,\n\nVoici vos identifiants pour accéder à l'espace parent de FLS School pour l'élève ${studentName} :\n\n- Lien de connexion : ${parentUrl}\n- Nom d'utilisateur : ${account.username}\n- Mot de passe : ${account.password}\n\nVous pourrez y consulter l'emploi du temps, le suivi des présences et l'historique des paiements.`;
    navigator.clipboard.writeText(message);
    setCopiedField('all');
    toast.success('Tous les identifiants ont été copiés !');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-ink">
                  Accès Espace Parent
                </DialogTitle>
                <DialogDescription className="text-xs text-muted">
                  Élève : <span className="font-semibold text-ink">{studentName}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted animate-pulse">
              Chargement des informations du compte...
            </div>
          ) : !account ? (
            <div className="py-6 space-y-5 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-line-soft flex items-center justify-center text-muted">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">
                  Aucun compte parent actif
                </h3>
                <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                  Créez un compte pour permettre aux parents de consulter
                  l'emploi du temps, les présences et les paiements de leur enfant.
                </p>
              </div>

              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="w-full h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs sm:text-sm gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {createMutation.isPending
                  ? 'Création en cours...'
                  : 'Créer les identifiants parent'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-3.5 bg-success/10 rounded-xl border border-success/20 flex items-center justify-between text-success">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold">Compte parent actif</span>
                </div>
                <a
                  href="/parent"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs flex items-center gap-1 hover:underline font-medium"
                >
                  Tester la page parent
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Username Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted">
                  Nom d'utilisateur
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-page-bg rounded-xl border border-line font-mono text-sm text-ink select-all">
                    {account.username}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(account.username, "Nom d'utilisateur")}
                    className="h-10 px-3 rounded-xl gap-1.5 text-xs"
                  >
                    {copiedField === "Nom d'utilisateur" ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    Copier
                  </Button>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted">
                    Mot de passe (visible par l'administrateur)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-brand-600 hover:underline flex items-center gap-1"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3 h-3" /> Masquer
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" /> Afficher
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-page-bg rounded-xl border border-line font-mono text-sm text-ink select-all font-bold tracking-wider">
                    {showPassword ? account.password : '••••••••'}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(account.password, 'Mot de passe')}
                    className="h-10 px-3 rounded-xl gap-1.5 text-xs"
                  >
                    {copiedField === 'Mot de passe' ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    Copier
                  </Button>
                </div>
              </div>

              {/* Copy all button */}
              <Button
                type="button"
                onClick={copyAllCredentials}
                className="w-full h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs sm:text-sm gap-2 mt-2"
              >
                {copiedField === 'all' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Copier le message complet pour le parent
              </Button>

              {/* Actions row */}
              <div className="pt-3 border-t border-line-soft flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmResetOpen(true)}
                  className="text-xs text-muted hover:text-ink gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Régénérer mot de passe
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="text-xs text-danger hover:bg-danger/10 hover:text-danger gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer l'accès
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Regenerate Password */}
      <ConfirmDialog
        open={confirmResetOpen}
        onOpenChange={setConfirmResetOpen}
        title="Régénérer le mot de passe ?"
        description="Un nouveau mot de passe aléatoire sera généré. Le parent devra utiliser ce nouveau mot de passe pour se connecter."
        confirmLabel="Régénérer"
        isLoading={resetMutation.isPending}
        onConfirm={() => resetMutation.mutate()}
      />

      {/* Confirm Delete Account */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Supprimer l'accès parent ?"
        description="Le parent ne pourra plus se connecter à son espace. Vous pourrez recréer un accès à tout moment."
        confirmLabel="Supprimer"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}
