import React, { useState, useContext } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, User, X } from 'lucide-react';
import { AppContext } from '../contexts/AppContext';

const Customers = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useContext(AppContext);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '', name: '', phone: '', email: '', birthday: '', gender: 'male'
  });
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: '', message: '' });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price) + ' ₫';
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        code: customer.code,
        birthday: customer.birthday || '',
        gender: customer.gender || 'male'
      });
    } else {
      const randomCode = `DRX-KH${Math.floor(1000 + Math.random() * 9000)}`;
      setEditingId(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        code: randomCode,
        birthday: '',
        gender: 'male'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveCustomer = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Vui lòng nhập tên và số điện thoại khách hàng!");
      return;
    }

    if (editingId) {
      updateCustomer({ ...formData, id: editingId });
    } else {
      const newCustomer = {
        id: Date.now().toString(),
        ...formData,
        code: formData.code || `DRX-KH${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        totalSales: 0
      };
      addCustomer(newCustomer);
    }
    handleCloseModal();
    setAlertModal({ isOpen: true, type: 'success', message: editingId ? 'Cập nhật khách hàng thành công!' : 'Thêm khách hàng thành công!' });
  };

  const handleDeleteCustomer = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này không?")) {
      deleteCustomer(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white uppercase tracking-tight">Khách hàng</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Quản lý danh sách và công nợ khách hàng</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg bg-[#0052ff] hover:bg-[#0042d1] text-white shadow-md shadow-[#0052ff]/10 transition-all"
        >
          <Plus className="w-4 h-4" />
          THÊM KHÁCH HÀNG
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
        <div className="relative w-full md:w-96 group">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-slate-500 group-focus-within:text-[#0052ff] dark:group-focus-within:text-[#6699ff] transition-colors">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Tìm theo mã, tên hoặc số điện thoại..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-[#0052ff] dark:focus:border-[#6699ff] focus:outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700 hover:bg-[#0052ff]/5 dark:hover:bg-[#0052ff]/20 border border-slate-200 dark:border-slate-600 hover:border-[#0052ff]/20 dark:hover:border-[#0052ff]/40 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#0052ff] dark:hover:text-[#6699ff] transition-all">
            <Filter className="w-3.5 h-3.5" />
            <span>Lọc theo nợ</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 transition-colors">
                <th className="p-4 font-bold uppercase tracking-wider">Mã khách hàng</th>
                <th className="p-4 font-bold uppercase tracking-wider">Tên khách hàng</th>
                <th className="p-4 font-bold uppercase tracking-wider text-center">Điện thoại</th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">Ngày tạo</th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">Tổng bán</th>
                <th className="p-4 font-bold uppercase tracking-wider text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 transition-colors">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400 font-semibold">Chưa có khách hàng nào trong hệ thống.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="p-4 font-mono font-bold text-slate-500 dark:text-slate-400">{c.code}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center font-semibold text-slate-600 dark:text-slate-300">{c.phone}</td>
                    <td className="p-4 text-right font-medium text-slate-500 dark:text-slate-400">
                      {c.createdAt || '13/07/2026'}
                    </td>
                    <td className="p-4 text-right font-bold text-[#0052ff] dark:text-[#6699ff]">{formatPrice(c.totalSales)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(c)}
                          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-[#E6F0FF] dark:hover:bg-[#0052ff]/20 text-slate-400 dark:text-slate-400 hover:text-[#0052ff] dark:hover:text-[#6699ff] border border-slate-200 dark:border-slate-600 hover:border-[#0052ff]/20 dark:hover:border-[#0052ff]/40 transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCustomer(c.id)}
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

      {/* CREATE / EDIT CUSTOMER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-black/50 w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors">
              <h3 className="text-[16px] font-bold text-slate-800 dark:text-white">
                {editingId ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-5">
              <div className="grid grid-cols-2 gap-5">
                {/* Cột trái */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                      Tên khách hàng <span className="text-rose-500 dark:text-rose-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      autoFocus
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Nhập tên khách hàng"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 text-[13px] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#0052FF] dark:focus:border-[#6699ff] transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                      Điện thoại <span className="text-rose-500 dark:text-rose-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Nhập số điện thoại"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 text-[13px] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#0052FF] dark:focus:border-[#6699ff] transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                      Email
                    </label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Nhập địa chỉ email"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 text-[13px] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#0052FF] dark:focus:border-[#6699ff] transition-colors"
                    />
                  </div>
                </div>

                {/* Cột phải */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                      Mã khách hàng
                    </label>
                    <input 
                      type="text" 
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="VD: DRX-KH1234"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 text-[13px] font-bold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#0052FF] dark:focus:border-[#6699ff] transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                      Sinh nhật
                    </label>
                    <input 
                      type="date" 
                      value={formData.birthday}
                      onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 text-[13px] text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#0052FF] dark:focus:border-[#6699ff] transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                      Giới tính
                    </label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 text-[13px] text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#0052FF] dark:focus:border-[#6699ff] transition-colors"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[13px] font-bold rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                Bỏ qua
              </button>
              <button 
                onClick={handleSaveCustomer}
                className="px-6 py-2 bg-[#0052FF] text-white text-[13px] font-bold rounded-lg hover:bg-[#0042d1] transition-colors shadow-md shadow-[#0052FF]/20"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERT MODAL */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => setAlertModal({ isOpen: false, type: '', message: '' })} />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-black/50 border border-slate-200 dark:border-slate-700 w-full max-w-xs overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 space-y-4">
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                {alertModal.type === 'success' ? (
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                )}
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                  {alertModal.type === 'success' ? 'Thành công!' : 'Lỗi'}
                </h3>
                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                  {alertModal.message}
                </p>
              </div>
              <button 
                onClick={() => setAlertModal({ isOpen: false, type: '', message: '' })}
                className="w-full px-4 py-2 bg-[#0052FF] text-white text-[13px] font-bold rounded-lg hover:bg-[#0042d1] transition-colors shadow-md shadow-[#0052FF]/20"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Customers;
