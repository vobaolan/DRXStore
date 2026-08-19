/**
 * DRX STORE - MODULE GIỎ HÀNG & THANH TOÁN (CART & CHECKOUT MODULE)
 * Quản lý các nghiệp vụ:
 * - Thêm / Xóa sản phẩm khỏi giỏ hàng
 * - Tính toán tổng tiền, chiết khấu và áp dụng mã Voucher
 * - Xử lý tiến trình thanh toán trừ số dư ví và tạo mã kích hoạt Key Steam
 */

// =============================================================================
// CỤM 1: TIỆN ÍCH ĐỊNH DẠNG TIỀN TỆ VNĐ (FORMAT CURRENCY)
// =============================================================================
function dinhDangTien(soTien) {
  if (soTien === 0) return "Miễn phí";
  return Number(soTien).toLocaleString("vi-VN") + "đ";
}

// =============================================================================
// CỤM 2: THÊM GAME VÀO GIỎ HÀNG (ADD TO CART)
// - Kiểm tra game đã có trong Thư viện đã mua chưa
// - Kiểm tra game đã tồn tại trong giỏ hàng chưa
// - Lưu vào LocalStorage và cập nhật Badge Header
// =============================================================================
function themVaoGio(gameId) {
  const cart = Storage.getCart();
  const game = GAME_DATABASE.find(g => g.id === gameId);

  if (!game) {
    showToast("Không tìm thấy thông tin game!", "error");
    return;
  }

  const library = Storage.getLibrary();
  if (library.some(item => item.gameId === gameId)) {
    showToast(`Bạn đã sở hữu "${game.title}" trong Thư viện Game!`, "info");
    return;
  }

  const existingItem = cart.find(item => item.id === gameId);
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
    showToast(`Đã tăng số lượng "${game.title}"!`, "success");
  } else {
    cart.push({
      id: game.id,
      title: game.title,
      price: game.price,
      originalPrice: game.originalPrice,
      discountPercent: game.discountPercent,
      cover: game.cover,
      platforms: game.platforms,
      quantity: 1
    });
    showToast(`Đã thêm "${game.title}" vào giỏ hàng!`, "success");
  }

  Storage.saveCart(cart);
  capNhatThanhHeaderCartBadge();

  if (typeof renderCartPage === "function") renderCartPage();
  if (typeof renderCartDrawer === "function") renderCartDrawer();
}

function thayDoiSoLuong(gameId, delta) {
  let cart = Storage.getCart();
  const item = cart.find(g => g.id === gameId);
  if (item) {
    item.quantity = (item.quantity || 1) + delta;
    if (item.quantity <= 0) {
      xoaKhoiGio(gameId);
      return;
    }
    Storage.saveCart(cart);
    capNhatThanhHeaderCartBadge();
    if (typeof renderCartDrawer === "function") renderCartDrawer();
  }
}
// =============================================================================
// CỤM 3: XÓA SẢN PHẨM KHỎI GIỎ HÀNG (REMOVE FROM CART)
// =============================================================================

// 3.1. Xóa 1 game cụ thể khỏi giỏ
function xoaKhoiGio(gameId) {
  let cart = Storage.getCart();
  const item = cart.find(g => g.id === gameId);
  cart = cart.filter(g => g.id !== gameId);
  Storage.saveCart(cart);
  capNhatThanhHeaderCartBadge();

  if (item) {
    showToast(`Đã bỏ "${item.title}" khỏi giỏ hàng!`, "info");
  }

  // Làm mới giao diện
  if (typeof renderCartPage === "function") renderCartPage();
  if (typeof renderCartDrawer === "function") renderCartDrawer();
}

// 3.2. Xóa toàn bộ giỏ hàng (Clear Cart)
function xoaToanBoGio() {
  Storage.saveCart([]);
  Storage.setCoupon(null);
  capNhatThanhHeaderCartBadge();
  showToast("Đã dọn sạch giỏ hàng!", "info");

  if (typeof renderCartPage === "function") renderCartPage();
  if (typeof renderCartDrawer === "function") renderCartDrawer();
}

