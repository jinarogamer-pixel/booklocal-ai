// Google Tag Manager/Analytics integration stub
export function trackEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, data);
  }
}
