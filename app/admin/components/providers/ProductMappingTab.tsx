import { useState, useEffect } from "react";
import { Plus, Trash2, Edit } from "lucide-react";

export function ProductMappingTab() {
  const [mappings, setMappings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<any[]>([]);
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    localProductId: "",
    providerId: "",
    externalProductId: "",
    priority: 1,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mapsRes, provRes, prodRes] = await Promise.all([
        fetch("/api/admin/product-mappings").then((r) => r.json()),
        fetch("/api/admin/external-providers").then((r) => r.json()),
        fetch("/api/products?limit=1000").then((r) => r.json()),
      ]);
      if (mapsRes.success) setMappings(mapsRes.data);
      if (provRes.success) setProviders(provRes.data);
      if (prodRes.success) setLocalProducts(prodRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/admin/product-mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData({ localProductId: "", providerId: "", externalProductId: "", priority: 1 });
        fetchData();
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (e) {
      alert("Lỗi lưu mapping");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Chắc chắn muốn xóa mapping này?")) return;
    try {
      const res = await fetch(`/api/admin/product-mappings/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Danh sách Mapping Sản Phẩm</h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Thêm Mapping
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-3 rounded-md mb-4 text-sm text-blue-800">
        <p><strong>Mapping Priority:</strong> Khi kho nội bộ hết hàng, hệ thống sẽ tự động gọi sang Provider có priority <strong>nhỏ nhất (1, 2, 3...)</strong> để mua hàng.</p>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500">Đang tải...</div>
      ) : (
        <table className="w-full text-sm text-left border">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">SP Nội bộ</th>
              <th className="p-3">Provider (Nguồn ngoài)</th>
              <th className="p-3">Product ID (Ngoài)</th>
              <th className="p-3">Ưu tiên (Priority)</th>
              <th className="p-3">Đã mua</th>
              <th className="p-3 text-right">Xóa</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m) => (
              <tr key={m._id} className="border-b">
                <td className="p-3">
                  <div className="font-medium">{m.localProductId?.title || 'Unknown'}</div>
                  <div className="text-xs text-gray-500">{m.localProductId?.platform}</div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    m.providerId?.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100"
                  }`}>
                    {m.providerId?.name || 'Unknown'}
                  </span>
                </td>
                <td className="p-3 font-mono">{m.externalProductId}</td>
                <td className="p-3 font-bold text-center w-24">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{m.priority}</span>
                </td>
                <td className="p-3 text-green-600 font-medium">{m.totalPurchased || 0}</td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(m._id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {mappings.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Chưa có mapping nào được cấu hình.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal Thêm Mapping */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">Thêm Mapping Mới</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Sản phẩm Nội bộ</label>
                <select
                  className="w-full border p-2 rounded"
                  value={formData.localProductId}
                  onChange={(e) => setFormData({ ...formData, localProductId: e.target.value })}
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {localProducts.map((p) => (
                    <option key={p._id} value={p._id}>
                      [{p.platform}] {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Provider Nguồn Ngoài</label>
                <select
                  className="w-full border p-2 rounded"
                  value={formData.providerId}
                  onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                >
                  <option value="">-- Chọn provider --</option>
                  {providers.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Product ID của Provider</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={formData.externalProductId}
                  onChange={(e) => setFormData({ ...formData, externalProductId: e.target.value })}
                  placeholder="Nhập ID SP bên provider (vd: 3)"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Độ ưu tiên (1 = Cao nhất)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border p-2 rounded"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">
                Hủy
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
