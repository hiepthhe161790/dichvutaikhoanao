import type { Metadata } from 'next';
import { seoMetadata } from '@/lib/utils/seo';

export const metadata: Metadata = {
  title: seoMetadata.faq.title,
  description: seoMetadata.faq.description,
  keywords: seoMetadata.faq.keywords.split(',').map(k => k.trim()),
  openGraph: {
    title: seoMetadata.faq.title,
    description: seoMetadata.faq.description,
    images: ['/logo.png'],
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
