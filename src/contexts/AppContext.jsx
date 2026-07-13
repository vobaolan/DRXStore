import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_USERS = `${API_BASE}/users`;
const API_CUSTOMERS = `${API_BASE}/customers`;
const API_ORDERS = `${API_BASE}/orders`;
const API_PRODUCTS = `${API_BASE}/products`;

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Global Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('drx_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('drx_dark_mode', isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fetch dữ liệu từ API Backend (json-server)
  const fetchAllData = async () => {
    try {
      const [resUsers, resCustomers, resOrders, resProducts] = await Promise.all([
        fetch(API_USERS),
        fetch(API_CUSTOMERS),
        fetch(API_ORDERS),
        fetch(API_PRODUCTS)
      ]);

      if (resUsers.ok) setUsers(await resUsers.json());
      if (resCustomers.ok) setCustomers(await resCustomers.json());
      if (resOrders.ok) setOrders(await resOrders.json());
      if (resProducts.ok) setProducts(await resProducts.json());
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu từ Server:', error);
    }

    // Vẫn dùng localStorage để giữ phiên Đăng nhập
    const storedActiveUser = localStorage.getItem('drx_active_user');
    if (storedActiveUser) {
      setActiveUser(JSON.parse(storedActiveUser));
    } else {
      setActiveUser(null);
    }
    setIsAuthReady(true);
  };

  // Nạp dữ liệu một lần khi App chạy
  useEffect(() => {
    fetchAllData();
  }, []);

  const login = async (email, password) => {
    try {
      const cleanEmail = email.replace(/\s+/g, '').toLowerCase();
      
      const response = await fetch(API_USERS);
      if (!response.ok) throw new Error('Lỗi mạng');
      const freshUsers = await response.json();
      
      const foundUser = freshUsers.find(u => u.email.replace(/\s+/g, '').toLowerCase() === cleanEmail);
      
      if (!foundUser) return { success: false, message: 'Email đăng nhập không tồn tại.' };
      if (foundUser.password !== password) return { success: false, message: 'Mật khẩu không chính xác.' };
      if (!foundUser.isActive) return { success: false, message: 'Tài khoản này đã bị khóa. Vui lòng liên hệ Admin tối cao.' };
      
      localStorage.setItem('admin_token', 'DRX_TOKEN_MOCK_123456');
      localStorage.setItem('drx_active_user', JSON.stringify(foundUser));
      setActiveUser(foundUser);
      
      return { success: true };
    } catch (error) {
      console.error('Lỗi kết nối Server:', error);
      return { success: false, message: 'Lỗi kết nối máy chủ API (Chưa bật json-server). Vui lòng kiểm tra lại mạng.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('drx_active_user');
    setActiveUser(null);
  };

  // --- USERS API ---
  const addUser = async (newUser) => {
    try {
      const response = await fetch(API_USERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const created = await response.json();
      setUsers(prev => [...prev, created]);
    } catch (error) { console.error('Lỗi tạo user:', error); }
  };

  const updateUser = async (updatedUser) => {
    try {
      const response = await fetch(`${API_USERS}/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      if (response.ok) {
        setUsers(prev => prev.map(u => (String(u.id) === String(updatedUser.id) ? updatedUser : u)));
        if (activeUser && String(activeUser.id) === String(updatedUser.id)) {
          setActiveUser(updatedUser);
          localStorage.setItem('drx_active_user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) { console.error('Lỗi cập nhật user:', error); }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`${API_USERS}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setUsers(prev => prev.filter(u => String(u.id) !== String(id)));
        if (activeUser && String(activeUser.id) === String(id)) logout();
      }
    } catch (error) { console.error('Lỗi xóa user:', error); }
  };

  // --- CUSTOMERS API ---
  const addCustomer = async (newItem) => {
    try {
      const res = await fetch(API_CUSTOMERS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newItem) });
      const created = await res.json();
      setCustomers(prev => [...prev, created]);
    } catch (e) { console.error(e); }
  };
  const updateCustomer = async (updatedItem) => {
    try {
      const res = await fetch(`${API_CUSTOMERS}/${updatedItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedItem) });
      if (res.ok) setCustomers(prev => prev.map(item => String(item.id) === String(updatedItem.id) ? updatedItem : item));
    } catch (e) { console.error(e); }
  };
  const deleteCustomer = async (id) => {
    try {
      const res = await fetch(`${API_CUSTOMERS}/${id}`, { method: 'DELETE' });
      if (res.ok) setCustomers(prev => prev.filter(item => String(item.id) !== String(id)));
    } catch (e) { console.error(e); }
  };

  // --- ORDERS API ---
  const addOrder = async (newItem) => {
    try {
      const res = await fetch(API_ORDERS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newItem) });
      const created = await res.json();
      setOrders(prev => [created, ...prev]);
    } catch (e) { console.error(e); }
  };
  const deleteOrder = async (id) => {
    try {
      const res = await fetch(`${API_ORDERS}/${id}`, { method: 'DELETE' });
      if (res.ok) setOrders(prev => prev.filter(item => String(item.id) !== String(id)));
    } catch (e) { console.error(e); }
  };

  // --- PRODUCTS API ---
  const addProduct = async (newItem) => {
    try {
      const res = await fetch(API_PRODUCTS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newItem) });
      const created = await res.json();
      setProducts(prev => [created, ...prev]);
    } catch (e) { console.error(e); }
  };
  const updateProduct = async (updatedItem) => {
    try {
      const res = await fetch(`${API_PRODUCTS}/${updatedItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedItem) });
      if (res.ok) setProducts(prev => prev.map(item => String(item.id) === String(updatedItem.id) ? updatedItem : item));
    } catch (e) { console.error(e); }
  };
  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API_PRODUCTS}/${id}`, { method: 'DELETE' });
      if (res.ok) setProducts(prev => prev.filter(item => String(item.id) !== String(id)));
    } catch (e) { console.error(e); }
  };

  return (
    <AppContext.Provider value={{ 
      users, activeUser, isAuthReady, fetchUsers: fetchAllData, 
      login, logout, addUser, updateUser, deleteUser,
      customers, addCustomer, updateCustomer, deleteCustomer,
      orders, addOrder, deleteOrder,
      products, setProducts, addProduct, updateProduct, deleteProduct,
      isDarkMode, setIsDarkMode
    }}>
      {children}
    </AppContext.Provider>
  );
};
