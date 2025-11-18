// Mock data for admin dashboard

export interface User {
  id: string;
  avatar: string;
  name: string;
  email: string;
  role: "admin" | "user" | "staff";
  status: "active" | "banned";
  createdAt: string;
  balance: number;
}

export interface Booking {
  id: string;
  code: string;
  customerName: string;
  service: string;
  time: string;
  status: "pending" | "completed" | "cancelled";
  note: string;
  amount: number;
}

export interface Transaction {
  id: string;
  transactionId: string;
  userName: string;
  type: "deposit" | "withdraw";
  amount: number;
  status: "pending" | "approved" | "rejected";
  time: string;
  note?: string;
}

export const users: User[] = [
  {
    id: "1",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
    name: "Nguyễn Văn An",
    email: "nguyenvanan@gmail.com",
    role: "user",
    status: "active",
    createdAt: "2024-01-15",
    balance: 1250000,
  },
  {
    id: "2",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
    name: "Trần Thị Bình",
    email: "tranthibinh@gmail.com",
    role: "user",
    status: "active",
    createdAt: "2024-01-20",
    balance: 850000,
  },
  {
    id: "3",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
    name: "Lê Minh Cường",
    email: "leminhcuong@gmail.com",
    role: "staff",
    status: "active",
    createdAt: "2024-02-01",
    balance: 500000,
  },
  {
    id: "4",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
    name: "Phạm Thị Dung",
    email: "phamthidung@gmail.com",
    role: "user",
    status: "banned",
    createdAt: "2024-02-10",
    balance: 0,
  },
  {
    id: "5",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
    name: "Hoàng Văn Em",
    email: "hoangvanem@gmail.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-01",
    balance: 5000000,
  },
];

export const bookings: Booking[] = [
  {
    id: "1",
    code: "BK001",
    customerName: "Nguyễn Văn An",
    service: "Tài khoản TikTok Premium",
    time: "2024-03-15 14:30",
    status: "completed",
    note: "Giao hàng thành công",
    amount: 150000,
  },
  {
    id: "2",
    code: "BK002",
    customerName: "Trần Thị Bình",
    service: "Nick Shopee Hạng Vàng",
    time: "2024-03-16 10:00",
    status: "pending",
    note: "Đang xử lý",
    amount: 250000,
  },
  {
    id: "3",
    code: "BK003",
    customerName: "Lê Minh Cường",
    service: "Gmail Business",
    time: "2024-03-16 15:45",
    status: "completed",
    note: "Hoàn thành",
    amount: 180000,
  },
  {
    id: "4",
    code: "BK004",
    customerName: "Phạm Thị Dung",
    service: "Lazada Gold Account",
    time: "2024-03-17 09:20",
    status: "cancelled",
    note: "Khách hàng hủy",
    amount: 200000,
  },
];

export const transactions: Transaction[] = [
  {
    id: "1",
    transactionId: "TX001",
    userName: "Nguyễn Văn An",
    type: "deposit",
    amount: 1000000,
    status: "approved",
    time: "2024-03-15 10:30",
    note: "Nạp qua ACB",
  },
  {
    id: "2",
    transactionId: "TX002",
    userName: "Trần Thị Bình",
    type: "withdraw",
    amount: 500000,
    status: "pending",
    time: "2024-03-16 14:20",
  },
  {
    id: "3",
    transactionId: "TX003",
    userName: "Lê Minh Cường",
    type: "deposit",
    amount: 2000000,
    status: "approved",
    time: "2024-03-16 16:45",
    note: "Nạp qua ACB",
  },
  {
    id: "4",
    transactionId: "TX004",
    userName: "Hoàng Văn Em",
    type: "withdraw",
    amount: 1500000,
    status: "rejected",
    time: "2024-03-17 11:00",
    note: "Thông tin không hợp lệ",
  },
];

export const monthlyRevenue = [
  { month: "Tháng 1", revenue: 45000000 },
  { month: "Tháng 2", revenue: 52000000 },
  { month: "Tháng 3", revenue: 48000000 },
  { month: "Tháng 4", revenue: 61000000 },
  { month: "Tháng 5", revenue: 55000000 },
  { month: "Tháng 6", revenue: 67000000 },
];

export const transactionsByType = [
  { name: "Nạp tiền", value: 65, color: "#3b82f6" },
  { name: "Rút tiền", value: 25, color: "#ef4444" },
  { name: "Mua hàng", value: 10, color: "#10b981" },
];
