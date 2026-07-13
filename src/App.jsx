import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Orders from './pages/Orders';
import POS from './pages/POS';
import Accounts from './pages/Accounts';
import Login from './pages/Login';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Customers from './pages/Customers';
import { AppContext, AppProvider } from './contexts/AppContext';
import { useContext } from 'react';

// Guard component kiểm tra phiên đăng nhập của quản trị viên (Từ Context)
const ProtectedRoute = () => {
  const { activeUser, isAuthReady } = useContext(AppContext);
  
  if (!isAuthReady) {
    // Tránh flash lỗi khi context đang nạp dữ liệu từ bộ nhớ
    return null; 
  }

  if (!activeUser) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Trang đầu tiên bắt buộc phải qua Đăng nhập */}
          <Route path="/login" element={<Login />} />

          {/* Khối các route được bảo vệ (Bắt buộc phải Login mới truy cập được) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<EditProduct />} />
              <Route path="orders" element={<Orders />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="customers" element={<Customers />} />
              <Route path="pos" element={<POS />} />
              <Route path="accounts" element={<Accounts />} />
            </Route>
          </Route>

          {/* Tự động redirect về root nếu gõ sai đường dẫn */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
