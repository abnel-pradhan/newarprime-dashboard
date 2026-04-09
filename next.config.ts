import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            // We keep the CSP exactly as it was, because we know it doesn't break Razorpay
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
            // THIS IS SAFE: It just tells the browser to be more private with URLs
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin' 
          },
          {
            // THIS IS SAFE: It just disables camera/mic access for privacy
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            // THIS IS SAFE: It forces the browser to use HTTPS (standard for all sites)
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ],
      },
    ]
  },
};

export default nextConfig;