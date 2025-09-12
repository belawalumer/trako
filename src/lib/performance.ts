// Performance monitoring utilities
export function measureNavigationTime() {
  if (typeof window === 'undefined') return;
  
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Navigation took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
  };
}

// Web Vitals monitoring
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
  
  // In production, you might want to send this to an analytics service
  // analytics.track('web-vital', metric);
}
