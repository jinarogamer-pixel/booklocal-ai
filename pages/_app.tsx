"use client";

import type { AppProps } from 'next/app';
import '../src/app/globals.css';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => { /* noop */ });
    }
  }, []);
  return <Component {...pageProps} />;
}

export default MyApp;
