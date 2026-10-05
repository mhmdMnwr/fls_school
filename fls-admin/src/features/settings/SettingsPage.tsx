import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Lock, Eye, EyeOff, LogOut, Loader2, ShieldCheck, User, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/errors';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SiteSettingsTab from './SiteSettingsTab';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ce champ est obligatoire'),
    newPassword: z.string().min(8, '8 caractères minimum'),
    confirmPassword: z.string().min(1, 'Ce champ est obligatoire'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { admin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Paramètres · FLS School';
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const mutation = useMutation({
    mutationFn: (values: PasswordFormValues) =>
      authApi.changePassword(values.currentPassword, values.newPassword),
    onSuccess: () => {
      toast.success('Mot de passe mis à jour');
      reset();
      setCurrentPasswordError(null);
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 401 || status === 400) {
        setCurrentPasswordError('Mot de passe actuel incorrect');
      } else {
        toast.error(getErrorMessage(err));
      }
    },
  });

  const onSubmit = (data: PasswordFormValues) => {
    setCurrentPasswordError(null);
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres"
        subtitle="Gérez votre compte administrateur et les options du site public"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger
            value="account"
            className="rounded-lg text-xs font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-xs flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Compte & Sécurité</span>
          </TabsTrigger>
          <TabsTrigger
            value="site"
            className="rounded-lg text-xs font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-xs flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span>Site web</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Compte & Sécurité */}
        <TabsContent value="account" className="space-y-6 max-w-[640px] mt-0">
        {/* Card 1: Profil */}
        <div className="bg-white rounded-2xl border border-line/60 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-ink">Profil administrateur</h2>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <div className="w-14 h-14 rounded-full bg-brand-600 text-white font-bold text-xl flex items-center justify-center shadow-xs">
              A
            </div>
            <div>
              <p className="text-base font-bold text-ink leading-tight">Admin</p>
              <p className="text-xs text-muted mt-0.5">Administrateur</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="admin-email" className="text-xs font-semibold text-ink">
              Adresse email
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <Input
                id="admin-email"
                type="email"
                disabled
                value={admin?.email || ''}
                className="pl-10 h-10 rounded-xl bg-page-bg/70 border-line text-muted font-medium cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-muted">
              Le compte administrateur unique est configuré via les variables d'environnement.
            </p>
          </div>
        </div>

        {/* Card 2: Sécurité */}
        <div className="bg-white rounded-2xl border border-line/60 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            <div>
              <h2 className="text-base font-bold text-ink">Sécurité</h2>
              <p className="text-xs text-muted mt-0.5">Changer le mot de passe</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Mot de passe actuel */}
            <div className="space-y-1.5">
              <Label htmlFor="current-password" className="text-xs font-semibold text-ink">
                Mot de passe actuel *
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('currentPassword')}
                  className="pr-10 h-10 rounded-xl bg-white border-line text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors p-1"
                  aria-label={showCurrent ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {(errors.currentPassword?.message || currentPasswordError) && (
                <p className="text-xs text-danger font-medium">
                  {currentPasswordError || errors.currentPassword?.message}
                </p>
              )}
            </div>

            {/* Nouveau mot de passe */}
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-xs font-semibold text-ink">
                Nouveau mot de passe *
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('newPassword')}
                  className="pr-10 h-10 rounded-xl bg-white border-line text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors p-1"
                  aria-label={showNew ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword?.message && (
                <p className="text-xs text-danger font-medium">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirmer le nouveau mot de passe */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs font-semibold text-ink">
                Confirmer le nouveau mot de passe *
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className="pr-10 h-10 rounded-xl bg-white border-line text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors p-1"
                  aria-label={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword?.message && (
                <p className="text-xs text-danger font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={mutation.isPending} className="h-10 px-5">
                {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Mettre à jour le mot de passe
              </Button>
            </div>
          </form>
        </div>

        {/* Card 3: Session */}
        <div className="bg-white rounded-2xl border border-line/60 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-ink">Session</h2>
            <p className="text-xs text-muted mt-0.5">
              Déconnectez-vous de votre session active sur cet appareil
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={logout}
            className="border-rose-200 text-[#B91C1C] hover:bg-[#FEE2E2]/60 hover:text-[#B91C1C] font-semibold h-10 px-4 self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
        </div>
        </TabsContent>

        {/* Tab 2: Site web */}
        <TabsContent value="site" className="mt-0 max-w-[800px]">
          <SiteSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
