import { Helmet } from 'react-helmet';
import { DEFAULT_SEO_IMAGE } from '@/lib/constants';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  url?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  keywords?: string;
  siteName?: string;
}

export default function SEO({
  title,
  description,
  image = DEFAULT_SEO_IMAGE,
  type = 'website',
  url,
  articlePublishedTime,
  articleModifiedTime,
  keywords = 'lịch sử Việt Nam, thời kỳ lịch sử, Vua Hùng, nhân vật lịch sử, di tích lịch sử, văn hóa Việt Nam, dòng thời gian lịch sử',
  siteName = 'Lịch Sử Việt Nam',
}: SEOProps) {
  const siteUrl = 'https://lichsuviet.edu.vn';
  const fullUrl = url ? (url.startsWith('http') ? url : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`) : siteUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image.startsWith('/') ? '' : '/'}${image}`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="lichsuviet.edu.vn" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Vietnamese" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="vi_VN" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />
      
      {/* Article specific meta */}
      {type === 'article' && articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {type === 'article' && articleModifiedTime && (
        <meta property="article:modified_time" content={articleModifiedTime} />
      )}
      
      {/* Mobile App Meta */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="application-name" content={siteName} />
      <meta name="theme-color" content="#CF2A27" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
}
