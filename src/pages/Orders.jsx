import React, { useState, useContext } from 'react';
import { Eye, Trash2, X, Edit2 } from 'lucide-react';
import { AppContext } from '../contexts/AppContext';

const Orders = () => {
  const { orders, deleteOrder, customers } = useContext(AppContext);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const getCustomerCode = (order) => {
    if (order.customerCode) return order.customerCode;
    const found = customers.find(c => String(c.id) === String(order.customerId));
    return found ? found.code : 'KL';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price) + ' ₫';
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteOrder(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white uppercase tracking-tight">Hóa đơn bán hàng</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Quản lý danh sách đơn hàng và doanh thu</p>
      </div>

      {/* Orders Table Container */}
      <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 transition-colors">
                <th className="p-4 font-bold uppercase tracking-wider">Mã Hoá Đơn</th>
                <th className="p-4 font-bold uppercase tracking-wider">Thời Gian</th>
                <th className="p-4 font-bold uppercase tracking-wider">Mã KH</th>
                <th className="p-4 font-bold uppercase tracking-wider">Khách Hàng</th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">Tổng Tiền Hàng</th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">Giảm Giá</th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">Khách Cần Trả</th>
                <th className="p-4 font-bold uppercase tracking-wider text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 transition-colors">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 dark:text-slate-400 font-semibold">Chưa có hóa đơn nào trong hệ thống.</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td 
                      className="p-4 font-bold text-[#0052ff] dark:text-[#6699ff] cursor-pointer hover:underline"
                      onClick={() => setSelectedOrder(o)}
                    >
                      {o.code || o.id}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">{o.date}</td>
                    <td className="p-4 font-mono font-bold text-slate-500 dark:text-slate-400">{getCustomerCode(o)}</td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{o.customer}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200 text-right">{formatPrice(o.total)}</td>
                    <td className="p-4 font-semibold text-rose-500 dark:text-rose-400 text-right">
                      {o.discount > 0 ? formatPrice(o.discount) : '0 ₫'}
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 text-right text-[13px]">{formatPrice(o.total - o.discount)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setSelectedOrder(o)}
                          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-[#E6F0FF] dark:hover:bg-[#0052ff]/20 text-slate-400 dark:text-slate-400 hover:text-[#0052ff] dark:hover:text-[#6699ff] border border-slate-200 dark:border-slate-600 hover:border-[#0052ff]/20 dark:hover:border-[#0052ff]/30 transition-all flex items-center gap-1 font-bold text-[10px] uppercase"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem</span>
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(o.id)}
                          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-600 hover:border-rose-200 dark:hover:border-rose-800 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-black/50 w-full max-w-5xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] transition-colors">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 shrink-0 transition-colors">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
                  Chi tiết hóa đơn: <span className="text-[#0052ff] dark:text-[#6699ff]">{selectedOrder.code || selectedOrder.id}</span>
                </h3>
                <span className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">Hoàn thành</span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              
              {/* Customer Info Card */}
              <div className="mb-6 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center transition-colors">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Thông tin khách hàng</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedOrder.customer} <span className="text-slate-400 dark:text-slate-500 font-mono text-xs ml-2">({selectedOrder.customerCode})</span></p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Thời gian tạo</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedOrder.date}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 transition-colors">
                      <th className="p-3 font-bold uppercase tracking-wider">Mã hàng</th>
                      <th className="p-3 font-bold uppercase tracking-wider">Tên hàng</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-center">SL</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-right">Đơn giá</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-right">Giảm giá</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-right">Giá bán</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 transition-colors">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-500 dark:text-slate-400">{item.sku}</td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{item.name}</td>
                        <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-300">{item.qty}</td>
                        <td className="p-3 text-right font-semibold text-slate-500 dark:text-slate-400">{formatPrice(item.unitPrice)}</td>
                        <td className="p-3 text-right font-semibold text-rose-500 dark:text-rose-400">{item.discount > 0 ? formatPrice(item.discount) : '-'}</td>
                        <td className="p-3 text-right font-bold text-slate-800 dark:text-slate-200">{formatPrice(item.finalPrice)}</td>
                        <td className="p-3 text-right font-bold text-[#0052ff] dark:text-[#6699ff]">{formatPrice(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 transition-colors">
                    <tr>
                      <td colSpan="4" className="p-4 text-right font-bold text-slate-600 dark:text-slate-400 uppercase text-[11px]">Tổng cộng:</td>
                      <td className="p-4 text-right font-bold text-rose-500 dark:text-rose-400">{formatPrice(selectedOrder.discount)}</td>
                      <td colSpan="2" className="p-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-[15px]">
                        {formatPrice(selectedOrder.total - selectedOrder.discount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50 shrink-0 transition-colors">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[12px] font-bold rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* XÁC NHẬN XÓA MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-transparent"
            onClick={() => setDeleteConfirmId(null)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/40 text-rose-500 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Xóa Hóa Đơn Này?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Bạn có chắc chắn muốn xóa hóa đơn <span className="font-bold text-slate-700 dark:text-slate-300">{deleteConfirmId}</span> không? Hành động này không thể hoàn tác.
              </p>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex gap-3 transition-colors">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl shadow-md shadow-rose-500/20 transition-colors"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;
