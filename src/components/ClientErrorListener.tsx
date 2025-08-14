"use client";

import { useEffect } from 'react';
import { logError } from '../utils/errorMonitoring';

export default function ClientErrorListener() {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      logError(event.error ?? event.message ?? 'Unknown error from window.error');
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      const reason: unknown = event.reason ?? 'Unhandled promise rejection';
      let message: string;

      if (typeof reason === 'string') {
        message = reason;
      } else if (reason && typeof (reason as { message?: unknown }).message === 'string') {
        // narrow to access message safely without using `any`
        message = (reason as { message: string }).message;
      } else {
        try {
          message = JSON.stringify(reason);
        } catch (_e) {
          message = 'Unhandled promise rejection (unserializable)';
        }
      }

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
