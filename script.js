/**
 * ============================================================================
 * 나만의 포트폴리오 인터랙션 스크립트 (script.js)
 * 상단 탭 버튼을 클릭했을 때 알맞은 화면을 부드럽게 보여주는 기능을 담당합니다.
 * ============================================================================
 */

// HTML 문서의 모든 요소가 다 준비(로딩)되었을 때 자바스크립트 코드를 실행합니다.
document.addEventListener("DOMContentLoaded", () => {
  // 1. 모든 탭 버튼들과 모든 탭 화면(패널) 요소들을 찾아옵니다.
  // document.querySelectorAll()은 조건에 맞는 모든 HTML 태그들을 배열과 유사한 형태로 가져옵니다.
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabPanes = document.querySelectorAll(".tab-pane");

  // 2. 찾아온 각각의 탭 버튼에 '클릭(click)' 이벤트를 걸어줍니다.
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 2-1. 클릭한 버튼의 data-tab 속성값(예: 'about', 'projects', 'blank')을 읽어옵니다.
      const targetTabId = button.getAttribute("data-tab");

      // 2-2. 기존에 선택되어 있던 모든 탭 버튼에서 'active' 클래스를 제거합니다.
      tabButtons.forEach((btn) => btn.classList.remove("active"));

      // 2-3. 기존에 화면에 보이고 있던 모든 탭 화면에서 'active' 클래스를 제거하여 숨깁니다.
      tabPanes.forEach((pane) => pane.classList.remove("active"));

      // 2-4. 지금 사용자가 방금 클릭한 버튼에만 'active' 클래스를 추가해 강조합니다.
      button.classList.add("active");

      // 2-5. 클릭한 탭의 ID와 일치하는 화면을 찾아서 'active' 클래스를 추가해 화면에 띄웁니다.
      const targetPane = document.getElementById(targetTabId);
      if (targetPane) {
        targetPane.classList.add("active");
      }
    });
  });

  // ==========================================================================
  // 3. 오디세이아 서사시 누적 타이핑 애니메이션 (Cumulative Epic Poem Typing)
  // 이전 행을 지우지 않고 한 행씩 누적하여 써내려가며, 최종적으로 전체 시구를 화면에 보여줍니다.
  // ==========================================================================
  const poemContainer = document.getElementById("typing-poem-box");

  if (poemContainer) {
    // 호메로스 오디세이아 오마주 시구 목록 (총 10행 서사시)
    const phrases = [
      "들려주소서, 뮤즈 여신이여!",
      "인문대를 졸업하고 많이도 방황한 그 사람 이야기를.",
      "그는 번역가를 꿈꿨고 수많은 문헌을 보았으며",
      "바다 건너 사람들 말과 풍토와 심성을 알고자",
      "마음 속으로 숱한 고난을 겪었습니다.",
      "그토록 애썼으나 결국 취업하지는 못했으니",
      "번역 AI의 등장으로 파멸한 것이라!",
      "사악한 자들! 졸업학년에 내 일자리를 잡아먹다니.",
      "하여 나도 AI 업계 밥그릇 좀 앗아먹고자 하나니",
      "어느 분야든, 제우스의 따님이여, 나에게도 들려주소서!"
    ];

    // HTML 내 초기 폴백 내용 비우기
    poemContainer.innerHTML = "";

    let lineIndex = 0;
    let charIndex = 0;
    let currentTextSpan = null;
    let cursorSpan = null;

    const typeSpeed = 70;  // 한 글자 타이핑 속도 (기존 50ms에서 약 0.5초 여유로워진 서정적 템포)
    const linePause = 950; // 한 행 완료 후 다음 행 시작 전 대기 시간 (기존 450ms + 500ms(0.5초) 호흡)

    function startNewLine() {
      if (lineIndex >= phrases.length) {
        // 모든 시구가 완성되었을 때: 마지막 행 끝에 커서가 깜빡이며 전체 시구가 영구히 표시됩니다.
        return;
      }

      // 이전 행에 있던 깜빡이는 커서 분리/제거
      if (cursorSpan && cursorSpan.parentNode) {
        cursorSpan.parentNode.removeChild(cursorSpan);
      }

      // 새로운 시구 행(Paragraph) 생성
      const lineEl = document.createElement("p");
      lineEl.className = "poem-line";

      currentTextSpan = document.createElement("span");
      currentTextSpan.className = "poem-text";

      cursorSpan = document.createElement("span");
      cursorSpan.className = "typing-cursor";
      cursorSpan.setAttribute("aria-hidden", "true");
      cursorSpan.textContent = "|";

      lineEl.appendChild(currentTextSpan);
      lineEl.appendChild(cursorSpan);
      poemContainer.appendChild(lineEl);

      charIndex = 0;
      typeChar();
    }

    function typeChar() {
      const currentPhrase = phrases[lineIndex];

      if (charIndex < currentPhrase.length) {
        currentTextSpan.textContent += currentPhrase.charAt(charIndex);
        charIndex++;
        setTimeout(typeChar, typeSpeed);
      } else {
        // 현재 행 완료: 다음 행으로 진행
        lineIndex++;
        if (lineIndex < phrases.length) {
          setTimeout(startNewLine, linePause);
        }
      }
    }

    // 첫 번째 시구 행 타이핑 시작
    startNewLine();
  }

});

