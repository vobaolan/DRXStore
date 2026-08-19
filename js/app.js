/**
 * DRX STORE - MODULE LOGIC ỨNG DỤNG CHÍNH (APP MAIN SCRIPT)
 * Quản lý vòng đời khởi tạo trang, lọc danh mục sản phẩm,
 * tìm kiếm thời gian thực, quản lý các cửa sổ Modal & Drawer
 */

// Biến lưu trữ danh sách game hiện hành
let filteredGames = [...GAME_DATABASE];

// =============================================================================
// CỤM 1: KHỞI TẠO ỨNG DỤNG KHI TRANG ĐÃ TẢI XONG (DOM CONTENT LOADED)
// =============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  // 1.1. Cập nhật thông tin người dùng và huy hiệu giỏ hàng trên Header
  capNhatThanhHeaderUser();
  capNhatThanhHeaderCartBadge();

  // 1.2. Render các khu vực hiển thị sản phẩm chính trên Trang chủ
  renderSpecialOffers(); // Khu vực Flash Sale 5 game
  renderTopSellersTabs("top-sellers"); // Khu vực Bảng xếp hạng game (mặc định tab Bán chạy)
  renderIndieSpotlight(); // Khu vực Góc Game Indie & Độc quyền 5 game

  // 1.3. Khởi tạo sự kiện tìm kiếm trực tiếp và nút bấm lọc thể loại
  setupSearchAndFilters();

  // 1.4. Thiết lập sự kiện đóng Modal khi click ra ngoài hoặc bấm phím ESC
  setupModalDismissals();

  // 1.5. Thiết lập sự kiện cuộn mượt mà (Smooth Scrolling) khi bấm các nút điều hướng
  setupSmoothScrollLinks();
}

/**
 * Hàm kích hoạt hiệu ứng cuộn trang mượt mà tới các khu vực sản phẩm (không bị Header che khuất)
 */
function setupSmoothScrollLinks() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#" || targetId === "") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        // Bù trừ 72px chiều cao Header + 24px khoảng cách thoáng đãng để không che tiêu đề & badge
        const headerOffset = 96;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}

// =============================================================================
// CỤM 1.5: ĐIỀU KHIỂN BẬT / TẮT ÂM THANH VIDEO HERO (HERO SOUND CONTROLLER)
// - Video tự động phát (Autoplay) 100% mượt mà trên mọi trình duyệt & Vercel
// - Nút icon kính mờ ở góc dưới cho phép người dùng click Bật / Tắt âm thanh
// =============================================================================
let isHeroSoundActive = false; // Mặc định tắt tiếng để trình duyệt cho phép video tự phát 100% không bị chặn

/**
 * Hàm bật / tắt âm thanh khi click nút icon ở góc video
 */
function toggleHeroSound() {
  const iframe = document.getElementById("heroBgVideoFrame");
  const btn = document.getElementById("heroSoundToggleBtn");
  if (!iframe || !iframe.contentWindow) return;

  if (isHeroSoundActive) {
    // Đang mở -> Chuyển sang TẮT TIẾNG
    try {
      iframe.contentWindow.postMessage(
        '{"event":"command","func":"mute","args":""}',
        "*",
      );
    } catch (e) {
      console.log("Audio toggle error:", e);
    }
    isHeroSoundActive = false;
    if (btn) {
      btn.classList.add("muted");
    }
  } else {
    // Đang tắt -> Chuyển sang MỞ TIẾNG
    try {
      iframe.contentWindow.postMessage(
        '{"event":"command","func":"unMute","args":""}',
        "*",
      );
      iframe.contentWindow.postMessage(
        '{"event":"command","func":"setVolume","args":[100]}',
        "*",
      );
      iframe.contentWindow.postMessage(
        '{"event":"command","func":"playVideo","args":""}',
        "*",
      );
    } catch (e) {
      console.log("Audio toggle error:", e);
    }
    isHeroSoundActive = true;
    if (btn) {
      btn.classList.remove("muted");
    }
  }
}

