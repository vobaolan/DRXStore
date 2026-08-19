/**
 * DRX STORE - MODULE LƯU TRỮ TRÌNH DUYỆT (LOCALSTORAGE MODULE)
 * Quản lý việc đọc / ghi dữ liệu trạng thái ứng dụng:
 * - Danh sách tài khoản người dùng (Users)
 * - Phiên đăng nhập người dùng hiện tại (Current User)
 * - Giỏ hàng (Cart) & Danh sách yêu thích (Wishlist)
 * - Thư viện game đã mua (Library) & Mã giảm giá (Coupon)
 */

// =============================================================================
// CỤM 1: CÁC KHÓA LƯU TRỮ LOCALSTORAGE (STORAGE KEYS)
// =============================================================================
const STORAGE_KEYS = {
  USERS: "drx_users",
  CURRENT_USER: "drx_current_user",
  CART: "drx_cart",
  WISHLIST: "drx_wishlist",
  LIBRARY: "drx_library",
  COUPON: "drx_coupon"
};

// =============================================================================
// CỤM 2: KHỞI TẠO DỮ LIỆU MẪU MẶC ĐỊNH (INIT DEFAULT STORAGE)
// =============================================================================
function initDefaultStorage() {
  // 2.1. Khởi tạo tài khoản mẫu nếu chưa có
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers = [
      {
        taiKhoan: "khach1",
        matKhau: "123456",
        hoTen: "Game Thủ VIP",
        email: "khach1@drxstore.vn",
        walletBalance: 2500000, // Có sẵn 2.500.000đ trong ví DRX Store
        createdAt: "15/08/2026"
      },
      {
        taiKhoan: "admin",
        matKhau: "admin123",
        hoTen: "Quản Trị Viên DRX",
        email: "admin@drxstore.vn",
        walletBalance: 10000000,
        createdAt: "01/01/2026"
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  // 2.2. Khởi tạo thư viện game đã mua ban đầu
  if (!localStorage.getItem(STORAGE_KEYS.LIBRARY + "_khach1")) {
    const defaultLibrary = [
      {
        gameId: "GAME_010", // Counter-Strike 2
        purchaseDate: "10/08/2026",
        activationKey: "CS2-DRX-9842-8812",
        playTimeHours: 142.5,
        lastPlayed: "Hôm qua",
        installed: true
      }
    ];
    localStorage.setItem(STORAGE_KEYS.LIBRARY + "_khach1", JSON.stringify(defaultLibrary));
  }

  // 2.3. Khởi tạo giỏ hàng rỗng nếu chưa có
  if (!localStorage.getItem(STORAGE_KEYS.CART + "_guest")) {
    localStorage.setItem(STORAGE_KEYS.CART + "_guest", JSON.stringify([]));
  }

  // 2.4. Khởi tạo danh sách yêu thích
  if (!localStorage.getItem(STORAGE_KEYS.WISHLIST + "_guest")) {
    localStorage.setItem(STORAGE_KEYS.WISHLIST + "_guest", JSON.stringify(["GAME_001", "GAME_007"]));
  }
}

// Chạy khởi tạo ngay lập tức khi nạp file JS
initDefaultStorage();

// =============================================================================
// CỤM 3: ĐỐI TƯỢNG STORAGE - CÁC HÀM GETTER & SETTER TIỆN ÍCH
// =============================================================================
const Storage = {
  _getUserSuffix() {
    const user = this.getCurrentUser();
    return user && user.taiKhoan ? '_' + user.taiKhoan : '_guest';
  },
  // 3.1. Quản lý danh sách Users
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    } catch {
      return [];
    }
  },

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // 3.2. Quản lý phiên đăng nhập (Current User)
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
    } catch {
      return null;
    }
  },

  setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
  },

  // 3.3. Quản lý Giỏ hàng (Cart)
  getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART + this._getUserSuffix())) || [];
    } catch {
      return [];
    }
  },

  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART + this._getUserSuffix(), JSON.stringify(cart));
  },

  // 3.4. Quản lý Danh sách yêu thích (Wishlist)
  getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST + this._getUserSuffix())) || [];
    } catch {
      return [];
    }
  },

  saveWishlist(wishlist) {
    localStorage.setItem(STORAGE_KEYS.WISHLIST + this._getUserSuffix(), JSON.stringify(wishlist));
  },

  // 3.5. Quản lý Thư viện game đã mua (Library)
  getLibrary() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LIBRARY + this._getUserSuffix())) || [];
    } catch {
      return [];
    }
  },

  saveLibrary(library) {
    localStorage.setItem(STORAGE_KEYS.LIBRARY + this._getUserSuffix(), JSON.stringify(library));
  },

  // 3.6. Quản lý Mã giảm giá (Coupon)
  getCoupon() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPON + this._getUserSuffix()));
    } catch {
      return null;
    }
  },

  setCoupon(coupon) {
    if (!coupon) {
      localStorage.removeItem(STORAGE_KEYS.COUPON + this._getUserSuffix());
    } else {
      localStorage.setItem(STORAGE_KEYS.COUPON + this._getUserSuffix(), JSON.stringify(coupon));
    }
  }
};

