const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const regex = /<div class="form-group" style="margin-top: 16px;">[\s\S]*?<button type="submit" class="btn btn-primary btn-block btn-md" style="margin-top: 24px;">Xác Nhận & Thanh Toán<\/button>/;

const replaceStr = `<div class="form-group" style="margin-top: 16px;">
              <label class="form-label" style="margin-bottom: 8px;">Phương thức thanh toán</label>
              <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                <label id="labelPayWallet" style="flex: 1; padding: 12px; border: 2px solid #3B82F6; border-radius: 12px; background: #EFF6FF; cursor: pointer; text-align: center; font-weight: 600; color: #1E40AF; transition: all 0.2s;" onclick="selectPayment('wallet')">
                  <input type="radio" name="paymentMethod" value="wallet" checked style="display:none;">
                  Ví DRX
                  <br><span id="checkoutWalletBalance" style="font-size: 0.8rem; font-weight: normal; color: #3B82F6;"></span>
                </label>
                <label id="labelPayQR" style="flex: 1; padding: 12px; border: 2px solid #E2E8F0; border-radius: 12px; background: #FFFFFF; cursor: pointer; text-align: center; font-weight: 600; color: #64748B; transition: all 0.2s;" onclick="selectPayment('qr')">
                  <input type="radio" name="paymentMethod" value="qr" style="display:none;">
                  Quét mã QR
                  <br><span style="font-size: 0.8rem; font-weight: normal;">Chuyển khoản 24/7</span>
                </label>
              </div>
              
              <div id="qrCodeContainer" style="display: none; text-align: center; padding: 16px; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 12px;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ThanhToanDRXStore" alt="QR Code" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="margin-top: 12px; font-weight: 600; color: #0F172A;">Quét mã bằng App Ngân Hàng</div>
                <div style="font-size: 0.875rem; color: #64748B;">Đơn hàng sẽ tự động duyệt sau 5-10 giây</div>
              </div>
            </div>
            
            <button type="submit" class="btn btn-primary btn-block btn-md" style="margin-top: 24px;">Xác Nhận & Thanh Toán</button>`;

if (html.match(regex)) {
  html = html.replace(regex, replaceStr);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('index.html updated successfully');
} else {
  console.log('Failed to match index.html');
}
