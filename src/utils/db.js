// Giả lập Cơ sở dữ liệu người dùng lưu trong localStorage

const defaultUsers = [
  {
    id: 1,
    name: 'Nguyễn Minh Triết',
    department: 'Kho hàng',
    email: 'trietnm@drxstore.vn',
    password: 'password123',
    isActive: true,
    permissions: {
      viewStock: true,
      addProduct: true,
      importImei: true,
      createOrderPos: false,
      editOrder: false,
      cancelOrder: false,
      viewRevenue: false,
      exportExcel: false
    }
  },
  {
    id: 2,
    name: 'Trần Thị Mỹ Linh',
    department: 'Bán hàng',
    email: 'linhttm@drxstore.vn',
    password: 'password123',
    isActive: true,
    permissions: {
      viewStock: false,
      addProduct: false,
      importImei: false,
      createOrderPos: true,
      editOrder: true,
      cancelOrder: false,
      viewRevenue: false,
      exportExcel: false
    }
  },
  {
    id: 3,
    name: 'Fizzy DRX (Super Admin)',
    department: 'Admin',
    email: 'admin@drxstore.vn',
    password: 'admin123', // Tài khoản Admin gốc
    isActive: true,
    permissions: {
      viewStock: true,
      addProduct: true,
      importImei: true,
      createOrderPos: true,
      editOrder: true,
      cancelOrder: true,
      viewRevenue: true,
      exportExcel: true
    }
  },
  {
    id: 4,
    name: 'Lê Văn Nam',
    department: 'Kho hàng',
    email: 'namlv@drxstore.vn',
    password: 'password123',
    isActive: false,
    permissions: {
      viewStock: true,
      addProduct: false,
      importImei: false,
      createOrderPos: false,
      editOrder: false,
      cancelOrder: false,
      viewRevenue: false,
      exportExcel: false
    }
  }
];

// Khởi tạo Database nếu chưa tồn tại
export const initDb = () => {
  const users = localStorage.getItem('drx_users');
  if (!users) {
    // Nếu chưa có thì khởi tạo mặc định
    localStorage.setItem('drx_users', JSON.stringify(defaultUsers));
    console.log('Database giả lập (localStorage) đã được khởi tạo với tài khoản Admin gốc.');
    console.log('Total users in DB:', defaultUsers.length);
  } else {
    // Nếu đã có, tuyệt đối không ghi đè, chỉ in số lượng ra log
    const parsedUsers = JSON.parse(users);
    console.log('Total users in DB:', parsedUsers.length);
  }
};

// Lấy danh sách nhân viên
export const getUsers = () => {
  initDb();
  return JSON.parse(localStorage.getItem('drx_users'));
};

// Lưu danh sách nhân viên đè lên localStorage
export const saveUsers = (users) => {
  console.log('Đang ghi vào DB:', users);
  localStorage.setItem('drx_users', JSON.stringify(users));
  console.log('Ghi thành công!');
};

// Xác thực đăng nhập của nhân viên (Đã áp dụng các bản vá bảo mật và chống sai sót dữ liệu)
export const verifyUser = (email, password) => {
  // Khởi tạo DB nếu cần thiết
  initDb();
  
  // BẮT BUỘC đọc trực tiếp từ localStorage khi hàm được gọi để lấy dữ liệu mới nhất
  const users = JSON.parse(localStorage.getItem('drx_users')) || [];
  
  // So sánh email sử dụng .trim().toLowerCase() ở cả 2 đầu để triệt tiêu khoảng trắng và lỗi chữ hoa thường
  const foundUser = users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
  
  if (!foundUser) return { success: false, message: 'Email đăng nhập không tồn tại.' };
  if (foundUser.password !== password) return { success: false, message: 'Mật khẩu không chính xác.' };
  if (!foundUser.isActive) return { success: false, message: 'Tài khoản này đã bị khóa. Vui lòng liên hệ Admin tối cao.' };
  
  return { success: true, user: foundUser };
};
