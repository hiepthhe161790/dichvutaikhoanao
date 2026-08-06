import type { Metadata } from 'next';
import { seoMetadata } from '@/lib/utils/seo';

export const metadata: Metadata = {
  title: seoMetadata.contact.title,
  description: seoMetadata.contact.description,
  keywords: seoMetadata.contact.keywords.split(',').map(k => k.trim()),
  openGraph: {
    title: seoMetadata.contact.title,
    description: seoMetadata.contact.description,
    images: ['/logo.png'],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
