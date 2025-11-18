"use client";

import { Product } from "../data/products";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
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
    <div className="mb-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Title Bar */}
      <div className="bg-[#0f172a] px-6 py-3">
        <h3 className="text-white">{title}</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Mô tả sản phẩm
              </th>
              <th className="px-6 py-3 text-center text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Số lượng còn lại
              </th>
              <th className="px-6 py-3 text-center text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Giá
              </th>
              <th className="px-6 py-3 text-center text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {products.map((product) => (
              <tr
                key={product._id}
                className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-gray-900 dark:text-gray-100">
                      {product.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {product.description}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {product.status === "available" ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                    >
                      {product.quantity.toLocaleString("vi-VN")}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 dark:bg-gray-900/20 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                    >
                      Hết hàng
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-lg border-2 border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/20">
                    <span className="text-red-600 dark:text-red-400">
                      {product.price.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {product.status === "available" ? (
                    <Button
                      onClick={() => handleBuyClick(product._id)}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
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
                      className="bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
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
