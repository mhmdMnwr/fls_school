import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { APP_NAME, APP_SUBTITLE, TAGLINE } from '@/config/brand';
import { useAuth } from '@/hooks/useAuth';
import { hasToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Ce champ est obligatoire')
    .email('Adresse email invalide'),
  password: z.string().min(1, 'Ce champ est obligatoire'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    document.title = 'Connexion · FLS School';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already logged in
  if (hasToken()) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setErrorMessage(null);
      setIsSubmitting(true);
      await login(values);
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch {
      setErrorMessage('Email ou mot de passe incorrect');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-page-bg">
      {/* Left panel - branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-sidebar-from to-sidebar-to relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Soft decorative blurred circles */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#5B4BF5]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#5B4BF5]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">{APP_NAME}</div>
            <div className="text-xs text-white/70">{APP_SUBTITLE}</div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto">
          <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 shadow-xl border border-white/10">
            <GraduationCap className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white">
            {APP_NAME}
          </h1>
          <p className="text-base text-white/70 font-medium">
            {APP_SUBTITLE}
          </p>
        </div>

        <div className="relative z-10 text-center">
          <p className="italic text-base text-white/80 font-normal">
            « {TAGLINE} »
          </p>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[420px] bg-white rounded-2xl border border-line/60 p-8 shadow-sm">
          {/* Mobile brand header */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-base text-ink">{APP_NAME}</div>
              <div className="text-xs text-muted">{APP_SUBTITLE}</div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-ink">Connexion</h2>
            <p className="text-sm text-muted mt-1">
              Accédez à l'espace administrateur
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-ink">
                Adresse email <span className="text-danger">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  autoFocus
                  placeholder="admin@fls.school"
                  className="pl-9 h-10 rounded-xl border-line text-sm focus:border-brand-600 focus:ring-brand-500/30"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-danger font-medium mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-ink">
                Mot de passe <span className="text-danger">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-9 pr-10 h-10 rounded-xl border-line text-sm focus:border-brand-600 focus:ring-brand-500/30"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink focus:outline-none"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger font-medium mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 text-danger text-xs font-medium animate-in fade-in-50">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-all shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Se connecter
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-line-soft text-center">
            <a
              href="/parent"
              className="text-xs text-muted hover:text-brand-600 transition-colors font-medium"
            >
              Vous êtes parent d'un élève ? Accès Espace Parent &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
