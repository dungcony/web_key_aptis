import React from 'react';

// component bài thi part 5: ghép tiêu đề cho các đoạn văn trong bài dài
export default function Part5Headings({ test, userAnswers, onChangeAnswer, isChecked }) {
  return (
    <div>
      <div className="headings-list-card">
        <div className="headings-list-title">Danh sách các tiêu đề lựa chọn:</div>
        <div className="headings-tags">
          {test.headings.map((heading) => (
            <span key={heading} className="heading-tag">
              📌 {heading}
            </span>
          ))}
        </div>
      </div>

      <div className="paragraphs-column">
        {test.paragraphs.map((p) => {
          const currentVal = userAnswers[p.paragraphNumber] || '';
          let statusClass = '';
          if (isChecked) {
            statusClass = currentVal === p.correctHeading ? 'correct' : 'wrong';
          }

          return (
            <div key={p.paragraphNumber} className="paragraph-card">
              <div className="paragraph-header">
                <span className="paragraph-badge">Đoạn văn {p.paragraphNumber}</span>
              </div>
              <div className="paragraph-content">{p.text}</div>
              <div>
                <select
                  className={`paragraph-select ${statusClass}`}
                  value={currentVal}
                  onChange={(e) => onChangeAnswer(p.paragraphNumber, e.target.value)}
                >
                  <option value="">-- Chọn tiêu đề phù hợp cho đoạn {p.paragraphNumber} --</option>
                  {test.headings.map((heading) => (
                    <option key={heading} value={heading}>
                      {heading}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
