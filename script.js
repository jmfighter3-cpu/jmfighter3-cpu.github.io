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
  // 4-C. 아폴론과 뮤즈의 리라 선율 플레이어 (Web Audio API Ancient Lyre & Breeze)
  // 외부 음원 파일 없이, 브라우저 내장 Web Audio API로 고대 리라 하프와 바람 소리를 실시간 합성합니다.
  // ==========================================================================
  const btnSoundToggle = document.getElementById("btnSoundToggle");
  const soundIcon = document.getElementById("soundIcon");
  const soundBtnText = document.getElementById("soundBtnText");
  const soundHint = document.getElementById("soundHint");
  const volumeSlider = document.getElementById("volumeSlider");
  const soundVisualizer = document.getElementById("soundVisualizer");

  let audioCtx = null;
  let noiseNode = null;
  let gainNode = null;
  let filterNode = null;
  let isPlaying = false;
  let lyreTimeout = null;

  // 고대 그리스 5음계 주파수 (D Dorian Pentatonic: D4, E4, G4, A4, C5, D5)
  const lyreNotes = [293.66, 329.63, 392.00, 440.00, 523.25, 587.33];

  // 고대 리라(Lyre) 현을 튕기는 플럭(Pluck) 음향 합성 함수
  function pluckLyreNote(ctx, targetGain) {
    if (!ctx || ctx.state !== "running" || !isPlaying) return;
    try {
      const now = ctx.currentTime;
      const freq = lyreNotes[Math.floor(Math.random() * lyreNotes.length)];

      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(0.07, now + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      const noteFilter = ctx.createBiquadFilter();
      noteFilter.type = "lowpass";
      noteFilter.frequency.setValueAtTime(1500, now);

      osc.connect(noteGain);
      noteGain.connect(noteFilter);
      noteFilter.connect(targetGain);

      osc.start(now);
      osc.stop(now + 2.3);
    } catch (e) {
      // 오류 방지
    }
  }

  // 지중해 바람 사이로 즉흥적인 리라 선율을 연주하는 스케줄러
  function scheduleLyreArpeggio(ctx, targetGain) {
    if (!isPlaying) return;
    pluckLyreNote(ctx, targetGain);

    const nextInterval = 1600 + Math.random() * 1600; // 1.6~3.2초 간격
    lyreTimeout = setTimeout(() => {
      scheduleLyreArpeggio(ctx, targetGain);
    }, nextInterval);
  }

  // 바람 소리를 생성하는 핑크 노이즈(Pink Noise) 오디오 버퍼 생성 함수
  function createWindBuffer(ctx) {
    const bufferSize = ctx.sampleRate * 3; // 3초 분량의 루프 버퍼
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    // 자연의 바람소리와 가장 유사한 핑크 노이즈 알고리즘 (Paul Kellet 필터)
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  function startAmbience() {
    // 사용자가 첫 클릭을 했을 때 오디오 컨텍스트를 생성합니다 (브라우저 자동 재생 정책 준수)
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    // 1. 노이즈 소스 노드 생성 및 무한 반복 설정
    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = createWindBuffer(audioCtx);
    noiseNode.loop = true;

    // 2. 부드러운 산들바람 느낌을 주는 저음역 로우패스 필터(Low-pass Filter) 연결
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = "lowpass";
    filterNode.frequency.setValueAtTime(380, audioCtx.currentTime); // 온화한 에게해 미풍 주파수

    // 3. 마스터 볼륨 조절 노드 연결
    gainNode = audioCtx.createGain();
    const currentVol = volumeSlider ? parseFloat(volumeSlider.value) : 0.5;
    gainNode.gain.setValueAtTime(currentVol * 0.8, audioCtx.currentTime);

    // 노드 체인 연결
    noiseNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseNode.start();
    isPlaying = true;

    // 고대 리라 하프 아르페지오 시작
    scheduleLyreArpeggio(audioCtx, gainNode);

    // UI 상태 업데이트
    if (soundIcon) soundIcon.textContent = "⏸️";
    if (soundBtnText) soundBtnText.textContent = "고대 리라 선율 멈추기";
    if (soundVisualizer) soundVisualizer.classList.add("playing");
    if (soundHint) soundHint.textContent = "🎼 아폴론과 오르페우스의 서정적인 리라 하프 선율과 지중해 바람이 연주 중입니다.";
  }

  function stopAmbience() {
    if (lyreTimeout) {
      clearTimeout(lyreTimeout);
      lyreTimeout = null;
    }

    if (noiseNode) {
      try {
        noiseNode.stop();
        noiseNode.disconnect();
      } catch (e) {
        // 이미 중지된 경우 예외 방지
      }
      noiseNode = null;
    }
    isPlaying = false;

    // UI 상태 복원
    if (soundIcon) soundIcon.textContent = "▶️";
    if (soundBtnText) soundBtnText.textContent = "고대 리라 선율 재생하기";
    if (soundVisualizer) soundVisualizer.classList.remove("playing");
    if (soundHint) soundHint.textContent = "버튼을 누르면 서정적인 리라 하프 선율과 지중해 산들바람이 울려 퍼집니다.";
  }

  // 재생/정지 버튼 클릭 이벤트 연결
  if (btnSoundToggle) {
    btnSoundToggle.addEventListener("click", () => {
      if (isPlaying) {
        stopAmbience();
      } else {
        startAmbience();
      }
    });
  }

  // 볼륨 슬라이더 조절 이벤트 연결
  if (volumeSlider) {
    volumeSlider.addEventListener("input", (e) => {
      if (gainNode && audioCtx) {
        const val = parseFloat(e.target.value);
        gainNode.gain.setValueAtTime(val * 0.8, audioCtx.currentTime);
      }
    });
  }
});

