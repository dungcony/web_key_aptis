import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Eye, EyeOff } from 'lucide-react';

// component phát âm thanh đọc kịch bản tự động bằng web speech api
export default function AudioPlayer({ textToPlay, transcriptText, tipText }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const utteranceRef = useRef(null);

  // dừng đọc âm thanh khi chuyển bài thi khác
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setShowTranscript(false);
    setShowTip(false);

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [textToPlay]);

  // bắt đầu phát âm thanh
  const handlePlay = () => {
    if (!window.speechSynthesis) {
      alert('Trình duyệt của bạn không hỗ trợ tính năng Web Speech API.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    // lọc bỏ các nhãn tiêu đề trước khi đọc
    const cleanText = textToPlay
      .replace(/Man:/gi, ' ')
      .replace(/Woman:/gi, ' ')
      .replace(/Topic:[^\n\r]+/gi, ' ')
      .trim();

    if (!cleanText) {
      alert('Không có nội dung âm thanh cho bài này.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;

    // ưu tiên tìm giọng tiếng anh tự nhiên
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  // tạm dừng phát âm thanh
  const handlePause = () => {
    if (window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  // phát lại từ đầu
  const handleReplay = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setTimeout(() => {
      handlePlay();
    }, 100);
  };

  return (
    <div className="audio-player-card">
      <div className="audio-controls-row">
        <div className="audio-left-controls">
          <div className="audio-icon-badge">
            <Volume2 size={20} />
          </div>

          {!isPlaying ? (
            <button type="button" className="audio-action-btn btn-play" onClick={handlePlay}>
              <Play size={16} /> {isPaused ? 'Tiếp tục nghe' : 'Phát âm thanh'}
            </button>
          ) : (
            <button type="button" className="audio-action-btn btn-pause" onClick={handlePause}>
              <Pause size={16} /> Tạm dừng
            </button>
          )}

          <button type="button" className="audio-action-btn btn-replay" onClick={handleReplay} title="Nghe lại từ đầu">
            <RotateCcw size={16} /> Nghe lại
          </button>
        </div>

        <div className="audio-right-toggles">
          {tipText && (
            <button
              type="button"
              className={`toggle-transcript-btn ${showTip ? 'active' : ''}`}
              onClick={() => setShowTip(!showTip)}
            >
              💡 {showTip ? 'Ẩn mẹo làm bài' : 'Xem mẹo làm bài'}
            </button>
          )}

          {transcriptText && (
            <button
              type="button"
              className={`toggle-transcript-btn ${showTranscript ? 'active' : ''}`}
              onClick={() => setShowTranscript(!showTranscript)}
            >
              {showTranscript ? <EyeOff size={16} /> : <Eye size={16} />}
              {showTranscript ? 'Ẩn Transcript' : 'Xem Transcript'}
            </button>
          )}
        </div>
      </div>

      {/* hiển thị mẹo làm bài nếu có */}
      {showTip && tipText && (
        <div className="listening-tip-box">
          <div className="tip-box-title">Mẹo ghi nhớ nhanh:</div>
          <div className="tip-box-content">{tipText}</div>
        </div>
      )}

      {/* hiển thị văn bản transcript khi người dùng yêu cầu */}
      {showTranscript && transcriptText && (
        <div className="listening-transcript-box">
          <div className="transcript-box-title">Kịch bản bài nghe (Transcript):</div>
          <div className="transcript-box-content">{transcriptText}</div>
        </div>
      )}
    </div>
  );
}
