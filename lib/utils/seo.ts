// SEO metadata for different pages
export const seoMetadata = {
  home: {
    title: 'Mua Tài Khoản Ảo - Tài Khoản Shopee, TikTok, MMO, Hotmail | Dịch Vụ Uy Tín',
    description: 'Dịch vụ mua bán tài khoản ảo chất lượng cao: Shopee, TikTok, MMO, Hotmail, Gmail. Giá rẻ, uy tín, an toàn 100%. Thanh toán nhanh, hỗ trợ 24/7.',
    keywords: 'mua tài khoản ảo, tài khoản shopee, tài khoản tiktok, hotmail, mua tài khoản mmo, tài khoản game, mua tài khoản game, bán tài khoản ảo',
    og: {
      title: 'Mua Tài Khoản Ảo - Giá Rẻ & An Toàn | Dịch Vụ Tài Khoản Số 1 Việt Nam',
      description: 'Cung cấp tài khoản ảo chất lượng, giá rẻ nhất thị trường. Shopee, TikTok, Hotmail - Thanh toán nhanh, bảo hành toàn bộ tài khoản.',
      image: '/og-home.jpg',
    },
  },
  buy: {
    title: 'Mua Tài Khoản Ảo - Shopee | TikTok | MMO | Hotmail - Giá Rẻ Nhất',
    description: 'Cửa hàng mua bán tài khoản ảo uy tín hàng đầu. Shopee, TikTok, MMO, Hotmail giá cực rẻ. Thanh toán secure, giao ngay 24/7.',
    keywords: 'mua tài khoản shopee, mua tài khoản tiktok, mua tài khoản mmo, mua hotmail, tài khoản ảo, tài khoản game',
  },
  deposit: {
    title: 'Nạp Tiền - Mua Tài Khoản Ảo | Thanh Toán Nhanh & An Toàn',
    description: 'Nạp tiền vào tài khoản để mua tài khoản ảo Shopee, TikTok, Hotmail. Hỗ trợ nhiều phương thức thanh toán, xử lý nhanh 24/7.',
    keywords: 'nạp tiền, thanh toán, mua tài khoản, tiền điện tử',
  },
  contact: {
    title: 'Liên Hệ - Dịch Vụ Mua Tài Khoản Ảo | Hỗ Trợ Khách Hàng 24/7',
    description: 'Liên hệ với chúng tôi để được hỗ trợ tốt nhất. Trả lời nhanh, giải quyết vấn đề hiệu quả, hỗ trợ toàn bộ dịch vụ mua tài khoản ảo.',
    keywords: 'liên hệ, hỗ trợ khách hàng, đặt câu hỏi, tài khoản ảo',
  },
  faq: {
    title: 'Câu Hỏi Thường Gặp - Mua Tài Khoản Ảo | Giải Đáp Chi Tiết',
    description: 'Giải đáp các câu hỏi thường gặp về dịch vụ mua tài khoản ảo Shopee, TikTok, Hotmail. Hướng dẫn sử dụng, bảo mật, thanh toán.',
    keywords: 'câu hỏi thường gặp, hỏi đáp, hướng dẫn, tài khoản ảo',
  },
};

// Generate structured data for rich snippets
export const generateOrganizationSchema = (baseUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Dịch Vụ Tài Khoản Ảo',
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  description: 'Cung cấp tài khoản ảo chất lượng cao: Shopee, TikTok, Hotmail. Giá rẻ, uy tín, an toàn 100%.',
  sameAs: [
    'https://www.facebook.com/yourpage',
    'https://www.instagram.com/yourpage',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    telephone: '+84-xxx-xxx-xxx',
    availableLanguage: 'vi',
  },
});

// Generate product schema for each product
export const generateProductSchema = (product: any, baseUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.image || `${baseUrl}/default-product.jpg`,
  price: product.price,
  priceCurrency: 'VND',
  availability: 'https://schema.org/InStock',
  url: `${baseUrl}/buy?productId=${product._id}`,
  aggregateRating: product.rating ? {
    '@type': 'AggregateRating',
    ratingValue: product.rating,
    ratingCount: product.reviewCount || 0,
  } : undefined,
});

// Generate local business schema
export const generateLocalBusinessSchema = (baseUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Dịch Vụ Tài Khoản Ảo',
  image: `${baseUrl}/logo.png`,
  description: 'Cung cấp tài khoản ảo chất lượng cao cho Shopee, TikTok, Hotmail',
  priceRange: '$$',
  url: baseUrl,
  telephone: '+84-xxx-xxx-xxx',
  areaServed: 'VN',
  serviceType: 'Online Service',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
});

// Breadcrumb schema
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});
