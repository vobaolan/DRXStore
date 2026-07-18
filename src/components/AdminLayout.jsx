import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  CreditCard,
  PlusCircle,
  Users,
  Bell,
  Moon,
  Sun,
  Search, 
  LogOut,
  ChevronRight,
  User,
  ScrollText,
  PieChart,
  UsersRound,
  PackageCheck,
  Menu,
  X
} from 'lucide-react';
import OdsLogo from './OdsLogo';
import { AppContext, secureStorage } from '../contexts/AppContext';
import { useContext } from 'react';
import { AIChatbot } from './AIChatbot';

const DateTimeDisplay = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = time.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  
  let lunarString = '';
  try {
    lunarString = new Intl.DateTimeFormat('vi-VN-u-ca-chinese', { day: 'numeric', month: 'long', year: 'numeric' }).format(time);
    // Tweak to look better if needed, e.g. replacing 'tháng' with 'Tháng'
    lunarString = lunarString.charAt(0).toUpperCase() + lunarString.slice(1);
  } catch (e) {
    lunarString = '';
  }

  return (
    <div className="hidden md:flex flex-col items-end justify-center mr-2 border-r border-slate-200 dark:border-slate-700 pr-6">
      <span className="text-[13px] font-extrabold text-[#0052ff] dark:text-[#6699ff] leading-none mb-1 tracking-wide">{timeString}</span>
      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {dateString} {lunarString ? `— ÂL: ${lunarString}` : ''}
      </span>
    </div>
  );
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeUser, logout, orders, isDarkMode, setIsDarkMode, updateUser } = useContext(AppContext);
  const [showNotif, setShowNotif] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState('');
  const [pwdAlert, setPwdAlert] = useState(null);
  const [hasNewNotif, setHasNewNotif] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on path changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);
  // Trigger dot notification on new order
  useEffect(() => {
    if (orders && orders.length > 0) {
      setHasNewNotif(true);
    }
  }, [orders]);

  // Lấy danh sách hàng hóa vừa xuất bán
  const recentSoldItems = orders ? orders
    .slice(0, 10)
    .flatMap(o => o.items.map(i => ({ 
      id: Math.random().toString(),
      itemName: i.name, 
      qty: i.qty,
      time: o.date,
      customer: o.customer
    })))
    .slice(0, 5) : [];

  // useEffect kiểm tra nếu không có activeUser thì đá về login
  useEffect(() => {
    if (!activeUser) {
      // Đảm bảo không bị lặp vô tận nếu load chậm
      const timer = setTimeout(() => {
        if (!secureStorage.getItem('ods_active_user')) {
          navigate('/login');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [activeUser, navigate]);

  const getPageTitle = () => {
    if (location.pathname.startsWith('/products/edit/')) return 'Chỉnh sửa sản phẩm';
    switch(location.pathname) {
      case '/': return 'Tổng quan kinh doanh';
      case '/pos': return 'Bán hàng tại quầy';
      case '/products': return 'Danh sách linh kiện';
      case '/products/add': return 'Thêm linh kiện mới';
      case '/orders': return 'Sổ đơn giao dịch';
      case '/accounts': return 'Quản lý Nhân sự & Phân quyền';
      case '/customers': return 'Trang khách hàng';
      default: return 'Trang quản trị';
    }
  };

  const handleLogout = () => {
    logout(); // Gọi hàm logout từ Context
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/pos', label: 'Bán hàng', icon: CreditCard, permission: 'createOrderPos' },
    { to: '/products', label: 'Hàng hoá', icon: Package, permission: 'viewStock' },
    { to: '/products/add', label: 'Thêm sản phẩm', icon: PlusCircle, permission: 'addProduct' },
    { to: '/orders', label: 'Hóa đơn', icon: ShoppingCart, permission: 'ordersView' },
    { to: '/customers', label: 'Khách hàng', icon: UsersRound, permission: 'viewCustomers' },
    { to: '/accounts', label: 'Quản lý nhân viên', icon: Users, role: 'Admin' },
  ];

  // Nếu chưa lấy được thông tin activeUser, chặn render giao diện để tránh rò rỉ layout
  if (!activeUser) {
    return (
      <div className="h-screen w-screen bg-[#F4F6F9] dark:bg-slate-900 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-[#0052ff] border-t-transparent animate-spin"></div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Đang tải cấu hình quyền...</span>
      </div>
    );
  }

  // Lọc các item được hiển thị trên Sidebar dựa trên quyền hạn (RBAC) của activeUser
  const allowedNavItems = navItems.filter((item) => {
    // Tài khoản thuộc bộ phận Admin có toàn quyền truy cập tất cả menu
    if (activeUser.department === 'Admin') return true;

    // Lọc theo phòng ban/role đặc thù (Quản lý nhân viên chỉ Admin thấy)
    if (item.role && activeUser.department !== item.role) return false;

    // Lọc theo phân quyền chi tiết trong permissions
    if (item.permission) {
      if (item.permission === 'ordersView') {
        // Cho phép xem menu đơn hàng nếu có quyền tạo POS hoặc sửa đơn hàng
        return activeUser.permissions.createOrderPos || activeUser.permissions.editOrder;
      }
      return activeUser.permissions[item.permission];
    }

    return true;
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F6F9] text-[#212529] dark:bg-slate-900 dark:text-white transition-colors duration-300">
      
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 1. SIDEBAR (Sidebar nền trắng, viền mảnh kiểu KiotViet) */}
      <aside className={`fixed inset-y-0 left-0 w-64 retail-sidebar flex flex-col z-40 shadow-xl md:shadow-none bg-white dark:bg-slate-800 border-r border-transparent dark:border-slate-700 transition-transform duration-300 md:translate-x-0 md:static md:flex md:h-screen shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo & Branding */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors duration-300">
          <div className="flex items-center gap-3.5">
            <img 
              src="/assets/logo-ods-vertical.png" 
              alt="ODS Brand Logo (Vertical)" 
              className="h-11 object-contain transition-all duration-300"
              style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'none' }}
              onError={(e) => {
                e.target.style.display = 'none';
                document.getElementById('ods-sidebar-placeholder').style.display = 'flex';
              }}
            />
            {/* Chữ thương hiệu đi kèm làm đầy khoảng trống */}
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-wider text-slate-800 dark:text-white uppercase leading-none">ODS STORE</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">HỆ THỐNG QUẢN TRỊ</span>
            </div>
          </div>

          {/* Close Menu Button for Mobile */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 md:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links - Chỉ hiển thị các mục menu được phép (allowedNavItems) */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 group border
                  ${isActive 
                    ? 'bg-[#E6F0FF] dark:bg-[#0052ff]/20 text-[#0052ff] dark:text-[#6699ff] border-[#0052ff]/20 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 border-transparent'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-[#0052ff]' : 'text-slate-400 group-hover:text-slate-500'}`} />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform opacity-0 group-hover:opacity-100 ${isActive ? 'text-[#0052ff] translate-x-0.5' : 'text-slate-400'}`} />
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Bottom Button */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 transition-colors duration-300">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-550 hover:bg-rose-50 dark:hover:bg-rose-900/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-all duration-200"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* RIGHT CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 2. HEADER */}
        <header className="h-20 retail-header flex items-center justify-between px-4 md:px-8 z-10 shadow-sm bg-white dark:bg-slate-800 dark:border-b dark:border-slate-700 transition-colors duration-300">
          <div className="flex items-center gap-3">
            {/* Hamburger menu button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 md:hidden transition-colors"
              title="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">Hệ thống</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 hidden sm:inline" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide">{getPageTitle()}</h2>
            </div>
          </div>

          {/* Search Bar & User Control */}
          <div className="flex items-center gap-2 md:gap-4">
            
            <DateTimeDisplay />

            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
            >
              {!isDarkMode ? <Sun className="w-4.5 h-4.5 text-orange-500" /> : <Moon className="w-4.5 h-4.5 text-slate-300" />}
            </button>

            {/* Notification Button */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotif(!showNotif); setHasNewNotif(false); }}
                className="relative p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
              >
                <Bell className="w-4.5 h-4.5" />
                {hasNewNotif && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#0052ff] rounded-full shadow-[0_0_8px_rgba(0,82,255,0.7)]" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotif && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Hàng hoá vừa xuất bán</h3>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                    {recentSoldItems.length > 0 ? recentSoldItems.map((item, idx) => (
                      <div key={idx} className="flex gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <div className="mt-0.5 flex-shrink-0 text-emerald-500">
                          <PackageCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-snug">
                            Đã xuất <span className="font-bold text-slate-800 dark:text-white">{item.qty} {item.itemName}</span> cho <span className="font-bold text-[#0052FF] dark:text-[#6699ff]">{item.customer}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{item.time}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">Chưa có giao dịch nào</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Session Profile - Đọc thông tin động của activeUser */}
            <div className="relative">
              <div 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-800 dark:text-white">{activeUser.name}</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{activeUser.department}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0052ff] to-[#00c3ff] p-0.5 shadow-sm shrink-0">
                <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center text-slate-700 font-bold overflow-hidden">
                  {activeUser.avatar ? (
                    <img src={activeUser.avatar} alt={activeUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4.5 h-4.5 text-[#0052ff]" />
                  )}
                </div>
              </div>

              {/* User Dropdown */}
              {showUserDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} />
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <button 
                      onClick={() => { setShowPwdModal(true); setShowUserDropdown(false); }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Đổi mật khẩu
                    </button>
                  </div>
                </>
              )}
            </div>
            </div>
          </div>
        </header>

        {/* 3. MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-[#F4F6F9] dark:bg-slate-900 transition-colors duration-300 p-4 md:p-8 flex flex-col justify-between">
          <div className="max-w-7xl mx-auto w-full flex-1">
            <Outlet />
          </div>
          
          {/* Footer Hệ thống chứa bản quyền & Logo Ngang (Hình 3) */}
          <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider w-full text-center sm:text-left">
            <span>© 2026 ODS Team. All rights reserved.</span>
            <div className={`transition-opacity duration-300 ${isDarkMode ? 'opacity-80 hover:opacity-100' : 'opacity-30 hover:opacity-60'}`}>
              <img 
                src="/assets/logo-ods-horizontal.png" 
                alt="ODS Brand Logo (Horizontal - Hình 3)" 
                className="h-11 object-contain transition-all duration-300"
                style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'none' }}
              />
            </div>
          </footer>
        </main>
      </div>

      {/* MODAL ĐỔI MẬT KHẨU */}
      {showPwdModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop trong suốt không làm mờ đen màn hình */}
          <div className="absolute inset-0 bg-transparent" onClick={() => setShowPwdModal(false)} />
          
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-4">Đổi mật khẩu</h3>
              <input 
                type="text"
                placeholder="Nhập mật khẩu mới..."
                value={pwdForm}
                onChange={(e) => setPwdForm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 text-sm text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 focus:border-[#0052ff] outline-none mb-5 font-medium"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowPwdModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => {
                    if (pwdForm.trim()) {
                      updateUser({ ...activeUser, password: pwdForm.trim() });
                      setShowPwdModal(false);
                      setPwdAlert('Đổi mật khẩu thành công!');
                      setPwdForm('');
                      setTimeout(() => setPwdAlert(null), 3000);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-[#0052ff] text-white text-sm font-bold rounded-xl hover:bg-[#0042d1] transition-colors shadow-md shadow-[#0052ff]/20"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP THÔNG BÁO THÀNH CÔNG */}
      {pwdAlert && (
        <div className="fixed top-24 right-8 z-[70] bg-emerald-50 dark:bg-emerald-900/90 text-emerald-600 dark:text-emerald-400 px-6 py-3.5 rounded-xl shadow-lg border border-emerald-200 dark:border-emerald-800 font-bold animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {pwdAlert}
        </div>
      )}

      {/* TRỢ LÝ HƯỚNG DẪN SỬ DỤNG HỆ THỐNG */}
      <AIChatbot />

    </div>
  );
};

export default AdminLayout;
