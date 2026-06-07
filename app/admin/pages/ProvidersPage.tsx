// Force recompile
"use client";

import { useState } from "react";
import { ProvidersListTab } from "../components/providers/ProvidersListTab";
import { ProviderWizardTab } from "../components/providers/ProviderWizardTab";
import { ProductMappingTab } from "../components/providers/ProductMappingTab";
import { ExternalOrderLogsTab } from "../components/providers/ExternalOrderLogsTab";

type Tab = "list" | "wizard" | "mapping" | "logs";

export function ProvidersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("list");
  // Lưu state provider đang sửa để truyền qua tab wizard
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);

  const handleEditProvider = (id: string) => {
    setEditingProviderId(id);
    setActiveTab("wizard");
  };

  const handleWizardComplete = () => {
    setEditingProviderId(null);
    setActiveTab("list");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Tích hợp API Ngoài</h2>
        {activeTab !== "wizard" && (
          <button
            onClick={() => {
              setEditingProviderId(null);
              setActiveTab("wizard");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Thêm cấu hình API
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          onClick={() => setActiveTab("list")}
          className={`pb-3 px-2 border-b-2 font-medium ${
            activeTab === "list" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Danh sách API
        </button>
        <button
          onClick={() => {
            setEditingProviderId(null);
            setActiveTab("wizard");
          }}
          className={`pb-3 px-2 border-b-2 font-medium ${
            activeTab === "wizard" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {editingProviderId ? "Sửa cấu hình" : "Thêm mới (Wizard)"}
        </button>
        <button
          onClick={() => setActiveTab("mapping")}
          className={`pb-3 px-2 border-b-2 font-medium ${
            activeTab === "mapping" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Mapping Sản phẩm
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`pb-3 px-2 border-b-2 font-medium ${
            activeTab === "logs" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Lịch sử giao dịch (Log)
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTab === "list" && <ProvidersListTab onEdit={handleEditProvider} />}
        {activeTab === "wizard" && (
          <ProviderWizardTab
            providerId={editingProviderId}
            onComplete={handleWizardComplete}
            onCancel={() => {
              setEditingProviderId(null);
              setActiveTab("list");
            }}
          />
        )}
        {activeTab === "mapping" && <ProductMappingTab />}
        {activeTab === "logs" && <ExternalOrderLogsTab />}
      </div>
    </div>
  );
}
