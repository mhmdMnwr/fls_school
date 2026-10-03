import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Page introuvable · FLS School';
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="max-w-md space-y-4">
        <span className="text-[64px] font-extrabold leading-none text-brand-600 block tracking-tight">
          404
        </span>
        <h1 className="text-2xl font-bold text-ink">Page introuvable</h1>
        <p className="text-sm text-muted">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="pt-4">
          <Button
            onClick={() => navigate('/')}
            className="h-11 px-6 rounded-xl font-semibold shadow-xs"
          >
            <Home className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
}
