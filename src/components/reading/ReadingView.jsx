import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Check, FileText } from 'lucide-react';
import { APTIS_READING_DATA } from '../../data/readingData';
import Part1Matching from './Part1Matching';
import Part2Ordering from './Part2Ordering';
import Part4Opinions from './Part4Opinions';
import Part5Headings from './Part5Headings';
import FeedbackBox from './FeedbackBox';

// component view chính cho toàn bộ kỹ năng reading
export default function ReadingView({ onCompleteTest, completedMap }) {
  const [activePartId, setActivePartId] = useState('part1');
  const [activeTestId, setActiveTestId] = useState('31');

  // trạng thái câu trả lời của người dùng
  const [userAnswers, setUserAnswers] = useState({});
  const [orderedSentences, setOrderedSentences] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [result, setResult] = useState(null);

  const currentPart = APTIS_READING_DATA.parts.find((p) => p.id === activePartId) || APTIS_READING_DATA.parts[0];
  const currentTest = currentPart.tests.find((t) => t.id === activeTestId) || currentPart.tests[0];

  // khởi tạo lại dữ liệu khi đổi bài test
  useEffect(() => {
    setUserAnswers({});
    setIsChecked(false);
    setResult(null);

    if (activePartId === 'part2' && currentTest.sentences) {
      // xáo trộn thứ tự các câu ban đầu để thực hành
      const shuffled = [...currentTest.sentences].sort(() => Math.random() - 0.5);
      setOrderedSentences(shuffled);
    }
  }, [activePartId, activeTestId, currentTest]);

  // chuyển đổi phần thi part
  const handleSelectPart = (partId) => {
    setActivePartId(partId);
    const targetPart = APTIS_READING_DATA.parts.find((p) => p.id === partId);
    if (targetPart && targetPart.tests.length > 0) {
      setActiveTestId(targetPart.tests[0].id);
    }
  };

  // cập nhật câu trả lời dạng dropdown
  const handleChangeAnswer = (key, value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // di chuyển câu trong part 2 bằng nút bấm
  const handleMoveSentence = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= orderedSentences.length) return;

    const newItems = [...orderedSentences];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setOrderedSentences(newItems);
  };

  // cập nhật toàn bộ mảng câu khi kéo thả
  const handleReorderSentences = (newItems) => {
    setOrderedSentences(newItems);
  };

  // chấm điểm và tính toán kết quả bài làm
  const handleCheckAnswers = useCallback(() => {
    let correctCount = 0;
    let totalCount = 0;
    const items = [];

    if (activePartId === 'part1') {
      totalCount = currentTest.sentences.length;
      currentTest.sentences.forEach((sentence) => {
        const userVal = userAnswers[sentence.id] || '';
        const isRight = userVal.toLowerCase() === sentence.answer.toLowerCase();
        if (isRight) correctCount++;
        items.push({
          label: `Câu: "${sentence.beforeText} [...] ${sentence.afterText}"`,
          userAnswer: userVal,
          correctAnswer: sentence.answer,
          explanation: sentence.explanation
        });
      });
    } else if (activePartId === 'part2') {
      totalCount = currentTest.sentences.length;
      orderedSentences.forEach((sentence, idx) => {
        const isRight = sentence.correctIndex === idx + 1;
        if (isRight) correctCount++;
        items.push({
          label: `Câu ở vị trí thứ ${idx + 1}`,
          userAnswer: sentence.text,
          correctAnswer: `Câu số ${sentence.correctIndex} trong đoạn gốc`,
          explanation: isRight ? 'Chính xác' : 'Vị trí này chưa phù hợp về logic đoạn văn'
        });
      });
    } else if (activePartId === 'part4') {
      totalCount = currentTest.questions.length;
      currentTest.questions.forEach((q) => {
        const userVal = userAnswers[q.id] || '';
        const isRight = userVal.toLowerCase() === q.answer.toLowerCase();
        if (isRight) correctCount++;
        items.push({
          label: `Câu hỏi: "${q.question}"`,
          userAnswer: userVal,
          correctAnswer: q.answer
        });
      });
    } else if (activePartId === 'part5') {
      totalCount = currentTest.paragraphs.length;
      currentTest.paragraphs.forEach((p) => {
        const userVal = userAnswers[p.paragraphNumber] || '';
        const isRight = userVal === p.correctHeading;
        if (isRight) correctCount++;
        items.push({
          label: `Đoạn ${p.paragraphNumber}`,
          userAnswer: userVal,
          correctAnswer: p.correctHeading
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

    onCompleteTest(activePartId, currentTest.id, correctCount, totalCount);
  }, [activePartId, currentTest, userAnswers, orderedSentences, onCompleteTest]);

  // làm lại bài đang làm
  const handleReset = () => {
    setUserAnswers({});
    setIsChecked(false);
    setResult(null);

    if (activePartId === 'part2' && currentTest.sentences) {
      const shuffled = [...currentTest.sentences].sort(() => Math.random() - 0.5);
      setOrderedSentences(shuffled);
    }
  };

  // chuyển sang bài trước hoặc bài sau
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
      {/* thanh chọn các part của reading */}
      <div className="parts-bar">
        {APTIS_READING_DATA.parts.map((part) => (
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
          const isDone = completedMap[`${activePartId}_${test.id}`];
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

      {/* thanh header đặc trưng chuẩn mẫu ảnh */}
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
            <FileText size={18} />
          </div>
          <div className="nav-title-group">
            <h2 className="nav-main-title">{currentPart.title}</h2>
            <p className="nav-sub-title">{currentTest.subtitle || currentPart.description}</p>
          </div>
        </div>

        <div className="nav-badge-pill">
          Câu {currentIndex + 1}/{totalTests}
        </div>
      </div>

      {/* thẻ bài làm chính */}
      <div className="exam-card">
        {activePartId === 'part1' && (
          <Part1Matching
            test={currentTest}
            userAnswers={userAnswers}
            onChangeAnswer={handleChangeAnswer}
            isChecked={isChecked}
          />
        )}

        {activePartId === 'part2' && (
          <Part2Ordering
            test={currentTest}
            sentences={orderedSentences}
            onMoveSentence={handleMoveSentence}
            onReorderSentences={handleReorderSentences}
            isChecked={isChecked}
          />
        )}

        {activePartId === 'part4' && (
          <Part4Opinions
            test={currentTest}
            userAnswers={userAnswers}
            onChangeAnswer={handleChangeAnswer}
            isChecked={isChecked}
          />
        )}

        {activePartId === 'part5' && (
          <Part5Headings
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
        <FeedbackBox result={result} fullPassage={currentTest.fullPassage} />
      </div>
    </section>
  );
}
