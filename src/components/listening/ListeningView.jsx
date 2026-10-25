import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Check, Headphones } from 'lucide-react';
import { APTIS_LISTENING_DATA } from '../../data/listeningData';
import Part3ManWoman from './Part3ManWoman';
import Part4Monologue from './Part4Monologue';
import FeedbackBox from '../reading/FeedbackBox';

// component view chính cho toàn bộ kỹ năng listening
export default function ListeningView({ onCompleteTest, completedMap }) {
  const [activePartId, setActivePartId] = useState('part3');
  const [activeTestId, setActiveTestId] = useState('1');

  // trạng thái câu trả lời của người dùng
  const [userAnswers, setUserAnswers] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [result, setResult] = useState(null);

  const currentPart = APTIS_LISTENING_DATA.parts.find((p) => p.id === activePartId) || APTIS_LISTENING_DATA.parts[0];
  const currentTest = currentPart.tests.find((t) => t.id === activeTestId) || currentPart.tests[0];

  // đặt lại câu trả lời khi đổi bài test
  useEffect(() => {
    setUserAnswers({});
    setIsChecked(false);
    setResult(null);
  }, [activePartId, activeTestId, currentTest]);

  // chuyển đổi qua lại giữa part 3 và part 4
  const handleSelectPart = (partId) => {
    setActivePartId(partId);
    const targetPart = APTIS_LISTENING_DATA.parts.find((p) => p.id === partId);
    if (targetPart && targetPart.tests.length > 0) {
      setActiveTestId(targetPart.tests[0].id);
    }
  };

  // cập nhật câu trả lời của người dùng
  const handleChangeAnswer = (key, value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // chấm điểm và tính toán kết quả bài nghe
  const handleCheckAnswers = useCallback(() => {
    let correctCount = 0;
    let totalCount = 0;
    const items = [];

    if (activePartId === 'part3') {
      totalCount = currentTest.statements.length;
      currentTest.statements.forEach((st) => {
        const userVal = userAnswers[st.id] || '';
        const isRight = userVal.toLowerCase() === st.answer.toLowerCase();
        if (isRight) correctCount++;
        items.push({
          label: `Nhận định ${st.id}: "${st.statement}"`,
          userAnswer: userVal,
          correctAnswer: st.answer
        });
      });
    } else if (activePartId === 'part4') {
      totalCount = currentTest.questions.length;
      currentTest.questions.forEach((q) => {
        const userVal = userAnswers[q.id] || '';
        const isRight = userVal.toUpperCase() === q.answer.toUpperCase();
        if (isRight) correctCount++;
        const correctOpt = q.options.find((o) => o.letter.toUpperCase() === q.answer.toUpperCase());
        items.push({
          label: `Câu hỏi ${q.id}: "${q.question}"`,
          userAnswer: userVal,
          correctAnswer: `${q.answer}. ${correctOpt ? correctOpt.text : ''}`
        });
      });
    }

    const percentage = Math.round((correctCount / totalCount) * 100);
    const isGood = percentage >= 70;

    setIsChecked(true);
    setResult({
      correctCount,
      totalCount,
      percentage,
      isGood,
      items
    });

    onCompleteTest(`listening_${activePartId}`, currentTest.id, correctCount, totalCount);
  }, [activePartId, currentTest, userAnswers, onCompleteTest]);

  // làm lại bài đang nghe
  const handleReset = () => {
    setUserAnswers({});
    setIsChecked(false);
    setResult(null);
  };

  // chuyển bài trước hoặc bài tiếp theo
  const handleNavigate = (offset) => {
    const currentIndex = currentPart.tests.findIndex((t) => t.id === activeTestId);
    const targetIndex = currentIndex + offset;
    if (targetIndex >= 0 && targetIndex < currentPart.tests.length) {
      setActiveTestId(currentPart.tests[targetIndex].id);
    }
  };

  const currentIndex = currentPart.tests.findIndex((t) => t.id === activeTestId);
  const totalTests = currentPart.tests.length;

  return (
    <section>
      {/* thanh chọn các part của listening */}
      <div className="parts-bar">
        {APTIS_LISTENING_DATA.parts.map((part) => (
          <button
            key={part.id}
            type="button"
            className={`part-tab-btn ${part.id === activePartId ? 'active' : ''}`}
            onClick={() => handleSelectPart(part.id)}
          >
            {part.title}
          </button>
        ))}
      </div>

      {/* thanh chọn từng bài test trong part */}
      <div className="test-selector-bar">
        {currentPart.tests.map((test, idx) => {
          const isDone = completedMap[`listening_${activePartId}_${test.id}`];
          return (
            <button
              key={test.id}
              type="button"
              className={`test-btn ${test.id === activeTestId ? 'active' : ''} ${isDone ? 'completed' : ''}`}
              onClick={() => setActiveTestId(test.id)}
            >
              <span>Bài {idx + 1}</span>
              {isDone && <Check size={14} className="test-badge-check" />}
            </button>
          );
        })}
      </div>

      {/* thanh header chuẩn giao diện */}
      <div className="exam-top-nav-card">
        <div className="nav-left-section">
          <button
            type="button"
            className="nav-back-circle-btn"
            onClick={() => handleNavigate(-1)}
            disabled={currentIndex <= 0}
            title="Quay lại bài trước"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="nav-icon-box">
            <Headphones size={18} />
          </div>
          <div className="nav-title-group">
            <h2 className="nav-main-title">{currentPart.title}</h2>
            <p className="nav-sub-title">{currentTest.title}</p>
          </div>
        </div>

        <div className="nav-badge-pill">
          Bài {currentIndex + 1}/{totalTests}
        </div>
      </div>

      {/* thẻ bài làm chính */}
      <div className="exam-card">
        {activePartId === 'part3' && (
          <Part3ManWoman
            test={currentTest}
            userAnswers={userAnswers}
            onChangeAnswer={handleChangeAnswer}
            isChecked={isChecked}
          />
        )}

        {activePartId === 'part4' && (
          <Part4Monologue
            test={currentTest}
            userAnswers={userAnswers}
            onChangeAnswer={handleChangeAnswer}
            isChecked={isChecked}
          />
        )}

        {/* thanh nút điều khiển */}
        <div className="controls-bar">
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => handleNavigate(-1)}
              disabled={currentIndex <= 0}
            >
              <ArrowLeft size={16} /> Bài trước
            </button>
            <button type="button" className="btn btn-outline" onClick={handleReset}>
              <RotateCcw size={16} /> Làm lại
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn btn-primary" onClick={handleCheckAnswers}>
              Kiểm tra đáp án
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => handleNavigate(1)}
              disabled={currentIndex >= totalTests - 1}
            >
              Bài tiếp theo <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* kết quả và lời giải chi tiết */}
        <FeedbackBox result={result} />
      </div>
    </section>
  );
}