// =============================================================================
// CỤM 2: RENDER KHU VỰC FLASH DEALS / GIẢM GIÁ SỐC
// - Lọc các game có discountPercent > 0
// - Hiển thị đủ 5 sản phẩm lấp đầy 5 cột
// =============================================================================
function renderSpecialOffers() {
  const container = document.getElementById("specialOffersGrid");
  if (!container) return;

  // Lọc các game có giảm giá
  const deals = GAME_DATABASE.filter((g) => g.discountPercent > 0);

  // Render đúng 5 game đầu tiên ra lưới HTML
  container.innerHTML = deals
    .slice(0, 5)
    .map((game) => renderGameCard(game, { highlightBorder: true }))
    .join("");
}

// =============================================================================
// CỤM 3: RENDER BẢNG XẾP HẠNG GAME THEO TAB CHUYỂN ĐỔI
// - Hỗ trợ các tab: top-sellers, trending, top-rated, under-500k
// - Hiển thị 10 sản phẩm (2 hàng x 5 cột)
// =============================================================================
function renderTopSellersTabs(tabType = "top-sellers") {
  const container = document.getElementById("tabbedGamesGrid");
  if (!container) return;

  // 3.1. Đổi trạng thái kích hoạt (active) cho nút tab tương ứng
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabType);
  });

  // 3.2. Lọc danh sách game theo tiêu chí tab được chọn
  let gamesToShow = [];
  if (tabType === "top-sellers") {
    gamesToShow = GAME_DATABASE.filter((g) => g.isTopSeller);
  } else if (tabType === "trending") {
    gamesToShow = GAME_DATABASE.filter((g) => g.isTrending);
  } else if (tabType === "top-rated") {
    gamesToShow = [...GAME_DATABASE].sort((a, b) => b.rating - a.rating);
  } else if (tabType === "under-500k") {
    gamesToShow = GAME_DATABASE.filter((g) => g.price > 0 && g.price <= 500000);
  }

  // 3.3. Render tối đa 10 game ra giao diện lưới 5 cột
  container.innerHTML = gamesToShow
    .slice(0, 10)
    .map((game) => renderGameCard(game))
    .join("");
}

// =============================================================================
// CỤM 4: RENDER GÓC GAME ĐỘC QUYỀN & KIỆT TÁC ĐỘC LẬP (INDIE SPOTLIGHT)
// - Lọc game thuộc thể loại Indie, Souls-like, Roguelike, Metroidvania...
// - Hiển thị đúng 5 game để lấp kín 5 cột không bị khuyết ô nào
// =============================================================================
function renderIndieSpotlight() {
  const container = document.getElementById("indieSpotlightGrid");
  if (!container) return;

  const indies = GAME_DATABASE.filter(
    (g) =>
      g.genres.includes("Indie") ||
      g.genres.includes("Souls-like") ||
      g.genres.includes("Roguelike") ||
      g.genres.includes("Metroidvania") ||
      g.genres.includes("Cốt truyện hay") ||
      g.rating >= 95,
  );

  // Render 5 game ra giao diện
  container.innerHTML = indies
    .slice(0, 5)
    .map((game) => renderGameCard(game))
    .join("");
}

