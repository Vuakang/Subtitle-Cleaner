import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Footer() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'Làm sao để xử lý tập tin phụ đề?',
      a: 'Bước 1: Kéo thả hoặc nhấn vào khung "Upload" bên phải để chọn tập tin .srt của bạn. Bước 2: Chọn các tuỳ chọn dọn dẹp phù hợp ở bảng cài đặt bên trái. Bước 3: Nhấn nút "Clean Subtitle" để xử lý. Bước 4: Nhấn "Download" để tải file đã dọn dẹp về máy.'
    },
    {
      q: 'Website có hỗ trợ xử lý nhiều file cùng lúc không?',
      a: 'Có! Bạn có thể chọn hoặc kéo thả cùng lúc nhiều tập tin .srt. Sau khi xử lý, hệ thống sẽ tự động nén thành file .zip để bạn tải về một lần duy nhất.'
    },
    {
      q: 'Remove SDH là gì?',
      a: 'SDH (Subtitles for the Deaf and Hard of Hearing) là phụ đề dành cho người khiếm thính, thường chứa các mô tả âm thanh như [Tiếng cửa đóng], (Nhạc nền), hay nhãn người nói "JOHN:". Khi bật tuỳ chọn này, các nội dung đó sẽ được xoá để phụ đề trông gọn gàng hơn.'
    },
    {
      q: 'Chức năng chuyển đổi định dạng hỗ trợ những loại nào?',
      a: 'Hiện tại website hỗ trợ chuyển đổi qua lại giữa 4 định dạng phụ đề phổ biến: SRT, VTT (WebVTT), ASS/SSA, và SUB (MicroDVD). Bạn chỉ cần tải file lên, chọn định dạng đầu ra mong muốn và nhấn "Convert".'
    },
    {
      q: 'Dữ liệu của tôi có được gửi lên máy chủ không?',
      a: 'Hoàn toàn không! Toàn bộ quá trình xử lý diễn ra 100% trên trình duyệt của bạn (client-side). Không có bất kỳ dữ liệu nào được tải lên internet. Tập tin của bạn luôn an toàn và riêng tư.'
    },
    {
      q: 'Remove watermarks xoá những gì?',
      a: 'Tính năng này sẽ tự động xoá các dòng phụ đề chứa watermark / credit như "Sync by...", "Subtitles by...", "Downloaded from...", "OpenSubtitles"... giúp file phụ đề sạch sẽ hơn.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-guide">
          <h2>📖 Hướng dẫn sử dụng</h2>
          <div className="guide-steps">
            <div className="guide-step">
              <div className="step-number">1</div>
              <div>
                <h4>Tải tập tin lên</h4>
                <p>Kéo thả hoặc nhấn vào khung Upload để chọn tập tin phụ đề (.srt, .ass, .vtt, .sub)</p>
              </div>
            </div>
            <div className="guide-step">
              <div className="step-number">2</div>
              <div>
                <h4>Chọn tuỳ chọn xử lý</h4>
                <p>Tick chọn các tính năng dọn dẹp mà bạn muốn áp dụng: xoá SDH, watermark, thẻ HTML...</p>
              </div>
            </div>
            <div className="guide-step">
              <div className="step-number">3</div>
              <div>
                <h4>Xử lý & Tải về</h4>
                <p>Nhấn "Clean Subtitle" để bắt đầu. Sau đó nhấn "Download" để lưu file đã dọn dẹp.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-faq">
          <h2>❓ Câu hỏi thường gặp</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => toggleFaq(index)}>
                  <span>{faq.q}</span>
                  {openFaq === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Srt Cleaner — Công cụ xử lý phụ đề miễn phí, bảo mật 100% trên trình duyệt.</p>
      </div>
    </footer>
  );
}
