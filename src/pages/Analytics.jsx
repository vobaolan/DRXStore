import React from 'react';
import { PieChart } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-[#E6F0FF] flex items-center justify-center mb-4">
        <PieChart className="w-8 h-8 text-[#0052ff]" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Phân tích biểu đồ</h2>
      <p className="text-sm text-slate-500 max-w-md">Tính năng này đang trong quá trình phát triển. Vui lòng quay lại sau!</p>
    </div>
  );
};

export default Analytics;
