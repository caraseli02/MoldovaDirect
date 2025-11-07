import * as Sentry from '@sentry/vue';

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  const config = useRuntimeConfig();

  // Only initialize Sentry in production
  if (process.env.NODE_ENV === 'production' && config.public.sentryDsn) {
    Sentry.init({
      app: nuxtApp.vueApp,
      dsn: config.public.sentryDsn,
      integrations: [
        Sentry.browserTracingIntegration({ router }),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% of transactions
      tracePropagationTargets: ['localhost', config.public.siteUrl],

      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

      // Release tracking
      release: process.env.NUXT_PUBLIC_APP_VERSION,
      environment: process.env.NODE_ENV,

      // Error filtering
      beforeSend(event, hint) {
        // Filter out non-critical errors
        if (event.exception) {
          const error = hint.originalException;
          if (error instanceof Error) {
            // Ignore network errors from analytics
            if (error.message.includes('Failed to fetch') && error.message.includes('analytics')) {
              return null;
            }
          }
        }
        return event;
      },
    });
  }

  // Core Web Vitals monitoring
  if (typeof window !== 'undefined') {
    // Monitor Cumulative Layout Shift (CLS)
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if ('hadRecentInput' in entry && !(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          clsEntries.push(entry);
        }
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });

    // Monitor Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;

      if (lastEntry) {
        console.log('[CWV] LCP:', lastEntry.renderTime || lastEntry.loadTime, 'ms');

        // Send to analytics
        if (config.public.sentryDsn) {
          Sentry.metrics.distribution('lcp', lastEntry.renderTime || lastEntry.loadTime, {
            unit: 'millisecond',
          });
        }
      }
    });

    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // Monitor First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidValue = (entry as any).processingStart - entry.startTime;
        console.log('[CWV] FID:', fidValue, 'ms');

        if (config.public.sentryDsn) {
          Sentry.metrics.distribution('fid', fidValue, {
            unit: 'millisecond',
          });
        }
      }
    });

    fidObserver.observe({ type: 'first-input', buffered: true });

    // Report CLS on page unload
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        console.log('[CWV] CLS:', clsValue);

        if (config.public.sentryDsn) {
          Sentry.metrics.distribution('cls', clsValue, {
            unit: 'none',
          });
        }
      }
    });

    // Monitor Time to First Byte (TTFB)
    const navigationObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const navEntry = entry as PerformanceNavigationTiming;
        const ttfb = navEntry.responseStart - navEntry.requestStart;

        console.log('[CWV] TTFB:', ttfb, 'ms');

        if (config.public.sentryDsn) {
          Sentry.metrics.distribution('ttfb', ttfb, {
            unit: 'millisecond',
          });
        }
      }
    });

    navigationObserver.observe({ type: 'navigation', buffered: true });

    // Monitor Interaction to Next Paint (INP)
    let maxInp = 0;
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (entry.interactionId) {
          const inp = entry.processingStart - entry.startTime;
          maxInp = Math.max(maxInp, inp);
        }
      }
    });

    inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 16 });

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && maxInp > 0) {
        console.log('[CWV] INP:', maxInp, 'ms');

        if (config.public.sentryDsn) {
          Sentry.metrics.distribution('inp', maxInp, {
            unit: 'millisecond',
          });
        }
      }
    });
  }

  return {
    provide: {
      sentry: Sentry,
    },
  };
});