// =============================================================================
// CỤM 5: TÌM KIẾM THỜI GIAN THỰC & BỘ LỌC THỂ LOẠI NHANH
// - Bắt sự kiện 'input' trên ô tìm kiếm
// - Hiển thị Dropdown gợi ý ngay lập tức khi gõ chữ
// - Bắt sự kiện click các nút lọc thể loại
// =============================================================================
function setupSearchAndFilters() {
  const searchInput = document.getElementById("mainSearchInput");
  const searchResultsDropdown = document.getElementById(
    "searchResultsDropdown",
  );

  // 5.1. Xử lý tìm kiếm trực tiếp trên thanh Header
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!searchResultsDropdown) return;

      // Nếu ô tìm kiếm rỗng thì ẩn dropdown
      if (query.length < 1) {
        searchResultsDropdown.classList.remove("show");
        return;
      }

      // Lọc các game khớp với tiêu đề, thể loại hoặc nhà phát triển
      const matches = GAME_DATABASE.filter(
        (g) =>
          g.title.toLowerCase().includes(query) ||
          g.genres.some((tag) => tag.toLowerCase().includes(query)) ||
          g.developer.toLowerCase().includes(query),
      ).slice(0, 5);

      // Hiển thị kết quả tìm kiếm
      if (matches.length === 0) {
        searchResultsDropdown.innerHTML = `
          <div class="search-empty-state">
            Không tìm thấy game nào khớp với "<b>${query}</b>"
          </div>
        `;
      } else {
        searchResultsDropdown.innerHTML = matches
          .map(
            (g) => `
          <div class="search-result-item" onclick="moModalChiTietGame('${g.id}'); dongSearchDropdown();">
            <img src="${g.cover}" alt="${g.title}" class="search-item-thumb">
            <div class="search-item-info">
              <div class="search-item-title">${g.title}</div>
              <div class="search-item-meta font-mono">${g.genres.slice(0, 2).join(", ")} • ${g.price === 0 ? "Miễn phí" : dinhDangTien(g.price)}</div>
            </div>
            ${g.discountPercent > 0 ? `<span class="discount-badge-sm">-${g.discountPercent}%</span>` : ""}
          </div>
        `,
          )
          .join("");
      }

      searchResultsDropdown.classList.add("show");
    });
  }

  // 5.2. Xử lý các nút lọc nhanh thể loại (Pill Tags)
  document.querySelectorAll(".filter-genre-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-genre-pill")
        .forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      const genre = pill.dataset.genre;

      const tabGrid = document.getElementById("tabbedGamesGrid");
      if (tabGrid) {
        let results = GAME_DATABASE;
        if (genre !== "Tất cả") {
          results = GAME_DATABASE.filter((g) => g.genres.includes(genre));
        }
        tabGrid.innerHTML = results.map((g) => renderGameCard(g)).join("");
      }
    });
  });
}

// Hàm ẩn dropdown tìm kiếm và xóa text trong ô input
function dongSearchDropdown() {
  const dropdown = document.getElementById("searchResultsDropdown");
  if (dropdown) dropdown.classList.remove("show");
  const searchInput = document.getElementById("mainSearchInput");
  if (searchInput) searchInput.value = "";
}

// =============================================================================
// CỤM 6: QUẢN LÝ CỬA SỔ MODAL CHI TIẾT & MODAL TÀI KHOẢN
// =============================================================================

// 6.1. Mở Modal xem chi tiết game
function moModalChiTietGame(gameId) {
  const game = GAME_DATABASE.find((g) => g.id === gameId);
  if (!game) return;

  renderGameDetailModal(game);
  const modal = document.getElementById("gameDetailModal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden"; // Khóa cuộn trang chính khi mở modal
  }
}

// 6.2. Đóng Modal xem chi tiết game
function dongModalChiTiet() {
  const modal = document.getElementById("gameDetailModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = ""; // Mở lại cuộn trang chính
  }
}

