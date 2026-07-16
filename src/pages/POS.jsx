import React, { useState, useContext, useMemo } from 'react';
import { Search, Filter, ShoppingCart, User, Plus, X, Minus, Trash2, CheckCircle2 } from 'lucide-react';
import { AppContext } from '../contexts/AppContext';

const POS = () => {
  const { products, addCustomer, customers, addOrder, updateCustomer, updateProduct, activeUser } = useContext(AppContext);

  // Left Panel State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  
  // Right Panel (Cart) State
  const [cart, setCart] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [discount, setDiscount] = useState('');
  const [note, setNote] = useState('');

  // Add Customer Modal State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '' });
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: '', message: '' });

  // Filtering products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'Tất cả' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const categories = ['Tất cả', ...new Set(products.map(p => p.category))];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price) + ' ₫';
  };

  const parseNumber = (val) => {
    const num = parseInt(val.replace(/\D/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  const handleDiscountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setDiscount('');
      return;
    }
    setDiscount(new Intl.NumberFormat('en-US').format(Number(rawValue)));
  };

  // Cart Actions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountVal = parseNumber(discount.toString());
  const total = Math.max(0, subtotal - discountVal);

  // Add Customer Handlers
  const handleSaveCustomer = () => {
    if (!newCustomerForm.name.trim() || !newCustomerForm.phone.trim()) {
      setAlertModal({ isOpen: true, type: 'error', message: 'Vui lòng nhập tên và số điện thoại khách hàng!' });
      return;
    }
    const newCustomer = {
      id: Date.now().toString(),
      code: `DRX-KH${Math.floor(1000 + Math.random() * 9000)}`,
      name: newCustomerForm.name,
      phone: newCustomerForm.phone,
      createdAt: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      totalSales: 0
    };
    addCustomer(newCustomer);
    setSelectedCustomerId(newCustomer.id);
    setIsCustomerModalOpen(false);
    setNewCustomerForm({ name: '', phone: '' });
    setAlertModal({ isOpen: true, type: 'success', message: 'Lưu khách hàng thành công!' });
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      setAlertModal({ isOpen: true, type: 'error', message: 'Giỏ hàng đang trống!' });
      return;
    }
    if (!selectedCustomerId) {
      setAlertModal({ isOpen: true, type: 'error', message: 'Vui lòng chọn khách hàng!' });
      return;
    }

    const orderCode = `DRX-HD${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderCode,
      code: orderCode,
      date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      customerId: selectedCustomerId,
      customer: customers.find(c => String(c.id) === String(selectedCustomerId))?.name || 'Khách lẻ',
      customerCode: customers.find(c => String(c.id) === String(selectedCustomerId))?.code || 'KL',
      staffName: activeUser ? activeUser.name : 'Admin',
      total: total,
      discount: discountVal,
      items: cart.map(item => ({
        sku: item.sku,
        name: item.name,
        qty: item.qty,
        unitPrice: item.price,
        discount: 0,
        finalPrice: item.price,
        total: item.price * item.qty
      }))
    };
    addOrder(newOrder);

    const customerToUpdate = customers.find(c => String(c.id) === String(selectedCustomerId));
    if (customerToUpdate) {
      updateCustomer({ ...customerToUpdate, totalSales: customerToUpdate.totalSales + total });
    }

    cart.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        updateProduct({ ...product, stock: Math.max(0, product.stock - item.qty) });
      }
    });

    setAlertModal({ isOpen: true, type: 'success', message: 'Thanh toán thành công!' });
    setCart([]);
    setDiscount('');
    setNote('');
    setSelectedCustomerId('');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      
      {/* LEFT PANEL: PRODUCTS */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-colors">
        {/* Products Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 space-y-4 shrink-0 transition-colors">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-white uppercase tracking-tight">Hàng Hóa</h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative w-full md:w-64 group">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-[#0052ff] transition-colors">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mặt hàng (F3)..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-600 focus:border-[#0052ff] dark:focus:border-[#6699ff] focus:outline-none transition-all shadow-sm"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 md:pb-0 scrollbar-hide">
              {categories.map((cat, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-[11px] font-bold border transition-all whitespace-nowrap ${
                    activeCategory === cat 
                      ? 'bg-[#E6F0FF] dark:bg-[#0052ff]/20 border-[#0052ff]/25 dark:border-[#0052ff]/30 text-[#0052ff] dark:text-[#6699ff]' 
                      : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((p) => (
              <div 
                key={p.id} 
                onClick={() => addToCart(p)}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-[#0052ff] dark:hover:border-[#6699ff] hover:shadow-[0_8px_24px_rgba(0,82,255,0.1)] transition-all cursor-pointer group flex flex-col"
              >
                <div className="w-full h-24 rounded-lg bg-slate-50 dark:bg-slate-700 mb-3 flex items-center justify-center text-slate-300 dark:text-slate-500 group-hover:text-[#0052ff]/50 transition-colors overflow-hidden shrink-0">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingCart className="w-8 h-8 opacity-50" />
                  )}
                </div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-relaxed mb-2 group-hover:text-[#0052ff] dark:group-hover:text-[#6699ff] transition-colors">{p.name}</h3>
                <div className="mt-auto pt-2 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase tracking-wider">{p.sku}</span>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">
                      Tồn: {p.stock}
                    </span>
                  </div>
                  <span className="block text-sm font-extrabold text-[#0052ff] dark:text-[#6699ff]">{formatPrice(p.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* RIGHT PANEL: CART & CHECKOUT */}
      <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm shrink-0 transition-colors">
        
        {/* Customer Select */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center gap-2 shrink-0 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-[#0052ff] dark:text-[#6699ff] shadow-sm shrink-0 transition-colors">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 relative">
            <select 
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 bg-white dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600 focus:border-[#0052ff] outline-none shadow-sm appearance-none cursor-pointer transition-colors"
            >
              <option value="">-- Chọn khách hàng --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => setIsCustomerModalOpen(true)}
            className="w-10 h-10 rounded-lg bg-[#0052ff] text-white hover:bg-[#0042d1] transition-colors flex items-center justify-center shadow-md shadow-[#0052ff]/20 shrink-0"
            title="Thêm khách mới"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-slate-800 min-h-0 transition-colors">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center border border-slate-100 dark:border-slate-600 transition-colors">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider">Chưa có sản phẩm</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 group hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                  <div className="flex-1 min-w-0 space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed pr-6">{item.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0052ff] dark:text-[#6699ff]">{formatPrice(item.price)}</span>
                      
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-500 p-0.5 shadow-sm transition-colors">
                        <button onClick={() => updateQty(item.id, -1)} className="p-1 text-slate-400 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 rounded hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className={`text-xs font-bold w-6 text-center ${item.qty > item.stock ? 'text-rose-500' : 'text-slate-700 dark:text-white'}`}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="p-1 text-slate-400 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 rounded hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="self-start p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all -mr-1 -mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Section */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 shrink-0 space-y-4 transition-colors">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Tổng tiền hàng:</span>
              <span className="font-bold text-slate-800 dark:text-white">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Giảm giá:</span>
              <div className="relative w-28">
                <input 
                  type="text" 
                  value={discount}
                  onChange={handleDiscountChange}
                  placeholder="0"
                  className="w-full pl-2 pr-6 py-1 text-right text-xs font-bold text-rose-500 dark:text-rose-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded outline-none focus:border-rose-400 dark:focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 dark:text-slate-500">₫</span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors">
              <span className="font-extrabold text-slate-800 dark:text-white uppercase tracking-tight text-sm">Khách cần trả:</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <input 
              type="text" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú đơn hàng (F4)..."
              className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10 transition-all shadow-sm"
            />
            <button 
              onClick={handleCheckout}
              className="w-full py-3 bg-[#0052ff] hover:bg-[#0042d1] text-white text-[13px] font-extrabold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 shadow-xl shadow-[#0052ff]/20 transition-all active:scale-[0.98]"
            >
              <CheckCircle2 className="w-5 h-5" />
              Thanh Toán
            </button>
          </div>

        </div>

      </div>

      {/* ADD CUSTOMER MODAL */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => setIsCustomerModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-tight">Thêm Khách Hàng Nhanh</h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Tên khách hàng</label>
                <input 
                  type="text" 
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({...newCustomerForm, name: e.target.value})}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#0052ff] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Số điện thoại</label>
                <input 
                  type="text" 
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({...newCustomerForm, phone: e.target.value})}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#0052ff] transition-colors"
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 transition-colors">
              <button 
                onClick={handleSaveCustomer}
                className="w-full py-2.5 bg-[#0052ff] hover:bg-[#0042d1] text-white text-xs font-bold rounded-xl shadow-md shadow-[#0052ff]/20 transition-colors"
              >
                Lưu khách hàng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ALERT MODAL */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-black/50 border border-slate-200 dark:border-slate-700 w-full max-w-xs overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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

export default POS;
