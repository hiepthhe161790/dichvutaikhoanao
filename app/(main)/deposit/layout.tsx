import type { Metadata } from 'next';
import { seoMetadata } from '@/lib/utils/seo';

export const metadata: Metadata = {
  title: seoMetadata.deposit.title,
  description: seoMetadata.deposit.description,
  keywords: seoMetadata.deposit.keywords.split(',').map(k => k.trim()),
  openGraph: {
    title: seoMetadata.deposit.title,
    description: seoMetadata.deposit.description,
    images: ['/logo.png'],
  },
};

export default function DepositLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
