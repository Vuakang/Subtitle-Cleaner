# 🤝 Srt Cleaner — Tài liệu bàn giao (Handoff)

> **Ngày bàn giao:** 12/08/2026 (cập nhật)  
> **Trạng thái:** ✅ Hoàn thành — Sẵn sàng deploy

---

## 1. Tóm tắt dự án

Website **Srt Cleaner** là công cụ xử lý phụ đề trực tuyến, chạy hoàn toàn trên trình duyệt (không cần backend). Website bao gồm 3 chức năng chính:

1. **Dọn dẹp phụ đề SRT** — Xoá thẻ HTML, SDH, watermark, speaker labels, nốt nhạc, và nhiều tuỳ chọn khác.
2. **Chuyển đổi định dạng** — Convert giữa SRT ↔ VTT ↔ ASS ↔ SUB.
3. **Resync Subtitles** — Dịch chuyển toàn bộ timestamp phụ đề theo số millisecond (hỗ trợ 5 định dạng: srt, ass, ssa, smi, vtt).

Cả ba chức năng đều hỗ trợ xử lý hàng loạt (batch) và tải về dưới dạng `.zip`.

---

## 2. Danh sách file & vai trò

### Cấu hình dự án
| File | Vai trò |
|------|---------|
| [`index.html`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/index.html) | HTML entry point, chứa meta tags SEO và favicon |
| [`package.json`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/package.json) | Quản lý dependencies: React 19, Vite 8, JSZip, lucide-react |
| [`vite.config.js`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/vite.config.js) | Cấu hình Vite với plugin React |

### Source code chính
| File | Vai trò |
|------|---------|
| [`src/main.jsx`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/src/main.jsx) | React DOM render — mount `<App />` vào `#root` |
| [`src/App.jsx`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/src/App.jsx) | Component gốc — quản lý state toàn cục, tích hợp tất cả component con |
| [`src/index.css`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/src/index.css) | CSS duy nhất — chứa Dark/Light theme, Glassmorphism, layout, animations |

### Components
| File | Vai trò |
|------|---------|
| [`Uploader.jsx`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/src/components/Uploader.jsx) | Khu vực kéo thả / chọn file .srt (hỗ trợ multi-file) |
| [`Settings.jsx`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/src/components/Settings.jsx) | 3 nhóm checkbox: Options, Remove text formatting, Remove between |
| [`FormatConverter.jsx`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/src/components/FormatConverter.jsx) | UI chuyển đổi định dạng — upload, chọn format, convert, download |
| [`ResyncSubtitles.jsx`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/src/components/ResyncSubtitles.jsx) | UI đồng bộ lại thời gian phụ đề — nhập ms, resync, download |
| [`ThemeToggle.jsx`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/src/components/ThemeToggle.jsx) | Nút Dark/Light mode — lưu vào localStorage |
| [`Footer.jsx`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/src/components/Footer.jsx) | Hướng dẫn sử dụng 3 bước + 6 câu FAQ accordion (tiếng Việt) |

### Utils (Logic xử lý)
| File | Vai trò |
|------|---------|
| [`srtCleaner.js`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/src/utils/srtCleaner.js) | Engine dọn dẹp SRT — parse → apply regex rules → rebuild |
| [`formatConverter.js`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/src/utils/formatConverter.js) | Engine chuyển đổi — parse 4 format → unified cue → serialize lại |
| [`resyncSubtitle.js`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/src/utils/resyncSubtitle.js) | Engine dịch chuyển timestamp — hỗ trợ SRT, VTT, ASS, SSA, SMI |

### Assets
| File | Vai trò |
|------|---------|
| [`public/favicon.svg`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/public/favicon.svg) | Favicon tuỳ chỉnh — hình khung phụ đề gradient xanh-tím |

---

## 3. Hướng dẫn tiếp nhận

### Cài đặt & chạy thử
```bash
# Clone hoặc tải thư mục dự án
cd "Project Website SRT Cleaner & Converter Subtitle"

# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev
# → http://localhost:5173

# Build production
npm run build
# → Output: dist/
```

### Deploy lên Netlify

**Cách 1 — Kéo thả (nhanh nhất):**
1. Chạy `npm run build` để tạo thư mục `dist/`.
2. Vào [app.netlify.com](https://app.netlify.com).
3. Kéo thả thư mục `dist/` vào giao diện Netlify.
4. Website sẽ live trong vài giây.

**Cách 2 — Kết nối Git (tự động deploy):**
1. Đẩy code lên GitHub.
2. Vào Netlify → New site → Import from Git.
3. Cấu hình:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Mỗi lần push code, Netlify sẽ tự động build lại.

---

## 4. Lưu ý kỹ thuật quan trọng

### Xử lý 100% Client-side
Toàn bộ logic (dọn dẹp, chuyển đổi, nén ZIP) chạy trên trình duyệt. Không có backend, API, hay database. Điều này có nghĩa:
- ✅ Không tốn chi phí máy chủ (chỉ trả tiền hosting static).
- ✅ Dữ liệu người dùng hoàn toàn riêng tư.
- ⚠️ Với file rất lớn (>10MB), trình duyệt có thể chậm — tuy nhiên file phụ đề thường chỉ vài trăm KB.

### CSS Architecture
- Toàn bộ styling nằm trong **1 file duy nhất** [`src/index.css`](file:///Users/ooazeroes/Documents/Project%20Website%20SRT%20Cleaner%20%26%20Converter%20Subtitle/src/index.css).
- Dark/Light mode dùng CSS custom properties (`--var`) và `data-theme` attribute trên `<html>`.
- Không dùng CSS-in-JS, CSS Modules, hay Tailwind.

### Mở rộng trong tương lai
Nếu muốn thêm tính năng, các hướng gợi ý:
- **Partial Sync Shifter** (dịch chuyển thời gian từng phần, không phải toàn bộ file) — mở rộng `resyncSubtitle.js`.
- **Preview Before/After** — thêm component hiển thị diff.
- **Encoding detection** — tích hợp thư viện `jschardet` hoặc `chardet`.
- **Drag-and-drop reorder** — cho phép sắp xếp thứ tự file khi xử lý batch.

---

## 5. Checklist bàn giao

- [x] Source code hoàn chỉnh, không có lỗi build
- [x] `npm run build` thành công (bundle ~100KB gzip)
- [x] Dark/Light mode hoạt động + lưu localStorage
- [x] Upload single file + multi file
- [x] Download single file + batch `.zip`
- [x] Chuyển đổi 4 định dạng (SRT, VTT, ASS, SUB)
- [x] Resync Subtitles — 5 định dạng (SRT, ASS, SSA, SMI, VTT)
- [x] Footer hướng dẫn + FAQ tiếng Việt
- [x] Favicon tuỳ chỉnh + Title SEO
- [x] Responsive (Mobile / Tablet / Desktop)
- [x] Tài liệu `overview.md` đã cập nhật
- [x] Tài liệu `handoff.md` đã cập nhật
