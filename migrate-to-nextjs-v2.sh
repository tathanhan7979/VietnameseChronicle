#!/bin/bash

# Tạo các thư mục cần thiết
mkdir -p nextapp/src/{pages,components,lib,utils,styles,hooks}
mkdir -p nextapp/src/pages/api/{periods,events,historical-figures,historical-sites,event-types,feedback,settings,auth}
mkdir -p nextapp/public/uploads

# Sao chép schema
echo "Sao chép schema..."
cp -r shared nextapp/

# Sao chép database connection
echo "Sao chép cấu hình database..."
cp -r db nextapp/

# Tạo file .env.local từ .env hiện tại
echo "Tạo file .env.local..."
cp .env nextapp/.env.local 2>/dev/null || echo "DATABASE_URL=${DATABASE_URL}" > nextapp/.env.local
echo "NEXTAUTH_SECRET=lichsuviet_migration_secret" >> nextapp/.env.local

# Tạo package.json cho Next.js
cat > nextapp/package.json << 'EOF'
{
  "name": "lichsuviet-nextjs",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.1",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-icons": "^1.3.0",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@tanstack/react-query": "^5.14.2",
    "bcrypt": "^5.1.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "drizzle-orm": "^0.28.6",
    "drizzle-zod": "^0.5.1",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.294.0",
    "next": "14.0.4",
    "pg": "^8.11.3",
    "postgres": "^3.4.3",
    "react": "^18",
    "react-dom": "^18",
    "react-helmet": "^6.1.0",
    "react-hook-form": "^7.48.2",
    "react-quill": "^2.0.0",
    "tailwind-merge": "^1.14.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.2"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/react-helmet": "^6.1.6",
    "autoprefixer": "^10.0.1",
    "drizzle-kit": "^0.20.6",
    "eslint": "^8",
    "eslint-config-next": "14.0.4",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
EOF

# Tạo tsconfig.json
cat > nextapp/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@db": ["./db/index.ts"],
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Tạo next.config.mjs
cat > nextapp/next.config.mjs << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'lichsuviet.edu.vn'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
EOF

# Tạo file tailwind.config.ts
cat > nextapp/tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom colors
        'vietnam-red': '#d80000',
        'vietnam-yellow': '#ffff00',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
EOF

# Tạo file postcss.config.js
cat > nextapp/postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Tạo file drizzle.config.ts
cat > nextapp/drizzle.config.ts << 'EOF'
import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found in .env.local file");
}

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
} satisfies Config;
EOF

# Tạo global.css
cat > nextapp/src/styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 0 84% 42%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5% 64.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 84% 42%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color: #f5f5f5;
}

::-webkit-scrollbar-thumb {
  background-color: #d80000;
  border-radius: 10px;
}

::-webkit-scrollbar-track {
  background-color: #f5f5f5;
  border-radius: 10px;
}
EOF

# Tạo file _app.tsx
cat > nextapp/src/pages/_app.tsx << 'EOF'
import '@/styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import { Helmet } from 'react-helmet';

// Tạo QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#d80000" />
        <link rel="icon" href="/favicon.ico" />
        <title>Lịch Sử Việt - Hành trình qua thời gian</title>
      </Helmet>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
EOF

# Tạo trang index.tsx
cat > nextapp/src/pages/index.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Lịch Sử Việt - Hành trình qua thời gian</title>
        <meta name="description" content="Khám phá lịch sử Việt Nam qua các thời kỳ, sự kiện, nhân vật và di tích lịch sử" />
        <meta property="og:title" content="Lịch Sử Việt - Hành trình qua thời gian" />
        <meta property="og:description" content="Khám phá lịch sử Việt Nam qua các thời kỳ, sự kiện, nhân vật và di tích lịch sử" />
        <meta property="og:image" content="https://lichsuviet.edu.vn/uploads/banner-image.png" />
      </Head>
      
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-vietnam-red mb-4">
            Lịch Sử Việt - Next.js 
          </h1>
          <p className="text-lg mb-8">
            Phiên bản Next.js đang được phát triển...
          </p>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
              <h2 className="text-xl font-semibold mb-2">Hiện trạng</h2>
              <ul className="text-left list-disc list-inside space-y-2">
                <li>Đang chuyển đổi các API endpoints</li>
                <li>Đang chuyển đổi giao diện người dùng</li>
                <li>Đang cấu hình cơ sở dữ liệu</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
EOF

# Tạo script để chỉnh sửa các import paths của API
cat > update-api-imports.sh << 'EOF'
#!/bin/bash

# Cập nhật các import trong các file API
for file in nextapp/src/pages/api/**/*.ts; do
  # Thay thế import từ '../../../db' thành '@db'
  sed -i 's/from "\.\.\/\.\.\/\.\.\/db"/from "@db"/g' "$file"
  sed -i "s/from '\.\.\/\.\.\/\.\.\/db'/from '@db'/g" "$file"
  
  # Thay thế import từ '../../../shared/schema' thành '@shared/schema'
  sed -i 's/from "\.\.\/\.\.\/\.\.\/shared\/schema"/from "@shared\/schema"/g' "$file"
  sed -i "s/from '\.\.\/\.\.\/\.\.\/shared\/schema'/from '@shared\/schema'/g" "$file"
done

echo "Đã cập nhật xong các import paths!"
EOF

chmod +x update-api-imports.sh

echo "Quá trình cài đặt hoàn tất. Cài đặt các dependencies cho Next.js..."
cd nextapp
npm install
cd ..

echo "Migration thành công! Để khởi động Next.js, chạy lệnh: cd nextapp && npm run dev"