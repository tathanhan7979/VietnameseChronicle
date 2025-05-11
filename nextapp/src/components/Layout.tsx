import { useState, ReactNode } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import SearchOverlay from './SearchOverlay';
import BackToTop from './BackToTop';
import { DEFAULT_SEO_IMAGE, SITE_NAME, SITE_DESCRIPTION } from '../lib/constants';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
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
        <title>{SITE_NAME}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://lichsuviet.edu.vn/" />
        <meta property="og:title" content="Lịch Sử Việt Nam" />
        <meta property="og:description" content="Khám phá hành trình lịch sử Việt Nam từ thời kỳ Tiền sử đến hiện đại" />
        <meta property="og:image" content={DEFAULT_SEO_IMAGE} />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://lichsuviet.edu.vn/" />
        <meta property="twitter:title" content="Lịch Sử Việt Nam" />
        <meta property="twitter:description" content="Khám phá hành trình lịch sử Việt Nam từ thời kỳ Tiền sử đến hiện đại" />
        <meta property="twitter:image" content={DEFAULT_SEO_IMAGE} />
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