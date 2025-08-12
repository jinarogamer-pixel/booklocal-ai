// Google Tag Manager/Analytics integration stub
export function trackEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof (window as unknown as { gtag?: (type: string, event: string, data?: Record<string, unknown>) => void }).gtag === 'function') {
    (window as unknown as { gtag: (type: string, event: string, data?: Record<string, unknown>) => void }).gtag('event', event, data);
  }
}
