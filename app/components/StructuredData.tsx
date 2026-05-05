export function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dichvutaikhoanao.com';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dịch Vụ Tài Khoản Ảo',
    alternateName: ['Mua Tài Khoản Ảo', 'Tài Khoản Shopee', 'Tài Khoản TikTok', 'Hotmail Account'],
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Dịch vụ mua bán tài khoản ảo uy tín: Shopee, TikTok, Hotmail, Gmail. Giá rẻ nhất thị trường, bảo hành 100%, giao ngay 24/7.',
    sameAs: [
      'https://www.facebook.com/yourpage',
      'https://www.instagram.com/yourpage',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      telephone: '+84-xxx-xxx-xxx',
      availableLanguage: ['vi', 'en'],
      hoursAvailable: 'Mo-Su 00:00-23:59',
    },
    areaServed: 'VN',
    priceRange: '$',
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Dịch Vụ Tài Khoản Ảo',
    image: `${baseUrl}/logo.png`,
    description: 'Cung cấp tài khoản ảo chất lượng cao cho Shopee, TikTok, Hotmail',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'VN',
      addressLocality: 'Việt Nam',
    },
    priceRange: '$ - $$',
    url: baseUrl,
    telephone: '+84-xxx-xxx-xxx',
    serviceType: 'Online Account Service',
    areaServed: 'VN',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: baseUrl,
    name: 'Mua Tài Khoản Ảo - Shopee, TikTok, Hotmail',
    description: 'Dịch vụ mua bán tài khoản ảo chất lượng cao với giá rẻ nhất',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/buy?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Mua tài khoản Shopee ở đâu uy tín?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bạn có thể mua tài khoản Shopee chất lượng cao tại chúng tôi. Giá rẻ nhất thị trường, bảo hành 100%, giao ngay 24/7. Thanh toán an toàn qua nhiều phương thức.',
        },
      },
      {
        '@type': 'Question',
        name: 'Giá tài khoản TikTok bao nhiêu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Giá tài khoản TikTok thay đổi tùy theo cấp độ và lượng follower. Chúng tôi cung cấp nhiều mức giá để phù hợp với nhu cầu. Xem thêm tại trang mua hàng.',
        },
      },
      {
        '@type': 'Question',
        name: 'Hotmail account giá bao nhiêu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Hotmail account tại chúng tôi có giá rất rẻ, có thể bắt đầu từ ngàn đồng. Tất cả tài khoản được bảo hành, giao ngay sau khi thanh toán.',
        },
      },
      {
        '@type': 'Question',
        name: 'Tài khoản ảo có bảo hành bao lâu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tất cả tài khoản được bảo hành 100%. Nếu tài khoản bị khóa hoặc gặp sự cố, liên hệ hỗ trợ của chúng tôi 24/7 để được hoàn tiền hoặc cấp tài khoản mới.',
        },
      },
      {
        '@type': 'Question',
        name: 'Thanh toán bao lâu thì nhận tài khoản?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sau khi thanh toán thành công, tài khoản sẽ được giao ngay lập tức. Hỗ trợ 24/7, kể cả lúc nửa đêm, ngày lễ.',
        },
      },
      {
        '@type': 'Question',
        name: 'Mua tài khoản MMO ở đâu uy tín?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bạn có thể mua tài khoản MMO chất lượng cao tại chúng tôi. Chúng tôi cung cấp tài khoản cho nhiều game MMO phổ biến, giá rẻ nhất, bảo hành 100%.',
        },
      },
      {
        '@type': 'Question',
        name: 'Giá tài khoản game bao nhiêu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Giá tài khoản game thay đổi tùy theo từng game và level. Chúng tôi cung cấp giá cạnh tranh, từ rẻ đến cao cấp, phù hợp mọi nhu cầu.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
