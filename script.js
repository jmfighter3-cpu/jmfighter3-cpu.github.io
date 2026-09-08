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
  // 3. 한 줄 소개 타이핑 애니메이션 (Typing Effect)
  // 타자기를 치듯이 글자가 한 글자씩 써지고 지워지며 다음 문구로 넘어갑니다.
  // ==========================================================================
  const typingElement = document.getElementById("typing-text");

  if (typingElement) {
    // 번갈아 가며 출력할 소개 문구 목록 (고전 그리스 서사 및 개발 철학 테마)
    const phrases = [
      "아이고 힘들다... 하지만 오늘도 성장 중! 🌱",
      "너 자신을 알라 (Gnothi Seauton)... 오늘도 버그를 잡는다 ⚔️",
      "험난한 항해 끝에 이타카에 도달하듯, 끈기 있는 개발자 ⛵",
      "6개월 버티기가 목표인 끈기 있는 탐구자 💻",
      "파이썬과 웹 개발을 사랑하는 jmfighter3-cpu 📜",
      "배움에는 왕도가 없다 — 매일 한 걸음씩 성장 중 ✨"
    ];

    let phraseIndex = 0;   // 현재 출력 중인 문장 번호
    let charIndex = 0;     // 현재 출력 중인 글자 위치
    let isDeleting = false; // 글자를 지우는 중인지 여부
    const typeSpeed = 100; // 글자 타이핑 속도 (밀리초)
    const deleteSpeed = 50; // 글자 지우는 속도 (밀리초)
    const pauseTime = 1800; // 문장이 완성된 후 머무는 시간 (밀리초)

    function typeLoop() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        // 글자를 하나씩 지워나갑니다.
        typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
      } else {
        // 글자를 하나씩 써내려갑니다.
        typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
      }

      // 글자 타이핑 속도 조절
      let delay = isDeleting ? deleteSpeed : typeSpeed;

      // 문장이 전부 완성되었을 때
      if (!isDeleting && charIndex === currentPhrase.length) {
        delay = pauseTime; // 잠시 멈추고 방문자가 읽을 수 있게 대기
        isDeleting = true; // 다음 단계로 지우기 시작
      } 
      // 문장이 전부 지워졌을 때
      else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length; // 다음 문장으로 순환
        delay = 400; // 다음 문장 시작 전 잠깐 대기
      }

      setTimeout(typeLoop, delay);
    }

    // 타이핑 애니메이션 시작
    typeLoop();
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

