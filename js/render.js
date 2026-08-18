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

  // 1.4. Xây dựng cấu trúc HTML hiển thị giá tiền
  let priceHtml = "";
  if (isFree) {
    priceHtml = `<span class="price-free">Miễn Phí</span>`;
  } else if (game.discountPercent > 0) {
    // Có giảm giá: Hiển thị giá gốc gạch ngang + giá bán nổi bật
    priceHtml = `
      <div class="price-column">
        <span class="price-original">${dinhDangTien(game.originalPrice)}</span>
        <span class="price-final">${dinhDangTien(game.price)}</span>
      </div>
    `;
  } else {
    // Không giảm giá: Chỉ hiển thị giá bán thông thường
    priceHtml = `<span class="price-final">${dinhDangTien(game.price)}</span>`;
  }

  // 1.5. Đánh dấu viền phát sáng đối với game siêu phẩm (rating >= 95 hoặc có flag)
  const isBorderHighlight = options.highlightBorder || game.rating >= 95;

  // 1.6. Trả về chuỗi HTML của thẻ Game Card
  return `
    <article class="game-card ${isBorderHighlight ? 'game-card-featured-border' : ''}" data-game-id="${game.id}">
      <div class="game-card-inner">
        <!-- Vùng ảnh Thumbnail Poster dọc -->
        <div class="game-card-thumb" onclick="moModalChiTietGame('${game.id}')">
          <img src="${game.cover}" alt="${game.title}" loading="lazy" class="game-thumb-img">
          <!-- Huy hiệu phần trăm giảm giá góc trên bên trái -->
          ${game.discountPercent > 0 ? `<span class="badge-discount-top">-${game.discountPercent}%</span>` : ''}
          <!-- Huy hiệu nền tảng kích hoạt góc trên bên phải -->
          <span class="badge-platform-top">${platformLabel}</span>
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

        <!-- Cấu hình máy tính yêu cầu -->
        <div class="modal-sys-reqs">
          <div class="sys-req-title">⚙️ CẤU HÌNH HỆ THỐNG YÊU CẦU:</div>
          <ul class="sys-req-list">
            <li><b>HĐH:</b> ${game.systemRequirements.os}</li>
            <li><b>CPU:</b> ${game.systemRequirements.processor}</li>
            <li><b>RAM:</b> ${game.systemRequirements.memory}</li>
            <li><b>GPU:</b> ${game.systemRequirements.graphics}</li>
            <li><b>Ổ cứng:</b> ${game.systemRequirements.storage}</li>
          </ul>
        </div>
      </div>

      <!-- Cột Phải: Thông tin chi tiết, Đánh giá, Tính năng & Mua ngay -->
      <div class="modal-info-col">
        <div>
          <div class="modal-header-meta">
            <div class="section-badge mb-1">
              <span class="badge-dot" style="background: #10B981;"></span>
              <span class="badge-text font-mono" style="color: #10B981;">● BẢN QUYỀN STEAM KEY</span>
            </div>
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

          <!-- Hộp Tính Năng Đi Kèm -->
          <div class="modal-features-grid">
            <div class="modal-feature-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              <span>Single-player & Co-op</span>
            </div>
            <div class="modal-feature-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>
              <span>Steam Cloud Save</span>
            </div>
            <div class="modal-feature-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
              <span>Hỗ trợ tay cầm</span>
            </div>
            <div class="modal-feature-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span>Tự động giao key 5s</span>
            </div>
          </div>
        </div>

        <!-- Mua / Thêm giỏ hàng -->
        <div class="modal-purchase-box">
          <div class="modal-price-wrap">
            ${game.discountPercent > 0 ? `
              <span class="discount-badge-lg">-${game.discountPercent}%</span>
              <div class="modal-price-col">
                <span class="price-original">${dinhDangTien(game.originalPrice)}</span>
                <span class="price-final text-2xl">${dinhDangTien(game.price)}</span>
              </div>
            ` : `<span class="price-final text-2xl">${isFree ? 'Miễn phí' : dinhDangTien(game.price)}</span>`}
          </div>

          <div class="modal-action-btns">
            <button class="btn btn-primary btn-md" onclick="themVaoGio('${game.id}'); dongModalChiTiet();">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
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
