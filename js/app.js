/**
 * DRX STORE - MODULE LOGIC ỨNG DỤNG CHÍNH (APP MAIN SCRIPT)
 * Quản lý vòng đời khởi tạo trang, lọc danh mục sản phẩm,
 * tìm kiếm thời gian thực, quản lý các cửa sổ Modal & Drawer
 */

// Biến lưu trữ danh sách game hiện hành
let filteredGames = [...GAME_DATABASE];

// Trạng thái lọc và sắp xếp hiện hành
let currentTab = "top-sellers";
let currentGenre = "Tất cả";
let currentSort = "default";

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
  renderSpecialOffers();               // Khu vực Flash Sale 5 game
  renderTopSellersTabs("top-sellers"); // Khu vực Bảng xếp hạng game (mặc định tab Bán chạy)
  renderIndieSpotlight();              // Khu vực Góc Game Indie & Độc quyền 5 game

  // 1.3. Khởi tạo sự kiện tìm kiếm trực tiếp và nút bấm lọc thể loại
  setupSearchAndFilters();

  // 1.4. Thiết lập sự kiện đóng Modal khi click ra ngoài hoặc bấm phím ESC
  setupModalDismissals();

  // 1.5. Thiết lập sự kiện cuộn mượt mà (Smooth Scrolling) khi bấm các nút điều hướng
  setupSmoothScrollLinks();

  // 1.6. Khởi tạo thanh tiến trình cuộn trang & nút Back to Top thông minh
  khoiTaoTienTrinhCuonTrang();
}

/**
 * Hàm kích hoạt hiệu ứng cuộn trang mượt mà tới các khu vực sản phẩm (không bị Header che khuất)
 */
function setupSmoothScrollLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#" || targetId === "") return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        // Bù trừ 72px chiều cao Header + 24px khoảng cách thoáng đãng để không che tiêu đề & badge
        const headerOffset = 96;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    });
  });
}

// =============================================================================
// CỤM 1.5: ĐIỀU KHIỂN BẬT / TẮT ÂM THANH VIDEO HERO (HERO SOUND CONTROLLER)
// - Mặc định chế độ MỞ TIẾNG (Sound ON Default)
// - Tự động kích hoạt âm thanh trailer 100% âm lượng
// =============================================================================
let isHeroSoundActive = true;

/**
 * Hàm gửi lệnh bật âm lượng video trailer lên 100%
 */
function kichHoatAmThanhTrailer() {
  const iframe = document.getElementById("heroBgVideoFrame");
  if (!iframe || !iframe.contentWindow) return;
  try {
    iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
    iframe.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[100]}', '*');
    iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
  } catch (e) {
    console.log("Audio status:", e);
  }
}

// Kích hoạt âm thanh khi tải trang
setTimeout(kichHoatAmThanhTrailer, 600);

// Đồng thời kích hoạt âm thanh ngay khi người dùng có thao tác chạm/click đầu tiên
["click", "scroll", "keydown", "touchstart"].forEach(evt => {
  window.addEventListener(evt, () => {
    if (isHeroSoundActive) kichHoatAmThanhTrailer();
  }, { once: true });
});

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
      iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
    } catch (e) {
      console.log("Audio toggle error:", e);
    }
    isHeroSoundActive = false;
    if (btn) {
      btn.classList.add("muted");
      btn.setAttribute("title", "Bật âm thanh trailer");
    }
    showToast("🔇 Đã tắt âm thanh trailer", "info");
  } else {
    // Đang tắt -> Chuyển sang MỞ TIẾNG
    kichHoatAmThanhTrailer();
    isHeroSoundActive = true;
    if (btn) {
      btn.classList.remove("muted");
      btn.setAttribute("title", "Tắt âm thanh trailer");
    }
    showToast("🔊 Đã mở âm thanh trailer", "success");
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
  const deals = GAME_DATABASE.filter(g => g.discountPercent > 0);
  
  // Render đúng 5 game đầu tiên ra lưới HTML
  container.innerHTML = deals.slice(0, 5).map(game => renderGameCard(game, { highlightBorder: true })).join("");
}

