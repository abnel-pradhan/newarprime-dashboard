import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; " +
                   // ADDED razorpay domains below to script-src
                   "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.razorpay.com https://api.razorpay.com; " +
                   "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                   "img-src 'self' blob: data: https://*.supabase.co https://img.youtube.com https://images.unsplash.com https://cdn.razorpay.com; " + 
                   "font-src 'self' https://fonts.gstatic.com; " +
                   "frame-src 'self' https://api.razorpay.com https://www.youtube.com https://td.doubleclick.net; " +
                   "connect-src 'self' https://*.supabase.co https://lumberjack.razorpay.com https://api.razorpay.com; " +
                   "object-src 'none'; " +
                   "base-uri 'self';"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ],
      },
    ]
  },
};

export default nextConfig;