// =============================================================================
// CỤM 4: TÍNH TOÁN TỔNG TIỀN VÀ KHUYẾN MÃI VOUCHER (CALCULATE TOTAL)
// =============================================================================
function tinhToanTongTienGioHang() {
  const cart = Storage.getCart();
  const coupon = Storage.getCoupon();

  let tamTinh = 0;
  let giaGoc = 0;

  // 4.1. Lặp qua từng game để cộng dồn tiền
  for (let i = 0; i < cart.length; i++) {
    const qty = cart[i].quantity || 1;
    tamTinh += cart[i].price * qty;
    giaGoc += (cart[i].originalPrice || cart[i].price) * qty;
  }

  let giamGiaKhuyenMai = giaGoc - tamTinh; // Mức giảm trực tiếp trên giá bán
  let giamGiaVoucher = 0;

  // 4.2. Tính mức giảm thêm nếu có áp dụng mã Voucher
  if (coupon && coupon.discount) {
    giamGiaVoucher = Math.round((tamTinh * coupon.discount) / 100);
  }

  let tongThanhToan = Math.max(0, tamTinh - giamGiaVoucher);

  return {
    soLuong: cart.reduce((total, item) => total + (item.quantity || 1), 0),
    giaGoc,
    tamTinh,
    giamGiaKhuyenMai,
    giamGiaVoucher,
    coupon,
    tongThanhToan
  };
}

// =============================================================================
// CỤM 5: ÁP DỤNG VÀ HỦY MÃ GIẢM GIÁ (COUPON / VOUCHER)
// =============================================================================

// 5.1. Áp dụng mã Voucher
function apDungVoucher(code) {
  const cleanCode = (code || "").trim().toUpperCase();
  if (!cleanCode) {
    showToast("Vui lòng nhập mã giảm giá!", "error");
    return false;
  }

  if (VOUCHERS[cleanCode]) {
    const voucherInfo = {
      code: cleanCode,
      discount: VOUCHERS[cleanCode].discount,
      desc: VOUCHERS[cleanCode].desc
    };
    Storage.setCoupon(voucherInfo);
    showToast(`Áp dụng mã ${cleanCode} thành công! Giảm ${voucherInfo.discount}%`, "success");
    if (typeof renderCartPage === "function") renderCartPage();
    if (typeof renderCartDrawer === "function") renderCartDrawer();
    return true;
  } else {
    showToast("Mã giảm giá không hợp lệ hoặc đã hết hạn!", "error");
    return false;
  }
}

// 5.2. Hủy mã Voucher
function huyVoucher() {
  Storage.setCoupon(null);
  showToast("Đã gỡ mã giảm giá!", "info");
  if (typeof renderCartPage === "function") renderCartPage();
  if (typeof renderCartDrawer === "function") renderCartDrawer();
}

// =============================================================================
// CỤM 6: QUẢN LÝ DANH SÁCH YÊU THÍCH (WISHLIST)
// =============================================================================
function toggleWishlist(gameId) {
  let wishlist = Storage.getWishlist();
  const game = GAME_DATABASE.find(g => g.id === gameId);
  const exists = wishlist.includes(gameId);

  if (exists) {
    wishlist = wishlist.filter(id => id !== gameId);
    showToast(`Đã xóa "${game ? game.title : 'Game'}" khỏi danh sách yêu thích!`, "info");
  } else {
    wishlist.push(gameId);
    showToast(`Đã thêm "${game ? game.title : 'Game'}" vào danh sách yêu thích!`, "success");
  }

  Storage.saveWishlist(wishlist);
  capNhatThanhHeaderWishlistBadge();
}

// =============================================================================
// CỤM 7: TIỆN ÍCH TẠO MÃ KÍCH HOẠT KEY STEAM TỰ ĐỘNG (GENERATE ACTIVATION KEY)
// =============================================================================
function sinhMaKichHoatSteam(gameId) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const genPart = (len) => {
    let res = "";
    for (let i = 0; i < len; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
  };
  const prefix = gameId.replace("GAME_", "DRX");
  return `${prefix}-${genPart(4)}-${genPart(4)}-${genPart(4)}`;
}

