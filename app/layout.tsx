import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast'; // <--- IMPORT THIS

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'NewarPrime',
  description: 'Learn & Earn',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Add this Toaster Component at the top */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#171717', // Dark Grey
              color: '#fff',
              border: '1px solid #333',
            },
            success: {
              iconTheme: {
                primary: '#10b981', // Green
                secondary: 'black',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444', // Red
                secondary: 'black',
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}