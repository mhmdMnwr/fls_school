import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CalendarCheck,
  Clock,
  Wallet,
} from 'lucide-react';
import { parentPortalApi } from '@/api/parentPortal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ParentLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    document.title = 'Espace Parent · FLS School';
  }, []);

  // Redirect if already logged in as parent
  if (localStorage.getItem('fls_parent_token')) {
    return <Navigate to="/parent/tableau-de-bord" replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Veuillez remplir tous les champs');
      return;
    }

    try {
      setErrorMessage(null);
      setIsSubmitting(true);
      const result = await parentPortalApi.login(username.trim(), password);
      localStorage.setItem('fls_parent_token', result.accessToken);
      localStorage.setItem(
        'fls_parent_student',
        JSON.stringify(result.student),
      );
      navigate('/parent/tableau-de-bord', { replace: true });
    } catch {
      setErrorMessage("Nom d'utilisateur ou mot de passe incorrect");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-page-bg">
      {/* Left panel - branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-[#312E81] to-[#4338CA] relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#5B4BF5]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#5B4BF5]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/15">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">FLS School</div>
            <div className="text-xs text-white/70">Espace Parent</div>
          </div>
        </div>

        <div className="relative z-10 my-auto space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/10">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Suivi Scolaire en Direct
            </h1>
            <p className="text-sm text-white/75 mt-2 max-w-md leading-relaxed">
              Consultez l'emploi du temps des cours, suivez l'assiduité et les présences,
              et visualisez l'historique complet des paiements de votre enfant.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-white/85">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <span>Emploi du temps hebdomadaire par matière et groupe</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/85">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-4 h-4 text-white" />
              </div>
              <span>Historique détaillé des présences, absences et séances d'essai</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/85">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span>Relevé clair et transparent des versements effectués</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/60">
          Identifiants fournis par l'administration de l'établissement.
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[420px] bg-white rounded-2xl border border-line/60 p-8 shadow-sm">
          {/* Mobile brand header */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#312E81] to-[#4338CA] flex items-center justify-center text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-base text-ink">FLS School</div>
              <div className="text-xs text-muted">Espace Parent</div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              Connexion Parent
            </h2>
            <p className="text-xs text-muted mt-1">
              Entrez le nom d'utilisateur et mot de passe de votre enfant
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-semibold text-ink">
                Nom d'utilisateur <span className="text-danger">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <Input
                  id="username"
                  type="text"
                  autoFocus
                  placeholder="prenom.nom"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9 h-10 rounded-xl border-line text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-ink">
                Mot de passe <span className="text-danger">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-10 rounded-xl border-line text-sm"
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
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 text-danger text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white font-medium text-sm transition-all shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Accéder à l'espace parent
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-line-soft text-center">
            <Link
              to="/login"
              className="text-xs text-muted hover:text-brand-600 transition-colors"
            >
              Vous êtes administrateur ? Connexion gestionnaire &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
