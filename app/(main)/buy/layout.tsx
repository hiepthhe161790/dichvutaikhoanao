import type { Metadata } from 'next';
import { seoMetadata } from '@/lib/utils/seo';

export const metadata: Metadata = {
  title: seoMetadata.buy.title,
  description: seoMetadata.buy.description,
  keywords: seoMetadata.buy.keywords.split(',').map(k => k.trim()),
  openGraph: {
    title: seoMetadata.buy.title,
    description: seoMetadata.buy.description,
    images: ['/logo.png'],
  },
};

export default function BuyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
