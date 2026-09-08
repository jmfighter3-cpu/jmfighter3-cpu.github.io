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

  // ==========================================================================
  // 5. 고대 그리스어와 소프트웨어 렉시콘 (Hellenic Lexicon)
  // 고전 철학 어휘와 현대 소프트웨어 엔지니어링 철학을 연결하는 낱말 카드 탐색기
  // ==========================================================================
  const lexiconChips = document.getElementById("lexiconChips");
  const lexiconDisplayBox = document.getElementById("lexiconDisplayBox");
  const lexiconGreek = document.getElementById("lexiconGreek");
  const lexiconTrans = document.getElementById("lexiconTrans");
  const lexiconPos = document.getElementById("lexiconPos");
  const lexiconCoreMeaning = document.getElementById("lexiconCoreMeaning");
  const lexiconDerivatives = document.getElementById("lexiconDerivatives");
  const lexiconExplanation = document.getElementById("lexiconExplanation");

  const btnLexiconPrev = document.getElementById("btnLexiconPrev");
  const btnLexiconNext = document.getElementById("btnLexiconNext");
  const btnLexiconRandom = document.getElementById("btnLexiconRandom");

  if (lexiconDisplayBox && lexiconChips) {
    const lexiconWords = [
      {
        greek: "Τέχνη",
        trans: "[Technē / 텍네]",
        pos: "명사 (여성)",
        meaning: "“기술, 기예, 장인정신, 예술 (Art / Craft / Craftsmanship)”",
        derivatives: "<code>Technology</code>(기술), <code>Technique</code>(기법/기교), <code>Technical</code>(전문적인)",
        explanation: "아리스토텔레스는 《니코마코스 윤리학》에서 테크네를 단순히 무언가를 만들어내는 손재주가 아니라, <strong>'원리를 깊이 이해하고 목적에 맞게 구현해내는 참된 이성적 능력'</strong>으로 정의했습니다. 오늘날 단순한 타이핑을 넘어 가독성, 유지보수성, 견고함을 갖춘 클린 코드를 짓고자 하는 <em>소프트웨어 장인정신(Software Craftsmanship)</em>의 본질이 바로 이 고대 테크네에 닿아 있습니다."
      },
      {
        greek: "Λόγος",
        trans: "[Logos / 로고스]",
        pos: "명사 (남성)",
        meaning: "“말, 말씀, 논리, 이성, 법칙 (Word / Reason / Logic)”",
        derivatives: "<code>Logic</code>(논리), <code>Algorithm</code>(알고리즘), <code>-logy</code>(학문 접미사)",
        explanation: "헤라클레이토스와 스토아 철학자들은 만물을 조화롭게 다스리는 우주의 궁극적인 질서이자 원리를 '로고스'라 불렀습니다. 컴퓨터 과학의 토대인 <strong>불리언 논리(Boolean Logic), 조건문과 루프, 데이터 파이프라인의 엄밀한 법칙성</strong> 전체가 현대 디지털 세계에 구현된 거대한 로고스의 실현체입니다."
      },
      {
        greek: "Ἀρετή",
        trans: "[Aretē / 아레테]",
        pos: "명사 (여성)",
        meaning: "“탁월함, 최고의 기량, 덕(Virtue), 잠재력의 온전한 실현”",
        derivatives: "<code>Aristocracy</code>(탁월한 자들의 지혜), <code>Arete</code>",
        explanation: "고대 그리스인에게 아레테는 사물이나 인간이 자신이 지닌 본질적인 목적을 가장 훌륭하고 탁월하게 발휘하는 상태를 뜻했습니다. 칼의 아레테가 날카로움이듯, 소프트웨어의 아레테는 <strong>최적의 성능과 가독성, 에러에 흔들리지 않는 견고함</strong>입니다. 개발자의 배움은 코드의 아레테를 향한 끝없는 여정입니다."
      },
      {
        greek: "Κυβερνήτης",
        trans: "[Kybernētēs / 키베르네테스]",
        pos: "명사 (남성)",
        meaning: "“조타수, 키잡이, 배를 모는 항해사 (Steersman / Pilot / Helmsman)”",
        derivatives: "<code>Kubernetes</code>(쿠버네티스 k8s), <code>Cybernetics</code>(인공두뇌학), <code>Cyber</code>(사이버)",
        explanation: "플라톤은 《국가》에서 거친 파도 속에서 배를 지혜롭게 조종하는 조타수를 '키베르네테스'로 비유했습니다. 구글(Google)의 엔지니어들은 바로 이 단어에서 착안하여 수많은 컨테이너를 지휘하고 자원을 지혜롭게 조율하는 현대 클라우드 오케스트레이션 도구에 <strong>‘쿠버네티스(Kubernetes)’</strong>라는 이름을 붙였습니다. (쿠버네티스 로고가 선박의 조타 핸들인 이유입니다!)"
      },
      {
        greek: "Κάθαρσις",
        trans: "[Catharsis / 카타르시스]",
        pos: "명사 (여성)",
        meaning: "“정화, 배설, 찌꺼기를 씻어냄, 영혼의 맑아짐 (Cleansing / Purification)”",
        derivatives: "<code>Catharsis</code>(카타르시스), <code>Cathartic</code>(정화하는)",
        explanation: "아리스토텔레스는 비극을 관람하며 겪는 감정의 정화를 카타르시스라 칭했습니다. 프로그래밍에서도 복잡하게 얽혀 있던 불필요한 코드를 덜어내고, 메모리 누수를 해소하는 <strong>가비지 컬렉션(Garbage Collection)</strong>과 마침내 붉은색 에러 창을 깨끗한 녹색(Green Pass)으로 바꿀 때 느끼는 전율이야말로 개발자가 맛보는 현대적 카타르시스입니다."
      },
      {
        greek: "Ἐπιστήμη",
        trans: "[Epistēmē / 에피스테메]",
        pos: "명사 (여성)",
        meaning: "“체계적 지식, 학문, 과학적 앎 (Scientific Knowledge)”",
        derivatives: "<code>Epistemology</code>(인식론), <code>Epistemic</code>(인식적인)",
        explanation: "고대 그리스에서 어렴풋한 믿음이나 개인적 의견(독사, Doxa)과 구별되는 '원인과 근거가 분명한 객관적 지식'을 에피스테메라고 했습니다. 복사-붙여넣기에 의존하는 파편적 코딩이 아니라, <strong>컴퓨터 구조, 메모리 모델, 운영체제의 기본 원리를 깊이 이해하고 코딩하는 컴퓨터 과학(Computer Science)</strong>의 탐구 정신이 곧 에피스테메입니다."
      },
      {
        greek: "Φρόνησις",
        trans: "[Phronēsis / 프로네시스]",
        pos: "명사 (여성)",
        meaning: "“실천적 지혜, 분별력, 상황에 맞는 올바른 판단력 (Practical Wisdom)”",
        derivatives: "<code>Prudence</code>(신중함, 사려깊음)",
        explanation: "이론적 지식(소피아)과 달리, 복잡하고 예측 불가능한 현실 상황 속에서 최선의 결정을 내리는 실천적 판단력을 뜻합니다. 굳이 무거운 최신 기술을 도입하지 않고 주어진 일정과 리소스에 가장 적합한 도구를 골라내는 능력, 즉 <em>‘적정 기술의 선택과 트레이드오프 조율’</em>이야말로 시니어 엔지니어의 프로네시스입니다."
      },
      {
        greek: "Ἀταραξία",
        trans: "[Ataraxia / 아타락시아]",
        pos: "명사 (여성)",
        meaning: "“마음의 평정, 동요나 불안이 없는 고요한 상태 (Tranquility / Peace of Mind)”",
        derivatives: "<code>Ataraxy</code>, <code>Ataractic</code>",
        explanation: "에피쿠로스와 피론 회의주의 학파가 추구한 최고선으로, 어떤 외적 혼란에도 흔들리지 않는 내면의 고요입니다. 프로덕션 서버에서 예기치 못한 에러 알림이 쏟아져도 당황하거나 패닉에 빠지지 않고, <strong>차분하게 시스템 로그와 스택 트레이스를 추적해 나가는 베테랑 엔지니어의 멘탈리티</strong>가 바로 아타락시아입니다."
      },
      {
        greek: "Κόσμος & Χάος",
        trans: "[Kosmos & Chaos / 코스모스와 카오스]",
        pos: "명사",
        meaning: "“질서와 조화(우주) ↔ 입을 벌린 혼돈(원초적 무질서)”",
        derivatives: "<code>Cosmos</code>(우주), <code>Cosmetic</code>(정돈/화장품), <code>Chaos</code>(혼돈), <code>Chaotic</code>(혼란한)",
        explanation: "그리스 신화에서 세상은 아무것도 형태가 잡히지 않은 어두운 심연(Chaos)에서 조화로운 질서와 아름다움을 갖춘 우주(Kosmos)로 변모해 갑니다. 수많은 기능이 덕지덕지 얽혀 유지보수가 불가능해진 <strong>스파게티 코드(Chaos)를 정갈한 모듈과 레이어로 다듬어내는 리팩토링(Kosmos)</strong>은 우주를 창조하는 일과 닮아 있습니다."
      },
      {
        greek: "Εὐδαιμονία",
        trans: "[Eudaimonia / 에우다이모니아]",
        pos: "명사 (여성)",
        meaning: "“행복, 번영, 인간다운 번성 (Flourishing / Well-being)”",
        derivatives: "<code>Eudaimonia</code>, <code>Eudaemonism</code>(행복주의)",
        explanation: "단순한 순간적 쾌락이 아니라, 인간으로서 가진 잠재력을 온전히 꽃피워 가치 있는 삶을 영위하는 충만한 상태를 의미합니다. 우리가 소프트웨어를 짓는 궁극적인 목적 역시 시스템을 통해 인간의 수고를 덜어주고 삶을 이롭게 만드는 것, 그리고 그 과정에서 <strong>창작자 자신도 깊은 지적 성취와 자아실현을 누리는 에우다이모니아</strong>에 있습니다."
      },
      {
        greek: "Διάλογος",
        trans: "[Dialogos / 디알로고스]",
        pos: "명사 (남성)",
        meaning: "“대화, 문답, 이성을 통한 교류 (Conversation / Dialogue)”",
        derivatives: "<code>Dialogue</code>(대화), <code>Dialectic</code>(변증법)",
        explanation: "dia(통하여) + logos(이성/말)의 결합으로, 서로 다른 시선이 만나 더 높은 진리에 다가가는 소크라테스식 탐구 방식입니다. 혼자 짠 코드의 맹점을 함께 짚어주는 <strong>코드 리뷰(Code Review)와 페어 프로그래밍(Pair Programming)</strong>이야말로 동료와 나누는 가장 생산적이고 지적인 디알로고스입니다."
      },
      {
        greek: "Μῦθος",
        trans: "[Mythos / 뮈토스]",
        pos: "명사 (남성)",
        meaning: "“이야기, 설화, 서사, 플롯 (Story / Narrative / Myth)”",
        derivatives: "<code>Myth</code>(신화), <code>Mythology</code>(신화학)",
        explanation: "논리적이고 분석적인 로고스(Logos)와 대비되어, 인간의 감정과 경험을 연결하고 감동을 주는 서사를 뜻합니다. 차가운 기능 명세서에 머물지 않고, 제품을 사용하는 사용자가 어떤 여정을 거치고 어떤 기쁨을 느낄지 설계하는 <strong>사용자 경험(UX)과 제품 스토리텔링</strong>의 중심에는 언제나 뮈토스가 살아 숨쉽니다."
      }
    ];

    let currentLexiconIndex = 0;

    // 1. 단어 칩 버튼 생성
    lexiconWords.forEach((wordObj, idx) => {
      const chipBtn = document.createElement("button");
      chipBtn.type = "button";
      chipBtn.className = "chip-btn" + (idx === 0 ? " active" : "");
      chipBtn.textContent = wordObj.greek;
      chipBtn.setAttribute("title", wordObj.meaning);

      chipBtn.addEventListener("click", () => {
        displayLexiconWord(idx);
      });

      lexiconChips.appendChild(chipBtn);
    });

    // 2. 단어 렌더링 함수
    function displayLexiconWord(index) {
      if (index < 0) index = lexiconWords.length - 1;
      if (index >= lexiconWords.length) index = 0;

      currentLexiconIndex = index;
      const word = lexiconWords[index];

      // 칩 활성화 상태 갱신
      const allChips = lexiconChips.querySelectorAll(".chip-btn");
      allChips.forEach((chip, i) => {
        chip.classList.toggle("active", i === index);
      });

      // 석판 전환 애니메이션
      lexiconDisplayBox.classList.remove("revealing");
      void lexiconDisplayBox.offsetWidth; // Reflow 강제
      lexiconDisplayBox.classList.add("revealing");

      // 텍스트 내용 갱신
      if (lexiconGreek) lexiconGreek.textContent = word.greek;
      if (lexiconTrans) lexiconTrans.textContent = word.trans;
      if (lexiconPos) lexiconPos.textContent = word.pos;
      if (lexiconCoreMeaning) lexiconCoreMeaning.textContent = word.meaning;
      if (lexiconDerivatives) lexiconDerivatives.innerHTML = word.derivatives;
      if (lexiconExplanation) lexiconExplanation.innerHTML = word.explanation;
    }

    // 3. 네비게이션 버튼 이벤트 리스너
    if (btnLexiconPrev) {
      btnLexiconPrev.addEventListener("click", () => {
        displayLexiconWord(currentLexiconIndex - 1);
      });
    }

    if (btnLexiconNext) {
      btnLexiconNext.addEventListener("click", () => {
        displayLexiconWord(currentLexiconIndex + 1);
      });
    }

    if (btnLexiconRandom) {
      btnLexiconRandom.addEventListener("click", () => {
        let randIdx;
        do {
          randIdx = Math.floor(Math.random() * lexiconWords.length);
        } while (randIdx === currentLexiconIndex && lexiconWords.length > 1);
        displayLexiconWord(randIdx);
      });
    }
  }

  // ==========================================================================
  // 6. [탭 4] 아고라 도편(Ostrakon) 방문자 방명록 시스템
  // 브라우저 LocalStorage를 활용한 실시간 점토판 방명록 및 닉네임 생성기
  // ==========================================================================
  const ostrakonForm = document.getElementById("ostrakonForm");
  const ostrakonAuthorInput = document.getElementById("ostrakonAuthor");
  const ostrakonContentInput = document.getElementById("ostrakonContent");
  const ostrakonStyleSelect = document.getElementById("ostrakonStyle");
  const ostrakonGrid = document.getElementById("ostrakonGrid");
  const ostrakonCountSpan = document.getElementById("ostrakonCount");
  const charCountSpan = document.getElementById("charCount");
  const btnRandomName = document.getElementById("btnRandomName");
  const btnResetDemo = document.getElementById("btnResetDemo");
  const dailyLimitHint = document.getElementById("dailyLimitHint");
  const btnEtchOstrakon = document.getElementById("btnEtchOstrakon");
  const liveStatusBadge = document.getElementById("liveStatusBadge");
  const liveStatusText = document.getElementById("liveStatusText");

  // ==========================================================================
  // ⭐️ [Firebase 실시간 클라우드 DB 연동 설정]
  // Firebase 콘솔(console.firebase.google.com)에서 발급받은 본인 프로젝트의
  // firebaseConfig 객체 값을 아래에 입력해 주시면 전 세계 실시간 광장이 활성화됩니다.
  // 키가 비어있거나 미설정된 상태에서는 자동으로 안전한 'LocalStorage 로컬 모드'로 동작합니다.
  // ==========================================================================
  const firebaseConfig = {
    apiKey: "AIzaSyD_Y0mGU9bflDdo5rp7EAo-qpkz5JVkbwg",
    authDomain: "jmfighter3-agora.firebaseapp.com",
    projectId: "jmfighter3-agora",
    storageBucket: "jmfighter3-agora.firebasestorage.app",
    messagingSenderId: "807611040092",
    appId: "1:807611040092:web:bfb19e2ce9f3661c0e0199",
    measurementId: "G-6L041MDW3G"
  };

  let db = null;
  let isFirebaseLive = false;

  // Firebase 초기화 검사 (SDK 로드 여부 및 apiKey 유효성 확인)
  if (
    typeof firebase !== "undefined" &&
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.trim() !== "" &&
    firebaseConfig.apiKey !== "YOUR_API_KEY"
  ) {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.firestore();
      isFirebaseLive = true;
      console.log("🏛️ [Agora] Firebase Firestore 글로벌 실시간 광장에 연결되었습니다.");
    } catch (err) {
      console.warn("Firebase 초기화 중 오류가 발생하여 로컬 저장소 모드로 전환합니다:", err);
      isFirebaseLive = false;
    }
  }

  function updateConnectionStatusUI() {
    if (!liveStatusBadge || !liveStatusText) return;
    if (isFirebaseLive) {
      liveStatusBadge.classList.add("live-connected");
      liveStatusText.textContent = "아고라 글로벌 실시간 광장 연결됨";
    } else {
      liveStatusBadge.classList.remove("live-connected");
      liveStatusText.textContent = "로컬 저장소 모드 (개인 보관함)";
    }
  }

  const OSTRAKON_STORAGE_KEY = "hellenic_ostrakon_guestbook";
  const OSTRAKON_RATE_LIMIT_KEY = "hellenic_ostrakon_daily_limit";
  const MAX_DAILY_POSTS = 3;         // 1인당 1일 최대 등록 가능 횟수
  const POST_COOLDOWN_SECONDS = 30;   // 연속 도배 방지 쿨다운 시간(초)

  // 기본 탑재 고대 그리스 철학자 및 운영자 도편 목록
  const defaultOstraka = [
    {
      id: "default-1",
      author: "아테네의 소크라테스",
      badge: "고대 현자",
      date: "기원전 399년 어느 날",
      style: "terracotta",
      message: "방문자여, 그대가 이 아고라에 발을 디딘 것만으로도 이미 훌륭한 배움의 여정이 시작되었소. 너 자신을 알라!",
      isDefault: true
    },
    {
      id: "default-2",
      author: "시라쿠사의 아르키메데스",
      badge: "기하학자",
      date: "기원전 212년",
      style: "olympian",
      message: "유레카! 나만의 생각과 인사를 남길 수 있는 아름다운 도편을 발견했도다. 오류 없는 코딩의 축복을 빈다.",
      isDefault: true
    },
    {
      id: "default-3",
      author: "키오스의 호메로스",
      badge: "서사시인",
      date: "기원전 8세기",
      style: "parian",
      message: "인문학과 코딩의 돛을 올리고 이타카를 향해 항해하는 그대의 서사적 모험담을 아폴론과 뮤즈 여신께서 굽어살피시리라.",
      isDefault: true
    },
    {
      id: "default-4",
      author: "jmfighter3-cpu",
      badge: "운영자",
      date: "2026년 봄날의 아고라",
      style: "terracotta",
      message: "웹 서사시 포트폴리오를 찾아주신 모든 분을 진심으로 환영합니다! 여러분만의 도편을 점토판에 새겨 따뜻한 발자취를 남겨주세요 🏛️",
      isDefault: true
    }
  ];

  // 랜덤 생성용 고대 그리스 별칭 후보군
  const greekNicknames = [
    "아테네의 방랑자", "시라쿠사의 기하학자", "델포이의 시인", 
    "올림피아의 달리기선수", "코린토스의 항해사", "이타카의 나그네", 
    "스파르타의 코더", "크레타의 미궁탐험가", "밀레토스의 철학자", 
    "테베의 번역가", "로도스의 거상", "아르고스의 영웅"
  ];

  if (ostrakonForm && ostrakonGrid) {
    // 1. LocalStorage에서 도편 목록 불러오기
    function loadOstraka() {
      const saved = localStorage.getItem(OSTRAKON_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("도편 데이터를 파싱하는 중 오류가 발생했습니다:", e);
          return [...defaultOstraka];
        }
      }
      return [...defaultOstraka];
    }

    // 2. LocalStorage에 도편 목록 저장하기
    function saveOstraka(list) {
      localStorage.setItem(OSTRAKON_STORAGE_KEY, JSON.stringify(list));
    }

    // 2-1. 오늘 날짜 문자열 반환 (YYYY-MM-DD 형식)
    function getTodayDateString() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    // 2-2. 일일 등록 제한 데이터 로드
    function loadRateLimitData() {
      const todayStr = getTodayDateString();
      const saved = localStorage.getItem(OSTRAKON_RATE_LIMIT_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.date === todayStr) {
            return parsed;
          }
        } catch (e) {
          console.error("도편 등록 제한 데이터를 파싱하는 중 오류가 발생했습니다:", e);
        }
      }
      return { date: todayStr, count: 0, lastTime: 0 };
    }

    // 2-3. 일일 등록 제한 데이터 저장
    function saveRateLimitData(data) {
      localStorage.setItem(OSTRAKON_RATE_LIMIT_KEY, JSON.stringify(data));
    }

    // 2-4. 일일 등록 가능 잔여 횟수 UI 갱신
    function updateDailyLimitUI() {
      if (!dailyLimitHint) return;
      const data = loadRateLimitData();
      const remaining = Math.max(0, MAX_DAILY_POSTS - data.count);

      if (remaining > 0) {
        dailyLimitHint.className = "daily-limit-badge";
        dailyLimitHint.innerHTML = `🏺 오늘 새길 수 있는 도편: <strong>${remaining}회 남음</strong> (1일 최대 ${MAX_DAILY_POSTS}회)`;
        if (btnEtchOstrakon) btnEtchOstrakon.disabled = false;
      } else {
        dailyLimitHint.className = "daily-limit-badge limit-reached";
        dailyLimitHint.innerHTML = `🏺 오늘의 도편 수량(최대 ${MAX_DAILY_POSTS}회)을 <strong>모두 소진</strong>했습니다. 내일 다시 만나요!`;
        if (btnEtchOstrakon) btnEtchOstrakon.disabled = true;
      }
    }

    let ostrakaList = [];

    // 3. 화면에 도편 목록 렌더링
    function renderOstraka() {
      ostrakonGrid.innerHTML = "";

      if (ostrakonCountSpan) {
        ostrakonCountSpan.textContent = ostrakaList.length;
      }

      ostrakaList.forEach((item) => {
        const tile = document.createElement("div");
        tile.className = `ostrakon-tile style-${item.style || "terracotta"}`;

        tile.innerHTML = `
          <div class="ostrakon-top">
            <div class="ostrakon-author">
              <span>${escapeHtml(item.author)}</span>
              ${item.badge ? `<span class="ostrakon-author-badge">${escapeHtml(item.badge)}</span>` : ""}
            </div>
            <span class="ostrakon-date">${escapeHtml(item.date)}</span>
          </div>
          <p class="ostrakon-message">${escapeHtml(item.message)}</p>
          <div class="ostrakon-bottom">
            <span class="ostrakon-seal">✦ OSTRAKON · AGORA</span>
            ${!item.isDefault ? `<button type="button" class="btn-delete-ostrakon" data-id="${item.id}" title="도편 삭제">지우기</button>` : ""}
          </div>
        `;

        // 삭제 버튼 이벤트 연결
        const delBtn = tile.querySelector(".btn-delete-ostrakon");
        if (delBtn) {
          delBtn.addEventListener("click", () => {
            if (confirm("이 도편을 점토판에서 지우시겠습니까?")) {
              if (item.isCloud && isFirebaseLive && db) {
                db.collection("ostraka").doc(item.id).delete()
                  .then(() => alert("도편이 클라우드 광장에서 삭제되었습니다."))
                  .catch((err) => alert("삭제 권한이 없거나 오류가 발생했습니다: " + err.message));
              } else {
                ostrakaList = ostrakaList.filter(o => o.id !== item.id);
                saveOstraka(ostrakaList);
                renderOstraka();
              }
            }
          });
        }

        ostrakonGrid.appendChild(tile);
      });
    }

    // 3-1. Firebase 실시간 연동 리스너 초기화 (미설정 시 로컬 저장소 로드)
    function initOstrakaSync() {
      if (isFirebaseLive && db) {
        db.collection("ostraka")
          .orderBy("createdAt", "desc")
          .limit(50)
          .onSnapshot((snapshot) => {
            const cloudOstraka = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              cloudOstraka.push({
                id: doc.id,
                author: data.author || "아고라 시민",
                badge: data.badge || "아고라 시민",
                date: data.date || "최근",
                style: data.style || "terracotta",
                message: data.message || "",
                isDefault: false,
                isCloud: true
              });
            });
            // 클라우드 실시간 도편들 + 기본 고대 철학자 도편 4개 병합
            ostrakaList = [...cloudOstraka, ...defaultOstraka];
            renderOstraka();
          }, (error) => {
            console.error("Firestore 실시간 데이터 수신 오류:", error);
            ostrakaList = loadOstraka();
            renderOstraka();
          });
      } else {
        // Firebase 미연동 시 로컬 모드로 동작
        ostrakaList = loadOstraka();
        renderOstraka();
      }
    }

    // XSS 방지를 위한 간단한 HTML 특수문자 이스케이프 함수
    function escapeHtml(text) {
      if (!text) return "";
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    // 4. 글자 수 카운터 리스너
    if (ostrakonContentInput && charCountSpan) {
      ostrakonContentInput.addEventListener("input", () => {
        charCountSpan.textContent = ostrakonContentInput.value.length;
      });
    }

    // 5. 랜덤 그리스 별칭 생성 버튼
    if (btnRandomName && ostrakonAuthorInput) {
      btnRandomName.addEventListener("click", () => {
        const randName = greekNicknames[Math.floor(Math.random() * greekNicknames.length)];
        ostrakonAuthorInput.value = randName;
        ostrakonAuthorInput.focus();
      });
    }

    // 6. 도편 작성 폼 제출(Submit) 핸들러 (1일 3회 등록 제한 & 30초 쿨다운 검사)
    ostrakonForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const rateData = loadRateLimitData();

      // 6-1. 일일 한도 초과 검사
      if (rateData.count >= MAX_DAILY_POSTS) {
        alert(`🏺 [아고라 원로원 공고]\n하루에 새길 수 있는 도편의 수량(최대 ${MAX_DAILY_POSTS}회)을 모두 소진하셨습니다.\n다양한 시민들의 원활한 공론을 위해 내일 다시 새겨주세요!`);
        updateDailyLimitUI();
        return;
      }

      // 6-2. 도배 방지 쿨다운 시간(30초) 검사
      const nowTime = Date.now();
      const elapsedSec = Math.floor((nowTime - (rateData.lastTime || 0)) / 1000);
      if (rateData.lastTime && elapsedSec < POST_COOLDOWN_SECONDS) {
        const remainingSec = POST_COOLDOWN_SECONDS - elapsedSec;
        alert(`⏳ [아고라 규율]\n점토판이 굳을 시간이 필요합니다. ${remainingSec}초 후에 다시 새겨주세요.`);
        return;
      }

      const author = ostrakonAuthorInput.value.trim();
      const message = ostrakonContentInput.value.trim();
      const style = ostrakonStyleSelect ? ostrakonStyleSelect.value : "terracotta";

      if (!author || !message) {
        alert("작성자 명칭과 메시지를 모두 입력해 주세요!");
        return;
      }

      const now = new Date();
      const dateString = `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`;

      const newOstrakon = {
        id: "ostrakon-" + Date.now(),
        author: author,
        badge: "아고라 시민",
        date: dateString,
        style: style,
        message: message,
        isDefault: false
      };

      if (isFirebaseLive && db) {
        // 1) 클라우드 Firestore에 저장 (성공 시 onSnapshot이 전 세계 모든 브라우저에 실시간 렌더링!)
        db.collection("ostraka").add({
          author: author,
          badge: "아고라 시민",
          date: dateString,
          style: style,
          message: message,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          alert("🎉 아고라 글로벌 광장에 그대의 도편이 실시간으로 새겨졌습니다!");
        }).catch((err) => {
          console.error("클라우드 전송 실패:", err);
          alert("클라우드 전송에 실패하여 로컬에 저장합니다: " + err.message);
          ostrakaList.unshift(newOstrakon);
          saveOstraka(ostrakaList);
          renderOstraka();
        });
      } else {
        // 2) 로컬 모드일 때
        ostrakaList.unshift(newOstrakon);
        saveOstraka(ostrakaList);
        renderOstraka();
        alert("🎉 아고라 광장에 그대의 도편이 성공적으로 새겨졌습니다! (로컬 모드)");
      }

      // 일일 등록 횟수 갱신
      rateData.count += 1;
      rateData.lastTime = nowTime;
      saveRateLimitData(rateData);
      updateDailyLimitUI();

      // 입력 폼 초기화
      ostrakonContentInput.value = "";
      if (charCountSpan) charCountSpan.textContent = "0";
    });

    // 7. 초기 도편 복구 버튼
    if (btnResetDemo) {
      btnResetDemo.addEventListener("click", () => {
        if (confirm("방명록을 초기 고대 그리스 철학자 도편 상태로 복구하시겠습니까? (직접 작성한 도편 및 등록 제한 기록이 모두 초기화됩니다)")) {
          ostrakaList = [...defaultOstraka];
          saveOstraka(ostrakaList);
          renderOstraka();

          // 일일 등록 제한 기록도 함께 리셋
          localStorage.removeItem(OSTRAKON_RATE_LIMIT_KEY);
          updateDailyLimitUI();
        }
      });
    }

    // 첫 실행 시 렌더링 및 상태 초기화
    initOstrakaSync();
    updateDailyLimitUI();
    updateConnectionStatusUI();
  }

});
