import React, { useState, useContext } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Layers, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';

const Products = () => {
  const navigate = useNavigate();
  const [expandedRow, setExpandedRow] = useState(null);
  
  const { products, deleteProduct } = useContext(AppContext);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price) + ' ₫';
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Buttons & Title */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white uppercase tracking-tight">Danh sách sản phẩm</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Danh sách sản phẩm của DRX Store</p>
        </div>
        <button 
          onClick={() => navigate('/products/add')}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg bg-[#0052ff] hover:bg-[#0042d1] text-white shadow-md shadow-[#0052ff]/10 border border-transparent active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          THÊM LINH KIỆN MỚI
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
        {/* Search */}
        <div className="relative w-full md:w-80 group">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-[#0052ff] dark:group-focus-within:text-[#6699ff] transition-colors">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên, SKU hoặc hãng..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-[#0052ff] dark:focus:border-[#6699ff] focus:outline-none transition-all"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700 hover:bg-[#0052ff]/5 border border-slate-200 dark:border-slate-600 hover:border-[#0052ff]/20 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#0052ff] dark:hover:text-[#6699ff] transition-all">
            <Filter className="w-3.5 h-3.5" />
            <span>Bộ lọc thông số</span>
          </button>
          <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-3 transition-colors">
            {['Tất cả', 'Laptop', 'Keyboard', 'Mouse'].map((cat, i) => (
              <button 
                key={i} 
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                  i === 0 
                    ? 'bg-[#E6F0FF] dark:bg-[#0052ff]/20 border-[#0052ff]/25 dark:border-[#0052ff]/30 text-[#0052ff] dark:text-[#6699ff]' 
                    : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 transition-colors">
                <th className="p-4 font-bold uppercase tracking-wider">Mã hàng</th>
                <th className="p-4 font-bold uppercase tracking-wider">Hình ảnh & Tên</th>
                <th className="p-4 font-bold uppercase tracking-wider">Giá bán</th>
                <th className="p-4 font-bold uppercase tracking-wider">Giá vốn</th>
                <th className="p-4 font-bold uppercase tracking-wider text-center">Tồn kho</th>
                <th className="p-4 font-bold uppercase tracking-wider text-center">Khách đặt</th>
                <th className="p-4 font-bold uppercase tracking-wider">Thời gian tạo</th>
                <th className="p-4 font-bold uppercase tracking-wider text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 transition-colors">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 dark:text-slate-400 font-semibold">Chưa có hàng hóa nào trong hệ thống.</td>
                </tr>
              ) : (
                products.map((p) => (
                  <React.Fragment key={p.id}>
                  <tr 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer"
                    onClick={() => setExpandedRow(expandedRow === p.id ? null : p.id)}
                  >
                    <td className="p-4 font-mono font-bold text-slate-500 dark:text-slate-400">{p.sku}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center p-1 overflow-hidden shrink-0 transition-colors">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded" />
                          ) : (
                            <Layers className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs group-hover:text-[#0052ff] dark:group-hover:text-[#6699ff] transition-colors line-clamp-2">{p.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{p.brand} - {p.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{formatPrice(p.price)}</td>
                    <td className="p-4 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatPrice(p.costPrice)}</td>
                    
                    <td className="p-4 text-center">
                      <div className="space-y-1">
                        {p.stock <= 5 ? (
                          <span className="text-rose-600 dark:text-rose-400 font-bold block">{p.stock}</span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-300 font-bold block">{p.stock}</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      {p.reserved > 0 ? (
                        <span className="text-orange-500 dark:text-orange-400 font-bold bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded">{p.reserved}</span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 font-medium">0</span>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{p.createdAt}</span>
                    </td>

                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/products/edit/${p.id}`); }}
                          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-[#E6F0FF] dark:hover:bg-[#0052ff]/20 text-slate-400 dark:text-slate-400 hover:text-[#0052ff] dark:hover:text-[#6699ff] border border-slate-200 dark:border-slate-600 hover:border-[#0052ff]/20 dark:hover:border-[#0052ff]/30 transition-all" 
                          title="Sửa hàng hóa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-600 hover:border-rose-200 dark:hover:border-rose-800 transition-all" title="Xóa hàng hóa">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded Description Row */}
                  {expandedRow === p.id && (
                    <tr className="bg-[#f8fafc] dark:bg-slate-800/50 transition-colors">
                      <td colSpan="8" className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-start gap-3 text-[13px]">
                          <span className="font-bold text-slate-700 dark:text-slate-300 min-w-max uppercase tracking-wider text-[11px] bg-slate-200/50 dark:bg-slate-700 px-2 py-1 rounded transition-colors">Mô tả chi tiết:</span>
                          <span className="text-slate-600 dark:text-slate-400 leading-relaxed italic">{p.description || 'Chưa có mô tả cho sản phẩm này.'}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Products;
