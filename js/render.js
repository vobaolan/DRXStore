/**
 * DRX STORE - MODULE RENDER GIAO DIỆN (RENDER MODULE)
 * Chuyên trách sinh mã HTML động để hiển thị:
 * - Thẻ sản phẩm Game Card (chuẩn sàn Key Game)
 * - Cửa sổ xem nhanh chi tiết game (Quick View Modal)
 * - Thông báo nổi góc màn hình (Toast Notification)
 */

// =============================================================================
// CỤM 1: HÀM RENDER THẺ SẢN PHẨM GAME (GAME CARD COMPONENT)
// - Hiển thị ảnh Poster dọc, nhãn giảm giá đỏ, nhãn nền tảng Steam Key
// - Hiển thị tên game, 2 tag thể loại, trạng thái tự động giao key
// - Hiển thị giá gốc gạch ngang (nếu có), giá bán hiện tại và nút thêm vào giỏ
// =============================================================================
function renderGameCard(game, options = {}) {
  // 1.1. Kiểm tra xem game có miễn phí không
  const isFree = game.price === 0;

  // 1.2. Lấy tối đa 2 thể loại đầu tiên để hiển thị dạng thẻ tag nhỏ gọn
  const tagsHtml = game.genres.slice(0, 2).map(g => `<span class="game-tag">${g}</span>`).join("");

  // 1.3. Xác định nhãn nền tảng kích hoạt key
  let platformLabel = "STEAM KEY";
  if (!game.platforms.includes("windows")) platformLabel = "PC KEY";

  // 1.4. Xây dựng cấu trúc HTML hiển thị giá tiền (kèm ô giảm giá UIVerse dưới chân)
  let priceHtml = "";
  if (isFree) {
    priceHtml = `<span class="price-free">Miễn Phí</span>`;
  } else if (game.discountPercent > 0) {
    // Có giảm giá: Hiển thị ô giảm giá đỏ lửa bên cạnh giá gốc gạch ngang + giá bán
    priceHtml = `
      <div class="price-discount-wrap">
        <span class="discount-badge">-${game.discountPercent}%</span>
        <div class="price-column">
          <span class="price-original">${dinhDangTien(game.originalPrice)}</span>
          <span class="price-final">${dinhDangTien(game.price)}</span>
        </div>
      </div>
    `;
  } else {
    // Không giảm giá: Chỉ hiển thị giá bán thông thường
    priceHtml = `
      <div class="price-column">
        <span class="price-final">${dinhDangTien(game.price)}</span>
      </div>
    `;
  }

  // 1.5. Đánh dấu viền phát sáng đối với game siêu phẩm (rating >= 95 hoặc có flag)
  const isBorderHighlight = options.highlightBorder || game.rating >= 95;

  // 1.6. Trả về chuỗi HTML của thẻ Game Card
  return `
    <article class="game-card ${isBorderHighlight ? 'game-card-featured-border' : ''}" data-game-id="${game.id}">
      <div class="game-card-inner">
        <!-- Vùng ảnh Thumbnail Poster dọc (100% sạch sẽ, không che hình) -->
        <div class="game-card-thumb" onclick="moModalChiTietGame('${game.id}')">
          <img src="${game.cover}" alt="${game.title}" loading="lazy" class="game-thumb-img">
          <!-- Lớp phủ hover hiển thị nút xem nhanh -->
          <div class="game-thumb-overlay">
            <span class="btn-quick-view">Xem chi tiết</span>
          </div>
        </div>

        <!-- Thân thẻ sản phẩm -->
        <div class="game-card-body">
          <!-- Tiêu đề game -->
          <h3 class="game-card-title" onclick="moModalChiTietGame('${game.id}')" title="${game.title}">${game.title}</h3>
          
          <!-- Danh sách thẻ tag thể loại -->
          <div class="game-card-tags">${tagsHtml}</div>
          
          <!-- Trạng thái tự động giao key -->
          <div class="game-card-stock">
            <span class="stock-dot"></span>
            <span>Tự động giao key</span>
          </div>

          <!-- Chân thẻ: Giá tiền và nút Thêm vào giỏ hàng -->
          <div class="game-card-footer">
            <div class="game-card-price">${priceHtml}</div>
            <button class="btn-add-cart" onclick="themVaoGio('${game.id}')" title="Thêm vào giỏ hàng">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

// 2. Render Modal Quick View Chi Tiết Game
function renderGameDetailModal(game) {
  const modalContainer = document.getElementById("gameDetailModalContent");
  if (!modalContainer || !game) return;

  const isFree = game.price === 0;

  const screenshotsHtml = game.screenshots.map((s, idx) => `
    <div class="modal-shot-item ${idx === 0 ? 'active' : ''}" onclick="doiModalMainImg('${s}', this)">
      <img src="${s}" alt="Screenshot ${idx + 1}" onerror="this.onerror=null; this.src='${game.cover}';">
    </div>
  `).join("");

  const tagsHtml = game.genres.map(g => `<span class="game-tag">${g}</span>`).join("");

  modalContainer.innerHTML = `
    <div class="modal-game-detail-grid">
      <!-- Cột Trái: Ảnh lớn, Album Screenshots & Cấu hình máy tính (Cân đối hoàn hảo, không còn khoảng trống) -->
      <div class="modal-gallery-col">
        <div class="modal-main-img-wrap">
          <img id="modalGameMainImg" src="${game.screenshots[0] || game.banner}" alt="${game.title}" onerror="this.onerror=null; this.src='${game.cover}';">
        </div>
        <div class="modal-shots-gallery">
          ${screenshotsHtml}
        </div>

        <!-- Cấu hình máy tính yêu cầu dạng Bảng Clean Light (Không cắt chữ, không thừa khoảng trống) -->
        <div class="modal-sys-reqs">
          <div class="sys-req-header">
            <span class="sys-req-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              <span>CẤU HÌNH YÊU CẦU</span>
            </span>
            <span class="sys-req-sub">Tối thiểu & Đề nghị</span>
          </div>
          <div class="sys-req-table">
            <div class="sys-req-row">
              <span class="sys-req-key">HĐH:</span>
              <span class="sys-req-val">${game.systemRequirements.os}</span>
            </div>
            <div class="sys-req-row">
              <span class="sys-req-key">CPU:</span>
              <span class="sys-req-val">${game.systemRequirements.processor}</span>
            </div>
            <div class="sys-req-row">
              <span class="sys-req-key">RAM:</span>
              <span class="sys-req-val">${game.systemRequirements.memory}</span>
            </div>
            <div class="sys-req-row">
              <span class="sys-req-key">GPU:</span>
              <span class="sys-req-val">${game.systemRequirements.graphics}</span>
            </div>
            <div class="sys-req-row">
              <span class="sys-req-key">Ổ cứng:</span>
              <span class="sys-req-val">${game.systemRequirements.storage}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Cột Phải: Thông tin chi tiết, Đánh giá, Tính năng & Mua ngay -->
      <div class="modal-info-col">
        <div class="modal-header-meta">
          <h2 class="modal-game-title">${game.title}</h2>
          <p class="modal-game-desc">${game.description}</p>
        </div>

        <div class="modal-meta-table">
          <div class="meta-row">
            <span class="meta-label">Đánh giá:</span>
            <span class="meta-value text-accent font-semibold">${game.reviewStatus} (${game.reviewCount.toLocaleString('vi-VN')})</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Ngày ra mắt:</span>
            <span class="meta-value font-mono">${game.releaseDate}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Nhà phát triển:</span>
            <span class="meta-value">${game.developer}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Thể loại:</span>
            <div class="meta-tags-wrap">${tagsHtml}</div>
          </div>
        </div>

        <!-- 2. Hộp 4 Tính Năng Nâng Tầm UIVerse (Không rớt chữ) -->
        <div class="modal-features-grid">
          <div class="modal-feature-pill">
            <span class="modal-feat-icon-wrap feat-blue">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </span>
            <span>Chơi đơn & Co-op</span>
          </div>
          <div class="modal-feature-pill">
            <span class="modal-feat-icon-wrap feat-cyan">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
            </span>
            <span>Steam Cloud</span>
          </div>
          <div class="modal-feature-pill">
            <span class="modal-feat-icon-wrap feat-indigo">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line><rect x="2" y="6" width="20" height="12" rx="6"></rect></svg>
            </span>
            <span>Hỗ trợ tay cầm</span>
          </div>
          <div class="modal-feature-pill">
            <span class="modal-feat-icon-wrap feat-emerald">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </span>
            <span>Tự động giao key</span>
          </div>
        </div>

        <!-- 3. Khung Mua Hàng Nâng Cấp UIVerse -->
        <div class="modal-purchase-box">
          <div class="modal-price-wrap">
            ${game.discountPercent > 0 ? `
              <span class="modal-discount-tag">-${game.discountPercent}%</span>
              <div class="modal-price-col">
                <span class="modal-price-original">${dinhDangTien(game.originalPrice)}</span>
                <span class="modal-price-final">${dinhDangTien(game.price)}</span>
              </div>
            ` : `
              <div class="modal-price-col">
                <span class="modal-price-final">${isFree ? 'Miễn phí' : dinhDangTien(game.price)}</span>
              </div>
            `}
          </div>

          <div class="modal-action-btns">
            <button class="modal-btn-cart" onclick="themVaoGio('${game.id}'); dongModalChiTiet();">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              <span>Thêm vào giỏ hàng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function doiModalMainImg(url, el) {
  const mainImg = document.getElementById("modalGameMainImg");
  if (mainImg) mainImg.src = url;
  document.querySelectorAll(".modal-shot-item").forEach(item => item.classList.remove("active"));
  if (el) el.classList.add("active");
}

// 4. Render Toast thông báo nổi góc màn hình
function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${type}`;

  let iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  if (type === "success") {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
  } else if (type === "error") {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  // Tự hủy sau 3.5 giây
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
