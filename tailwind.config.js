/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#0000C8',       // Xanh Cobalt gốc từ Logo DRX
          primary: '#0052FF',    // Xanh Neon/Electric làm màu nhấn thương hiệu
          accent: '#00C3FF',
        },
        retail: {
          base: '#F4F6F9',       // Nền xám nhạt kiểu KiotViet
          surface: '#FFFFFF',    // Nền trắng tinh khôi cho container
          border: '#E2E8F0',     // Viền slate nhẹ nhàng
          textDark: '#212529',   // Chữ xám tối/đen chính
          textMuted: '#6C757D',  // Chữ mô tả xám nhạt
          lightBlue: '#E6F0FF'   // Màu nền phụ xanh nhạt
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
// Trigger HMR 2