// 6.3. Mở Modal tài khoản (Đăng nhập / Đăng ký)
function moModalAuth(tab = "login") {
  const modal = document.getElementById("authModal");
  if (!modal) return;

  chuyenTabAuth(tab);
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// 6.4. Đóng Modal tài khoản
function dongModalAuth() {
  const modal = document.getElementById("authModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// 6.5. Chuyển đổi giữa Form Đăng nhập và Form Đăng ký
function chuyenTabAuth(tab) {
  const tabLogin = document.getElementById("tabBtnLogin");
  const tabRegister = document.getElementById("tabBtnRegister");
  const authTitle = document.getElementById("authModalTitle");
  const slider = document.getElementById("authFormsSlider");
  const formLogin = document.getElementById("formLogin");
  const formRegister = document.getElementById("formRegister");

  if (tab === "login") {
    if (tabLogin) tabLogin.classList.add("active");
    if (tabRegister) tabRegister.classList.remove("active");
    if (authTitle) authTitle.textContent = "Đăng Nhập DRX Store";
    if (slider) slider.classList.remove("show-register");
    if (formLogin) formLogin.style.opacity = "1";
    if (formRegister) formRegister.style.opacity = "0";
    // Đảm bảo tab đăng nhập có thể thao tác được
    if (formLogin) formLogin.style.pointerEvents = "auto";
    if (formRegister) formRegister.style.pointerEvents = "none";
  } else {
    if (tabLogin) tabLogin.classList.remove("active");
    if (tabRegister) tabRegister.classList.add("active");
    if (authTitle) authTitle.textContent = "Đăng Ký Tài Khoản Mới";
    if (slider) slider.classList.add("show-register");
    if (formLogin) formLogin.style.opacity = "0";
    if (formRegister) formRegister.style.opacity = "1";
    // Đảm bảo tab đăng ký có thể thao tác được
    if (formLogin) formLogin.style.pointerEvents = "none";
    if (formRegister) formRegister.style.pointerEvents = "auto";
  }
}

// 6.6. Xử lý submit form Đăng nhập
function submitDangNhap(e) {
  e.preventDefault();
  const username = document.getElementById("inputLoginUser").value.trim();
  const pass = document.getElementById("inputLoginPass").value;

  const result = dangNhapTaiKhoan(username, pass);
  if (result.success) {
    showToast(result.message, "success");
    dongModalAuth();
    capNhatThanhHeaderUser();
  } else {
    showToast(result.message, "error");
  }
}

// 6.7. Xử lý submit form Đăng ký
function submitDangKy(e) {
  e.preventDefault();
  const username = document.getElementById("inputRegUser").value.trim();
  const pass = document.getElementById("inputRegPass").value;
  const confirmPass = document.getElementById("inputRegConfirmPass") ? document.getElementById("inputRegConfirmPass").value : pass;
  const fullname = document.getElementById("inputRegName").value.trim();
  const email = document.getElementById("inputRegEmail").value.trim();

  // Validate before submit
  const isEmailValid = validateEmail(email);
  const isPassValid = validatePassword(pass);
  const isConfirmValid = validateConfirmPassword(pass, confirmPass);

  if (!isEmailValid || !isPassValid || !isConfirmValid) {
    return;
  }

  const result = dangKyTaiKhoan(username, pass, fullname, email);
  if (result.success) {
    showToast(result.message, "success");
    dongModalAuth();
    capNhatThanhHeaderUser();
  } else {
    showToast(result.message, "error");
  }
}


// 6.8. Hàm xử lý Ẩn/Hiện mật khẩu
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const eyeIcon = btn.querySelector('.eye-icon');
  const eyeOffIcon = btn.querySelector('.eye-off-icon');
  
  if (input.type === 'password') {
    input.type = 'text';
    if (eyeIcon) eyeIcon.style.display = 'none';
    if (eyeOffIcon) eyeOffIcon.style.display = 'block';
  } else {
    input.type = 'password';
    if (eyeIcon) eyeIcon.style.display = 'block';
    if (eyeOffIcon) eyeOffIcon.style.display = 'none';
  }
}

// 6.9. Validation thời gian thực cho Form Đăng ký
document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.getElementById('inputRegEmail');
  const passInput = document.getElementById('inputRegPass');
  const confirmPassInput = document.getElementById('inputRegConfirmPass');

  if (emailInput) {
    emailInput.addEventListener('input', () => validateEmail(emailInput.value));
  }
  if (passInput) {
    passInput.addEventListener('input', () => {
      validatePassword(passInput.value);
      if (confirmPassInput && confirmPassInput.value) {
        validateConfirmPassword(passInput.value, confirmPassInput.value);
      }
    });
  }
  if (confirmPassInput) {
    confirmPassInput.addEventListener('input', () => validateConfirmPassword(passInput.value, confirmPassInput.value));
  }
});

