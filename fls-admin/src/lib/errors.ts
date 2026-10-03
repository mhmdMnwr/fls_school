import { AxiosError } from 'axios';

export interface BackendErrorResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

export function getErrorMessage(error: unknown): string {
  if (!error) {
    return 'Une erreur est survenue. Veuillez réessayer.';
  }

  const axiosErr = error as AxiosError<BackendErrorResponse>;

  // Network error (no response)
  if (axiosErr.isAxiosError && !axiosErr.response) {
    return 'Impossible de contacter le serveur.';
  }

  const data = axiosErr.response?.data;
  if (data?.message) {
    if (Array.isArray(data.message)) {
      return data.message.join('\n');
    }
    return String(data.message);
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Une erreur est survenue. Veuillez réessayer.';
}
