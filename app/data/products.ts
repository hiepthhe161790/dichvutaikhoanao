export type Platform = "tiktok" | "shopee" | "lazada" | "gmail" | "hotmail";

export interface Product {
  id: string;
  platform: Platform;
  category: string;
  title: string;
  description: string;
  quantity: number;
  price: number;
  status: "available" | "soldout";
}

export const products: Product[] = [
  // TikTok Accounts
  {
    id: "tiktok-1",
    platform: "tiktok",
    category: "tiktok",
    title: "Tài khoản TikTok Việt Nam",
    description: "Nick TikTok reg bằng số điện thoại Việt Nam, đã verify email",
    quantity: 245,
    price: 15000,
    status: "available",
  },
  {
    id: "tiktok-2",
    platform: "tiktok",
    category: "tiktok",
    title: "TikTok có từ 1000-5000 follow",
    description: "Tài khoản TikTok đã có lượng follow tự nhiên, tương tác tốt",
    quantity: 89,
    price: 85000,
    status: "available",
  },
  {
    id: "tiktok-3",
    platform: "tiktok",
    category: "tiktok",
    title: "TikTok Creator Fund Ready",
    description: "Tài khoản TikTok đủ điều kiện tham gia quỹ sáng tạo",
    quantity: 0,
    price: 250000,
    status: "soldout",
  },

  // Shopee Silver Rank
  {
    id: "shopee-silver-1",
    platform: "shopee",
    category: "shopee-silver",
    title: "Nick Shopee hạng Bạc",
    description: "Tài khoản Shopee đã đạt hạng Bạc, có lịch sử mua hàng",
    quantity: 156,
    price: 25000,
    status: "available",
  },
  {
    id: "shopee-silver-2",
    platform: "shopee",
    category: "shopee-silver",
    title: "Shopee Bạc + 50 xu",
    description: "Nick Shopee hạng Bạc tích lũy 50-100 xu",
    quantity: 78,
    price: 30000,
    status: "available",
  },

  // Shopee Gold Rank
  {
    id: "shopee-gold-1",
    platform: "shopee",
    category: "shopee-gold",
    title: "Nick Shopee hạng Vàng",
    description: "Tài khoản Shopee đạt hạng Vàng, ưu đãi cao",
    quantity: 45,
    price: 65000,
    status: "available",
  },
  {
    id: "shopee-gold-2",
    platform: "shopee",
    category: "shopee-gold",
    title: "Shopee Vàng + 200 xu",
    description: "Nick Shopee hạng Vàng có 200-500 xu khả dụng",
    quantity: 23,
    price: 95000,
    status: "available",
  },

  // Shopee with Coins
  {
    id: "shopee-coin-1",
    platform: "shopee",
    category: "shopee-coin",
    title: "Nick Shopee 100-300 xu",
    description: "Tài khoản Shopee có sẵn 100-300 xu để sử dụng",
    quantity: 198,
    price: 20000,
    status: "available",
  },
  {
    id: "shopee-coin-2",
    platform: "shopee",
    category: "shopee-coin",
    title: "Nick Shopee 500-1000 xu",
    description: "Tài khoản Shopee có 500-1000 xu giá trị cao",
    quantity: 67,
    price: 45000,
    status: "available",
  },

  // Shopee with Successful Orders
  {
    id: "shopee-order-1",
    platform: "shopee",
    category: "shopee-orders",
    title: "Shopee có 5-10 đơn thành công",
    description: "Nick Shopee đã có 5-10 đơn giao dịch thành công",
    quantity: 134,
    price: 35000,
    status: "available",
  },
  {
    id: "shopee-order-2",
    platform: "shopee",
    category: "shopee-orders",
    title: "Shopee có 20+ đơn thành công",
    description: "Tài khoản Shopee uy tín với 20+ đơn hoàn thành",
    quantity: 56,
    price: 75000,
    status: "available",
  },

  // Shopee Phone Login
  {
    id: "shopee-phone-1",
    platform: "shopee",
    category: "shopee-phone",
    title: "Nick Shopee reg phone VN",
    description: "Tài khoản Shopee đăng ký bằng số điện thoại Việt Nam",
    quantity: 289,
    price: 18000,
    status: "available",
  },
  {
    id: "shopee-phone-2",
    platform: "shopee",
    category: "shopee-phone",
    title: "Shopee login phone verify",
    description: "Nick Shopee đăng nhập qua phone đã xác thực",
    quantity: 167,
    price: 22000,
    status: "available",
  },

  // Shopee Web Buff
  {
    id: "shopee-buff-1",
    platform: "shopee",
    category: "shopee-buff",
    title: "Nick Shopee buff web chuẩn",
    description: "Tài khoản Shopee buff web chất lượng cao",
    quantity: 423,
    price: 12000,
    status: "available",
  },
  {
    id: "shopee-buff-2",
    platform: "shopee",
    category: "shopee-buff",
    title: "Shopee buff web giá rẻ",
    description: "Nick Shopee buff web số lượng lớn, giá tốt",
    quantity: 567,
    price: 8000,
    status: "available",
  },

  // Lazada Accounts
  {
    id: "lazada-1",
    platform: "lazada",
    category: "lazada",
    title: "Nick Lazada Việt Nam mới",
    description: "Tài khoản Lazada mới tạo, chưa sử dụng",
    quantity: 178,
    price: 20000,
    status: "available",
  },
  {
    id: "lazada-2",
    platform: "lazada",
    category: "lazada",
    title: "Lazada có lịch sử mua hàng",
    description: "Nick Lazada đã có đơn hàng thành công",
    quantity: 92,
    price: 40000,
    status: "available",
  },

  // Gmail Accounts
  {
    id: "gmail-1",
    platform: "gmail",
    category: "gmail",
    title: "Gmail mới tạo 2024",
    description: "Tài khoản Gmail mới, chưa sử dụng, bảo hành đầy đủ",
    quantity: 834,
    price: 5000,
    status: "available",
  },
  {
    id: "gmail-2",
    platform: "gmail",
    category: "gmail",
    title: "Gmail có khôi phục",
    description: "Gmail có email/phone khôi phục, an toàn cao",
    quantity: 456,
    price: 12000,
    status: "available",
  },
  {
    id: "gmail-3",
    platform: "gmail",
    category: "gmail",
    title: "Gmail cũ 2020-2022",
    description: "Tài khoản Gmail đã tạo từ 2020-2022, độ tin cậy cao",
    quantity: 123,
    price: 25000,
    status: "available",
  },

  // Hotmail Accounts
  {
    id: "hotmail-1",
    platform: "hotmail",
    category: "hotmail",
    title: "Hotmail trusted cũ",
    description: "Tài khoản Hotmail/Outlook cũ, độ tin cậy cao",
    quantity: 89,
    price: 35000,
    status: "available",
  },
  {
    id: "hotmail-2",
    platform: "hotmail",
    category: "hotmail",
    title: "Hotmail new 2024",
    description: "Hotmail/Outlook mới tạo 2024, chất lượng tốt",
    quantity: 267,
    price: 15000,
    status: "available",
  },
  {
    id: "hotmail-3",
    platform: "hotmail",
    category: "hotmail",
    title: "Hotmail có recovery",
    description: "Tài khoản Hotmail có khôi phục đầy đủ",
    quantity: 0,
    price: 45000,
    status: "soldout",
  },
];

