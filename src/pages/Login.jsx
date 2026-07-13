import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert } from 'lucide-react';
import DrxLogo from '../components/DrxLogo';
import { AppContext } from '../contexts/AppContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Dùng Context API
  const { login } = useContext(AppContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Gọi hàm login từ Context (Bất đồng bộ)
    const result = await login(email, password);
    if (result.success) {
      // Thành công thì chuyển hướng
      navigate('/');
    } else {
      // Báo lỗi cụ thể
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#F4F6F9] dark:bg-slate-900 px-4 relative transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-black/50 p-8 space-y-6 z-10 transition-colors">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center justify-center">
            <img 
              src="/assets/logo-drx-vertical.png" 
              alt="DRX Brand Logo (Vertical)" 
              className="h-20 object-contain dark:brightness-0 dark:invert transition-all"
              onError={(e) => {
                e.target.style.display = 'none';
                document.getElementById('drx-login-placeholder').style.display = 'flex';
              }}
            />
            
            {/* Fallback SVG/Branding Container */}
            <div 
              id="drx-login-placeholder" 
              className="hidden w-14 h-16 bg-[#E6F0FF] rounded-2xl p-2.5 border border-slate-100 shadow-sm items-center justify-center"
            >
              <DrxLogo className="w-full h-full text-[#0052FF]" color="#0052FF" />
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-xl font-extrabold text-[#212529] dark:text-white tracking-wide">DRX STORE</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">Cổng Quản Trị Hệ Thống</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Email đăng nhập</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-slate-500 group-focus-within:text-[#0052ff] dark:group-focus-within:text-[#6699ff] transition-colors">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nhập email của bạn..."
                autoComplete="new-email"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-sm text-[#212529] dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-[#0052ff] dark:focus:border-[#6699ff] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Mật khẩu</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-slate-500 group-focus-within:text-[#0052ff] dark:group-focus-within:text-[#6699ff] transition-colors">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-sm text-[#212529] dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-[#0052ff] dark:focus:border-[#6699ff] focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-sm font-bold text-white rounded-lg bg-[#0052ff] hover:bg-[#0042d1] shadow-md shadow-[#0052ff]/20 active:scale-[0.98] transition-all"
          >
            ĐĂNG NHẬP
          </button>
        </form>



      </div>

      {/* Logo Watermark Góc Phải Dưới */}
      <div className="absolute bottom-6 right-8 opacity-20 pointer-events-none">
        <img 
          src="/assets/logo-drx-horizontal.png" 
          alt="DRX Brand Logo (Horizontal - Hình 3)" 
          className="h-6 object-contain dark:brightness-0 dark:invert transition-all"
        />
      </div>

    </div>
  );
};

export default Login;
