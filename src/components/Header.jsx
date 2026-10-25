import React from 'react';
import { BookOpen, Headphones, Mic, PenTool, Timer } from 'lucide-react';

// component header quản lý chọn kỹ năng và chế độ thi
export default function Header({
  activeSkill,
  onSelectSkill,
  mode,
  onSelectMode,
  timerSeconds
}) {
  // định dạng thời gian mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="brand" onClick={() => onSelectSkill('reading')}>
          <span className="brand-badge">APTIS</span>
          <span className="brand-title">Practice Hub</span>
        </div>

        <nav className="skill-tabs">
          <button
            type="button"
            className={`skill-btn ${activeSkill === 'reading' ? 'active' : ''}`}
            onClick={() => onSelectSkill('reading')}
          >
            <BookOpen size={16} /> Reading
          </button>
          <button
            type="button"
            className={`skill-btn ${activeSkill === 'listening' ? 'active' : ''}`}
            onClick={() => onSelectSkill('listening')}
          >
            <Headphones size={16} /> Listening
          </button>
          <button
            type="button"
            className={`skill-btn ${activeSkill === 'speaking' ? 'active' : ''}`}
            onClick={() => onSelectSkill('speaking')}
          >
            <Mic size={16} /> Speaking <span className="skill-tag">Sắp có</span>
          </button>
          <button
            type="button"
            className={`skill-btn ${activeSkill === 'writing' ? 'active' : ''}`}
            onClick={() => onSelectSkill('writing')}
          >
            <PenTool size={16} /> Writing <span className="skill-tag">Sắp có</span>
          </button>
        </nav>

        <div className="header-actions">
          <div className="mode-selector">
            <button
              type="button"
              className={`mode-btn ${mode === 'practice' ? 'active' : ''}`}
              onClick={() => onSelectMode('practice')}
            >
              Luyện tập
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'exam' ? 'active' : ''}`}
              onClick={() => onSelectMode('exam')}
            >
              Thi thử
            </button>
          </div>

          {mode === 'exam' && (
            <div className="timer-box">
              <Timer size={16} />
              <span>{formatTime(timerSeconds)}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
