import React from 'react';
import { ShoppingBag, Eye, Star } from 'lucide-react';

/**
 * Component SVG vẽ Logo DRX (phiên bản màu xanh Electric Blue gốc)
 * Được thiết kế dựa trên logo chính thức của đội:
 * - Dải chéo từ trên-trái xuống dưới-phải: Dải đặc màu xanh.
 * - Dải chéo từ trên-phải xuống dưới-trái: Gồm 4 sọc song song màu xanh.
 */
export const DrxLogo = ({ className = "w-6 h-6", color = "#0000C8" }) => (
  <svg 
    viewBox="0 0 240 320" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Dải chéo đặc màu xanh (Top-Left to Bottom-Right) */}
    <path 
      d="M15 40L145 170L190 125L60 10L15 40Z" 
      fill={color} 
    />
    <path 
      d="M80 105L210 235L225 220L95 90L80 105Z" 
      fill={color} 
    />
    
    {/* 4 Dải sọc song song màu xanh (Top-Right to Bottom-Left) */}
    {/* Sọc 1 */}
    <path 
      d="M195 10L180 25L215 60L230 45L195 10Z" 
      fill={color} 
    />
    {/* Sọc 2 */}
    <path 
      d="M165 40L125 80L160 115L200 75L165 40Z" 
      fill={color} 
    />
    {/* Sọc 3 */}
    <path 
      d="M110 95L60 145L95 180L145 130L110 95Z" 
      fill={color} 
    />
    {/* Sọc 4 */}
    <path 
      d="M45 160L10 195L45 230L80 195L45 160Z" 
      fill={color} 
    />

    {/* Phần chữ DRX ở dưới */}
    <path 
      d="M48 260H65C73 260 78 265 78 272V298C78 305 73 310 65 310H48V260ZM63 295C64 295 65 294 65 293V277C65 276 64 275 63 275H58V295H63Z" 
      fill={color} 
    />
    <path 
      d="M93 260H112C120 260 125 265 125 272V282C125 287 122 291 117 293L126 310H112L105 295H103V310H93V260ZM108 281C109 281 110 280 110 279V274C110 273 109 272 108 272H103V281H108Z" 
      fill={color} 
    />
    <path 
      d="M140 260L153 283L166 260H179L161 289L179 310H166L153 292L140 310H127L145 289L127 260H140Z" 
      fill={color} 
    />
  </svg>
);

/**
 * ProductCard Component - Thiết kế theo phong cách Dark Mode Glassmorphism
 * Màu nhấn chủ đạo: Electric Blue (#0052FF) lấy cảm hứng từ Logo DRX
 * 
 * @param {Object} product - Đối tượng chứa thông tin sản phẩm
 * @param {Function} onAddToCart - Callback khi click nút "Thêm vào giỏ"
 * @param {Function} onViewDetail - Callback khi click nút "Xem chi tiết"
 */
const ProductCard = ({ product, onAddToCart, onViewDetail }) => {
  const {
    name = "Bàn phím cơ Razer BlackWidow 2019",
    brand = "Razer",
    category = "Keyboard",
    base_price = 2490000,
    old_price = 2990000,
    stock_quantity = 5,
    images = ["https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop"],
    specifications = {
      "Switch": "Razer Green (Clicky)",
      "Layout": "ANSI (104 phím)",
      "Keycap": "Tương thích PBT Gradient"
    },
    ratings = { average: 4.8 }
  } = product || {};

  // Hàm helper format giá sang VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const discountPercentage = old_price 
    ? Math.round(((old_price - base_price) / old_price) * 100) 
    : 0;

  return (
    <div className="relative group w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#161923]/80 to-[#0e1017]/95 border border-[#222533] hover:border-[#0052ff]/50 backdrop-blur-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(0,82,255,0.15)] overflow-hidden">
      
      {/* 1. Header Badges & DRX Branding */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        {/* Nút giảm giá neon */}
        {discountPercentage > 0 && (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#0052ff] text-white shadow-[0_0_10px_rgba(0,82,255,0.4)] tracking-wide">
            -{discountPercentage}%
          </span>
        )}
        
        {/* Tích hợp nhận diện thương hiệu DRX ẩn nhẹ nhàng */}
        <div className="flex items-center gap-1.5 ml-auto bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/5">
          <DrxLogo className="w-3.5 h-4 text-[#0052ff]" color="#0052ff" />
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">DRX Auth</span>
        </div>
      </div>

      {/* 2. Product Image Container */}
      <div className="relative aspect-square w-full bg-[#090b10] flex items-center justify-center p-6 overflow-hidden">
        {/* Lớp nền tỏa sáng nhẹ phía sau ảnh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,82,255,0.06)_0%,transparent_70%)]" />
        
        <img
          src={images[0]}
          alt={name}
          className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Nút Xem Nhanh xuất hiện khi Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <button 
            onClick={onViewDetail}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-[#1e2230] text-gray-200 hover:text-white border border-[#2d3142] hover:border-[#0052ff] hover:bg-[#0052ff]/10 hover:shadow-[0_0_15px_rgba(0,82,255,0.3)] transition-all duration-200"
            title="Xem chi tiết"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. Product Info Block */}
      <div className="p-5">
        {/* Hãng & Đánh giá */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-[#0052ff] uppercase tracking-wider">{brand}</span>
          <div className="flex items-center gap-1 bg-[#1c1f2e] px-1.5 py-0.5 rounded text-[11px] font-semibold text-amber-400">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {ratings.average.toFixed(1)}
          </div>
        </div>

        {/* Tên sản phẩm */}
        <h3 className="text-sm font-semibold text-gray-100 line-clamp-2 min-h-[40px] mb-3 group-hover:text-white transition-colors">
          {name}
        </h3>

        {/* 4. Thông số kỹ thuật rút gọn (Dynamic Specs) */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-black/25 p-2.5 rounded-lg border border-white/[0.03]">
          {Object.entries(specifications).slice(0, 4).map(([key, val]) => (
            <div key={key} className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-medium">{key}</span>
              <span className="text-[11px] text-gray-300 font-semibold truncate" title={val.toString()}>
                {val.toString()}
              </span>
            </div>
          ))}
        </div>

        {/* 5. Giá bán & CTA Button */}
        <div className="flex items-center justify-between pt-1 border-t border-[#222533]">
          <div className="flex flex-col">
            {old_price && (
              <span className="text-xs text-gray-500 line-through font-medium">
                {formatPrice(old_price)}
              </span>
            )}
            <span className="text-base font-bold text-gray-100 group-hover:text-white">
              {formatPrice(base_price)}
            </span>
          </div>

          {stock_quantity > 0 ? (
            <button
              onClick={onAddToCart}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-[#0052ff] to-[#0042d1] hover:from-[#0062ff] hover:to-[#004cfa] text-white shadow-[0_0_10px_rgba(0,82,255,0.2)] hover:shadow-[0_0_20px_rgba(0,82,255,0.4)] border border-white/10 active:scale-95 transition-all duration-150"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              THÊM GIỎ
            </button>
          ) : (
            <span className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-950/20 text-red-500 border border-red-900/30">
              HẾT HÀNG
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
