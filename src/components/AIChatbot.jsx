import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, BookOpen } from 'lucide-react';

// Dữ liệu hướng dẫn sử dụng DRX Store
const DRX_KNOWLEDGE = {
  pos: `Để BÁN HÀNG và THANH TOÁN (POS):
1. Nhấp vào mục "POS" trên thanh menu bên trái.
2. Chọn các linh kiện cần bán bằng cách nhấn vào chúng ở danh sách.
3. Ở cột Giỏ hàng bên phải, điều chỉnh số lượng hoặc xóa bớt.
4. Chọn Khách hàng (bằng cách tìm kiếm mã khách hàng hoặc tên).
5. Nhấp nút "THANH TOÁN".
6. Màn hình sẽ hiện hộp thoại hỏi "Bạn có muốn in hóa đơn không?". Chọn "Có" để in mẫu hóa đơn 80mm có logo DRX STORE.`,

  product: `Để QUẢN LÝ HÀNG HÓA & THÊM SẢN PHẨM:
1. Truy cập mục "Hàng hóa" ở danh sách menu.
2. Bấm nút "THÊM LINH KIỆN MỚI" ở góc phải.
3. Điền các thông tin: Tên sản phẩm, Hãng, Danh mục, Giá bán, Giá vốn và Số lượng tồn kho.
4. Nhấn "Lưu" để hoàn tất. Hệ thống sẽ tự động tạo mã SKU ngẫu nhiên nếu bạn để trống.`,

  customer: `Để QUẢN LÝ KHÁCH HÀNG & CÔNG NỢ:
1. Chọn mục "Khách hàng" trên menu.
2. Tại đây có thể quản lý Mã khách hàng (VD: DRX-KH2629), Tên, SĐT và số dư nợ hiện tại.
3. Khi tạo đơn hàng tại POS, chọn đúng khách hàng để hệ thống tự động đồng bộ doanh số và công nợ cho khách hàng đó.`,

  password: `Để ĐỔI MẬT KHẨU tài khoản:
1. Nhấn vào Avatar của bạn ở góc trên cùng bên phải màn hình.
2. Chọn "Đổi mật khẩu".
3. Nhập mật khẩu mới vào ô trống rồi nhấn nút "Lưu". Mật khẩu của bạn sẽ được mã hóa an toàn và cập nhật ngay lập tức.`
};

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Xin chào! Tôi là Trợ lý ảo DRX Store. Bạn cần tôi hướng dẫn sử dụng tính năng nào hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Gửi tin nhắn của User
    setMessages(prev => [...prev, { sender: 'user', text }]);
    if (!textToSend) setInput('');

    // Phản hồi tự động của Bot
    setTimeout(() => {
      let reply = 'Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Hãy nhấn vào các gợi ý nhanh bên dưới hoặc hỏi về các chủ đề: "pos", "thêm sản phẩm", "khách hàng", "mật khẩu".';
      const cleanText = text.toLowerCase();

      if (cleanText.includes('pos') || cleanText.includes('thanh toan') || cleanText.includes('ban hang') || cleanText.includes('in hoa don') || cleanText.includes('bill')) {
        reply = DRX_KNOWLEDGE.pos;
      } else if (cleanText.includes('sản phẩm') || cleanText.includes('linh kiện') || cleanText.includes('thêm') || cleanText.includes('hang hoa') || cleanText.includes('product')) {
        reply = DRX_KNOWLEDGE.product;
      } else if (cleanText.includes('khách hàng') || cleanText.includes('công nợ') || cleanText.includes('nợ') || cleanText.includes('customer')) {
        reply = DRX_KNOWLEDGE.customer;
      } else if (cleanText.includes('mật khẩu') || cleanText.includes('đổi mật khẩu') || cleanText.includes('pass') || cleanText.includes('password')) {
        reply = DRX_KNOWLEDGE.password;
      }

      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Nút bong bóng chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-[#0052ff] hover:bg-[#0042d1] text-white shadow-lg hover:shadow-xl active:scale-95 transition-all animate-bounce"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Cửa sổ Trợ lý ảo */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-[#0052ff] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Trợ Lý DRX Store</h4>
                <p className="text-[10px] text-blue-200 font-semibold">Hướng dẫn sử dụng hệ thống</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dòng tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-900/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed whitespace-pre-line font-medium shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#0052ff] text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Gợi ý nhanh */}
          <div className="p-2 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button onClick={() => handleSend('Hướng dẫn POS')} className="px-2.5 py-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-600 hover:text-[#0052ff] transition-all">Bán hàng POS</button>
            <button onClick={() => handleSend('Cách thêm sản phẩm')} className="px-2.5 py-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-600 hover:text-[#0052ff] transition-all">Thêm linh kiện</button>
            <button onClick={() => handleSend('Đổi mật khẩu')} className="px-2.5 py-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-600 hover:text-[#0052ff] transition-all">Đổi mật khẩu</button>
          </div>

          {/* Khung nhập tin nhắn */}
          <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900/50 text-xs font-semibold text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0052ff]"
            />
            <button onClick={() => handleSend()} className="p-2 bg-[#0052ff] hover:bg-[#0042d1] text-white rounded-xl active:scale-95 transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
