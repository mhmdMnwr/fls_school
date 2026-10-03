import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-2xl border border-line/60 p-8 shadow-sm space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-ink">Une erreur est survenue</h2>
              <p className="text-sm text-muted mt-1.5">
                Une exception inattendue s'est produite dans l'application.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="text-left bg-page-bg rounded-xl border border-line p-3 font-mono text-[11px] text-danger max-h-32 overflow-y-auto whitespace-pre-wrap">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={this.handleReset}
                className="w-full sm:w-auto h-10 px-5 gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recharger
              </Button>
              <Button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto h-10 px-5 gap-2 shadow-xs"
              >
                <Home className="w-4 h-4" />
                Accueil
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
