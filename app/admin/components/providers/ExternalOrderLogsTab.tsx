import { useState, useEffect } from "react";

export function ExternalOrderLogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any>(null); // For raw data modal

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/external-order-logs?page=${page}&limit=20`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Lịch sử Gọi API (Logs)</h3>
        <button onClick={() => fetchLogs()} className="text-sm px-3 py-1 border rounded hover:bg-gray-50">
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500">Đang tải...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3">Thời gian</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Product ID / Qty</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Trans ID</th>
                  <th className="p-3">Lỗi / Kết quả</th>
                  <th className="p-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                      <div className="text-xs text-gray-400">{log.durationMs}ms</div>
                    </td>
                    <td className="p-3 font-medium">{log.providerId?.name || 'Unknown'}</td>
                    <td className="p-3">
                      ID: {log.externalProductId}
                      <div className="text-xs text-gray-500">SL: {log.quantity}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.status === "success" ? "bg-green-100 text-green-800" :
                        log.status === "failed" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs font-mono">{log.externalOrderId || '-'}</td>
                    <td className="p-3 text-xs max-w-[200px] truncate text-red-500">
                      {log.errorMessage || (log.status === "success" ? `${log.parsedAccounts?.length || 0} accounts` : '-')}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Xem Raw
                      </button>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-500">
                      Chưa có giao dịch API ngoài nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Trước
              </button>
              <span className="px-3 py-1">Trang {page} / {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Raw Data Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h3 className="font-bold">Chi tiết Log: {selectedLog._id}</h3>
              <button onClick={() => setSelectedLog(null)} className="text-gray-500 hover:text-black">
                Đóng
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 text-gray-700">Raw Request (Params/Body)</h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto h-[400px]">
                  {JSON.stringify(selectedLog.rawRequest, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 text-gray-700">Raw Response (Từ Provider)</h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto h-[400px]">
                  {JSON.stringify(selectedLog.rawResponse, null, 2)}
                </pre>
              </div>
              <div className="col-span-2">
                <h4 className="font-semibold text-sm mb-2 text-gray-700">Parsed Accounts (Kết quả giải mã)</h4>
                <pre className="bg-gray-100 text-gray-800 border p-4 rounded text-xs overflow-x-auto max-h-[200px]">
                  {JSON.stringify(selectedLog.parsedAccounts, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
