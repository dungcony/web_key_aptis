import React from 'react';

// component bài thi part 1: hiển thị mỗi câu văn chứa chỗ trống thành một box riêng biệt
export default function Part1Matching({ test, userAnswers, onChangeAnswer, isChecked }) {
  const subtitle = test.subtitle || 'Choose the word that fits in the gap 01';

  return (
    <div className="part1-container">
      <div className="part1-instruction-title">{subtitle}</div>

      <div className="sentences-list">
        {test.sentences.map((sentence) => {
          const selectedVal = userAnswers[sentence.id] || '';
          const isRight = selectedVal.toLowerCase() === sentence.answer.toLowerCase();

          let boxStatusClass = '';
          let selectStatusClass = '';
          if (isChecked) {
            boxStatusClass = isRight ? 'box-correct' : 'box-wrong';
            selectStatusClass = isRight ? 'select-correct' : 'select-wrong';
          }

          return (
            <div key={sentence.id} className={`sentence-row-box ${boxStatusClass}`}>
              <div className="sentence-text-wrapper">
                <span className="sentence-text-part">{sentence.beforeText}</span>

                <div className="sentence-select-wrapper">
                  <select
                    className={`sentence-inline-select ${selectStatusClass}`}
                    value={selectedVal}
                    onChange={(e) => onChangeAnswer(sentence.id, e.target.value)}
                  >
                    <option value=""> </option>
                    {sentence.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="sentence-text-part">{sentence.afterText}</span>
              </div>

              {isChecked && (
                <div className="sentence-feedback-row">
                  {isRight ? (
                    <span className="status-text-correct">✓ Chính xác</span>
                  ) : (
                    <span className="status-text-wrong">
                      ✗ Đáp án đúng: <strong>{sentence.answer}</strong>
                    </span>
                  )}
                  {sentence.explanation && (
                    <span className="sentence-hint">💡 {sentence.explanation}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
