import { useState, useEffect } from "react";

export function ProviderWizardTab({
  providerId,
  onComplete,
  onCancel,
}: {
  providerId: string | null;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    slug: "",
    baseUrl: "",
    authType: "query_param",
    authParamName: "api_key",
    authValue: "",
    status: "testing",
    endpoints: {
      getProfile: "profile.php",
      getProducts: "products.php",
      getProduct: "product.php?product={productId}",
      buyProduct: "buy.php",
      getOrder: "order.php?order={orderId}",
    },
    buyConfig: {
      method: "GET",
      productIdParam: "id",
      quantityParam: "amount",
      couponParam: "",
      extraBodyParams: {},
    },
    responseMap: {
      successField: "status",
      successValue: "success",
      dataField: "data",
      itemFormat: "pipe_separated",
      itemFields: ["username", "password"],
    },
  });

  useEffect(() => {
    if (providerId) {
      fetchProvider();
    }
  }, [providerId]);

  const fetchProvider = async () => {
    try {
      const res = await fetch(`/api/admin/external-providers/${providerId}`);
      const data = await res.json();
      if (data.success) {
        setFormData({
          ...formData,
          ...data.data,
          // Merge objects in case of missing fields
          endpoints: { ...formData.endpoints, ...(data.data.endpoints || {}) },
          buyConfig: { ...formData.buyConfig, ...(data.data.buyConfig || {}) },
          responseMap: { ...formData.responseMap, ...(data.data.responseMap || {}) },
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (path: string[], value: any) => {
    setFormData((prev: any) => {
      const copy = { ...prev };
      let current = copy;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return copy;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const url = providerId ? `/api/admin/external-providers/${providerId}` : "/api/admin/external-providers";
      const method = providerId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("Lưu thành công!");
        onComplete();
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (e) {
      alert("Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Wizard Steps Header */}
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded"></div>
        <div
          className="absolute left-0 top-1/2 h-1 bg-blue-600 -z-10 -translate-y-1/2 transition-all duration-300 rounded"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        ></div>

        {[1, 2, 3].map((num) => (
          <div key={num} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 ${
                step >= num ? "bg-blue-600 border-white text-white" : "bg-white border-gray-200 text-gray-400"
              }`}
            >
              {num}
            </div>
            <span className={`text-xs mt-2 font-medium ${step >= num ? "text-blue-600" : "text-gray-400"}`}>
              {num === 1 ? "Cơ bản" : num === 2 ? "Endpoints" : "Parsing Logic"}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Thông tin cơ bản & Xác thực</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên Provider</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={formData.name}
                  onChange={(e) => handleChange(["name"], e.target.value)}
                  placeholder="Vd: Taikhoan295"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug (định danh)</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={formData.slug}
                  disabled={!!providerId}
                  onChange={(e) => handleChange(["slug"], e.target.value)}
                  placeholder="vd: taikhoan295"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                <select
                  className="w-full border rounded p-2"
                  value={formData.status}
                  onChange={(e) => handleChange(["status"], e.target.value)}
                >
                  <option value="testing">Testing (Chưa dùng để bán thật)</option>
                  <option value="active">Active (Cho phép dùng để bán)</option>
                  <option value="inactive">Inactive (Tạm ngưng)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Base URL</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={formData.baseUrl}
                onChange={(e) => handleChange(["baseUrl"], e.target.value)}
                placeholder="https://taikhoan295.com/api/"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kiểu xác thực</label>
                <select
                  className="w-full border rounded p-2"
                  value={formData.authType}
                  onChange={(e) => handleChange(["authType"], e.target.value)}
                >
                  <option value="query_param">Query Param (?api_key=...)</option>
                  <option value="header_bearer">Bearer Token</option>
                  <option value="header_custom">Custom Header</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tên Param/Header</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={formData.authParamName}
                  onChange={(e) => handleChange(["authParamName"], e.target.value)}
                  placeholder="api_key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">API Key / Token</label>
                <input
                  type="password"
                  className="w-full border rounded p-2"
                  value={formData.authValue}
                  onChange={(e) => handleChange(["authValue"], e.target.value)}
                  placeholder={providerId ? "(Đã thiết lập, bỏ trống để giữ nguyên)" : "Nhập API key..."}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Cấu hình Endpoints</h3>
            <p className="text-sm text-gray-500">Khai báo các đường dẫn API tương đối so với Base URL.</p>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Get Profile (Lấy số dư)</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={formData.endpoints.getProfile}
                  onChange={(e) => handleChange(["endpoints", "getProfile"], e.target.value)}
                  placeholder="profile.php"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Get Products (Danh sách SP)</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={formData.endpoints.getProducts}
                  onChange={(e) => handleChange(["endpoints", "getProducts"], e.target.value)}
                  placeholder="products.php"
                />
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold mb-2">Buy Product (Endpoint mua hàng)</h4>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Endpoint</label>
                    <input
                      type="text"
                      className="w-full border rounded p-2"
                      value={formData.endpoints.buyProduct}
                      onChange={(e) => handleChange(["endpoints", "buyProduct"], e.target.value)}
                      placeholder="buy.php"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">HTTP Method</label>
                    <select
                      className="w-full border rounded p-2"
                      value={formData.buyConfig.method}
                      onChange={(e) => handleChange(["buyConfig", "method"], e.target.value)}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Param Name cho Product ID</label>
                    <input
                      type="text"
                      className="w-full border rounded p-2"
                      value={formData.buyConfig.productIdParam}
                      onChange={(e) => handleChange(["buyConfig", "productIdParam"], e.target.value)}
                      placeholder="vd: id"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Param Name cho Số lượng</label>
                    <input
                      type="text"
                      className="w-full border rounded p-2"
                      value={formData.buyConfig.quantityParam}
                      onChange={(e) => handleChange(["buyConfig", "quantityParam"], e.target.value)}
                      placeholder="vd: amount"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Logic đọc kết quả trả về (Parsing)</h3>
            <p className="text-sm text-gray-500">Giúp hệ thống hiểu được data trả về khi mua hàng thành công.</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Field báo hiệu thành công (Vd: status)</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={formData.responseMap.successField}
                  onChange={(e) => handleChange(["responseMap", "successField"], e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Giá trị thành công (Vd: success)</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={formData.responseMap.successValue}
                  onChange={(e) => handleChange(["responseMap", "successValue"], e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Field chứa mảng tài khoản (Vd: data)</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={formData.responseMap.dataField}
                  onChange={(e) => handleChange(["responseMap", "dataField"], e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Định dạng tài khoản</label>
                <select
                  className="w-full border rounded p-2"
                  value={formData.responseMap.itemFormat}
                  onChange={(e) => handleChange(["responseMap", "itemFormat"], e.target.value)}
                >
                  <option value="pipe_separated">Cách nhau bởi dấu gạch đứng (user|pass)</option>
                  <option value="colon_separated">Cách nhau bởi dấu hai chấm (user:pass)</option>
                  <option value="json_object">Object JSON {'{"username":"..."}'}</option>
                  <option value="newline">Mỗi dòng 1 text</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Các cột dữ liệu theo thứ tự (cách nhau bởi dấu phẩy)
              </label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={formData.responseMap.itemFields.join(", ")}
                onChange={(e) => handleChange(["responseMap", "itemFields"], e.target.value.split(",").map((s) => s.trim()))}
                placeholder="username, password, email"
              />
              <p className="text-xs text-gray-500 mt-1">
                Hệ thống sẽ gán giá trị tách được vào các field này (bắt buộc phải có "username" và "password").
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
        >
          Hủy
        </button>
        <div className="flex gap-2">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
            >
              Quay lại
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Tiếp tục
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Đang lưu..." : "Lưu & Hoàn tất"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
