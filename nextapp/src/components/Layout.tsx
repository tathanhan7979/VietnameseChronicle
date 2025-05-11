import React, { ReactNode, useEffect } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import NProgress from 'nprogress';
import Router from 'next/router';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  noIndex?: boolean;
  customHeader?: ReactNode;
  customFooter?: ReactNode;
  siteName?: string;
}

// Setup NProgress
NProgress.configure({ showSpinner: false });

// Configure progress bar
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Lịch Sử Việt Nam',
  description = 'Khám phá lịch sử Việt Nam qua các thời kỳ, sự kiện quan trọng, nhân vật lịch sử và di tích văn hóa.',
  keywords = 'lịch sử việt nam, việt nam, thời kỳ lịch sử, nhân vật lịch sử, di tích lịch sử, sự kiện lịch sử, văn hóa việt nam',
  image = 'https://lichsuviet.edu.vn/uploads/banner-image.png',
  url,
  type = 'website',
  articlePublishedTime,
  articleModifiedTime,
  noIndex = false,
  customHeader,
  customFooter,
  siteName = 'Lịch Sử Việt Nam',
}) => {
  const router = useRouter();
  const canonicalUrl = url || `https://lichsuviet.edu.vn${router.asPath}`;

  // Add nprogress CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      #nprogress {
        pointer-events: none;
      }
      #nprogress .bar {
        background: #e11d48;
        position: fixed;
        z-index: 1031;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
      }
      #nprogress .peg {
        display: block;
        position: absolute;
        right: 0px;
        width: 100px;
        height: 100%;
        box-shadow: 0 0 10px #e11d48, 0 0 5px #e11d48;
        opacity: 1.0;
        transform: rotate(3deg) translate(0px, -4px);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        {noIndex && <meta name="robots" content="noindex" />}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content={type} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:site_name" content={siteName} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={image} />
        
        {/* Article specific meta tags */}
        {type === 'article' && articlePublishedTime && (
          <meta property="article:published_time" content={articlePublishedTime} />
        )}
        {type === 'article' && articleModifiedTime && (
          <meta property="article:modified_time" content={articleModifiedTime} />
        )}
        
        {/* DNS Prefetch and Preconnect for optimization */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//connect.facebook.net" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Add Material Icons for the timeline */}
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

        {/* Custom fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Header */}
      {customHeader || <Header />}

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      {customFooter || <Footer />}
    </>
  );
};

export default Layout;