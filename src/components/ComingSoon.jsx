import React from 'react';
import { ArrowLeft } from 'lucide-react';

// component thông báo cho các kỹ năng đang chờ bổ sung dữ liệu
export default function ComingSoon({ skillName, onBackToReading }) {
  const displayNames = {
    listening: 'Listening (Nghe hiểu)',
    speaking: 'Speaking (Nói)',
    writing: 'Writing (Viết)'
  };

  return (
    <section className="coming-soon-card">
      <div className="coming-soon-icon">🚀</div>
      <h2 className="coming-soon-title">Kỹ năng {displayNames[skillName] || skillName}</h2>
      <p className="coming-soon-desc">
        Hệ thống đang chuẩn bị cấu trúc câu hỏi và âm thanh/chấm điểm cho kỹ năng này.
        Bạn có thể cung cấp thêm tài liệu PDF hoặc đề thi để được nạp vào hệ thống bất cứ lúc nào!
      </p>
      <div style={{ marginTop: '24px' }}>
        <button type="button" className="btn btn-primary" onClick={onBackToReading}>
          <ArrowLeft size={16} /> Quay lại phần Reading
        </button>
      </div>
    </section>
  );
}