function showError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const errorElement = document.getElementById(errorId);
  if (input) input.classList.add('is-invalid');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

function clearError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const errorElement = document.getElementById(errorId);
  if (input) input.classList.remove('is-invalid');
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    clearError('inputRegEmail', 'errorRegEmail');
    return false;
  }
  if (!regex.test(email)) {
    showError('inputRegEmail', 'errorRegEmail', 'Email không hợp lệ!');
    return false;
  } else {
    clearError('inputRegEmail', 'errorRegEmail');
    return true;
  }
}

function validatePassword(pass) {
  if (!pass) {
    clearError('inputRegPass', 'errorRegPass');
    return false;
  }
  if (pass.length < 6) {
    showError('inputRegPass', 'errorRegPass', 'Mật khẩu phải có ít nhất 6 ký tự!');
    return false;
  } else {
    clearError('inputRegPass', 'errorRegPass');
    return true;
  }
}

function validateConfirmPassword(pass, confirmPass) {
  if (!confirmPass) {
    clearError('inputRegConfirmPass', 'errorRegConfirmPass');
    return false;
  }
  if (pass !== confirmPass) {
    showError('inputRegConfirmPass', 'errorRegConfirmPass', 'Mật khẩu nhập lại không khớp!');
    return false;
  } else {
    clearError('inputRegConfirmPass', 'errorRegConfirmPass');
    return true;
  }
}


// =============================================================================
// CỤM 7: QUẢN LÝ THANH TRƯỢT GIỎ HÀNG (CART SLIDE-IN DRAWER)
// - Mở/đóng thanh trượt từ mép phải màn hình
// - Render danh sách game trong giỏ, tính tạm tính, voucher, tổng thanh toán
// =============================================================================

