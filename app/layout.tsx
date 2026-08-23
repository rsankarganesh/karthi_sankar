import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const socialImage = `${basePath}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Sankar & Karthiha — Housewarming Invitation',
  description: 'Join us as we open the doors to our new home in Narangba on 7 September 2026.',
  openGraph: {
    title: 'Sankar & Karthiha — Our Housewarming',
    description: 'Join us in Narangba on 7 September 2026 as we open the doors to our new home.',
    type: 'website',
    images: [{ url: socialImage, width: 1200, height: 630, alt: 'Sankar and Karthiha housewarming invitation' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sankar & Karthiha — Our Housewarming',
    description: 'Join us in Narangba on 7 September 2026 as we open the doors to our new home.',
    images: [socialImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
