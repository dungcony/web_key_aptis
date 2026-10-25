// module xử lý hiển thị và kiểm tra các bài thi reading
const ReadingModule = {
  currentPartId: null,
  currentTest: null,
  currentSentenceOrder: [],

  // nạp dữ liệu bài thi reading cụ thể
  loadTest(partId, testId) {
    this.currentPartId = partId;
    const part = window.APTIS_READING_DATA.parts.find(p => p.id === partId);
    if (!part) return;

    this.currentTest = part.tests.find(t => t.id === testId) || part.tests[0];
    const container = document.getElementById("exam-content-area");
    const feedbackBox = document.getElementById("feedback-box");
    feedbackBox.classList.remove("active");
    feedbackBox.innerHTML = "";

    // cập nhật tiêu đề và mô tả
    document.getElementById("exam-card-title").textContent = this.currentTest.title;
    document.getElementById("exam-card-desc").textContent = part.description;

    // render theo từng part
    if (partId === "part1") {
      this.renderPart1(container, this.currentTest);
    } else if (partId === "part2") {
      this.renderPart2(container, this.currentTest);
    } else if (partId === "part4") {
      this.renderPart4(container, this.currentTest);
    } else if (partId === "part5") {
      this.renderPart5(container, this.currentTest);
    }
  },

  // hiển thị dạng bài part 1: điền từ vào chỗ trống
  renderPart1(container, test) {
    let passageHtml = test.textTemplate;
    test.blanks.forEach(blank => {
      let selectHtml = `<select class="blank-select" id="blank-select-${blank.id}">
        <option value="">-- [ ${blank.id} ] --</option>`;
      blank.options.forEach(opt => {
        selectHtml += `<option value="${opt}">${opt}</option>`;
      });
      selectHtml += `</select>`;
      passageHtml = passageHtml.replace(`{blank_${blank.id}}`, selectHtml);
    });

    container.innerHTML = `
      <div class="passage-fill-box">
        ${passageHtml}
      </div>
    `;
  },

  // hiển thị dạng bài part 2: sắp xếp thứ tự câu
  renderPart2(container, test) {
    // xáo trộn các câu ban đầu để người học thực hành sắp xếp
    this.currentSentenceOrder = [...test.sentences].sort(() => Math.random() - 0.5);

    let html = "";
    if (test.fixedSentence) {
      html += `
        <div class="ordering-fixed-box">
          <span style="color: var(--accent);">[Câu mở đầu cố định]:</span> ${test.fixedSentence}
        </div>
      `;
    }

    html += `<div class="ordering-container" id="ordering-list">`;
    this.currentSentenceOrder.forEach((sentence, idx) => {
      html += `
        <div class="order-item" draggable="true" data-id="${sentence.id}" data-index="${idx}">
          <div class="order-number">${idx + 1}</div>
          <div class="order-text">${sentence.text}</div>
          <div class="order-actions">
            <button type="button" class="order-btn btn-up" onclick="ReadingModule.moveSentence(${idx}, -1)" ${idx === 0 ? "disabled" : ""}>▲</button>
            <button type="button" class="order-btn btn-down" onclick="ReadingModule.moveSentence(${idx}, 1)" ${idx === this.currentSentenceOrder.length - 1 ? "disabled" : ""}>▼</button>
          </div>
        </div>
      `;
    });
    html += `</div>`;

    container.innerHTML = html;
    this.attachDragAndDropHandlers();
  },

  // hỗ trợ kéo thả câu trên máy tính
  attachDragAndDropHandlers() {
    const list = document.getElementById("ordering-list");
    if (!list) return;

    let draggedItem = null;

    list.querySelectorAll(".order-item").forEach(item => {
      item.addEventListener("dragstart", () => {
        draggedItem = item;
        item.classList.add("dragging");
      });

      item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
        draggedItem = null;
      });

      item.addEventListener("dragover", e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(list, e.clientY);
        if (afterElement == null) {
          list.appendChild(draggedItem);
        } else {
          list.insertBefore(draggedItem, afterElement);
        }
      });
    });

    // cập nhật mảng dữ liệu theo thứ tự dom
    list.addEventListener("drop", () => {
      const newItems = Array.from(list.querySelectorAll(".order-item"));
      const newOrder = [];
      newItems.forEach((el, index) => {
        const id = el.getAttribute("data-id");
        const found = this.currentSentenceOrder.find(s => s.id === id);
        if (found) newOrder.push(found);
        el.querySelector(".order-number").textContent = index + 1;
        el.setAttribute("data-index", index);
      });
      this.currentSentenceOrder = newOrder;
      this.refreshSentenceButtons();
    });

    function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll(".order-item:not(.dragging)")];
      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
  },

  // di chuyển câu lên hoặc xuống bằng nút bấm
  moveSentence(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= this.currentSentenceOrder.length) return;

    // hoán đổi vị trí câu trong mảng
    const temp = this.currentSentenceOrder[index];
    this.currentSentenceOrder[index] = this.currentSentenceOrder[targetIndex];
    this.currentSentenceOrder[targetIndex] = temp;

    // render lại danh sách câu
    const list = document.getElementById("ordering-list");
    if (!list) return;

    let html = "";
    this.currentSentenceOrder.forEach((sentence, idx) => {
      html += `
        <div class="order-item" draggable="true" data-id="${sentence.id}" data-index="${idx}">
          <div class="order-number">${idx + 1}</div>
          <div class="order-text">${sentence.text}</div>
          <div class="order-actions">
            <button type="button" class="order-btn btn-up" onclick="ReadingModule.moveSentence(${idx}, -1)" ${idx === 0 ? "disabled" : ""}>▲</button>
            <button type="button" class="order-btn btn-down" onclick="ReadingModule.moveSentence(${idx}, 1)" ${idx === this.currentSentenceOrder.length - 1 ? "disabled" : ""}>▼</button>
          </div>
        </div>
      `;
    });
    list.innerHTML = html;
    this.attachDragAndDropHandlers();
  },

  // làm mới trạng thái nút lên xuống
  refreshSentenceButtons() {
    const list = document.getElementById("ordering-list");
    if (!list) return;
    const items = list.querySelectorAll(".order-item");
    items.forEach((item, idx) => {
      const upBtn = item.querySelector(".btn-up");
      const downBtn = item.querySelector(".btn-down");
      if (upBtn) upBtn.disabled = idx === 0;
      if (downBtn) downBtn.disabled = idx === items.length - 1;
    });
  },

  // hiển thị dạng bài part 4: đọc hiểu ý kiến 4 người
  renderPart4(container, test) {
    let peopleHtml = `<div class="people-column">`;
    test.people.forEach(person => {
      peopleHtml += `
        <div class="person-card">
          <div class="person-name">${person.name}</div>
          <div class="person-quote">${person.text}</div>
        </div>
      `;
    });
    peopleHtml += `</div>`;

    const peopleNames = test.people.map(p => p.name);

    let questionsHtml = `<div class="matching-questions-column">`;
    test.questions.forEach((q, idx) => {
      questionsHtml += `
        <div class="question-match-item" id="match-item-${q.id}">
          <div class="question-match-header">${idx + 1}. ${q.question}</div>
          <div class="match-select-box">
            <select class="match-select" id="match-select-${q.id}">
              <option value="">-- Chọn người phát biểu --</option>
              ${peopleNames.map(name => `<option value="${name}">${name}</option>`).join("")}
            </select>
          </div>
        </div>
      `;
    });
    questionsHtml += `</div>`;

    container.innerHTML = `
      <div class="split-view-container">
        ${peopleHtml}
        ${questionsHtml}
      </div>
    `;
  },

  // hiển thị dạng bài part 5: ghép tiêu đề bài đọc dài
  renderPart5(container, test) {
    let headingsHtml = `
      <div class="headings-list-card">
        <div class="headings-list-title">Danh sách các tiêu đề lựa chọn:</div>
        <div class="headings-tags">
          ${test.headings.map(h => `<span class="heading-tag">📌 ${h}</span>`).join("")}
        </div>
      </div>
    `;

    let paragraphsHtml = `<div class="paragraphs-column">`;
    test.paragraphs.forEach(p => {
      paragraphsHtml += `
        <div class="paragraph-card" id="paragraph-card-${p.paragraphNumber}">
          <div class="paragraph-header">
            <span class="paragraph-badge">Đoạn văn ${p.paragraphNumber}</span>
          </div>
          <div class="paragraph-content">${p.text}</div>
          <div>
            <select class="paragraph-select" id="para-select-${p.paragraphNumber}">
              <option value="">-- Chọn tiêu đề phù hợp cho đoạn ${p.paragraphNumber} --</option>
              ${test.headings.map(h => `<option value="${h}">${h}</option>`).join("")}
            </select>
          </div>
        </div>
      `;
    });
    paragraphsHtml += `</div>`;

    container.innerHTML = headingsHtml + paragraphsHtml;
  },

  // chấm điểm và đưa ra giải thích chi tiết
  checkAnswers() {
    if (!this.currentTest) return;

    const feedbackBox = document.getElementById("feedback-box");
    feedbackBox.innerHTML = "";
    feedbackBox.classList.add("active");

    let correctCount = 0;
    let totalCount = 0;
    let detailsHtml = "";

    if (this.currentPartId === "part1") {
      totalCount = this.currentTest.blanks.length;
      let expListHtml = `<div class="explanations-list">`;

      this.currentTest.blanks.forEach(blank => {
        const select = document.getElementById(`blank-select-${blank.id}`);
        const userVal = select ? select.value : "";
        const isRight = userVal.toLowerCase() === blank.answer.toLowerCase();

        if (select) {
          select.classList.remove("correct", "wrong");
          select.classList.add(isRight ? "correct" : "wrong");
        }

        if (isRight) correctCount++;

        expListHtml += `
          <div class="explanation-item">
            <strong>Vị trí [ ${blank.id} ]:</strong> Bạn chọn <em>"${userVal || "(chưa chọn)"}"</em> - Đáp án đúng: <strong style="color: var(--success);">${blank.answer}</strong>
            <br>
            <span style="color: var(--text-muted); font-size: 0.9rem;">💡 ${blank.explanation}</span>
          </div>
        `;
      });
      expListHtml += `</div>`;

      detailsHtml = `
        ${expListHtml}
        <div class="full-passage-box">
          <div class="full-passage-title">Đoạn văn hoàn chỉnh:</div>
          <div class="full-passage-content">${this.currentTest.fullPassage}</div>
        </div>
      `;
    } else if (this.currentPartId === "part2") {
      totalCount = this.currentTest.sentences.length;
      const list = document.getElementById("ordering-list");
      const domItems = list ? list.querySelectorAll(".order-item") : [];

      domItems.forEach((item, index) => {
        const expectedIndex = index + 1;
        const sentence = this.currentSentenceOrder[index];
        const isRight = sentence.correctIndex === expectedIndex;

        item.classList.remove("correct", "wrong");
        item.classList.add(isRight ? "correct" : "wrong");

        if (isRight) correctCount++;
      });

      detailsHtml = `
        <div class="full-passage-box">
          <div class="full-passage-title">Đoạn văn theo thứ tự chuẩn:</div>
          <div class="full-passage-content">${this.currentTest.fullPassage}</div>
        </div>
      `;
    } else if (this.currentPartId === "part4") {
      totalCount = this.currentTest.questions.length;
      let expListHtml = `<div class="explanations-list">`;

      this.currentTest.questions.forEach(q => {
        const select = document.getElementById(`match-select-${q.id}`);
        const userVal = select ? select.value : "";
        const isRight = userVal.toLowerCase() === q.answer.toLowerCase();

        if (select) {
          select.classList.remove("correct", "wrong");
          select.classList.add(isRight ? "correct" : "wrong");
        }

        if (isRight) correctCount++;

        expListHtml += `
          <div class="explanation-item">
            <strong>Câu hỏi:</strong> "${q.question}"<br>
            Bạn chọn: <em>"${userVal || "(chưa chọn)"}"</em> - Đáp án đúng: <strong style="color: var(--success);">${q.answer}</strong>
          </div>
        `;
      });
      expListHtml += `</div>`;
      detailsHtml = expListHtml;
    } else if (this.currentPartId === "part5") {
      totalCount = this.currentTest.paragraphs.length;
      let expListHtml = `<div class="explanations-list">`;

      this.currentTest.paragraphs.forEach(p => {
        const select = document.getElementById(`para-select-${p.paragraphNumber}`);
        const userVal = select ? select.value : "";
        const isRight = userVal === p.correctHeading;

        if (select) {
          select.classList.remove("correct", "wrong");
          select.classList.add(isRight ? "correct" : "wrong");
        }

        if (isRight) correctCount++;

        expListHtml += `
          <div class="explanation-item">
            <strong>Đoạn ${p.paragraphNumber}:</strong> Bạn chọn <em>"${userVal || "(chưa chọn)"}"</em><br>
            Tiêu đề chuẩn: <strong style="color: var(--success);">${p.correctHeading}</strong>
          </div>
        `;
      });
      expListHtml += `</div>`;
      detailsHtml = expListHtml;
    }

    const percentage = Math.round((correctCount / totalCount) * 100);
    const isGood = percentage >= 70;

    feedbackBox.innerHTML = `
      <div class="feedback-score ${isGood ? "good" : "bad"}">
        ${isGood ? "🎉 Tuyệt vời!" : "📝 Cần cố gắng thêm!"} Kết quả: ${correctCount}/${totalCount} câu đúng (${percentage}%)
      </div>
      ${detailsHtml}
    `;

    // lưu kết quả vào localstorage để ghi nhận hoàn thành bài
    if (window.App) {
      window.App.recordResult(this.currentPartId, this.currentTest.id, correctCount, totalCount);
    }
  },

  // đặt lại trạng thái ban đầu của bài thi
  reset() {
    if (this.currentPartId && this.currentTest) {
      this.loadTest(this.currentPartId, this.currentTest.id);
    }
  }
};

window.ReadingModule = ReadingModule;
