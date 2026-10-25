import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ComingSoon from './components/ComingSoon';
import ReadingView from './components/reading/ReadingView';
import ListeningView from './components/listening/ListeningView';
import './App.css';

// component gốc quản lý toàn bộ trạng thái của ứng dụng
export default function App() {
  const [activeSkill, setActiveSkill] = useState('reading');
  const [mode, setMode] = useState('practice');
  const [timerSeconds, setTimerSeconds] = useState(35 * 60);
  const [completedMap, setCompletedMap] = useState({});

  // tải lại tiến độ học tập từ bộ nhớ trình duyệt
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aptis_completed_map');
      if (saved) {
        setCompletedMap(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Không thể tải tiến độ từ localStorage', e);
    }
  }, []);

  // xử lý đếm ngược thời gian khi ở chế độ thi thử
  useEffect(() => {
    if (mode !== 'exam') return;

    setTimerSeconds(35 * 60);
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          alert('Hết thời gian làm bài thi! Vui lòng kiểm tra lại kết quả của bạn.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode]);

  // lưu kết quả khi hoàn thành bài test
  const handleCompleteTest = (partId, testId, score, total) => {
    const key = `${partId}_${testId}`;
    const nextMap = {
      ...completedMap,
      [key]: { score, total, percentage: Math.round((score / total) * 100) }
    };
    setCompletedMap(nextMap);
    try {
      localStorage.setItem('aptis_completed_map', JSON.stringify(nextMap));
    } catch (e) {
      console.error('Không thể lưu tiến độ vào localStorage', e);
    }
  };

  return (
    <div className="app-container">
      <Header
        activeSkill={activeSkill}
        onSelectSkill={setActiveSkill}
        mode={mode}
        onSelectMode={setMode}
        timerSeconds={timerSeconds}
      />

      <main className="main-wrapper">
        {activeSkill === 'reading' && (
          <ReadingView onCompleteTest={handleCompleteTest} completedMap={completedMap} />
        )}

        {activeSkill === 'listening' && (
          <ListeningView onCompleteTest={handleCompleteTest} completedMap={completedMap} />
        )}

        {activeSkill !== 'reading' && activeSkill !== 'listening' && (
          <ComingSoon skillName={activeSkill} onBackToReading={() => setActiveSkill('reading')} />
        )}
      </main>

      <footer className="footer">
        Aptis Practice Platform • Nền tảng React Dark Mode • Dữ liệu bóc tách từ tài liệu Reading & Listening
      </footer>
    </div>
  );
}