// =============================================================================
// CỤM 3: RENDER BẢNG XẾP HẠNG GAME THEO TAB CHUYỂN ĐỔI
// - Hỗ trợ các tab: top-sellers, trending, top-rated, under-500k
// - Hiển thị 10 sản phẩm (2 hàng x 5 cột)
// =============================================================================
function renderTopSellersTabs(tabType = "top-sellers") {
  // 3.1. Đổi trạng thái kích hoạt (active) cho nút tab tương ứng
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabType);
  });

  // 3.2. Cập nhật trạng thái tab hiện hành và cập nhật lưới game
  currentTab = tabType;
  updateGamesGrid();
}

/**
 * Hàm lọc và sắp xếp game tuần tự (Pipeline) dựa trên trạng thái hiện tại
 */
function updateGamesGrid() {
  const container = document.getElementById("tabbedGamesGrid");
  if (!container) return;

  // 1. Lọc game theo Tab đang chọn
  let games = [];
  if (currentTab === "top-sellers") {
    games = GAME_DATABASE.filter(g => g.isTopSeller);
  } else if (currentTab === "trending") {
    games = GAME_DATABASE.filter(g => g.isTrending);
  } else if (currentTab === "top-rated") {
    games = [...GAME_DATABASE].sort((a, b) => b.rating - a.rating);
  } else if (currentTab === "under-500k") {
    games = GAME_DATABASE.filter(g => g.price > 0 && g.price <= 500000);
  } else {
    games = [...GAME_DATABASE];
  }

  // 2. Lọc game theo thể loại (Genre Pill) đang chọn
  if (currentGenre !== "Tất cả") {
    games = games.filter(g => g.genres.includes(currentGenre));
  }

  // 3. Sắp xếp mảng game kết quả theo tiêu chí được chọn từ Dropdown
  if (currentSort === "price-asc") {
    games.sort((a, b) => a.price - b.price);
  } else if (currentSort === "price-desc") {
    games.sort((a, b) => b.price - a.price);
  } else if (currentSort === "rating-desc") {
    games.sort((a, b) => b.rating - a.rating);
  } else if (currentSort === "name-asc") {
    games.sort((a, b) => a.title.localeCompare(b.title, "vi"));
  } else if (currentSort === "sales-desc") {
    games.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  // 4. Render tối đa 10 game ra giao diện lưới
  if (games.length === 0) {
    container.innerHTML = `
      <div class="grid-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 48px 0; color: var(--color-foreground-muted); font-family: var(--font-body); font-weight: 500;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 12px;">🔍</span>
        Không tìm thấy tựa game nào phù hợp với bộ lọc hiện tại.
      </div>
    `;
  } else {
    container.innerHTML = games.slice(0, 10).map(game => renderGameCard(game)).join("");
  }
}

// =============================================================================
// CỤM 4: RENDER GÓC GAME ĐỘC QUYỀN & KIỆT TÁC ĐỘC LẬP (INDIE SPOTLIGHT)
// - Lọc game thuộc thể loại Indie, Souls-like, Roguelike, Metroidvania...
// - Hiển thị đúng 5 game để lấp kín 5 cột không bị khuyết ô nào
// =============================================================================
function renderIndieSpotlight() {
  const container = document.getElementById("indieSpotlightGrid");
  if (!container) return;

  const indies = GAME_DATABASE.filter(g => 
    g.genres.includes("Indie") || 
    g.genres.includes("Souls-like") || 
    g.genres.includes("Roguelike") || 
    g.genres.includes("Metroidvania") ||
    g.genres.includes("Cốt truyện hay") ||
    g.rating >= 95
  );
  
  // Render 5 game ra giao diện
  container.innerHTML = indies.slice(0, 5).map(game => renderGameCard(game)).join("");
}

// =============================================================================
// CỤM 5: TÌM KIẾM THỜI GIAN THỰC & BỘ LỌC THỂ LOẠI NHANH
// - Bắt sự kiện 'input' trên ô tìm kiếm
// - Hiển thị Dropdown gợi ý ngay lập tức khi gõ chữ
// - Bắt sự kiện click các nút lọc thể loại
// =============================================================================
function setupSearchAndFilters() {
  const searchInput = document.getElementById("mainSearchInput");
  const searchResultsDropdown = document.getElementById("searchResultsDropdown");

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
      const matches = GAME_DATABASE.filter(g => 
        g.title.toLowerCase().includes(query) ||
        g.genres.some(tag => tag.toLowerCase().includes(query)) ||
        g.developer.toLowerCase().includes(query)
      ).slice(0, 5);

      // Hiển thị kết quả tìm kiếm
      if (matches.length === 0) {
        searchResultsDropdown.innerHTML = `
          <div class="search-empty-state">
            Không tìm thấy game nào khớp với "<b>${query}</b>"
          </div>
        `;
      } else {
        searchResultsDropdown.innerHTML = matches.map(g => `
          <div class="search-result-item" onclick="moModalChiTietGame('${g.id}'); dongSearchDropdown();">
            <img src="${g.cover}" alt="${g.title}" class="search-item-thumb">
            <div class="search-item-info">
              <div class="search-item-title">${g.title}</div>
              <div class="search-item-meta font-mono">${g.genres.slice(0, 2).join(", ")} • ${g.price === 0 ? 'Miễn phí' : dinhDangTien(g.price)}</div>
            </div>
            ${g.discountPercent > 0 ? `<span class="discount-badge-sm">-${g.discountPercent}%</span>` : ''}
          </div>
        `).join("");
      }

      searchResultsDropdown.classList.add("show");
    });
  }

  // 5.2. Xử lý các nút lọc nhanh thể loại (Pill Tags) và Dropdown Sắp xếp
  document.querySelectorAll(".filter-genre-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".filter-genre-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentGenre = pill.dataset.genre;
      updateGamesGrid();
    });
  });

  // Lắng nghe sự kiện thay đổi của Dropdown Sắp xếp game
  const sortSelect = document.getElementById("gameSortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      updateGamesGrid();
    });
  }
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
  const game = GAME_DATABASE.find(g => g.id === gameId);
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
function moModalAuth(tab = 'login') {
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
  const formLogin = document.getElementById("formLogin");
  const formRegister = document.getElementById("formRegister");
  const authTitle = document.getElementById("authModalTitle");

  if (tab === 'login') {
    if (tabLogin) tabLogin.classList.add("active");
    if (tabRegister) tabRegister.classList.remove("active");
    if (formLogin) formLogin.style.display = "block";
    if (formRegister) formRegister.style.display = "none";
    if (authTitle) authTitle.textContent = "Đăng Nhập DRX Store";
  } else {
    if (tabLogin) tabLogin.classList.remove("active");
    if (tabRegister) tabRegister.classList.add("active");
    if (formLogin) formLogin.style.display = "none";
    if (formRegister) formRegister.style.display = "block";
    if (authTitle) authTitle.textContent = "Đăng Ký Tài Khoản Mới";
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
  const fullname = document.getElementById("inputRegName").value.trim();
  const email = document.getElementById("inputRegEmail").value.trim();

  const result = dangKyTaiKhoan(username, pass, fullname, email);
  if (result.success) {
    showToast(result.message, "success");
    dongModalAuth();
    capNhatThanhHeaderUser();
  } else {
    showToast(result.message, "error");
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

  // Nếu giỏ hàng trống: Hiển thị trạng thái rỗng
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

  // Render danh sách sản phẩm trong giỏ
  container.innerHTML = cart.map(item => `
    <div class="cart-drawer-item">
      <img src="${item.cover}" alt="${item.title}" class="drawer-item-img">
      <div class="drawer-item-info">
        <div class="drawer-item-title">${item.title}</div>
        <div class="drawer-item-price font-mono">${item.price === 0 ? 'Miễn phí' : dinhDangTien(item.price)}</div>
      </div>
      <button class="btn-remove-item" onclick="xoaKhoiGio('${item.id}')" title="Xóa khỏi giỏ">✕</button>
    </div>
  `).join("");

  // Render phần tổng kết và nút tiến hành thanh toán
  if (footerContainer) {
    footerContainer.style.display = "block";
    footerContainer.innerHTML = `
      <div class="drawer-summary-rows">
        <div class="summary-row">
          <span>Tạm tính (${summary.soLuong} game):</span>
          <span class="font-mono">${dinhDangTien(summary.tamTinh)}</span>
        </div>
        ${summary.giamGiaVoucher > 0 ? `
          <div class="summary-row text-accent">
            <span>Voucher (${summary.coupon.code}):</span>
            <span class="font-mono">-${dinhDangTien(summary.giamGiaVoucher)}</span>
          </div>
        ` : ''}
        <div class="summary-row total-row">
          <span>Tổng thanh toán:</span>
          <span class="font-mono text-xl text-accent font-bold">${dinhDangTien(summary.tongThanhToan)}</span>
        </div>
      </div>
      <div class="drawer-btn-actions">
        <button class="btn btn-primary btn-block" onclick="thanhToanDonHang()">
          Xác Nhận Thanh Toán Ngay
        </button>
      </div>
    `;
  }
}

// =============================================================================
// CỤM 8: QUẢN LÝ DANH SÁCH GAME YÊU THÍCH (WISHLIST MODAL)
// =============================================================================

// 8.1. Mở Modal danh sách game đã lưu
function moWishlistDrawer() {
  const wishlist = Storage.getWishlist();
  const wishGames = GAME_DATABASE.filter(g => wishlist.includes(g.id));

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
        ${wishGames.map(g => `
          <div class="wishlist-row-item">
            <img src="${g.cover}" alt="${g.title}" class="wishlist-item-thumb">
            <div class="wishlist-item-meta">
              <h4>${g.title}</h4>
              <p class="font-mono text-sm text-muted-foreground">${g.genres.slice(0, 2).join(" • ")} | Đánh giá: ★ ${g.rating}%</p>
              <div class="wishlist-item-price font-mono font-bold">${g.price === 0 ? 'Miễn phí' : dinhDangTien(g.price)}</div>
            </div>
            <div class="wishlist-item-btns">
              <button class="btn btn-primary btn-sm" onclick="themVaoGio('${g.id}'); dongWishlistModal();">Thêm vào giỏ</button>
              <button class="btn btn-outline btn-sm" onclick="toggleWishlist('${g.id}'); moWishlistDrawer();">Bỏ thích</button>
            </div>
          </div>
        `).join("")}
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
  document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
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
// CỤM 10: TIỆN ÍCH CUỘN TRANG (SCROLL UTILITIES: PROGRESS BAR & BACK TO TOP)
// =============================================================================
function khoiTaoTienTrinhCuonTrang() {
  // 1. Tạo & chèn HTML cho Scroll Progress Bar
  if (!document.getElementById("scrollProgressBar")) {
    const progContainer = document.createElement("div");
    progContainer.className = "scroll-progress-container";
    progContainer.innerHTML = `<div id="scrollProgressBar" class="scroll-progress-bar"></div>`;
    document.body.appendChild(progContainer);
  }

  // 2. Tạo & chèn HTML cho Nút Back-to-Top thông minh
  if (!document.getElementById("backToTopBtn")) {
    const btn = document.createElement("button");
    btn.id = "backToTopBtn";
    btn.className = "back-to-top-btn";
    btn.setAttribute("aria-label", "Quay lại đầu trang");
    btn.innerHTML = `
      <svg class="progress-ring" width="50" height="50">
        <circle class="progress-ring__circle-bg" stroke="rgba(255, 255, 255, 0.08)" stroke-width="3" fill="transparent" r="22" cx="25" cy="25"/>
        <circle id="progressRingCircle" class="progress-ring__circle" stroke="url(#progressGradient)" stroke-width="3" fill="transparent" r="22" cx="25" cy="25"/>
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--color-accent)" />
            <stop offset="100%" stop-color="var(--color-accent-secondary)" />
          </linearGradient>
        </defs>
      </svg>
      <span class="arrow-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </span>
    `;
    document.body.appendChild(btn);

    // Sự kiện cuộn mượt lên đầu trang khi click
    btn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  const progressBar = document.getElementById("scrollProgressBar");
  const backBtn = document.getElementById("backToTopBtn");
  const circle = document.getElementById("progressRingCircle");
  
  if (!progressBar || !backBtn || !circle) return;

  // Tính chu vi vòng tròn r = 22px
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;

  // Thiết lập dasharray ban đầu
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = circumference;

  // Hàm cập nhật trạng thái khi cuộn
  function capNhatTrangThaiCuon() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if (scrollHeight <= 0) return;

    const scrollPercent = (scrollTop / scrollHeight) * 100;

    // Cập nhật thanh tiến trình ngang
    progressBar.style.width = `${scrollPercent}%`;

    // Cập nhật viền tròn của nút Back-to-Top
    const offset = circumference - (scrollPercent / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // Ẩn hiện nút Back-to-Top dựa trên vị trí cuộn (>300px)
    if (scrollTop > 300) {
      backBtn.classList.add("show");
    } else {
      backBtn.classList.remove("show");
    }
  }

  window.addEventListener("scroll", capNhatTrangThaiCuon, { passive: true });
  window.addEventListener("resize", capNhatTrangThaiCuon, { passive: true });
  
  // Chạy thử ngay khi khởi tạo
  capNhatTrangThaiCuon();
}

