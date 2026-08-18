/**
 * DRX STORE - MODULE XÁC THỰC NGƯỜI DÙNG (AUTHENTICATION MODULE)
 * Kế thừa chuẩn kiến thức bài tập Javascript DOM:
 * - timTaiKhoan(), dangKyTaiKhoan(), dangNhapTaiKhoan(), dangXuatTaiKhoan()
 * - Quản lý số dư ví người dùng (DRX Wallet Balance)
 * - Cập nhật thông tin người dùng trên thanh Header
 */

// =============================================================================
// CỤM 1: TÌM TÀI KHOẢN TRONG DANH SÁCH LOCALSTORAGE (FIND USER)
// =============================================================================
function timTaiKhoan(taiKhoan) {
  const danhSach = Storage.getUsers();
  for (let i = 0; i < danhSach.length; i++) {
    if (danhSach[i].taiKhoan.toLowerCase() === taiKhoan.toLowerCase()) {
      return danhSach[i];
    }
  }
  return null;
}

// =============================================================================
// CỤM 2: ĐĂNG KÝ TÀI KHOẢN MỚI (USER REGISTRATION)
// - Kiểm tra tính hợp lệ tên tài khoản, mật khẩu
// - Kiểm tra tài khoản đã tồn tại chưa
// - Tặng ngay 1.000.000đ vào ví mừng thành viên mới
// =============================================================================
function dangKyTaiKhoan(taiKhoan, matKhau, hoTen, email) {
  // 2.1. Kiểm tra dữ liệu bắt buộc
  if (!taiKhoan || !matKhau) {
    return { success: false, message: "Vui lòng nhập đầy đủ tên tài khoản và mật khẩu!" };
  }

  // 2.2. Kiểm tra độ dài tối thiểu
  if (taiKhoan.length < 3) {
    return { success: false, message: "Tên tài khoản phải có ít nhất 3 ký tự!" };
  }

  if (matKhau.length < 6) {
    return { success: false, message: "Mật khẩu phải có ít nhất 6 ký tự!" };
  }

  // 2.3. Kiểm tra trùng lặp tài khoản
  const daTonTai = timTaiKhoan(taiKhoan);
  if (daTonTai !== null) {
    return { success: false, message: "Tài khoản đã tồn tại, vui lòng chọn tên khác!" };
  }

  // 2.4. Khởi tạo đối tượng người dùng mới
  const danhSach = Storage.getUsers();
  const newUser = {
    taiKhoan: taiKhoan,
    matKhau: matKhau,
    hoTen: hoTen || taiKhoan,
    email: email || `${taiKhoan}@drxstore.vn`,
    walletBalance: 1000000, // Tặng ngay 1.000.000đ vào ví DRX Store chào mừng tân thủ
    createdAt: new Date().toLocaleDateString("vi-VN")
  };

  // 2.5. Lưu người dùng vào LocalStorage
  danhSach.push(newUser);
  Storage.saveUsers(danhSach);

  // 2.6. Tự động đăng nhập luôn sau khi đăng ký thành công
  Storage.setCurrentUser(newUser);
  return { success: true, message: "Đăng ký thành công! Bạn nhận được 1.000.000đ tiền mừng vào ví." };
}

// =============================================================================
// CỤM 3: ĐĂNG NHẬP TÀI KHOẢN (USER LOGIN)
// - Kiểm tra tên tài khoản và mật khẩu
// - Lưu phiên đăng nhập vào LocalStorage
// =============================================================================
function dangNhapTaiKhoan(taiKhoan, matKhau) {
  if (!taiKhoan || !matKhau) {
    return { success: false, message: "Vui lòng nhập tài khoản và mật khẩu!" };
  }

  const user = timTaiKhoan(taiKhoan);
  if (user === null || user.matKhau !== matKhau) {
    return { success: false, message: "Sai tài khoản hoặc mật khẩu!" };
  }

  Storage.setCurrentUser(user);
  return { success: true, message: `Chào mừng trở lại, ${user.hoTen || user.taiKhoan}!` };
}

// =============================================================================
// CỤM 4: ĐĂNG XUẤT TÀI KHOẢN (USER LOGOUT)
// =============================================================================
function dangXuatTaiKhoan() {
  Storage.setCurrentUser(null);
  window.location.reload();
}

// =============================================================================
// CỤM 5: NẠP TIỀN VÀO VÍ DRX STORE (TOP UP WALLET)
// =============================================================================
function napTienVi(soTien = 500000) {
  const currentUser = Storage.getCurrentUser();
  if (!currentUser) return false;

  currentUser.walletBalance = (currentUser.walletBalance || 0) + soTien;
  Storage.setCurrentUser(currentUser);

  // Cập nhật lại trong danh sách người dùng
  const users = Storage.getUsers();
  const index = users.findIndex(u => u.taiKhoan === currentUser.taiKhoan);
  if (index !== -1) {
    users[index].walletBalance = currentUser.walletBalance;
    Storage.saveUsers(users);
  }

  return true;
}

// =============================================================================
// CỤM 6: CẬP NHẬT GIAO DIỆN TÀI KHOẢN TRÊN THANH HEADER
// - Hiển thị Avatar, Tên, Số dư ví nếu đã đăng nhập
// - Hiển thị nút "Đăng nhập / Đăng ký" nếu chưa đăng nhập
// =============================================================================
function capNhatThanhHeaderUser() {
  const userArea = document.getElementById("headerUserArea");
  if (!userArea) return;

  const currentUser = Storage.getCurrentUser();

  if (currentUser) {
    const formattedBalance = (currentUser.walletBalance || 0).toLocaleString("vi-VN") + "đ";
    userArea.innerHTML = `
      <div class="user-profile-widget">
        <div class="user-avatar-badge">
          <span class="user-avatar-text">${currentUser.taiKhoan.charAt(0).toUpperCase()}</span>
          <span class="user-status-dot"></span>
        </div>
        <div class="user-info-text">
          <div class="user-name">${currentUser.hoTen || currentUser.taiKhoan}</div>
          <div class="user-wallet" title="Số dư ví DRX Store">Ví: <b>${formattedBalance}</b></div>
        </div>
        <div class="user-dropdown-menu">
          <button onclick="napTienViVaThongBao()" class="dropdown-item btn-deposit">💳 Nạp +500.000đ vào ví</button>
          <hr class="dropdown-divider">
          <button onclick="dangXuatTaiKhoan()" class="dropdown-item text-danger">🚪 Đăng xuất</button>
        </div>
      </div>
    `;
  } else {
    userArea.innerHTML = `
      <div class="auth-buttons-group">
        <button class="btn btn-outline btn-sm" onclick="moModalAuth('login')">Đăng nhập</button>
        <button class="btn btn-primary btn-sm" onclick="moModalAuth('register')">Đăng ký</button>
      </div>
    `;
  }
}

// 6.1. Hàm tiện ích nạp tiền và hiển thị Toast thông báo
function napTienViVaThongBao() {
  if (napTienVi(500000)) {
    if (typeof showToast === "function") {
      showToast("Nạp thành công 500.000đ vào ví DRX Store!", "success");
    }
    capNhatThanhHeaderUser();
  }
}

