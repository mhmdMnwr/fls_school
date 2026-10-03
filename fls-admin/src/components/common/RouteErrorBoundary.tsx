import React, { useState } from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotFoundPage from '@/features/NotFoundPage';

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  // If this is a 404 route error response, render the official 404 page
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : isRouteErrorResponse(error)
      ? `${error.status} ${error.statusText}`
      : typeof error === 'string'
      ? error
      : 'Une erreur inattendue est survenue.';

  const errorStack = error instanceof Error ? error.stack : undefined;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-line/60 p-8 shadow-sm space-y-5">
        {/* Warning Icon Tile */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center shadow-xs">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-ink">Une erreur inattendue est survenue</h1>
          <p className="text-sm text-muted mt-1.5">
            Une erreur technique s'est produite lors de l'affichage de cette page. Veuillez recharger ou
            revenir au tableau de bord.
          </p>
        </div>

        {/* Technical Details Accordion */}
        <div className="text-left bg-page-bg rounded-xl border border-line p-3 text-xs">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-muted hover:text-ink font-semibold transition-colors"
          >
            <span>Détails techniques</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showDetails && (
            <div className="mt-2.5 pt-2.5 border-t border-line font-mono text-[11px] text-danger break-words max-h-48 overflow-y-auto whitespace-pre-wrap">
              <p className="font-bold">{errorMessage}</p>
              {errorStack && <p className="text-muted mt-1">{errorStack}</p>}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto h-10 px-5 gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recharger la page
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto h-10 px-5 gap-2 shadow-xs"
          >
            <Home className="w-4 h-4" />
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorBoundary;
