import { useState, ReactNode } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import SearchOverlay from './SearchOverlay';
import BackToTop from './BackToTop';
import { DEFAULT_SEO_IMAGE, SITE_NAME, SITE_DESCRIPTION } from '../lib/constants';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  noIndex?: boolean;
}

export default function Layout({ 
  children, 
  title = SITE_NAME, 
  description = SITE_DESCRIPTION, 
  url = 'https://lichsuviet.edu.vn', 
  image = DEFAULT_SEO_IMAGE,
  noIndex = false
}: LayoutProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Robots */}
        {noIndex && <meta name="robots" content="noindex,nofollow" />}
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={url} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={image} />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Header onOpenSearch={handleOpenSearch} />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <BackToTop />
        <SearchOverlay isOpen={isSearchOpen} onClose={handleCloseSearch} />
      </div>
    </>
  );
}