export const categories = [
  { id: "all", label: "Tất cả sản phẩm", icon: "squares-2x2" },
  { id: "tiktok", label: "Tài khoản TikTok", icon: "musical-note" },
  { id: "shopee-silver", label: "Nick Shopee hạng Bạc", icon: "star" },
  { id: "shopee-gold", label: "Nick Shopee hạng Vàng", icon: "trophy" },
  { id: "shopee-coin", label: "Nick Shopee có xu", icon: "currency-dollar" },
  { id: "shopee-orders", label: "Nick Shopee có đơn giao thành công", icon: "shopping-bag" },
  { id: "shopee-phone", label: "Nick reg phone login qua điện thoại", icon: "device-phone-mobile" },
  { id: "shopee-buff", label: "Nick Shopee buff web", icon: "arrow-trending-up" },
  { id: "lazada", label: "Nick Lazada", icon: "shopping-cart" },
  { id: "gmail", label: "Gmail có", icon: "envelope" },
  { id: "hotmail", label: "Mua Hotmail trusted/new", icon: "at-symbol" },
  { id: "ee-shop", label: "TK SHOP TRANG (ĐÃ ĐỊNH DANH)", icon: "🏪" },
  { id: 'gmail', label: 'GMAIL CÓ', icon: '📧' },
  { id: 'hotmail', label: 'MUA HOTMAIL TRUSTED / NEW', icon: '📨' },
  { id: 'lazada', label: 'TÀI KHOẢN LAZADA', icon: '🛒' },
];
