import React from 'react';

// component bài thi part 4: đọc hiểu ý kiến phát biểu của 4 người
export default function Part4Opinions({ test, userAnswers, onChangeAnswer, isChecked }) {
  const peopleNames = test.people.map((p) => p.name);

  return (
    <div className="split-view-container">
      <div className="people-column">
        {test.people.map((person) => (
          <div key={person.name} className="person-card">
            <div className="person-name">{person.name}</div>
            <div className="person-quote">{person.text}</div>
          </div>
        ))}
      </div>

      <div className="matching-questions-column">
        {test.questions.map((q, idx) => {
          const currentVal = userAnswers[q.id] || '';
          let statusClass = '';
          if (isChecked) {
            statusClass = currentVal.toLowerCase() === q.answer.toLowerCase() ? 'correct' : 'wrong';
          }

          return (
            <div key={q.id} className="question-match-item">
              <div className="question-match-header">
                {idx + 1}. {q.question}
              </div>
              <div className="match-select-box">
                <select
                  className={`match-select ${statusClass}`}
                  value={currentVal}
                  onChange={(e) => onChangeAnswer(q.id, e.target.value)}
                >
                  <option value="">-- Chọn người phát biểu --</option>
                  {peopleNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
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
