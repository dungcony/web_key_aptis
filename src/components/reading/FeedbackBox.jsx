import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

// component hiển thị kết quả chấm điểm và lời giải chi tiết
export default function FeedbackBox({ result, fullPassage }) {
  if (!result) return null;

  const { correctCount, totalCount, percentage, isGood, items } = result;

  return (
    <div className="feedback-box">
      <div className={`feedback-score ${isGood ? 'good' : 'bad'}`}>
        {isGood ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
        <span>
          {isGood ? 'Tuyệt vời!' : 'Cần cố gắng thêm!'} Kết quả: {correctCount}/{totalCount} câu đúng ({percentage}%)
        </span>
      </div>

      <div className="explanations-list">
        {items.map((item, idx) => (
          <div key={idx} className="explanation-item">
            <strong>{item.label}:</strong> Bạn chọn <em>"{item.userAnswer || '(chưa chọn)'}"</em> - Đáp án đúng:{' '}
            <strong style={{ color: 'var(--success)' }}>{item.correctAnswer}</strong>
            {item.explanation && (
              <>
                <br />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>💡 {item.explanation}</span>
              </>
            )}
          </div>
        ))}
      </div>

      {fullPassage && (
        <div className="full-passage-box">
          <div className="full-passage-title">Đoạn văn hoàn chỉnh:</div>
          <div className="full-passage-content">{fullPassage}</div>
        </div>
      )}
    </div>
  );
}
