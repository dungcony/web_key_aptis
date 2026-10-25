import React from 'react';
import AudioPlayer from './AudioPlayer';

// component bài thi listening part 3: chọn người phát biểu ý kiến man / woman / both
export default function Part3ManWoman({ test, userAnswers, onChangeAnswer, isChecked }) {
  const options = ['Man', 'Woman', 'Both'];

  return (
    <div className="listening-part-container">
      {/* trình phát âm thanh bài hội thoại */}
      <AudioPlayer
        textToPlay={test.transcript || test.title}
        transcriptText={test.transcript}
      />

      {/* danh sách 4 nhận định ý kiến, mỗi nhận định là một box độc lập */}
      <div className="listening-statements-list">
        {test.statements.map((st) => {
          const selectedVal = userAnswers[st.id] || '';
          const isRight = selectedVal.toLowerCase() === st.answer.toLowerCase();

          let boxStatusClass = '';
          if (isChecked) {
            boxStatusClass = isRight ? 'box-correct' : 'box-wrong';
          }

          return (
            <div key={st.id} className={`listening-statement-card ${boxStatusClass}`}>
              <div className="statement-header-row">
                <span className="statement-number-badge">Nhận định {st.id}</span>
                {isChecked && (
                  <span className={`statement-status-tag ${isRight ? 'tag-correct' : 'tag-wrong'}`}>
                    {isRight ? '✓ Chính xác' : `✗ Đáp án đúng: ${st.answer}`}
                  </span>
                )}
              </div>

              <div className="statement-text-body">{st.statement}</div>

              {/* ba lựa chọn man, woman, both dạng nút bấm lớn */}
              <div className="speakers-choice-row">
                {options.map((opt) => {
                  const isSelected = selectedVal.toLowerCase() === opt.toLowerCase();
                  const isCorrectAnswer = st.answer.toLowerCase() === opt.toLowerCase();

                  let btnClass = 'speaker-choice-btn';
                  if (isSelected) btnClass += ' selected';
                  if (isChecked) {
                    if (isCorrectAnswer) btnClass += ' opt-correct';
                    else if (isSelected && !isCorrectAnswer) btnClass += ' opt-wrong';
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      className={btnClass}
                      onClick={() => onChangeAnswer(st.id, opt)}
                    >
                      {opt === 'Man' && '👨 Nam (Man)'}
                      {opt === 'Woman' && '👩 Nữ (Woman)'}
                      {opt === 'Both' && '👥 Cả hai (Both)'}
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
