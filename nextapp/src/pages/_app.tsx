import React from 'react';
import { AppProps } from 'next/app';
import { useEffect } from 'react';
import Router from 'next/router';
import NProgress from 'nprogress';
import '../styles/globals.css';

// Type declaration for Google Analytics
declare global {
  interface Window {
    gtag?: (command: string, id: string, config: any) => void;
  }
}

// NProgress configuration
NProgress.configure({ 
  showSpinner: false,
  minimum: 0.1,
  easing: 'ease',
  speed: 300
});

// Configure progress bar
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function MyApp({ Component, pageProps }: AppProps) {
  // Add global event listeners or other app-wide logic
  useEffect(() => {
    // You could add analytics or other page view logic here
    const handleRouteChange = (url: string) => {
      // Example: track page view with Google Analytics
      window.gtag?.('config', 'G-XXXXXXXXXX', {
        page_path: url,
      });
    };

    Router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);

  return <Component {...pageProps} />;
}