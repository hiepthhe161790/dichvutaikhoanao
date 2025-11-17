"use client";

import { Product } from "../data/products";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

interface ProductTableProps {
  title: string;
  products: Product[];
  onBuy: (productId: string) => void;
}

export function ProductTable({ title, products, onBuy }: ProductTableProps) {
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
                key={product.id}
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
                      onClick={() => onBuy(product.id)}
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
    </div>
  );
}
