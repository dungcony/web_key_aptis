import React from 'react';
import AudioPlayer from './AudioPlayer';

// component bài thi listening part 4: độc thoại và trả lời 2 câu hỏi trắc nghiệm
export default function Part4Monologue({ test, userAnswers, onChangeAnswer, isChecked }) {
  return (
    <div className="listening-part-container">
      {/* trình phát âm thanh bài độc thoại */}
      <AudioPlayer
        textToPlay={test.transcript || test.tip || test.title}
        transcriptText={test.transcript}
        tipText={test.tip}
      />

      {/* danh sách 2 câu hỏi trắc nghiệm, mỗi câu là một box riêng biệt */}
      <div className="listening-questions-grid">
        {test.questions.map((q) => {
          const selectedLetter = userAnswers[q.id] || '';
          const isRight = selectedLetter.toUpperCase() === q.answer.toUpperCase();

          let cardStatusClass = '';
          if (isChecked) {
            cardStatusClass = isRight ? 'box-correct' : 'box-wrong';
          }

          return (
            <div key={q.id} className={`listening-question-card ${cardStatusClass}`}>
              <div className="listening-q-header">
                <span className="q-number-pill">Câu hỏi {q.id}</span>
                {isChecked && (
                  <span className={`statement-status-tag ${isRight ? 'tag-correct' : 'tag-wrong'}`}>
                    {isRight ? '✓ Chính xác' : `✗ Đáp án đúng: ${q.answer}`}
                  </span>
                )}
              </div>

              <div className="listening-q-title">{q.question}</div>

              {/* ba phương án lựa chọn a, b, c */}
              <div className="options-vertical-list">
                {q.options.map((opt) => {
                  const isSelected = selectedLetter.toUpperCase() === opt.letter.toUpperCase();
                  const isCorrectAnswer = q.answer.toUpperCase() === opt.letter.toUpperCase();

                  let optClass = 'option-choice-btn';
                  if (isSelected) optClass += ' selected';
                  if (isChecked) {
                    if (isCorrectAnswer) optClass += ' opt-correct';
                    else if (isSelected && !isCorrectAnswer) optClass += ' opt-wrong';
                  }

                  return (
                    <button
                      key={opt.letter}
                      type="button"
                      className={optClass}
                      onClick={() => onChangeAnswer(q.id, opt.letter)}
                    >
                      <span className="option-letter">{opt.letter}</span>
                      <span className="option-label">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