// 7.1. Mở ngăn kéo giỏ hàng
function moCartDrawer() {
  renderCartDrawer();
  const drawer = document.getElementById("cartDrawer");
  if (drawer) {
    drawer.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

// 7.2. Đóng ngăn kéo giỏ hàng
function dongCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  if (drawer) {
    drawer.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// 7.3. Render nội dung bên trong giỏ hàng trượt
function renderCartDrawer() {
  const container = document.getElementById("cartDrawerItems");
  const footerContainer = document.getElementById("cartDrawerFooter");
  if (!container) return;

  const cart = Storage.getCart();
  const summary = tinhToanTongTienGioHang();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <div class="empty-icon">🛒</div>
        <h3>Giỏ hàng đang trống!</h3>
        <p class="text-muted-foreground">Khám phá hàng ngàn tựa game đình đám và ưu đãi cực sốc đang chờ bạn.</p>
        <a href="javascript:void(0)" class="btn btn-primary btn-md mt-4" onclick="dongCartDrawer()">Khám Phá Cửa Hàng</a>
      </div>
    `;
    if (footerContainer) footerContainer.style.display = "none";
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-drawer-item" style="position:relative;">
      <img src="${item.cover}" alt="${item.title}" class="drawer-item-img">
      <div class="drawer-item-info">
        <div class="drawer-item-title">${item.title}</div>
        <div class="drawer-item-price font-mono">${item.price === 0 ? "Miễn phí" : dinhDangTien(item.price)}</div>
        <div class="qty-controls" style="display:flex; align-items:center; gap:8px; margin-top:8px;">
          <button class="qty-btn" onclick="thayDoiSoLuong('${item.id}', -1)" style="width:24px;height:24px;border-radius:4px;border:1px solid #E2E8F0;background:#F8FAFC;cursor:pointer;font-weight:bold;">-</button>
          <span style="font-size:0.875rem;font-weight:600;min-width:16px;text-align:center;">${item.quantity || 1}</span>
          <button class="qty-btn" onclick="thayDoiSoLuong('${item.id}', 1)" style="width:24px;height:24px;border-radius:4px;border:1px solid #E2E8F0;background:#F8FAFC;cursor:pointer;font-weight:bold;">+</button>
        </div>
      </div>
      <button class="btn-remove-item" onclick="xoaKhoiGio('${item.id}')" title="Xóa khỏi giỏ" style="position:absolute;top:12px;right:12px;">✕</button>
    </div>
  `,
    )
    .join("");

  if (footerContainer) {
    footerContainer.style.display = "block";
    footerContainer.innerHTML = `
      <div class="drawer-summary-rows">
        <div class="summary-row">
          <span>Tạm tính (${summary.soLuong} game):</span>
          <span class="font-mono">${dinhDangTien(summary.tamTinh)}</span>
        </div>
        ${
          summary.giamGiaVoucher > 0
            ? `
          <div class="summary-row text-accent">
            <span>Voucher (${summary.coupon.code}):</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="font-mono">-${dinhDangTien(summary.giamGiaVoucher)}</span>
              <button onclick="huyVoucher()" style="background:transparent;border:none;color:#EF4444;cursor:pointer;font-weight:bold;" title="Gỡ mã">✕</button>
            </div>
          </div>
        `
            : `
          <div class="voucher-input-group" style="display:flex; gap:8px; margin: 12px 0;">
            <input type="text" id="inputVoucherCode" class="form-input" style="height: 36px; border-radius: 6px; font-size: 13px;" placeholder="Nhập mã">
            <button class="btn btn-primary btn-sm" onclick="apDungVoucherBtn()" style="border-radius: 6px; height: 36px; font-size: 13px;">Áp dụng</button>
          </div>
        `
        }
        <div class="summary-row total-row" style="margin-top:12px; border-top: 1px solid #E2E8F0; padding-top: 12px;">
          <span>Tổng thanh toán:</span>
          <span class="font-mono text-xl text-accent font-bold">${dinhDangTien(summary.tongThanhToan)}</span>
        </div>
      </div>
      <div class="drawer-btn-actions" style="margin-top:16px;">
        <button class="btn btn-primary btn-block" onclick="moCheckoutModal()">
          Tiến Hành Thanh Toán
        </button>
      </div>
    `;
  }
}

function apDungVoucherBtn() {
  const code = document.getElementById("inputVoucherCode").value;
  apDungVoucher(code);
}

// Checkout Modal Functions
function moCheckoutModal() {
  const cart = Storage.getCart();
  if (cart.length === 0) {
    showToast("Giỏ hàng đang trống!", "error");
    return;
  }
  const currentUser = Storage.getCurrentUser();
  if (!currentUser) {
    dongCartDrawer();
    moModalAuth('login');
    showToast("Vui lòng đăng nhập để thanh toán!", "info");
    return;
  }

  // Populate info
  document.getElementById("inputCheckoutName").value = currentUser.hoTen || currentUser.taiKhoan;
  document.getElementById("inputCheckoutEmail").value = currentUser.email || "";
  document.getElementById("checkoutWalletBalance").innerText = "(Số dư: " + dinhDangTien(currentUser.walletBalance || 0) + ")";

  const summary = tinhToanTongTienGioHang();
  document.getElementById("checkoutSummary").innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.875rem;">
      <span>Tổng số game:</span>
      <span class="font-mono">${summary.soLuong}</span>
    </div>
    ${summary.giamGiaVoucher > 0 ? `<div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.875rem; color:#2563EB;">
      <span>Giảm giá Voucher:</span>
      <span class="font-mono">-${dinhDangTien(summary.giamGiaVoucher)}</span>
    </div>` : ''}
    <div style="display:flex; justify-content:space-between; font-size:1.125rem; font-weight:700; margin-top:12px; border-top:1px solid #E2E8F0; padding-top:12px;">
      <span>Tổng cần thanh toán:</span>
      <span class="font-mono text-accent">${dinhDangTien(summary.tongThanhToan)}</span>
    </div>
  `;

  dongCartDrawer();
  const modal = document.getElementById("checkoutModal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function dongCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function submitCheckout(e) {
  e.preventDefault();
  
  const phone = document.getElementById("inputCheckoutPhone").value.trim();
  const email = document.getElementById("inputCheckoutEmail").value.trim();

  // Validate Phone (10 digits starting with 0)
  const phoneRegex = /^0\d{9}$/;
  if (!phoneRegex.test(phone)) {
    showError("inputCheckoutPhone", "errorCheckoutPhone", "SĐT không hợp lệ (Phải có 10 số và bắt đầu bằng số 0)!");
    return;
  } else {
    clearError("inputCheckoutPhone", "errorCheckoutPhone");
  }

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError("inputCheckoutEmail", "errorCheckoutEmail", "Email không hợp lệ!");
    return;
  } else {
    clearError("inputCheckoutEmail", "errorCheckoutEmail");
  }

  // Proceed Payment
  const res = thucHienThanhToan("wallet");
  if (res && res.success) {
    dongCheckoutModal();
    showToast(`🎉 Thanh toán thành công! Mã kích hoạt đã được gửi tới ${email}. Vui lòng kiểm tra Thư viện.`, "success");
    
    // Save email & phone to user profile for future
    const currentUser = Storage.getCurrentUser();
    currentUser.email = email;
    currentUser.phone = phone;
    Storage.setCurrentUser(currentUser);
    const users = Storage.getUsers();
    const idx = users.findIndex(u => u.taiKhoan === currentUser.taiKhoan);
    if (idx !== -1) {
      users[idx] = currentUser;
      Storage.saveUsers(users);
    }
  }
}

// Add dismiss logic for checkoutModal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    dongCheckoutModal();
  }
});
document.getElementById("checkoutModal")?.addEventListener("click", (e) => {
  if (e.target.id === "checkoutModal") dongCheckoutModal();
});

// // 8.1. Mở Modal danh sách game đã lưu
function moWishlistDrawer() {
  const wishlist = Storage.getWishlist();
  const wishGames = GAME_DATABASE.filter((g) => wishlist.includes(g.id));

  const modal = document.getElementById("wishlistModal");
  const container = document.getElementById("wishlistModalContent");
  if (!modal || !container) return;

  if (wishGames.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <div class="empty-icon">❤️</div>
        <h3>Danh sách ước chưa có game nào!</h3>
        <p class="text-muted-foreground">Nhấn vào biểu tượng trái tim ở các game để lưu lại khi cần mua.</p>
        <a href="javascript:void(0)" class="btn btn-primary btn-md mt-4" onclick="dongWishlistModal()">Duyệt Kho Game</a>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="wishlist-grid-list">
        ${wishGames
          .map(
            (g) => `
          <div class="wishlist-row-item">
            <img src="${g.cover}" alt="${g.title}" class="wishlist-item-thumb">
            <div class="wishlist-item-meta">
              <h4>${g.title}</h4>
              <p class="font-mono text-sm text-muted-foreground">${g.genres.slice(0, 2).join(" • ")} | Đánh giá: ★ ${g.rating}%</p>
              <div class="wishlist-item-price font-mono font-bold">${g.price === 0 ? "Miễn phí" : dinhDangTien(g.price)}</div>
            </div>
            <div class="wishlist-item-btns">
              <button class="btn btn-primary btn-sm" onclick="themVaoGio('${g.id}'); dongWishlistModal();">Thêm vào giỏ</button>
              <button class="btn btn-outline btn-sm" onclick="toggleWishlist('${g.id}'); moWishlistDrawer();">Bỏ thích</button>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// 8.2. Đóng Modal danh sách yêu thích
function dongWishlistModal() {
  const modal = document.getElementById("wishlistModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// =============================================================================
// CỤM 9: THIẾT LẬP ĐÓNG MODAL KHI NHẤN PHÍM ESC HOẶC CLICK RA NGOÀI BACKDROP
// =============================================================================
function setupModalDismissals() {
  // 9.1. Lắng nghe phím bấm Escape trên bàn phím
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dongModalChiTiet();
      dongModalAuth();
      dongCartDrawer();
      dongWishlistModal();
      dongSearchDropdown();
    }
  });

  // 9.2. Lắng nghe sự kiện click vào lớp nền tối (backdrop)
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        dongModalChiTiet();
        dongModalAuth();
        dongWishlistModal();
      }
    });
  });

  // 9.3. Đóng dropdown tìm kiếm khi click ra ngoài thanh tìm kiếm
  document.addEventListener("click", (e) => {
    const searchWrap = document.querySelector(".header-search-wrap");
    if (searchWrap && !searchWrap.contains(e.target)) {
      dongSearchDropdown();
    }
  });
}


