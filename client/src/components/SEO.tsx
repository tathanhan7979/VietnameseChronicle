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
}

export default function SEO({
  title,
  description,
  image = DEFAULT_SEO_IMAGE,
  type = 'website',
  url,
  articlePublishedTime,
  articleModifiedTime,
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
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:locale" content="vi_VN" />
      
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
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
}
