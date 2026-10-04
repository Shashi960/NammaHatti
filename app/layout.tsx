import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LocationProvider } from '@/context/LocationContext';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export const metadata: Metadata = {
  title: 'LocalMesh · Online Shopping for Local Products & Route-Pooled Delivery',
  description:
    'Discover local shops, explore deals, and get orders delivered seamlessly through verified daily commuter route pooling.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LocalMesh',
  },
  icons: {
    icon: '/placeholder-product.svg',
    apple: '/placeholder-product.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2874f0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#2874f0" />
      </head>
      <body className="flex flex-col min-h-screen bg-[#f1f2f4]">
        <AuthProvider>
          <LocationProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <Footer />
              <MobileBottomNav />
            </CartProvider>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
