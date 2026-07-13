import React, { useState, useEffect, useContext } from 'react';
import { X, Image as ImageIcon, ChevronDown, Info, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateProduct, products } = useContext(AppContext);
  const [images, setImages] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');

  const [brandsList, setBrandsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  
  const [originalProduct, setOriginalProduct] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', value: '' });
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: '', message: '' });

  useEffect(() => {
    if (products) {
      const prodBrands = [...new Set(products.map(p => p.brand))].filter(Boolean);
      const prodCategories = [...new Set(products.map(p => p.category))].filter(Boolean);
      
      const customBrands = JSON.parse(localStorage.getItem('drx_custom_brands') || '[]');
      const customCategories = JSON.parse(localStorage.getItem('drx_custom_categories') || '[]');
      
      setBrandsList([...new Set([...prodBrands, ...customBrands])]);
      setCategoriesList([...new Set([...prodCategories, ...customCategories])]);
    }
  }, [products]);

  useEffect(() => {
    if (products && id) {
      const product = products.find(p => p.id === id || p.sku === id);
      if (product) {
        setSku(product.sku || '');
        setName(product.name || '');
        setBrand(product.brand || '');
        setCategory(product.category || '');
        setPrice(product.price ? product.price.toString() : '');
        setCostPrice(product.costPrice ? product.costPrice.toString() : '');
        setStock(product.stock ? product.stock.toString() : '');
        setDescription(product.description || '');
        setCurrentTime(product.createdAt || '');
        if (product.image) {
          setImages([product.image]);
        }
        setOriginalProduct(product);
      }
    }
  }, [products, id]);

  // Handle Image Upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handlePriceChange = (e, setter) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setter('');
      return;
    }
    setter(new Intl.NumberFormat('en-US').format(Number(rawValue)));
  };

  const handleCreateBrand = () => {
    setModalConfig({ isOpen: true, type: 'brand', value: '' });
  };

  const handleCreateCategory = () => {
    setModalConfig({ isOpen: true, type: 'category', value: '' });
  };

  const handleModalSubmit = () => {
    if (!modalConfig.value.trim()) return;
    const formatted = modalConfig.value.trim();
    
    if (modalConfig.type === 'brand') {
      if (!brandsList.includes(formatted)) {
        setBrandsList(prev => [...prev, formatted]);
        const customBrands = JSON.parse(localStorage.getItem('drx_custom_brands') || '[]');
        localStorage.setItem('drx_custom_brands', JSON.stringify([...new Set([...customBrands, formatted])]));
      }
      setBrand(formatted);
    } else {
      if (!categoriesList.includes(formatted)) {
        setCategoriesList(prev => [...prev, formatted]);
        const customCategories = JSON.parse(localStorage.getItem('drx_custom_categories') || '[]');
        localStorage.setItem('drx_custom_categories', JSON.stringify([...new Set([...customCategories, formatted])]));
      }
      setCategory(formatted);
    }
    setModalConfig({ isOpen: false, type: '', value: '' });
  };

  const handleSave = (stayOnPage = false) => {
    if (!name) {
      setAlertModal({ isOpen: true, type: 'error', message: 'Vui lòng nhập tên sản phẩm!' });
      return;
    }
    const updatedProduct = {
      ...(originalProduct || {}),
      id: id,
      name,
      sku,
      brand: brand || 'Khác',
      category: category || 'Khác',
      price: Number(String(price).replace(/,/g, '')) || 0,
      costPrice: Number(String(costPrice).replace(/,/g, '')) || 0,
      stock: Number(stock) || 0,
      description,
      image: images.length > 0 ? images[0] : null
    };
    updateProduct(updatedProduct);
    navigate('/products');
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-4">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white uppercase tracking-tight">Chỉnh sửa sản phẩm</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Cập nhật thông tin chi tiết của linh kiện</p>
        </div>
        <button 
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[13px] font-bold rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <X className="w-4 h-4" />
          Hủy bỏ
        </button>
      </div>

      {/* TABS (Simplified) */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-700 mb-6">
        <button className="pb-3 text-[13px] font-bold text-[#0052FF] border-b-2 border-[#0052FF]">
          Thông tin chung
        </button>
      </div>

      {/* MAIN FORM */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6 transition-colors">
        
        {/* ROW 1: Mã hàng & Thời gian tạo */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Mã hàng (SKU)</label>
            <input 
              type="text" 
              value={sku}
              readOnly
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 text-[13px] font-bold text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Thời gian tạo</label>
            <input 
              type="text" 
              value={currentTime}
              readOnly
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 text-[13px] font-semibold text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-not-allowed"
            />
          </div>
        </div>

        {/* ROW 2: Tên sản phẩm & Hình ảnh */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col h-full">
            <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Tên sản phẩm <span className="text-rose-500">*</span></label>
            <textarea 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên sản phẩm..."
              className="w-full flex-1 min-h-[100px] px-3 py-2 bg-slate-50 dark:bg-slate-900/50 text-[13px] font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-[#0052FF] outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Hình ảnh</label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-[100px] h-[100px] rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden group">
                  <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-50"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              
              <label className="w-[100px] h-[100px] rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-[#0052FF] mb-1 transition-colors" />
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#0052FF]">Thêm ảnh</span>
              </label>
            </div>
          </div>
        </div>

        {/* ROW 2.5: Thương hiệu & Nhóm hàng */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Hãng sản xuất (Thương hiệu)</label>
              <button 
                onClick={handleCreateBrand}
                className="text-[10px] font-bold text-[#0052FF] hover:underline"
              >
                + Tạo mới
              </button>
            </div>
            <select 
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 text-[13px] font-bold text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-[#0052FF] outline-none"
            >
              <option value="" disabled>-- Chọn hãng sản xuất --</option>
              {brandsList.map((b, i) => (
                <option key={i} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Danh mục (Nhóm hàng)</label>
              <button 
                onClick={handleCreateCategory}
                className="text-[10px] font-bold text-[#0052FF] hover:underline"
              >
                + Tạo mới
              </button>
            </div>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 text-[13px] font-bold text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-[#0052FF] outline-none"
            >
              <option value="" disabled>-- Chọn danh mục --</option>
              {categoriesList.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* ROW 3: Giá bán & Giá vốn */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Giá bán</label>
            <div className="relative">
              <input 
                type="text" 
                value={price}
                onChange={(e) => handlePriceChange(e, setPrice)}
                placeholder="0"
                className="w-full px-3 py-2 pr-8 bg-slate-50 dark:bg-slate-900/50 text-[13px] font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-[#0052FF] outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">₫</span>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Giá vốn</label>
            <div className="relative">
              <input 
                type="text" 
                value={costPrice}
                onChange={(e) => handlePriceChange(e, setCostPrice)}
                placeholder="0"
                className="w-full px-3 py-2 pr-8 bg-slate-50 dark:bg-slate-900/50 text-[13px] font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-[#0052FF] outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">₫</span>
            </div>
          </div>
        </div>

        {/* ROW 4: Tồn kho & Khách đặt */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Số lượng nhập kho</label>
            <input 
              type="number" 
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 text-[13px] font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-[#0052FF] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Khách đặt</label>
            <input 
              type="number" 
              placeholder="0"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 text-[13px] font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-[#0052FF] outline-none"
            />
          </div>
        </div>

        {/* ROW 5: Mô tả */}
        <div>
          <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Mô tả sản phẩm</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập mô tả chi tiết sản phẩm..."
            className="w-full min-h-[120px] px-3 py-2 bg-slate-50 dark:bg-slate-900/50 text-[13px] text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-[#0052FF] outline-none resize-none"
          />
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="flex justify-end pt-6 mt-6 border-t border-slate-200 dark:border-slate-700 transition-colors">
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/products')}
            className="px-8 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors border border-slate-200 dark:border-slate-600 shadow-sm"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={() => handleSave(false)}
            className="px-10 py-3 bg-[#0052ff] hover:bg-[#0042d1] text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-[#0052ff]/20"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* CUSTOM MODAL */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 dark:border-slate-700 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50/50">
              <h3 className="font-bold text-slate-800">
                {modalConfig.type === 'brand' ? 'Tạo hãng sản xuất mới' : 'Tạo danh mục mới'}
              </h3>
              <button 
                onClick={() => setModalConfig({ isOpen: false, type: '', value: '' })}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Tên hiển thị <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  autoFocus
                  value={modalConfig.value}
                  onChange={(e) => setModalConfig(prev => ({ ...prev, value: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleModalSubmit()}
                  placeholder={modalConfig.type === 'brand' ? 'Nhập tên hãng...' : 'Nhập tên danh mục...'}
                  className="w-full px-3 py-2 bg-white text-[13px] font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-[#0052FF] outline-none shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button 
                  onClick={() => setModalConfig({ isOpen: false, type: '', value: '' })}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[13px] font-bold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleModalSubmit}
                  className="flex-1 px-4 py-2 bg-[#0052FF] text-white text-[13px] font-bold rounded-lg hover:bg-[#0042d1] transition-colors shadow-md shadow-[#0052FF]/20"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALERT MODAL */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 dark:border-slate-700 w-full max-w-xs overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 space-y-4">
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                {alertModal.type === 'success' ? (
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                )}
                <h3 className="font-bold text-slate-800 text-lg">
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

export default EditProduct;
