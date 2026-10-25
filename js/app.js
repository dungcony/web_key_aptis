// ứng dụng chính quản lý luồng thi, bộ đếm giờ và lưu trữ tiến độ
const App = {
  activeSkill: "reading",
  activePartId: "part1",
  activeTestId: "31",
  mode: "practice",
  timerSeconds: 35 * 60,
  timerInterval: null,

  // khởi tạo toàn bộ ứng dụng khi trang web tải xong
  init() {
    this.bindEvents();
    this.renderPartsNav();
    this.switchPart(this.activePartId);
  },

  // gán các sự kiện tương tác
  bindEvents() {
    // chuyển kỹ năng chính
    document.querySelectorAll(".skill-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const skill = btn.getAttribute("data-skill");
        if (skill !== "reading") {
          this.showComingSoon(skill);
        } else {
          this.showReadingArea();
        }
      });
    });

    // chuyển đổi chế độ luyện tập hoặc thi thử
    document.getElementById("btn-mode-practice").addEventListener("click", () => {
      this.setMode("practice");
    });

    document.getElementById("btn-mode-exam").addEventListener("click", () => {
      this.setMode("exam");
    });

    // các nút hành động kiểm tra và làm lại
    document.getElementById("btn-check").addEventListener("click", () => {
      if (this.activeSkill === "reading") {
        window.ReadingModule.checkAnswers();
      }
    });

    document.getElementById("btn-reset").addEventListener("click", () => {
      if (this.activeSkill === "reading") {
        window.ReadingModule.reset();
      }
    });

    document.getElementById("btn-prev").addEventListener("click", () => {
      this.navigateTest(-1);
    });

    document.getElementById("btn-next").addEventListener("click", () => {
      this.navigateTest(1);
    });
  },

  // hiển thị thanh chọn các part của reading
  renderPartsNav() {
    const bar = document.getElementById("parts-bar");
    bar.innerHTML = "";

    window.APTIS_READING_DATA.parts.forEach(part => {
      const btn = document.createElement("button");
      btn.className = `part-tab-btn ${part.id === this.activePartId ? "active" : ""}`;
      btn.textContent = part.title;
      btn.addEventListener("click", () => {
        this.switchPart(part.id);
      });
      bar.appendChild(btn);
    });
  },

  // chuyển đổi qua lại giữa các part
  switchPart(partId) {
    this.activePartId = partId;

    // cập nhật trạng thái giao diện nút tab part
    document.querySelectorAll(".part-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.textContent.includes(partId.toUpperCase()) || (partId === "part1" && btn.textContent.includes("Phần 1")) || (partId === "part2" && btn.textContent.includes("Phần 2")) || (partId === "part4" && btn.textContent.includes("Phần 4")) || (partId === "part5" && btn.textContent.includes("Phần 5")));
    });

    const part = window.APTIS_READING_DATA.parts.find(p => p.id === partId);
    if (!part || !part.tests.length) return;

    this.activeTestId = part.tests[0].id;
    this.renderTestSelector(part);
    this.loadCurrentTest();
  },

  // hiển thị danh sách các bài test trong part hiện tại
  renderTestSelector(part) {
    const container = document.getElementById("test-selector-bar");
    container.innerHTML = "";

    part.tests.forEach((test, idx) => {
      const btn = document.createElement("button");
      const isCompleted = this.isTestCompleted(part.id, test.id);
      btn.className = `test-btn ${test.id === this.activeTestId ? "active" : ""} ${isCompleted ? "completed" : ""}`;
      btn.textContent = `Bài ${idx + 1}`;
      btn.title = test.title;
      btn.addEventListener("click", () => {
        this.activeTestId = test.id;
        this.updateTestSelectorActiveState();
        this.loadCurrentTest();
      });
      container.appendChild(btn);
    });
  },

  // cập nhật nút active trong danh sách bài test
  updateTestSelectorActiveState() {
    const part = window.APTIS_READING_DATA.parts.find(p => p.id === this.activePartId);
    if (!part) return;

    const btns = document.querySelectorAll(".test-btn");
    part.tests.forEach((test, idx) => {
      if (btns[idx]) {
        btns[idx].classList.toggle("active", test.id === this.activeTestId);
      }
    });
  },

  // nạp dữ liệu bài test hiện hành
  loadCurrentTest() {
    if (this.activeSkill === "reading") {
      window.ReadingModule.loadTest(this.activePartId, this.activeTestId);
    }
  },

  // chuyển sang bài kế tiếp hoặc bài trước đó
  navigateTest(offset) {
    const part = window.APTIS_READING_DATA.parts.find(p => p.id === this.activePartId);
    if (!part) return;

    const currentIndex = part.tests.findIndex(t => t.id === this.activeTestId);
    const nextIndex = currentIndex + offset;

    if (nextIndex >= 0 && nextIndex < part.tests.length) {
      this.activeTestId = part.tests[nextIndex].id;
      this.updateTestSelectorActiveState();
      this.loadCurrentTest();
    }
  },

  // thiết lập chế độ luyện tập hoặc thi thử
  setMode(mode) {
    this.mode = mode;
    const btnPractice = document.getElementById("btn-mode-practice");
    const btnExam = document.getElementById("btn-mode-exam");
    const timerBox = document.getElementById("timer-box");

    if (mode === "exam") {
      btnExam.classList.add("active");
      btnPractice.classList.remove("active");
      timerBox.classList.add("active");
      this.startExamTimer();
    } else {
      btnPractice.classList.add("active");
      btnExam.classList.remove("active");
      timerBox.classList.remove("active");
      this.stopExamTimer();
    }
  },

  // bắt đầu đồng hồ đếm ngược cho kỳ thi
  startExamTimer() {
    this.stopExamTimer();
    this.timerSeconds = 35 * 60;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timerSeconds--;
      this.updateTimerDisplay();

      if (this.timerSeconds <= 0) {
        this.stopExamTimer();
        alert("Hết thời gian làm bài! Hệ thống sẽ tự động chấm điểm bài làm của bạn.");
        window.ReadingModule.checkAnswers();
      }
    }, 1000);
  },

  // dừng đồng hồ đếm ngược
  stopExamTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  // hiển thị thời gian còn lại
  updateTimerDisplay() {
    const minutes = Math.floor(this.timerSeconds / 60);
    const seconds = this.timerSeconds % 60;
    const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    document.getElementById("timer-display").textContent = display;
  },

  // lưu lại kết quả bài test vào bộ nhớ trình duyệt
  recordResult(partId, testId, score, total) {
    const key = `aptis_progress_${partId}_${testId}`;
    const data = {
      score,
      total,
      percentage: Math.round((score / total) * 100),
      date: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(data));

    // đánh dấu hoàn thành trên nút bài test
    this.renderTestSelector(window.APTIS_READING_DATA.parts.find(p => p.id === partId));
  },

  // kiểm tra xem bài test đã hoàn thành trước đó chưa
  isTestCompleted(partId, testId) {
    const key = `aptis_progress_${partId}_${testId}`;
    return localStorage.getItem(key) !== null;
  },

  // hiển thị thông báo cho các kỹ năng chưa nạp dữ liệu
  showComingSoon(skillName) {
    this.activeSkill = skillName;
    document.querySelectorAll(".skill-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-skill") === skillName);
    });

    document.getElementById("reading-section").style.display = "none";
    const comingSoonCard = document.getElementById("coming-soon-card");
    comingSoonCard.classList.add("active");

    const names = {
      listening: "Listening (Nghe hiểu)",
      speaking: "Speaking (Nói)",
      writing: "Writing (Viết)"
    };

    document.getElementById("coming-soon-name").textContent = names[skillName] || skillName;
  },

  // hiển thị lại khu vực luyện đọc
  showReadingArea() {
    this.activeSkill = "reading";
    document.querySelectorAll(".skill-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-skill") === "reading");
    });

    document.getElementById("reading-section").style.display = "block";
    document.getElementById("coming-soon-card").classList.remove("active");
  }
};

window.App = App;

// khởi chạy khi toàn bộ html sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  window.App.init();
});
