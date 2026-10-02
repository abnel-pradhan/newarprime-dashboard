import type { Metadata } from 'next';
import './globals.css';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import AIChatWidget from '@/components/AIChatWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "NewarPrime | India's Elite Affiliate Platform",
  description: 'Master high-income digital skills and build a daily income. Join the fastest-growing Learn & Earn community today.',
  openGraph: {
    title: 'NewarPrime | Learn & Earn Daily',
    description: 'Start your digital entrepreneurship journey today. High-income skills, 70% direct commissions, and expert mentorship.',
    url: 'https://www.newarprime.in',
    siteName: 'NewarPrime',
    images: [
      {
        url: 'https://www.newarprime.in/og-preview.jpg',
        width: 1200,
        height: 630,
        alt: 'NewarPrime Platform Preview',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "NewarPrime | India's Elite Affiliate Platform",
    description: 'Master high-income digital skills and build a daily income.',
    images: ['/og-preview.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#171717',
              color: '#fff',
              border: '1px solid #333',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: 'black',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'black',
              },
            },
          }}
        />

        {children}
        <MobileBottomNav />
        <AIChatWidget />
      </body>
    </html>
  );
}