// =============================================================================
// CỤM 10: THƯ VIỆN GAME (LIBRARY)
// =============================================================================
function moModalLibrary() {
  renderLibrary();
  const modal = document.getElementById("libraryModal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function dongModalLibrary() {
  const modal = document.getElementById("libraryModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function renderLibrary() {
  const container = document.getElementById("libraryItemsContainer");
  if (!container) return;

  const library = Storage.getLibrary();
  
  if (!library || library.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 0;">
        <div style="font-size: 3rem; margin-bottom: 16px;">🎮</div>
        <h3 style="color: #0F172A; font-weight: 600;">Thư viện trống</h3>
        <p style="color: #64748B;">Bạn chưa sở hữu game nào. Hãy dạo cửa hàng nhé!</p>
        <button class="btn btn-primary" style="margin-top: 16px;" onclick="dongModalLibrary()">Mua game ngay</button>
      </div>
    `;
    return;
  }

  // Kết hợp thông tin từ GAME_DATABASE
  const libraryItems = library.map(lib => {
    const game = GAME_DATABASE.find(g => g.id === lib.gameId) || { title: "Game không xác định", cover: "" };
    return { ...lib, ...game };
  });

  container.innerHTML = libraryItems.map(item => `
    <div style="display: flex; gap: 16px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <img src="${item.cover}" alt="${item.title}" style="width: 100px; height: 140px; object-fit: cover; border-radius: 8px;">
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
        <h3 style="font-size: 1.125rem; font-weight: 700; color: #0F172A; margin: 0 0 8px 0;">${item.title}</h3>
        <div style="font-size: 0.875rem; color: #64748B; margin-bottom: 4px;">Ngày mua: ${item.purchaseDate}</div>
        <div style="font-size: 0.875rem; color: #64748B; margin-bottom: 12px;">Trạng thái: ${item.installed ? 'Đã cài đặt' : 'Chưa cài đặt'}</div>
        
        <div style="background: #F1F5F9; border: 1px dashed #CBD5E1; border-radius: 8px; padding: 12px;">
          <div style="font-size: 0.75rem; font-weight: 600; color: #64748B; text-transform: uppercase; margin-bottom: 4px;">Mã Kích Hoạt Steam (Key)</div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <code style="font-family: monospace; font-size: 1rem; font-weight: 700; color: #2563EB; letter-spacing: 1px; flex: 1;">${item.activationKey}</code>
            <button onclick="navigator.clipboard.writeText('${item.activationKey}'); showToast('Đã copy mã: ${item.activationKey}', 'success');" style="background: #E0E7FF; color: #4338CA; border: none; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 600;">Copy</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

// Add dismiss logic
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    dongModalLibrary();
  }
});
document.getElementById("libraryModal")?.addEventListener("click", (e) => {
  if (e.target.id === "libraryModal") dongModalLibrary();
});
