"use client";

import { Product } from "../data/products";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ShoppingCartIcon, FireIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useAuthContext } from "@/lib/context/AuthContext";
import { toast } from "sonner";

interface ProductTableProps {
  title: string;
  products: Product[];
  onBuy: (productId: string, quantity: number) => void;
}

export function ProductTable({ title, products, onBuy }: ProductTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, revalidateAuth } = useAuthContext();
  const handleBuyClick = (productId: string) => {
    setSelectedProductId(productId);
    setQuantity(1);
    setError("");
    setIsModalOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProductId) return;

    // Kiểm tra đã login
    if (!user) {
      setError("Vui lòng đăng nhập để mua hàng");
      return;
    }

    if (quantity < 1) {
      setError("Số lượng phải lớn hơn 0");
      return;
    }

    const product = products.find((p) => p._id === selectedProductId);
    if (product && quantity > product.quantity) {
      setError(`Chỉ còn ${product.quantity} sản phẩm`);
      return;
    }

    // Kiểm tra số dư tiền
    const totalPrice = product?.price ? product.price * quantity : 0;
    if (user.balance < totalPrice) {
      const needMore = totalPrice - user.balance;
      setError(
        `Số dư không đủ. Bạn cần ${needMore.toLocaleString("vi-VN")} đ nữa (Số dư: ${user.balance.toLocaleString("vi-VN")} đ)`
      );
      return;
    }

    // Gửi request mua hàng
    setIsLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create order");
        return;
      }

      // Hiển thị thành công
      toast.success(`Mua hàng thành công! Bạn đã mua ${quantity} tài khoản.`);

      // Refresh user data
      if (revalidateAuth) {
        await revalidateAuth();
      }

      // Call parent handler
      onBuy(selectedProductId, quantity);
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to create order");
    } finally {
      setIsLoading(false);
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="mb-6 bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Title Bar */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] px-6 py-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="relative flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <h3 className="text-white flex items-center gap-2">
            {title}
            <FireIcon className="w-5 h-5 text-orange-400" />
          </h3>
          <div className="ml-auto px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white">
            {products.length} sản phẩm
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-750 border-b-2 border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                Mô tả sản phẩm
              </th>
              <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                Số lượng còn lại
              </th>
              <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                Giá
              </th>
              <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {products.map((product, index) => (
              <tr
                key={product._id}
                className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-300 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-5">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mt-2 group-hover:scale-150 transition-transform"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-gray-100 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-2">
                        <CheckBadgeIcon className="w-4 h-4 text-green-500" />
                        {product.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  {product.status === "available" ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 dark:text-green-400 font-bold">
                        {product.quantity.toLocaleString("vi-VN")}
                      </span>
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 px-4 py-2"
                    >
                      Hết hàng
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-500 dark:border-red-600 bg-gradient-to-br from-red-50 via-orange-50 to-red-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-red-900/20 shadow-lg hover:shadow-xl transition-shadow">
                    <span className="text-red-600 dark:text-red-400 font-bold">
                      {product.price.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  {product.status === "available" ? (
                    <Button
                      onClick={() => handleBuyClick(product._id)}
                      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-700 dark:to-blue-600 dark:hover:from-blue-800 dark:hover:to-blue-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/50 hover:scale-105 transition-all duration-300 rounded-xl border-2 border-blue-400 dark:border-blue-500"
                      size="sm"
                    >
                      <ShoppingCartIcon className="w-4 h-4 mr-1.5" />
                      Mua ngay
                    </Button>
                  ) : (
                    <Button
                      disabled
                      variant="outline"
                      size="sm"
                      className="bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50"
                    >
                      Hết hàng
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nhập Số Lượng */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nhập số lượng mua
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số lượng
              </label>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white w-10 h-10"
                  size="sm"
                >
                  −
                </Button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-center font-medium"
                />
                <Button
                  onClick={() => setQuantity(quantity + 1)}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white w-10 h-10"
                  size="sm"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Hiển thị thông tin giá và số dư */}
            {selectedProductId && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Giá mỗi cái:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {products
                        .find((p) => p._id === selectedProductId)
                        ?.price.toLocaleString("vi-VN")}{" "}
                      đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tổng tiền:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {(
                        (products.find((p) => p._id === selectedProductId)?.price || 0) *
                        quantity
                      ).toLocaleString("vi-VN")}{" "}
                      đ
                    </span>
                  </div>
                  <div className="border-t border-blue-200 dark:border-blue-700 pt-2 mt-2 flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Số dư của bạn:</span>
                    <span
                      className={`font-semibold ${
                        user && user.balance >= (products.find((p) => p._id === selectedProductId)?.price || 0) * quantity
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {user?.balance.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                className="flex-1 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmPurchase}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white disabled:opacity-50"
              >
                {isLoading ? "Đang xử lý..." : "Xác nhận mua"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
