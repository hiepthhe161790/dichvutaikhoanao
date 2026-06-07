import { useState, useEffect } from "react";
import { Edit2, Trash2, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export function ProvidersListTab({ onEdit }: { onEdit: (id: string) => void }) {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/external-providers");
      const data = await res.json();
      if (data.success) {
        setProviders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch providers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa provider này có thể làm lỗi các mapping đang dùng. Bạn có chắc?")) return;
    try {
      const res = await fetch(`/api/admin/external-providers/${id}`, { method: "DELETE" });
      if (res.ok) fetchProviders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTest = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/external-providers/${id}/test`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`Test thành công! Số dư: ${data.data.balance !== undefined ? data.data.balance : "Không xác định"}`);
        fetchProviders();
      } else {
        alert("Test thất bại: " + data.error);
      }
    } catch (e) {
      alert("Test thất bại!");
    }
  };

  if (loading) return <div className="p-4 text-center">Đang tải...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-3">Tên Provider</th>
            <th className="px-4 py-3">Base URL</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Health / Balance</th>
            <th className="px-4 py-3">Thống kê mua</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => (
            <tr key={p._id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">
                {p.name}
                <div className="text-xs text-gray-400">{p.slug}</div>
              </td>
              <td className="px-4 py-3 text-xs">{p.baseUrl}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  p.status === "active" ? "bg-green-100 text-green-800" :
                  p.status === "testing" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                }`}>
                  {p.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  {p.isHealthy ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                  <span>{p.lastKnownBalance !== undefined ? `${p.lastKnownBalance} đ` : "-"}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-green-600">{p.totalSuccessOrders || 0}</span>
                <span className="text-gray-400"> / {p.totalOrdersPlaced || 0}</span>
              </td>
              <td className="px-4 py-3 text-right flex justify-end gap-2">
                <button onClick={() => handleTest(p._id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Test Connection">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={() => onEdit(p._id)} className="p-1 text-gray-600 hover:bg-gray-200 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p._id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {providers.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                Chưa có nhà cung cấp API ngoài nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
