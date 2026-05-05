// Schema.org JSON-LD configurations for SEO

export function generateProductSchema(product: {
  _id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  platform?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dichvutaikhoanao.com';
  
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.image || `${baseUrl}/product-placeholder.png`,
    url: `${baseUrl}/buy#product-${product._id}`,
    brand: {
      '@type': 'Brand',
      name: 'Dịch Vụ Tài Khoản Ảo',
    },
    offers: {
      '@type': 'Offer',
      price: product.price.toString(),
      priceCurrency: 'VND',
      url: `${baseUrl}/buy#product-${product._id}`,
      availability: 'https://schema.org/InStock',
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  content?: string;
  image?: string;
  publishedDate: string;
  modifiedDate?: string;
  author?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dichvutaikhoanao.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    image: article.image || `${baseUrl}/default-image.png`,
    datePublished: article.publishedDate,
    dateModified: article.modifiedDate || article.publishedDate,
    author: {
      '@type': 'Organization',
      name: article.author || 'Dịch Vụ Tài Khoản Ảo',
    },
  };
}

export function generateLocalBusinessSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dichvutaikhoanao.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Dịch Vụ Tài Khoản Ảo',
    url: baseUrl,
    description: 'Dịch vụ bán tài khoản ảo uy tín cho TikTok, Shopee, Lazada, Gmail, Hotmail',
    image: `${baseUrl}/logo.png`,
    contact: {
      '@type': 'ContactPoint',
      telephone: '+84-xxx-xxx-xxx', // Update this
      contactType: 'Customer Service',
      availableLanguage: 'Vietnamese',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'VN',
      // addressLocality: 'City',
      // addressRegion: 'State',
      // postalCode: 'PostalCode',
      // streetAddress: 'Street',
    },
  };
}

export function generateReviewSchema(reviews: Array<{
  rating: number;
  author: string;
  comment: string;
  date: string;
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    ratingValue:
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '5',
    reviewCount: reviews.length,
    review: reviews.map((r) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating.toString(),
      },
      reviewBody: r.comment,
      datePublished: r.date,
    })),
  };
}
