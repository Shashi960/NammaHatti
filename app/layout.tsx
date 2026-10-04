import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LocationProvider } from '@/context/LocationContext';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'LocalMesh · Geographically Dynamic Local-Commerce & Route-Pooled Delivery',
  description:
    'Discover local products from nearby merchants and get them delivered through route-pooled travel.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <LocationProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
