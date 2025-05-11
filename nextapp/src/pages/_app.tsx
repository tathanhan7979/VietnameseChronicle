import React from 'react';
import { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../styles/globals.css';

// Font configuration
const inter = Inter({ subsets: ['latin'] });

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={inter.className}>
        <Component {...pageProps} />
      </div>
    </QueryClientProvider>
  );
}