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
                   "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; " +
                   "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                   "img-src 'self' blob: data: https://img.youtube.com https://images.unsplash.com; " +
                   "font-src 'self' https://fonts.gstatic.com; " +
                   "frame-src 'self' https://api.razorpay.com https://www.youtube.com https://td.doubleclick.net; " +
                   "connect-src 'self' https://*.supabase.co https://lumberjack.razorpay.com;"
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
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ]
  },
};

export default nextConfig;