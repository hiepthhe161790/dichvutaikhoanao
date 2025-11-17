# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Sử dụng JWT token trong header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Products (Sản phẩm)

#### GET `/api/products`
Lấy danh sách sản phẩm

**Query Parameters:**
- `platform` (optional): tiktok | shopee | lazada | gmail | hotmail
- `category` (optional): ID danh mục
- `status` (optional): available | soldout
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số items/trang (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### GET `/api/products/[id]`
Lấy chi tiết sản phẩm

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tiktok-1",
    "platform": "tiktok",
    "title": "...",
    "description": "...",
    "quantity": 0,
    "price": 3.99,
    "status": "available"
  }
}
```

#### POST `/api/products` 🔒 Admin
Tạo sản phẩm mới

**Body:**
```json
{
  "platform": "tiktok",
  "title": "Nick TikTok...",
  "description": "Mô tả...",
  "quantity": 100,
  "price": 3.99,
  "category": "tiktok-buff"
}
```

#### PUT `/api/products/[id]` 🔒 Admin
Cập nhật sản phẩm

#### DELETE `/api/products/[id]` 🔒 Admin
Xóa sản phẩm

---

### 2. Orders (Đơn hàng)

#### GET `/api/orders` 🔒
Lấy danh sách đơn hàng của user

**Query Parameters:**
- `status` (optional): pending | completed | failed
- `page` (optional)
- `limit` (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-1",
      "productId": "tiktok-1",
      "productTitle": "...",
      "quantity": 1,
      "totalPrice": 3.99,
      "status": "completed",
      "accountData": "user|pass|mail|pass",
      "createdAt": "2025-11-16T..."
    }
  ]
}
```

#### POST `/api/orders` 🔒
Tạo đơn hàng mới (mua sản phẩm)

**Body:**
```json
{
  "productId": "tiktok-1",
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "order-123",
    "status": "completed",
    "accountData": "user|pass|mail|pass"
  }
}
```

---

### 3. Authentication

#### POST `/api/auth/register`
Đăng ký tài khoản

**Body:**
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/login`
Đăng nhập

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-1",
    "username": "user123",
    "email": "user@example.com",
    "role": "user",
    "balance": 0,
    "token": "jwt-token-here"
  }
}
```

#### POST `/api/auth/logout` 🔒
Đăng xuất

---

### 4. User Profile

#### GET `/api/user/profile` 🔒
Lấy thông tin profile

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-1",
    "username": "user123",
    "email": "user@example.com",
    "role": "user",
    "balance": 134,
    "discount": 5,
    "createdAt": "2025-11-16T..."
  }
}
```

#### PUT `/api/user/profile` 🔒
Cập nhật profile

**Body:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

---

### 5. User Balance

#### GET `/api/user/balance` 🔒
Lấy số dư tài khoản

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 134,
    "discount": 5,
    "currency": "VND"
  }
}
```

#### POST `/api/user/balance/deposit` 🔒
Nạp tiền vào tài khoản

**Body:**
```json
{
  "amount": 100000,
  "method": "bank_transfer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit request created",
  "data": {
    "transactionId": "txn-123",
    "amount": 100000,
    "method": "bank_transfer",
    "status": "pending",
    "paymentUrl": "https://..."
  }
}
```

---

### 6. Categories

#### GET `/api/categories`
Lấy danh sách danh mục

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "all",
      "label": "TẤT CẢ SẢN PHẨM",
      "icon": "📦"
    },
    {
      "id": "tiktok",
      "label": "TÀI KHOẢN TIKTOK",
      "icon": "🎵"
    }
  ]
}
```

---

## Error Responses

Tất cả endpoints đều trả về error theo format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Frontend Usage

Sử dụng API client:

```typescript
import apiClient from '@/lib/api-client';

// Lấy sản phẩm
const products = await apiClient.getProducts({ platform: 'tiktok' });

// Tạo đơn hàng
const order = await apiClient.createOrder({ 
  productId: 'tiktok-1', 
  quantity: 1 
});

// Đăng nhập
const response = await apiClient.login({
  email: 'user@example.com',
  password: 'password123'
});
```

---

## TODO - Implementation Checklist

- [ ] Kết nối Database (MongoDB/PostgreSQL)
- [ ] Implement JWT authentication
- [ ] Hash passwords (bcrypt)
- [ ] Add rate limiting
- [ ] Add input validation (Zod)
- [ ] Implement payment gateway integration
- [ ] Add email notifications
- [ ] Add logging system
- [ ] Add API documentation (Swagger)
- [ ] Add unit tests
- [ ] Add CORS configuration
- [ ] Implement refresh tokens
- [ ] Add file upload for admin
- [ ] Add webhooks for payment
