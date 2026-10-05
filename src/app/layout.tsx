import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext';

export const metadata: Metadata = {
  title: 'Vindu Ruchulu | Authentic Andhra & Telangana Next-Day Cloud Kitchen',
  description:
    'Experience slow-cooked Hyderabadi biryanis, spicy Andhra chicken curry, gongura mutton, gutti vankaya, and hot tiffins made fresh tomorrow in traditional brass handis.',
  keywords: [
    'Cloud Kitchen Hyderabad',
    'Andhra Food Online',
    'Telangana Curries',
    'Hyderabadi Dum Biryani',
    'Next-Day Food Ordering',
    'Home-style Telugu Food',
    'Gongura Mutton',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-cream-100 text-tamarind-950 font-sans antialiased selection:bg-turmeric-400 selection:text-tamarind-950">
        <CustomerAuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
