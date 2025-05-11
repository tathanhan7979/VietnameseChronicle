import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="vi">
      <Head>
        {/* Google Fonts */}
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
        
        {/* Facebook SDK */}
        <script
          async
          defer
          crossOrigin="anonymous"
          src="https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v17.0&appId=198066915623&autoLogAppEvents=1"
          nonce="ZmHM9HL1"
        />
        
        {/* Meta tags for SEO */}
        <meta name="author" content="LichSuViet.edu.vn" />
        <meta name="robots" content="index, follow" />
        <meta name="revisit-after" content="7 days" />
        <meta httpEquiv="content-language" content="vi" />
        <meta name="geo.region" content="VN" />
        <meta name="geo.placename" content="Vietnam" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Preconnect to improve performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//connect.facebook.net" />
        
        {/* Open Graph Default Image (fallback) */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Head>
      <body>
        <Main />
        <NextScript />
        
        {/* Div for Facebook comments root */}
        <div id="fb-root"></div>
      </body>
    </Html>
  );
}