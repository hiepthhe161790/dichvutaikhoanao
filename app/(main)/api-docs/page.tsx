"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/lib/components/ProtectedRoute";
import { 
  CodeBracketIcon, 
  DocumentTextIcon, 
  KeyIcon, 
  ServerStackIcon, 
  CheckCircleIcon,
  DocumentDuplicateIcon
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép vào clipboard!");
  };

  const CodeBlock = ({ code, language = "json" }: { code: string, language?: string }) => (
    <div className="relative group mt-4 mb-6">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => copyToClipboard(code)}
          className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:text-white hover:bg-gray-700"
        >
          <DocumentDuplicateIcon className="w-4 h-4" />
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono border border-gray-800">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 shrink-0">
              <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">Tài liệu API</h3>
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === "overview" 
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <DocumentTextIcon className="w-5 h-5" />
                    Tổng quan
                  </button>
                  <button
                    onClick={() => setActiveTab("auth")}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === "auth" 
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <KeyIcon className="w-5 h-5" />
                    Xác thực (Auth)
                  </button>
                  <button
                    onClick={() => setActiveTab("endpoints")}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === "endpoints" 
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <ServerStackIcon className="w-5 h-5" />
                    Endpoints
                  </button>
                  <button
                    onClick={() => setActiveTab("examples")}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === "examples" 
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <CodeBracketIcon className="w-5 h-5" />
                    Code mẫu
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
              
              {activeTab === "overview" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">API Documentation</h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                    Hệ thống Developer API cho phép bạn đấu nối, tự động hóa việc lấy sản phẩm và dịch vụ từ hệ thống của chúng tôi một cách nhanh chóng và an toàn.
                  </p>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                    <h4 className="text-blue-800 dark:text-blue-400 font-bold mb-2 flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5" />
                      Yêu cầu cơ bản
                    </h4>
                    <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 text-sm space-y-2 ml-1">
                      <li>Base URL: <code className="bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded text-blue-800 dark:text-blue-200">{typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/api/v1</code></li>
                      <li>Tất cả API đều trả về dữ liệu định dạng JSON.</li>
                      <li>Bạn cần tạo API Key tại trang <a href="/profile" className="underline font-bold">Profile</a> để bắt đầu.</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-4 mb-8">
                    <h4 className="text-amber-800 dark:text-amber-400 font-bold mb-2 flex items-center gap-2">
                      ⚠️ Lưu ý quan trọng về Timeout
                    </h4>
                    <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
                      Vì hệ thống hỗ trợ cơ chế tích hợp đa nguồn (có thể cần kết nối và mua hàng trực tiếp từ API của đối tác ngoài ở background), thời gian phản hồi cho các yêu cầu mua hàng đôi khi có thể kéo dài từ 3 đến 8 giây. 
                      Đại lý đấu nối <strong>bắt buộc phải cấu hình Connection Timeout tối thiểu là 15 - 20 giây</strong> trên hệ thống của mình để đảm bảo giao dịch không bị gián đoạn hoặc ngắt quãng giữa chừng gây bất đồng bộ số dư.
                    </p>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Quy chuẩn Response</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">Mọi request đều trả về format chuẩn sau đây:</p>
                  <CodeBlock code={`{
  "success": true, // hoặc false nếu có lỗi
  "data": { ... }, // Dữ liệu trả về (nếu success = true)
  "error": "Message" // Thông báo lỗi (nếu success = false)
}`} />
                </div>
              )}

              {activeTab === "auth" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Xác Thực (Authentication)</h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Để truy cập API, bạn cần truyền API Key vào Header của HTTP Request. Hệ thống hỗ trợ 2 cách truyền Header:
                  </p>
                  
                  <div className="space-y-6 mt-8">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">Cách 1: Sử dụng Bearer Token (Khuyên dùng)</h4>
                      <CodeBlock code={`Authorization: Bearer <API_KEY_CUA_BAN>`} language="http" />
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">Cách 2: Sử dụng X-API-Key</h4>
                      <CodeBlock code={`x-api-key: <API_KEY_CUA_BAN>`} language="http" />
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mt-8">
                    <p className="text-yellow-800 dark:text-yellow-300 text-sm font-medium">
                      ⚠️ Lưu ý bảo mật: API Key có quyền truy cập trực tiếp vào số dư của bạn để mua hàng. 
                      Tuyệt đối không để lộ API Key hoặc nhúng trực tiếp API Key vào code phía Frontend/Client. 
                      Nếu nghi ngờ bị lộ, hãy vào Profile để Reset lại API Key ngay lập tức.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "endpoints" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Danh sách Endpoints</h1>
                  
                  <div className="space-y-12">
                    {/* Endpoint 1 */}
                    <div className="border-b border-gray-200 dark:border-slate-800 pb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold px-2 py-1 rounded text-sm">GET</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white font-mono">/api/v1/me</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">Kiểm tra thông tin tài khoản và số dư hiện tại.</p>
                      <CodeBlock code={`{
  "success": true,
  "data": {
    "username": "email@example.com",
    "fullName": "Nguyen Van A",
    "balance": 1500000,
    "role": "customer",
    "bonusPercentage": 0
  }
}`} />
                    </div>

                    {/* Endpoint 2 */}
                    <div className="border-b border-gray-200 dark:border-slate-800 pb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold px-2 py-1 rounded text-sm">GET</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white font-mono">/api/v1/services</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">Lấy danh sách các chuyên mục, tài khoản, dịch vụ đang bán trên hệ thống kèm theo số lượng tồn kho (stock) và giá (price).</p>
                      <CodeBlock code={`{
  "success": true,
  "data": {
    "categories": [
      { "id": "cat_1", "name": "Facebook", "slug": "facebook", "type": "account" }
    ],
    "items": [
      {
        "id": "item_1",
        "name": "Via Facebook Limit 50",
        "categoryId": "cat_1",
        "type": "account", // hoặc 'service'
        "price": 50000,
        "stock": 125,
        "minQuantity": 1,
        "maxQuantity": 125
      }
    ]
  }
}`} />
                    </div>

                    {/* Endpoint 3 */}
                    <div className="border-b border-gray-200 dark:border-slate-800 pb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold px-2 py-1 rounded text-sm">POST</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white font-mono">/api/v1/orders/buy</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">Thực hiện mua tài khoản hoặc dịch vụ.</p>
                      <h5 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Request Body (JSON)</h5>
                      <CodeBlock code={`{
  "itemId": "id_cua_san_pham_hoac_dich_vu",
  "type": "account", // hoặc "service"
  "quantity": 10, // Số lượng mua
  // Dành riêng cho mua dịch vụ (service):
  "links": [
    { "url": "https://facebook.com/123", "quantity": 1000 }
  ],
  "note": "Ghi chú đơn hàng"
}`} />
                      <h5 className="font-bold text-sm text-gray-900 dark:text-white mb-2 mt-4">Response (Thành công mua Account)</h5>
                      <CodeBlock code={`{
  "success": true,
  "message": "Successfully purchased 1 accounts",
  "data": {
    "orderId": "order_xyz_123",
    "quantity": 1,
    "totalPrice": 50000,
    "accounts": [
      {
        "username": "uid|pass|2fa|email|passmail"
      }
    ]
  }
}`} />
                    </div>

                    {/* Endpoint 4 */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold px-2 py-1 rounded text-sm">GET</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white font-mono">/api/v1/orders/[id]</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">Kiểm tra trạng thái đơn hàng (Đặc biệt hữu ích để poll trạng thái của đơn Service/Buff).</p>
                      <CodeBlock code={`{
  "success": true,
  "data": {
    "id": "order_xyz_123",
    "type": "service",
    "status": "completed", // pending, processing, completed, cancelled
    "totalPrice": 10000
  }
}`} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "examples" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Code Mẫu Tích Hợp</h1>
                  
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">cURL</h4>
                  <CodeBlock language="bash" code={`curl -X GET "${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/api/v1/me" \\
  -H "Authorization: Bearer YOUR_API_KEY"`} />

                  <h4 className="font-bold text-gray-900 dark:text-white mb-2 mt-8">PHP (cURL)</h4>
                  <CodeBlock language="php" code={`<?php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://yourdomain.com/api/v1/services',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'GET',
  CURLOPT_HTTPHEADER => array(
    'Authorization: Bearer YOUR_API_KEY'
  ),
));

$response = curl_exec($curl);
curl_close($curl);
echo $response;
?>`} />

                  <h4 className="font-bold text-gray-900 dark:text-white mb-2 mt-8">Node.js (Fetch)</h4>
                  <CodeBlock language="javascript" code={`const buyAccount = async () => {
  const response = await fetch('https://yourdomain.com/api/v1/orders/buy', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      itemId: '65f...123',
      type: 'account',
      quantity: 1
    })
  });
  
  const data = await response.json();
  console.log(data);
};

buyAccount();`} />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
