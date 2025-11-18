"use client";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  bgColor: string;
}

export function StatCard({ icon, title, value, subtitle, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
            {title}
          </p>
          <p className={`text-gray-900 dark:text-gray-100 mb-2 text-3xl font-bold ${color}`}>
            {value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
        <div className={`${bgColor} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
