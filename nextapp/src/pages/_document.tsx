import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="vi">
      <Head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        
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
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}