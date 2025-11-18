"use client";

import { useState, useEffect } from "react";
import { Squares2X2Icon } from "@heroicons/react/24/outline";
import * as HeroIcons from "@heroicons/react/24/outline";

interface Category {
  id: string;
  label: string;
  icon: any;
  iconName?: string;
}

// Get icon component from Heroicons by name
const getIconComponent = (iconName: string | undefined) => {
  if (!iconName) return Squares2X2Icon;
  return (HeroIcons as any)[iconName] || Squares2X2Icon;
};

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  categories?: Array<{ _id: string; name: string; platform: string; icon?: string }>;
}

export function CategoryTabs({ 
  activeCategory, 
  onCategoryChange, 
  categories: apiCategories = [] 
}: CategoryTabsProps) {
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", label: "Tất cả sản phẩm", icon: Squares2X2Icon, iconName: "Squares2X2Icon" },
  ]);

  useEffect(() => {
    if (apiCategories && apiCategories.length > 0) {
      // Build categories from API data
      const builtCategories: Category[] = [
        { id: "all", label: "Tất cả sản phẩm", icon: Squares2X2Icon, iconName: "Squares2X2Icon" },
      ];

      apiCategories.forEach((cat) => {
        const IconComponent = getIconComponent(cat.icon);
        builtCategories.push({
          id: cat.name, // Use category name as ID for filtering
          label: cat.name,
          icon: IconComponent,
          iconName: cat.icon,
        });
      });

      setCategories(builtCategories);
    }
  }, [apiCategories]);
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-[65px] z-20">
      <div className="flex flex-wrap justify-center gap-3 p-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 text-base font-medium transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 border-blue-600 text-primary shadow-lg shadow-blue-600/30"
                  : "bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700"
              }`}
            >
              <Icon className="w-6 h-6 flex-shrink-0" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
