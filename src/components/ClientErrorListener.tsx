"use client";

import { useEffect } from 'react';
import { logError } from '../utils/errorMonitoring';

export default function ClientErrorListener() {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      logError(event.error ?? event.message ?? 'Unknown error from window.error');
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      const reason = (event.reason as any) ?? 'Unhandled promise rejection';
      const message = typeof reason === 'string' ? reason : reason?.message ?? JSON.stringify(reason);
      logError(message);
    }

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
