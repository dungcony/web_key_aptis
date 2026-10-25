import React, { useState } from 'react';

// component bài thi part 2: sắp xếp câu thành đoạn văn hoàn chỉnh
export default function Part2Ordering({
  test,
  sentences,
  onMoveSentence,
  onReorderSentences,
  isChecked
}) {
  const [draggedIdx, setDraggedIdx] = useState(null);

  // bắt đầu kéo thẻ câu
  const handleDragStart = (index) => {
    setDraggedIdx(index);
  };

  // xử lý khi thả thẻ câu vào vị trí mới
  const handleDrop = (dropIndex) => {
    if (draggedIdx === null || draggedIdx === dropIndex) return;
    const newItems = [...sentences];
    const [removed] = newItems.splice(draggedIdx, 1);
    newItems.splice(dropIndex, 0, removed);
    onReorderSentences(newItems);
    setDraggedIdx(null);
  };

  return (
    <div>
      {test.fixedSentence && (
        <div className="ordering-fixed-box">
          <span style={{ color: 'var(--accent)' }}>[Câu mở đầu cố định]:</span> {test.fixedSentence}
        </div>
      )}

      <div className="ordering-container">
        {sentences.map((sentence, idx) => {
          let statusClass = '';
          if (isChecked) {
            statusClass = sentence.correctIndex === idx + 1 ? 'correct' : 'wrong';
          }

          return (
            <div
              key={sentence.id}
              className={`order-item ${statusClass} ${draggedIdx === idx ? 'dragging' : ''}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(idx)}
            >
              <div className="order-number">{idx + 1}</div>
              <div className="order-text">{sentence.text}</div>
              <div className="order-actions">
                <button
                  type="button"
                  className="order-btn"
                  onClick={() => onMoveSentence(idx, -1)}
                  disabled={idx === 0}
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="order-btn"
                  onClick={() => onMoveSentence(idx, 1)}
                  disabled={idx === sentences.length - 1}
                >
                  ▼
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