// =============================================================================
// CỤM 8: TIẾN TRÌNH THANH TOÁN ĐƠN HÀNG (CHECKOUT PROCESS)
// - Kiểm tra tài khoản và số dư ví
// - Trừ tiền ví, sinh Key game và lưu vào Thư viện
// - Dọn sạch giỏ hàng và cập nhật giao diện
// =============================================================================
function thucHienThanhToan(phuongThuc = "wallet") {
  const cart = Storage.getCart();
  if (cart.length === 0) {
    showToast("Giỏ hàng của bạn đang trống!", "error");
    return null;
  }

  const currentUser = Storage.getCurrentUser();
  const summary = tinhToanTongTienGioHang();

  // 8.1. Nếu thanh toán bằng ví DRX Store, kiểm tra số dư
  if (phuongThuc === "wallet") {
    if (!currentUser) {
      moModalAuth('login');
      showToast("Vui lòng đăng nhập để thanh toán đơn hàng!", "info");
      return null;
    }

    const currentBalance = currentUser.walletBalance || 0;
    if (currentBalance < summary.tongThanhToan) {
      showToast(`Số dư ví không đủ (Còn ${dinhDangTien(currentBalance)}, Cần ${dinhDangTien(summary.tongThanhToan)}). Vui lòng nạp thêm tiền!`, "error");
      return null;
    }

    // Trừ tiền trong ví
    currentUser.walletBalance -= summary.tongThanhToan;
    Storage.setCurrentUser(currentUser);

    // Cập nhật lại trong danh sách người dùng
    const users = Storage.getUsers();
    const idx = users.findIndex(u => u.taiKhoan === currentUser.taiKhoan);
    if (idx !== -1) {
      users[idx].walletBalance = currentUser.walletBalance;
      Storage.saveUsers(users);
    }
  }

  // 8.2. Chuyển toàn bộ game trong giỏ vào Thư viện cá nhân (Library)
  const library = Storage.getLibrary();
  const newPurchases = [];

  cart.forEach(item => {
    if (!library.some(lib => lib.gameId === item.id)) {
      const purchaseRecord = {
        gameId: item.id,
        purchaseDate: new Date().toLocaleDateString("vi-VN"),
        activationKey: sinhMaKichHoatSteam(item.id),
        playTimeHours: 0,
        lastPlayed: "Chưa chơi",
        installed: false
      };
      library.push(purchaseRecord);
      newPurchases.push({ ...item, key: purchaseRecord.activationKey });
    }
  });

  Storage.saveLibrary(library);

  // 8.3. Xóa giỏ hàng và voucher sau khi thanh toán thành công
  Storage.saveCart([]);
  Storage.setCoupon(null);
  capNhatThanhHeaderCartBadge();
  capNhatThanhHeaderUser();

  return {
    success: true,
    purchasedItems: newPurchases,
    totalPaid: summary.tongThanhToan,
    paymentMethod: phuongThuc,
    orderId: "DRX-" + Date.now().toString().slice(-6)
  };
}

// 8.4. Hàm xử lý khi nhấn nút Thanh toán ngay trên giao diện
function thanhToanDonHang() {
  const res = thucHienThanhToan("wallet");
  if (res && res.success) {
    dongCartDrawer();
    showToast(`🎉 Thanh toán thành công đơn hàng #${res.orderId}! Mã key đã được tạo tự động.`, "success");
  }
}

// =============================================================================
// CỤM 9: CẬP NHẬT CÁC HUY HIỆU ĐẾM (BADGES) TRÊN THANH HEADER
// =============================================================================
function capNhatThanhHeaderCartBadge() {
  const badge = document.getElementById("headerCartBadge");
  if (!badge) return;
  const count = Storage.getCart().length;
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

function capNhatThanhHeaderWishlistBadge() {
  const badge = document.getElementById("headerWishlistBadge");
  if (!badge) return;
  const count = Storage.getWishlist().length;
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}
