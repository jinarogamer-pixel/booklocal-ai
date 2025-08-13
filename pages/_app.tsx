import type { AppProps } from 'next/app';
import '../src/app/globals.css';
import { useEffect } from 'react';
import { captureError } from '../src/lib/errorMonitoring';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }

    // Add global error handlers to catch unhandled errors
    const handleError = (event: ErrorEvent) => {
      captureError(event.error || event.message, {
        source: 'global-error-handler',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      captureError(event.reason, {
        source: 'unhandled-promise-rejection',
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
