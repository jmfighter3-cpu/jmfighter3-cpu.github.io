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

  // ==========================================================================
  // 4. 델포이 아폴론 신전의 코딩 신탁 (The Delphic Oracle)
  // 버튼을 누를 때마다 고대 그리스 철학 명언과 개발자의 유쾌한 해설을 랜덤으로 점지합니다.
  // ==========================================================================
  const btnConsultOracle = document.getElementById("btnConsultOracle");
  const oracleDisplayBox = document.getElementById("oracleDisplayBox");
  const oracleGreek = document.getElementById("oracleGreek");
  const oracleTrans = document.getElementById("oracleTrans");
  const oracleKorean = document.getElementById("oracleKorean");
  const oracleDev = document.getElementById("oracleDev");
  const oracleAltar = document.querySelector(".oracle-altar");

  if (btnConsultOracle && oracleDisplayBox) {
    // 고대 그리스 철학 명언 및 개발자 해설 데이터셋 (총 15선)
    const oracles = [
      {
        greek: "Γνῶθι σεαυτόν",
        trans: "[Gnōthi seauton]",
        korean: "“너 자신을 알라” — 소크라테스 / 델포이 아폴론 신전 주춧돌 명문",
        dev: "<code>console.log</code>를 찍어보기 전까지는 네 코드도 스스로를 모른다. 자신의 버그를 정직하게 응시하는 개발자만이 배포의 지혜를 얻으리라."
      },
      {
        greek: "Μηδὲν ἄγαν",
        trans: "[Mēden agan]",
        korean: "“어떤 것도 지나치지 마라 (중용을 지켜라)” — 솔론 / 델포이 신전 격언",
        dev: "과도한 조기 최적화와 과잉 아키텍처 설계는 멀쩡히 돌아가던 코드를 파멸로 이끈다. 작동하는 단순함이 최선의 지혜니라."
      },
      {
        greek: "Πάντα ῥεῖ καὶ οὐδὲν μένει",
        trans: "[Panta rhei kai ouden menei]",
        korean: "“모든 것은 흐르고 머무르지 않는다” — 헤라클레이토스",
        dev: "어제의 에러도, 한 시대를 풍미한 프레임워크도 강물처럼 흘러가리니, 두려워 말고 매일 조금씩 배움을 이어가라."
      },
      {
        greek: "Χαλεπὰ τὰ καλά",
        trans: "[Chalepa ta kala]",
        korean: "“아름다운 것은 성취하기 어렵다” — 플라톤 《국가》",
        dev: "우아하고 결점 없는 소프트웨어는 단 한 번의 커밋으로 빚어지지 않는다. 숱한 리팩토링의 땀방울을 감내하라."
      },
      {
        greek: "Ἀρχὴ ἥμισυ παντός",
        trans: "[Archē hēmisy pantos]",
        korean: "“시작이 전체의 절반이다” — 피타고라스 / 아리스토텔레스",
        dev: "새 프로젝트 저장소를 생성하고 첫 번째 <code>git init</code>을 마쳤다면, 이미 소프트웨어 완성의 반은 이룬 셈이다."
      },
      {
        greek: "Ἓν οἶδα ὅτι οὐδὲν οἶδα",
        trans: "[Hen oida hoti ouden oida]",
        korean: "“내가 아는 유일한 것은 내가 아무것도 모른다는 사실뿐이다” — 소크라테스",
        dev: "공식 문서를 세 번 정독했다 하여 자만하지 마라. 에러 로그 앞에서 겸손히 스택오버플로우를 엿보는 자가 진정한 시니어이다."
      },
      {
        greek: "Εὕρηκα! Εὕρηκα!",
        trans: "[Heurēka! Heurēka!]",
        korean: "“찾았다! 알아내었다!” — 아르키메데스 (시라쿠사의 현자)",
        dev: "반나절 동안 모니터를 노려보다 마침내 누락된 세미콜론 하나, 오타 하나를 찾아낸 순간의 환희는 신들의 넥타르보다 달콤하다."
      },
      {
        greek: "Ἄνδρα μοι ἔννεπε, Μοῦσα",
        trans: "[Andra moi ennepe, Mousa]",
        korean: "“뮤즈 여신이여, 그 노련한 사나이의 이야기를 들려주소서” — 호메로스 《오디세이아》",
        dev: "인문학의 바다에서 방황하다 AI와 코딩이라는 새로운 모험의 돛을 올린 그대의 항해를 올림포스의 신들이 지켜보고 계신다."
      },
      {
        greek: "Μῆνιν ἄειδε, θεά, Πηληϊάδεω Ἀχιλῆος",
        trans: "[Mēnin aeide, thea, Pēlēïadeō Achilēos]",
        korean: "“노래하소서, 여신이여! 펠레우스의 아들 아킬레우스의 분노를” — 호메로스 《일리아스》",
        dev: "퇴근 10분 전 날아든 긴급 기획 변경 요청에 분노하지 마라. 분노로 서두른 커밋은 치명적인 머지 충돌(Merge Conflict)을 낳을 뿐이다."
      },
      {
        greek: "Τὰ πάντα κυβερνᾷ κεραυνός",
        trans: "[Ta panta kyberna keraunos]",
        korean: "“벼락이 만물을 조타(운전)한다” — 헤라클레이토스",
        dev: "언제 작업실 전원이 나가거나 노트북 배터리가 방전될지 모른다. 잦은 <code>Ctrl + S</code>와 원격 푸시만이 번개의 심판에서 그대를 구원하리라."
      },
      {
        greek: "Οὐδεὶς ἑκὼν ἁμαρτάνει",
        trans: "[Oudeis hekōn hamartanei]",
        korean: "“누구도 고의로 악(실수)을 저지르지 않는다” — 소크라테스",
        dev: "누구도 버그를 만들고 싶어서 짠 적은 없다. 코드 리뷰에서 동료의 실수를 나무라지 말고, 조용히 풀 리퀘스트를 보듬어주어라."
      },
      {
        greek: "Σπεῦδε βραδέως",
        trans: "[Speude bradeōs / Festina lente]",
        korean: "“천천히 서둘러라” — 고대 그리스-로마 현인들의 지혜",
        dev: "배포 마감이 촉박할수록 테스트 코드를 꼼꼼히 돌려라. 조급하게 달린 배포는 롤백(Rollback)이라는 혹독한 역풍을 맞게 된다."
      },
      {
        greek: "Καλὸς κἀγαθός",
        trans: "[Kalos kagathos]",
        korean: "“아름답고도 선한 자” — 고대 아테네의 이상적 인간상",
        dev: "남이 읽기 쉬운 명료한 변수명(美)과 예외 상황에서도 터지지 않는 견고한 로직(善)을 갖춘 코드는 아테나 여신의 축복을 받는다."
      },
      {
        greek: "Ἄριστον μὲν ὕδωρ",
        trans: "[Ariston men hydōr]",
        korean: "“물이야말로 가장 으뜸가는 것이라” — 핀다로스 《올림피아 송가》",
        dev: "카페인과 에너지 음료에만 의지하지 말고 맑은 물 한 잔을 마셔라. 뇌수가 촉촉해져야 숨어 있던 널 포인터(NullPointer)가 비로소 보인다."
      },
      {
        greek: "Ἀνέχου καὶ ἀπέχου",
        trans: "[Anechou kai apechou]",
        korean: "“견디고 절제하라” — 에픽테토스 (스토아 철학)",
        dev: "터미널을 가득 메운 붉은색 에러 메시지 앞에서도 동요하지 마라. 인내와 집념으로 원인을 추적하는 자가 끝내 버그를 정복하리라."
      }
    ];

    let lastOracleIndex = 0; // 직전에 출력된 신탁 번호 (연속 중복 방지용)

    // 신탁 청하기 버튼 클릭 이벤트 리스너 등록
    btnConsultOracle.addEventListener("click", () => {
      // 1. 직전에 출력된 내용과 연속으로 겹치지 않도록 새로운 랜덤 인덱스 추첨
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * oracles.length);
      } while (newIndex === lastOracleIndex && oracles.length > 1);

      lastOracleIndex = newIndex;
      const chosen = oracles[newIndex];

      // 2. 신전 향로 시각 효과 (아이콘 흔들림 & 빛 번짐 애니메이션)
      if (oracleAltar) {
        oracleAltar.classList.add("pulsing");
        setTimeout(() => oracleAltar.classList.remove("pulsing"), 600);
      }

      // 3. 신탁 석판 박스에 부드러운 현현(Reveal) 애니메이션 적용
      oracleDisplayBox.classList.remove("revealing");
      void oracleDisplayBox.offsetWidth; // 브라우저 Reflow 강제 실행으로 애니메이션 리셋
      oracleDisplayBox.classList.add("revealing");

      // 4. 화면 내용 갱신
      if (oracleGreek) oracleGreek.textContent = chosen.greek;
      if (oracleTrans) oracleTrans.textContent = chosen.trans;
      if (oracleKorean) oracleKorean.textContent = chosen.korean;
      if (oracleDev) oracleDev.innerHTML = `"${chosen.dev}"`;
    });
  }

});


