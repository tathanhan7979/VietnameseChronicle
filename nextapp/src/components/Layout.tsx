import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import BackToTop from './BackToTop';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  url?: string;
  noIndex?: boolean;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  keywords?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Lịch Sử Việt Nam',
  description = 'Khám phá lịch sử Việt Nam qua các thời kỳ với đầy đủ thông tin về sự kiện, nhân vật và di tích lịch sử.',
  image = 'https://lichsuviet.edu.vn/uploads/banner-image.png',
  type = 'website',
  url = 'https://lichsuviet.edu.vn',
  noIndex = false,
  articlePublishedTime,
  articleModifiedTime,
  keywords = 'lịch sử việt nam, việt nam, thời kỳ lịch sử, nhân vật lịch sử, di tích lịch sử',
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let currentActiveSection: string | null = null;
      
      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionId = section.getAttribute('id');
        
        if (sectionTop < 200 && sectionId) {
          currentActiveSection = sectionId;
        }
      });
      
      setActiveSection(currentActiveSection);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const handleSectionSelect = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        
        {noIndex && <meta name="robots" content="noindex, nofollow" />}
        
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content="Lịch Sử Việt Nam" />
        <meta property="og:locale" content="vi_VN" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        
        {type === 'article' && articlePublishedTime && (
          <meta property="article:published_time" content={articlePublishedTime} />
        )}
        
        {type === 'article' && articleModifiedTime && (
          <meta property="article:modified_time" content={articleModifiedTime} />
        )}
        
        <link rel="canonical" href={url} />
      </Head>
      
      <Header 
        activeSection={activeSection || undefined} 
        onSectionSelect={handleSectionSelect} 
      />
      
      <main>{children}</main>
      
      <Footer />
      
      <BackToTop />
    </>
  );
};

export default Layout;