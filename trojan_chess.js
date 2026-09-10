/**
 * ============================================================================
 * 체스: 트로이 (Chess: Troy) - trojan_chess.js
 * 호메로스의 대서사시 『일리아스』 테마 체스 엔진 및 인터랙션 스크립트
 * ============================================================================
 * 이 스크립트는 다음 핵심 기능들을 제공합니다:
 * 1. chess.js 라이브러리 기반의 엄격하고 완벽한 체스 룰 검증 (체크, 체크메이트, 캐슬링, 앙파상 등)
 * 2. 아카이아(그리스) vs 트로이 진영의 영웅 매핑 및 호메로스풍 서사 대사 출력
 * 3. Web Audio API를 활용한 무설치·고성능 브라우저 자체 합성 효과음 (착수, 전투, 승리)
 * 4. 미니맥스(Minimax) 및 위치 가치 테이블(PST) 기반의 3단계 AI 대전 상대
 * 5. 올림포스 제우스의 운명의 저울(형세 바) 및 기보 기록
 */

(function () {
  "use strict";

  // ==========================================================================
  // 1. 트로이 전쟁 영웅 데이터 및 기물 매핑 (Hero Encyclopedia)
  // ==========================================================================
  const HERO_DATA = {
    w: {
      name: "아카이아 연합군 (그리스)",
      leader: "총사령관 아가멤논",
      crest: "🏛️",
      pieces: {
        k: { name: "아가멤논 (Agamemnon)", title: "미케네의 군주, 아카이아 총사령관", symbol: "♔", heroCrest: "👑", shortName: "아가멤논", roleClass: "hero-agamemnon" },
        q: { name: "아킬레우스 (Achilles)", title: "펠레우스의 아들, 최강의 전사", symbol: "♕", heroCrest: "⚔️", shortName: "아킬레우스", roleClass: "hero-achilles" },
        b: { name: "오디세우스 (Odysseus)", title: "이타카의 왕, 지략의 영웅", symbol: "♗", heroCrest: "📜", shortName: "오디세우스", roleClass: "hero-odysseus" },
        n: { name: "파트로클로스 (Patroclus)", title: "아킬레우스의 벗, 용맹한 전사", symbol: "♘", heroCrest: "🐎", shortName: "파트로클로스", roleClass: "hero-patroclus" },
        r: { name: "대·소 아이아스 (Ajax)", title: "거대한 방패의 대 아이아스 & 신속한 창의 소 아이아스", symbol: "♖", heroCrest: "🛡️", shortName: "아이아스", roleClass: "hero-ajax" },
        p: { name: "미르미돈 정예병 (Myrmidon)", title: "아킬레우스 직속 최정예 개미 전사들", symbol: "♙", heroCrest: "🐜", shortName: "미르미돈", roleClass: "hero-myrmidon" }
      }
    },
    b: {
      name: "트로이 수호군 (일리온)",
      leader: "위대한 노왕 프리아모스",
      crest: "🛡️",
      pieces: {
        k: { name: "프리아모스 (Priam)", title: "트로이의 성군, 일리오스의 왕", symbol: "♚", heroCrest: "👑", shortName: "프리아모스", roleClass: "hero-priam" },
        q: { name: "헥토르 (Hector)", title: "투구 빛나는 트로이의 불멸의 방패", symbol: "♛", heroCrest: "🛡️", shortName: "헥토르", roleClass: "hero-hector" },
        b: { name: "파리스 & 헬레노스", title: "트로이의 궁수 왕자 & 아폴론의 예언자", symbol: "♝", heroCrest: "🏹", shortName: "파리스", roleClass: "hero-paris" },
        n: { name: "아이네이아스 (Aeneas)", title: "아프로디테의 아들, 다르다니아의 영웅", symbol: "♞", heroCrest: "🐎", shortName: "아이네이아스", roleClass: "hero-aeneas" },
        r: { name: "트로이의 성벽 (Walls of Troy)", title: "포세이돈과 아폴론이 쌓은 난공불락의 문", symbol: "♜", heroCrest: "🏰", shortName: "트로이 성벽", roleClass: "hero-trojanwall" },
        p: { name: "트로이 팔랑크스 (Trojan Phalanx)", title: "조국의 땅을 수호하는 용맹한 보병들", symbol: "♟", heroCrest: "⚔️", shortName: "트로이 보병", roleClass: "hero-phalanx" }
      }
    }
  };

  // 상황별 서사 대사 모음집 (Homeric Battle Cries)
  const BATTLE_DIALOGUES = {
    start: [
      "호메로스 『일리아스』의 서막: 트로이 벌판 위로 거대한 운명의 장막이 오릅니다!",
      "뮤즈 여신이여! 펠레우스의 아들 아킬레우스의 파멸적인 분노를 노래하소서!",
      "스카이아 문 너머로 트로이 전사들과 아카이아 연합군이 마주 섰습니다."
    ],
    moves: [
      "방패와 창이 부딪히며 대열이 팽팽히 맞섭니다.",
      "영웅들이 호흡을 가다듬으며 다음 전술을 응시합니다.",
      "모래 먼지 이는 스카만드로스 강변에 묵직한 진군 소리가 울립니다.",
      "운명의 여신 모이라가 체스판 위를 조용히 굽어봅니다."
    ],
    captures: {
      q: "최강의 영웅이 격돌하여 적을 베어 넘깁니다! 올림포스의 신들도 숨을 죽입니다!",
      r: "단단했던 진영의 보루가 무너져 내리며 함성이 전장에 메아리칩니다!",
      b: "날카로운 화살과 지략의 칼날이 적의 허를 정확히 찔렀습니다!",
      n: "전차가 흙먼지를 일으키며 적의 측면을 순식간에 꿰뚫었습니다!",
      p: "일진일퇴의 육박전 끝에 전선에서 용맹한 병사가 쓰러졌습니다."
    },
    check: [
      "경고! 킹의 목전에 칼날이 닿았습니다! '도망칠 곳은 없다!'",
      "위기! 적의 맹장이 성벽을 넘어 군주의 앞을 가로막았습니다!",
      "포위망이 좁혀집니다! 왕이 다급히 호위병들을 불러 모읍니다!"
    ],
    checkmate: {
      w: "승리! 아카이아 연합군이 일리온의 성벽을 무너뜨렸습니다! 아가멤논과 아킬레우스의 대승!",
      b: "승리! 트로이의 수호군이 아카이아 함대를 바다로 격퇴했습니다! 헥토르와 프리아모스의 영광!"
    },
    draw: "치열한 격전 끝에 양 진영 모두 힘을 다해 일시 휴전을 선포합니다. (무승부)"
  };

  // ==========================================================================
  // 2. Web Audio API 사운드 신시사이저 (무설치 자체 합성 오디오)
  // ==========================================================================
  class SoundController {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }

    // 대리석 말 놓는 묵직한 타격음 (Stone Placement)
    playMove() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    }

    // 청동 검과 방패가 부딪히는 찰나의 금속 타격음 (Bronze Clash)
    playCapture() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 1. 고음 메탈릭 배음
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);

      // 2. 묵직한 타격 펀치음
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(160, now);
      subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
      subGain.gain.setValueAtTime(0.35, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.13);
    }

    // 체크 경고음 (Tense Horn)
    playCheck() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [440, 554.37, 659.25].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.26);
      });
    }

    // 승리 팡파르 (Victory Fanfare)
    playVictory() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.45);
      });
    }
  }

  // ==========================================================================
  // 3. 체스 AI 평가 함수 및 미니맥스 엔진 (Minimax with PST)
  // ==========================================================================
  const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

  // 기물 위치 가치 테이블 (Piece-Square Tables: 중앙 장악 및 영웅 진격 보상)
  const PAWN_PST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ];

  const KNIGHT_PST = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ];

  const BISHOP_PST = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ];

  function evaluateBoard(game) {
    let totalScore = 0;
    const board = game.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        let val = PIECE_VALUES[piece.type] || 0;

        // 위치 가치 가산
        let pstVal = 0;
        const pstRow = piece.color === 'w' ? r : 7 - r;
        if (piece.type === 'p') pstVal = PAWN_PST[pstRow][c];
        else if (piece.type === 'n') pstVal = KNIGHT_PST[pstRow][c];
        else if (piece.type === 'b') pstVal = BISHOP_PST[pstRow][c];

        val += pstVal;

        if (piece.color === 'w') {
          totalScore += val;
        } else {
          totalScore -= val;
        }
      }
    }
    return totalScore;
  }

  function minimax(game, depth, alpha, beta, isMaximizing) {
    if (depth === 0 || game.game_over()) {
      return evaluateBoard(game);
    }

    const moves = game.moves();

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        game.move(moves[i]);
        const ev = minimax(game, depth - 1, alpha, beta, false);
        game.undo();
        maxEval = Math.max(maxEval, ev);
        alpha = Math.max(alpha, ev);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < moves.length; i++) {
        game.move(moves[i]);
        const ev = minimax(game, depth - 1, alpha, beta, true);
        game.undo();
        minEval = Math.min(minEval, ev);
        beta = Math.min(beta, ev);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  function getBestMove(game, difficulty) {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;

    // 난이도 1: 신병 (Recruit) - 무작위 또는 단순 포획 우선
    if (difficulty === "recruit") {
      const captureMoves = moves.filter(m => m.captured);
      if (captureMoves.length > 0 && Math.random() < 0.6) {
        return captureMoves[Math.floor(Math.random() * captureMoves.length)];
      }
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // 난이도 2: 영웅 (Heroic - 깊이 2)
    // 난이도 3: 올림포스 신 (Olympian - 깊이 3)
    const depth = difficulty === "olympian" ? 3 : 2;
    const isMaximizing = game.turn() === 'w';

    let bestMove = null;
    let bestVal = isMaximizing ? -Infinity : Infinity;

    // 수 탐색 시 포획 수부터 우선 정렬 (탐색 효율 향상)
    moves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      game.move(move);
      const ev = minimax(game, depth - 1, -Infinity, Infinity, !isMaximizing);
      game.undo();

      if (isMaximizing) {
        if (ev > bestVal) {
          bestVal = ev;
          bestMove = move;
        }
      } else {
        if (ev < bestVal) {
          bestVal = ev;
          bestMove = move;
        }
      }
    }

    return bestMove || moves[0];
  }

  // ==========================================================================
  // 3-1. 고대 그리스 & 트로이 영웅 흉상 조각상(Bust Statue) SVG 렌더러
  // ==========================================================================
  function generateStatueSvg(type, color, heroInfo) {
    const isWhite = color === 'w';
    const prefix = isWhite ? 'st-wh' : 'st-bl';
    const strokeColor = isWhite ? '#b45309' : '#d97706';
    const baseStroke = isWhite ? '#92400e' : '#f59e0b';
    const nameColor = isWhite ? '#78350f' : '#fde68a';
    const badgeBg = isWhite ? 'rgba(255, 255, 255, 0.92)' : 'rgba(28, 25, 23, 0.95)';
    const badgeColor = isWhite ? '#b45309' : '#fbbf24';

    const defs = isWhite ? `
      <defs>
        <linearGradient id="${prefix}-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="35%" stop-color="#f8f4ec"/>
          <stop offset="75%" stop-color="#e8decb"/>
          <stop offset="100%" stop-color="#c4b59f"/>
        </linearGradient>
        <linearGradient id="${prefix}-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24"/>
          <stop offset="50%" stop-color="#d97706"/>
          <stop offset="100%" stop-color="#92400e"/>
        </linearGradient>
        <linearGradient id="${prefix}-plinth" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#f3ebe0"/>
          <stop offset="100%" stop-color="#d5c4af"/>
        </linearGradient>
      </defs>
    ` : `
      <defs>
        <linearGradient id="${prefix}-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#785c49"/>
          <stop offset="35%" stop-color="#4a3424"/>
          <stop offset="75%" stop-color="#241710"/>
          <stop offset="100%" stop-color="#0f0905"/>
        </linearGradient>
        <linearGradient id="${prefix}-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f59e0b"/>
          <stop offset="50%" stop-color="#b45309"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
        <linearGradient id="${prefix}-plinth" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#4a392d"/>
          <stop offset="25%" stop-color="#2c1e14"/>
          <stop offset="100%" stop-color="#140c07"/>
        </linearGradient>
      </defs>
    `;

    // 고대 그리스 주춧돌 받침대 (Classical Plinth)
    const plinth = `
      <rect x="20" y="86" width="60" height="5" rx="1.5" fill="url(#${prefix}-plinth)" stroke="${baseStroke}" stroke-width="0.8"/>
      <rect x="23" y="91" width="54" height="15" fill="url(#${prefix}-plinth)" stroke="${baseStroke}" stroke-width="0.8"/>
      <rect x="16" y="106" width="68" height="7" rx="2" fill="url(#${prefix}-plinth)" stroke="${baseStroke}" stroke-width="1"/>
      <text x="50" y="102" font-family="'Cinzel', 'Pretendard Variable', serif" font-size="7" font-weight="900" fill="${nameColor}" text-anchor="middle" letter-spacing="0.02em">${heroInfo.shortName}</text>
    `;

    // 체스 역할 인장 뱃지 (우측 상단)
    const badge = `
      <g transform="translate(74, 5)">
        <circle cx="9" cy="9" r="9" fill="${badgeBg}" stroke="${baseStroke}" stroke-width="1"/>
        <text x="9" y="13" font-size="11" font-weight="900" fill="${badgeColor}" text-anchor="middle">${heroInfo.symbol}</text>
      </g>
    `;

    let bustContent = "";

    if (isWhite) {
      // === 아카이아 연합군 (White / 파로스 백색 대리석 흉상) ===
      switch (type) {
        case 'k': // 아가멤논 (황금관, 풍성한 곱슬 턱수염, 왕의 망토)
          bustContent = `
            <path d="M22,86 C24,68 34,64 50,64 C66,64 76,68 78,86 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
            <path d="M34,65 C38,76 44,86 44,86 M66,65 C62,76 56,86 56,86" stroke="${strokeColor}" stroke-width="0.7" fill="none"/>
            <rect x="43" y="52" width="14" height="15" rx="2" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.8"/>
            <path d="M36,46 C35,66 65,66 64,46 C64,42 36,42 36,46 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
            <path d="M42,50 C44,58 48,64 50,65 C52,64 56,58 58,50" stroke="${strokeColor}" stroke-width="0.8" fill="none"/>
            <path d="M38,36 C38,48 62,48 62,36 C62,28 38,28 38,36 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
            <path d="M50,34 L50,42 L47,44 L53,44" stroke="${strokeColor}" stroke-width="0.9" fill="none"/>
            <path d="M34,26 L42,32 L50,22 L58,32 L66,26 L64,36 L36,36 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
            <circle cx="50" cy="29" r="2.5" fill="#ffffff" stroke="${strokeColor}" stroke-width="0.6"/>
          `;
          break;
        case 'q': // 아킬레우스 (솟구친 깃털 코린토스 투구, 전사의 눈빛, 근육 흉갑)
          bustContent = `
            <path d="M22,86 C24,66 32,62 50,62 C68,62 76,66 78,86 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
            <path d="M36,70 C42,75 48,75 50,78 C52,75 58,75 64,70" stroke="${strokeColor}" stroke-width="0.8" fill="none"/>
            <rect x="43" y="52" width="14" height="13" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.8"/>
            <path d="M50,6 C38,6 30,15 36,28 C42,28 58,28 64,28 C70,15 62,6 50,6 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
            <path d="M42,10 Q50,18 58,10 M44,16 Q50,23 56,16" stroke="#ffffff" stroke-width="0.8" fill="none"/>
            <path d="M34,28 C32,46 36,60 50,63 C64,60 68,46 66,28 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
            <path d="M40,38 L48,38 L48,48 L44,53 L56,53 L52,48 L52,38 L60,38" fill="#451a03" stroke="${strokeColor}" stroke-width="0.8"/>
          `;
          break;
        case 'b': // 오디세우스 (원뿔형 필레우스 모자, 지혜로운 수염, 날카로운 눈매)
          bustContent = `
            <path d="M22,86 C25,70 35,66 50,66 C65,66 75,70 78,86 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
            <circle cx="34" cy="70" r="3" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
            <path d="M37,48 C36,65 64,65 63,48 C63,42 37,42 37,48 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
            <path d="M38,36 C38,48 62,48 62,36 C62,28 38,28 38,36 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
            <path d="M49,34 L49,42 L46,44 L54,44" stroke="${strokeColor}" stroke-width="0.9" fill="none"/>
            <path d="M34,36 C36,16 64,16 66,36 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1.1"/>
            <path d="M33,36 Q38,40 37,44 M67,36 Q62,40 63,44" stroke="${strokeColor}" stroke-width="1.2" fill="none"/>
          `;
          break;
        case 'n': // 파트로클로스 (전차마 볏 투구의 젊은 영웅)
          bustContent = `
            <path d="M22,86 C24,68 34,63 50,63 C66,63 76,68 78,86 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
            <path d="M50,8 C40,8 34,18 42,26 C46,26 54,26 58,26 C66,18 60,8 50,8 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.9"/>
            <path d="M46,12 C48,8 52,8 54,12" stroke="#ffffff" stroke-width="0.8" fill="none"/>
            <path d="M36,26 C34,44 40,58 50,60 C60,58 66,44 64,26 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
            <path d="M42,36 C42,48 58,48 58,36 Z" fill="#f8f4ec" stroke="${strokeColor}" stroke-width="0.7"/>
            <path d="M50,38 L50,44 L48,46 L52,46" stroke="${strokeColor}" stroke-width="0.8" fill="none"/>
          `;
          break;
        case 'r': // 대·소 아이아스 (등 뒤의 거대한 칠중 방패와 육중한 흉상)
          bustContent = `
            <path d="M18,24 C18,16 82,16 82,24 L84,86 L16,86 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1.3"/>
            <circle cx="50" cy="45" r="24" fill="none" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="3,2"/>
            <circle cx="50" cy="45" r="8" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
            <path d="M26,86 C28,66 36,60 50,60 C64,60 72,66 74,86 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
            <path d="M37,28 C35,46 38,58 50,60 C62,58 65,46 63,28 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
            <path d="M43,40 L48,40 L48,48 L52,48 L52,40 L57,40" stroke="#3b2210" stroke-width="1.2" fill="none"/>
          `;
          break;
        case 'p': // 미르미돈 (코린토스 투구의 정예 개미 보병)
          bustContent = `
            <path d="M24,86 C26,70 34,66 50,66 C66,66 74,70 76,86 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
            <path d="M36,24 C34,44 38,60 50,63 C62,60 66,44 64,24 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
            <path d="M40,38 L48,38 L48,50 L45,54 L55,54 L52,50 L52,38 L60,38" fill="#3b2210" stroke="${strokeColor}" stroke-width="0.8"/>
            <path d="M36,24 C42,18 58,18 64,24" stroke="${strokeColor}" stroke-width="1.2" fill="none"/>
          `;
          break;
      }
    } else {
      // === 트로이 수호군 (Black / 일리온 앤틱 청동 & 흑요석 흉상) ===
      switch (type) {
        case 'k': // 프리아모스 (트로이 티아라 왕관, 긴 수염, 위엄 있는 노왕)
          bustContent = `
            <path d="M22,86 C24,68 34,64 50,64 C66,64 76,68 78,86 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
            <path d="M35,46 C34,70 66,70 65,46 C65,42 35,42 35,46 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
            <path d="M42,52 C45,62 48,72 50,75 C52,72 55,62 58,52" stroke="${strokeColor}" stroke-width="0.9" fill="none"/>
            <path d="M38,36 C38,48 62,48 62,36 C62,28 38,28 38,36 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
            <path d="M50,34 L50,42 L47,44 L53,44" stroke="${strokeColor}" stroke-width="0.9" fill="none"/>
            <path d="M34,30 C36,14 48,10 56,12 C62,14 66,22 66,32 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1.1"/>
            <circle cx="50" cy="22" r="2.5" fill="#fde68a" stroke="${strokeColor}" stroke-width="0.6"/>
          `;
          break;
        case 'q': // 헥토르 (눈부신 말갈기 깃털 투구, 트로이 원형 방패)
          bustContent = `
            <path d="M22,86 C24,66 32,62 50,62 C68,62 76,66 78,86 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1.1"/>
            <path d="M20,60 C24,54 32,54 36,60 L32,86 L18,86 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.9"/>
            <path d="M50,6 C36,6 28,15 35,28 C42,28 58,28 65,28 C72,15 64,6 50,6 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1.1"/>
            <path d="M34,28 C32,46 36,60 50,63 C64,60 68,46 66,28 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1.1"/>
            <path d="M40,38 L48,38 L48,48 L44,53 L56,53 L52,48 L52,38 L60,38" fill="#d97706" stroke="${strokeColor}" stroke-width="0.8"/>
          `;
          break;
        case 'b': // 파리스 (앞으로 굽은 프리기안 캡, 미남 왕자)
          bustContent = `
            <path d="M22,86 C25,70 35,66 50,66 C65,66 75,70 78,86 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
            <path d="M38,36 C38,52 62,52 62,36 C62,26 38,26 38,36 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
            <path d="M50,34 L50,42 L47,44 L53,44" stroke="${strokeColor}" stroke-width="0.9" fill="none"/>
            <path d="M34,34 C34,16 48,8 58,10 C68,12 66,24 54,20 C48,22 42,26 34,34 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1.1"/>
          `;
          break;
        case 'n': // 아이네이아스 (다르다니아 영웅, 명장의 투구)
          bustContent = `
            <path d="M22,86 C24,68 34,63 50,63 C66,63 76,68 78,86 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
            <path d="M50,8 C40,8 34,18 42,26 C46,26 54,26 58,26 C66,18 60,8 50,8 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
            <path d="M36,26 C34,44 40,58 50,60 C60,58 66,44 64,26 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
            <path d="M42,36 C42,48 58,48 58,36 Z" fill="#2c1e14" stroke="${strokeColor}" stroke-width="0.7"/>
            <path d="M50,38 L50,44 L48,46 L52,46" stroke="${strokeColor}" stroke-width="0.8" fill="none"/>
          `;
          break;
        case 'r': // 트로이 성벽 (스카이아 문 성탑 흉벽 요새 조각상)
          bustContent = `
            <path d="M24,86 L28,40 L22,40 L22,22 L34,22 L34,30 L44,30 L44,22 L56,22 L56,30 L66,30 L66,22 L78,22 L78,40 L72,40 L76,86 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1.2"/>
            <path d="M30,50 L70,50 M28,62 L72,62 M26,74 L74,74" stroke="${strokeColor}" stroke-width="0.7" fill="none"/>
            <path d="M42,86 L42,66 C42,60 58,60 58,66 L58,86 Z" fill="#000000" stroke="${strokeColor}" stroke-width="1"/>
          `;
          break;
        case 'p': // 트로이 보병 (원뿔형 청동 투구의 팔랑크스 수호병)
          bustContent = `
            <path d="M24,86 C26,70 34,66 50,66 C66,66 74,70 76,86 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
            <path d="M36,32 C38,16 62,16 64,32 C66,48 62,60 50,63 C38,60 34,48 36,32 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
            <path d="M48,16 L50,8 L52,16 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
            <path d="M40,38 L48,38 L48,48 L52,48 L52,38 L60,38" stroke="${strokeColor}" stroke-width="1" fill="none"/>
          `;
          break;
      }
    }

    return `
      <svg viewBox="0 0 100 115" class="statue-svg" xmlns="http://www.w3.org/2000/svg">
        ${defs}
        <g class="statue-group">
          ${bustContent}
          ${plinth}
          ${badge}
        </g>
      </svg>
    `;
  }
  // 4. 메인 트로이 체스 게임 관리자 클래스 (TrojanChessGame)
  // ==========================================================================
  class TrojanChessGame {
    constructor() {
      // 체스 인스턴스 (chess.js가 전역에 로드되어 있는지 확인)
      if (typeof Chess === "undefined") {
        console.error("chess.js 라이브러리를 찾을 수 없습니다.");
        return;
      }

      this.game = new Chess();
      this.sound = new SoundController();

      // 게임 설정 상태
      this.playerColor = 'w';       // 'w': 아카이아(그리스), 'b': 트로이
      this.gameMode = 'ai';         // 'ai': 1인 vs AI, 'pvp': 2인 로컬 대전
      this.aiDifficulty = 'heroic'; // 'recruit', 'heroic', 'olympian'
      this.specialMode = true;      // 트로이 서사 특수 모드 활성화 여부
      this.trojanHorseUsed = false; // 트로이 목마 전술 사용 여부

      // 선택 상태
      this.selectedSquare = null;
      this.legalMovesForSelected = [];
      this.pendingPromotion = null; // 승급 대기 중인 착수 정보 { from, to }

      // 잡힌 기물 기록
      this.capturedPieces = { w: [], b: [] };

      // DOM 요소 캐싱
      this.initDomElements();
      this.bindEvents();

      // 최초 렌더링
      this.render();
      this.setDialogue(BATTLE_DIALOGUES.start[Math.floor(Math.random() * BATTLE_DIALOGUES.start.length)]);
    }

    initDomElements() {
      this.boardEl = document.getElementById("chessBoard");
      this.dialogueEl = document.getElementById("trojanDialogue");
      this.scaleWhiteEl = document.getElementById("scaleWhite");
      this.scaleBlackEl = document.getElementById("scaleBlack");
      this.scaleRatioEl = document.getElementById("scaleRatio");
      this.historyListEl = document.getElementById("chessHistoryList");

      this.whiteCapturedEl = document.getElementById("whiteCaptured");
      this.blackCapturedEl = document.getElementById("blackCaptured");

      this.whiteCardEl = document.getElementById("whiteFactionCard");
      this.blackCardEl = document.getElementById("blackFactionCard");

      // 컨트롤 바 요소들
      this.selectGameMode = document.getElementById("selectGameMode");
      this.selectDifficulty = document.getElementById("selectDifficulty");
      this.selectSide = document.getElementById("selectSide");

      this.btnNewGame = document.getElementById("btnNewGame");
      this.btnUndo = document.getElementById("btnUndo");
      this.btnResign = document.getElementById("btnResign");
      this.btnSoundToggle = document.getElementById("btnSoundToggle");
      this.btnTrojanHorse = document.getElementById("btnTrojanHorse");

      // 프로모션 모달
      this.promoModal = document.getElementById("promotionModal");
    }

    bindEvents() {
      // 모드 및 난이도 변경 이벤트
      if (this.selectGameMode) {
        this.selectGameMode.addEventListener("change", (e) => {
          this.gameMode = e.target.value;
          if (this.selectDifficulty) {
            this.selectDifficulty.parentElement.style.display = this.gameMode === "ai" ? "flex" : "none";
          }
          this.resetGame();
        });
      }

      if (this.selectDifficulty) {
        this.selectDifficulty.addEventListener("change", (e) => {
          this.aiDifficulty = e.target.value;
        });
      }

      if (this.selectSide) {
        this.selectSide.addEventListener("change", (e) => {
          this.playerColor = e.target.value;
          this.resetGame();
        });
      }

      // 버튼 이벤트
      if (this.btnNewGame) {
        this.btnNewGame.addEventListener("click", () => this.resetGame());
      }

      if (this.btnUndo) {
        this.btnUndo.addEventListener("click", () => this.undoMove());
      }

      if (this.btnResign) {
        this.btnResign.addEventListener("click", () => this.resignGame());
      }

      if (this.btnSoundToggle) {
        this.btnSoundToggle.addEventListener("click", () => {
          this.sound.enabled = !this.sound.enabled;
          this.btnSoundToggle.textContent = this.sound.enabled ? "🔊 소리 켬" : "🔇 음소거";
        });
      }

      // 트로이 목마 특수 전술 버튼 이벤트
      if (this.btnTrojanHorse) {
        this.btnTrojanHorse.addEventListener("click", () => this.activateTrojanHorse());
      }

      // 승급 선택 모달 버튼 이벤트
      const promoButtons = document.querySelectorAll(".btn-promo-piece");
      promoButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const pieceType = e.currentTarget.getAttribute("data-piece");
          if (this.pendingPromotion) {
            this.executeMove(this.pendingPromotion.from, this.pendingPromotion.to, pieceType);
            this.pendingPromotion = null;
            this.closePromotionModal();
          }
        });
      });

      // 아코디언 가이드 토글 이벤트
      const accordionHeader = document.getElementById("chessGuideHeader");
      const accordionBody = document.getElementById("chessGuideBody");
      if (accordionHeader && accordionBody) {
        accordionHeader.addEventListener("click", () => {
          accordionHeader.classList.toggle("open");
          accordionBody.classList.toggle("open");
        });
      }
    }

    // 새 게임 초기화
    resetGame() {
      this.game.reset();
      this.selectedSquare = null;
      this.legalMovesForSelected = [];
      this.pendingPromotion = null;
      this.capturedPieces = { w: [], b: [] };
      this.trojanHorseUsed = false;
      if (this.btnTrojanHorse) {
        this.btnTrojanHorse.disabled = false;
        this.btnTrojanHorse.textContent = "목마 잠입 개시";
      }
      this.render();
      this.setDialogue(BATTLE_DIALOGUES.start[Math.floor(Math.random() * BATTLE_DIALOGUES.start.length)]);

      // AI 선공 처리 (플레이어가 트로이/Black을 선택했을 때)
      if (this.gameMode === "ai" && this.playerColor === 'b') {
        this.triggerAiMove();
      }
    }

    // 대사 출력 갱신
    setDialogue(text) {
      if (this.dialogueEl) {
        this.dialogueEl.textContent = text;
      }
    }

    // 보드 렌더링
    render() {
      if (!this.boardEl) return;
      this.boardEl.innerHTML = "";

      const boardState = this.game.board();
      const lastMove = this.game.history({ verbose: true }).slice(-1)[0];
      const isCheck = this.game.in_check();
      const currentTurn = this.game.turn();

      // 뷰 방향: 플레이어가 흑(b)이면 보드를 뒤집어서 표시
      const isFlipped = this.playerColor === 'b';

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const row = isFlipped ? 7 - r : r;
          const col = isFlipped ? 7 - c : c;

          const squareName = String.fromCharCode(97 + col) + (8 - row);
          const piece = boardState[row][col];
          const isLight = (row + col) % 2 === 0;

          const squareDiv = document.createElement("div");
          squareDiv.className = `square ${isLight ? "light" : "dark"}`;
          squareDiv.setAttribute("data-square", squareName);

          // 1. 선택된 칸 하이라이트
          if (this.selectedSquare === squareName) {
            squareDiv.classList.add("selected");
          }

          // 2. 마지막 착수 칸 하이라이트
          if (lastMove && (lastMove.from === squareName || lastMove.to === squareName)) {
            squareDiv.classList.add("last-move");
          }

          // 3. 체크 상태인 킹 하이라이트
          if (isCheck && piece && piece.type === 'k' && piece.color === currentTurn) {
            squareDiv.classList.add("in-check");
          }

          // 4. 착수 가능 힌트 점 및 포획 링 표시
          const moveHint = this.legalMovesForSelected.find(m => m.to === squareName);
          if (moveHint) {
            if (moveHint.captured) {
              const ring = document.createElement("div");
              ring.className = "capture-ring";
              squareDiv.appendChild(ring);
            } else {
              const dot = document.createElement("div");
              dot.className = "move-dot";
              squareDiv.appendChild(dot);
            }
          }

          // 5. 기물 렌더링 (고대 그리스 & 트로이 대리석/청동 조각상 흉상 모델링)
          if (piece) {
            const pieceDiv = document.createElement("div");
            const isWhite = piece.color === 'w';
            const heroInfo = HERO_DATA[piece.color].pieces[piece.type];

            pieceDiv.className = `piece statue-piece ${isWhite ? "white-piece" : "black-piece"} ${heroInfo ? heroInfo.roleClass : ""}`;
            pieceDiv.title = `${heroInfo ? heroInfo.name : ""} — ${heroInfo ? heroInfo.title : ""}`;

            pieceDiv.innerHTML = generateStatueSvg(piece.type, piece.color, heroInfo);

            squareDiv.appendChild(pieceDiv);
          }

          // 칸 클릭 이벤트
          squareDiv.addEventListener("click", () => this.handleSquareClick(squareName));

          this.boardEl.appendChild(squareDiv);
        }
      }

      this.updateStatusAndPanels();
    }

    // 칸 클릭 인터랙션 처리
    handleSquareClick(squareName) {
      // 게임 종료 상태이거나 승급 대기 중이면 무시
      if (this.game.game_over() || this.pendingPromotion) return;

      const currentTurn = this.game.turn();

      // AI 턴일 때 플레이어의 조작 방지
      if (this.gameMode === "ai" && currentTurn !== this.playerColor) {
        return;
      }

      // 이미 선택된 기물이 있고, 클릭한 칸이 유효한 이동 경로인 경우 -> 착수 진행
      if (this.selectedSquare) {
        const targetMove = this.legalMovesForSelected.find(m => m.to === squareName);

        if (targetMove) {
          // 승급(Promotion) 여부 확인
          if (targetMove.flags.includes('p')) {
            this.pendingPromotion = { from: this.selectedSquare, to: squareName };
            this.openPromotionModal(currentTurn);
            return;
          }

          this.executeMove(this.selectedSquare, squareName);
          this.selectedSquare = null;
          this.legalMovesForSelected = [];
          return;
        }
      }

      // 기물 선택 처리
      const pieceAtSquare = this.game.get(squareName);
      if (pieceAtSquare && pieceAtSquare.color === currentTurn) {
        this.selectedSquare = squareName;
        this.legalMovesForSelected = this.game.moves({ square: squareName, verbose: true });
        this.render();
      } else {
        // 빈 칸이거나 상대 기물 클릭 시 선택 해제
        this.selectedSquare = null;
        this.legalMovesForSelected = [];
        this.render();
      }
    }

    // 착수 실행
    executeMove(from, to, promotionPiece = 'q') {
      const move = this.game.move({
        from: from,
        to: to,
        promotion: promotionPiece
      });

      if (!move) return;

      // 잡힌 기물 기록
      if (move.captured) {
        const victimColor = move.color === 'w' ? 'b' : 'w';
        const capturedHero = HERO_DATA[victimColor].pieces[move.captured];
        this.capturedPieces[victimColor].push(capturedHero ? capturedHero.symbol : move.captured);
        this.sound.playCapture();

        // 서사 대사 출력
        const captureLine = BATTLE_DIALOGUES.captures[move.captured] || "적을 포획하였습니다!";
        const actorName = HERO_DATA[move.color].pieces[move.piece].name;
        this.setDialogue(`${actorName}: "${captureLine}"`);
      } else {
        this.sound.playMove();
        if (Math.random() < 0.4) {
          this.setDialogue(BATTLE_DIALOGUES.moves[Math.floor(Math.random() * BATTLE_DIALOGUES.moves.length)]);
        }
      }

      // 체크/체크메이트 사운드 및 대사
      if (this.game.in_checkmate()) {
        const winner = this.game.turn() === 'w' ? 'b' : 'w';
        this.sound.playVictory();
        this.setDialogue(BATTLE_DIALOGUES.checkmate[winner]);
      } else if (this.game.in_check()) {
        this.sound.playCheck();
        this.setDialogue(BATTLE_DIALOGUES.check[Math.floor(Math.random() * BATTLE_DIALOGUES.check.length)]);
      } else if (this.game.in_draw()) {
        this.setDialogue(BATTLE_DIALOGUES.draw);
      }

      this.render();

      // AI 착수 발동
      if (!this.game.game_over() && this.gameMode === "ai" && this.game.turn() !== this.playerColor) {
        this.triggerAiMove();
      }
    }

    // AI 착수 지연 실행 (인간적인 고민 시간 400ms 연출)
    triggerAiMove() {
      setTimeout(() => {
        if (this.game.game_over()) return;

        const bestMove = getBestMove(this.game, this.aiDifficulty);
        if (bestMove) {
          this.executeMove(bestMove.from, bestMove.to, bestMove.promotion || 'q');
        }
      }, 420);
    }

    // 한 수 무르기 (Undo)
    undoMove() {
      if (this.gameMode === "ai") {
        // AI 모드에서는 플레이어의 직전 수와 AI의 수 둘 다 취소 (총 2수)
        this.game.undo();
        this.game.undo();
      } else {
        this.game.undo();
      }

      this.selectedSquare = null;
      this.legalMovesForSelected = [];
      this.rebuildCapturedFromHistory();
      this.render();
      this.setDialogue("시간을 되돌려 전열을 다시 가다듬습니다.");
    }

    // 기권 (Resign)
    resignGame() {
      if (this.game.game_over()) return;
      const resignedColor = this.game.turn();
      const winner = resignedColor === 'w' ? 'b' : 'w';
      this.setDialogue(`${HERO_DATA[resignedColor].leader}이(가) 백기를 들고 항복을 선언했습니다. ${HERO_DATA[winner].name}의 대승!`);
      this.sound.playVictory();
    }

    // 트로이 목마 특수 기믹 (Trojan Horse Tactic)
    activateTrojanHorse() {
      if (this.trojanHorseUsed || this.game.game_over()) return;
      if (this.game.turn() !== 'w') {
        alert("트로이 목마 전술은 아카이아 연합군(백) 차례에만 발동할 수 있습니다!");
        return;
      }

      // 호메로스 서사 컷인 및 대사
      this.trojanHorseUsed = true;
      if (this.btnTrojanHorse) {
        this.btnTrojanHorse.disabled = true;
        this.btnTrojanHorse.textContent = "목마 작전 완료";
      }

      this.sound.playCheck();
      this.setDialogue("오디세우스의 지략! 거대한 목마가 트로이 성벽 안으로 진입하였습니다! '트로이인들이여, 이것은 아테나 여신께 바치는 봉헌물이다!'");
    }

    // 기보 이력으로부터 잡힌 기물 재계산 (무르기 시 복원)
    rebuildCapturedFromHistory() {
      this.capturedPieces = { w: [], b: [] };
      const history = this.game.history({ verbose: true });
      history.forEach((m) => {
        if (m.captured) {
          const victimColor = m.color === 'w' ? 'b' : 'w';
          const hero = HERO_DATA[victimColor].pieces[m.captured];
          this.capturedPieces[victimColor].push(hero ? hero.symbol : m.captured);
        }
      });
    }

    // 상태 패널, 운명의 저울, 기보 로그 UI 동기화
    updateStatusAndPanels() {
      const turn = this.game.turn();

      // 1. 진영 카드 활성화 턴 강조
      if (this.whiteCardEl && this.blackCardEl) {
        this.whiteCardEl.classList.toggle("active-turn", turn === 'w');
        this.blackCardEl.classList.toggle("active-turn", turn === 'b');
      }

      // 2. 잡힌 기물 트레이 업데이트
      if (this.whiteCapturedEl) {
        this.whiteCapturedEl.innerHTML = this.capturedPieces.b
          .map(s => `<span class="captured-piece">${s}</span>`)
          .join("");
      }
      if (this.blackCapturedEl) {
        this.blackCapturedEl.innerHTML = this.capturedPieces.w
          .map(s => `<span class="captured-piece">${s}</span>`)
          .join("");
      }

      // 3. 제우스의 운명의 저울 (Scale of Fate) 형세 계산
      const score = evaluateBoard(this.game); // 양수면 백군 우세, 음수면 흑군 우세
      // 점수 범위를 10% ~ 90% 사이의 비율로 변환 (중앙 50%)
      const clampedScore = Math.max(-1000, Math.min(1000, score));
      const whitePercent = Math.round(50 + (clampedScore / 1000) * 40);

      if (this.scaleWhiteEl) {
        this.scaleWhiteEl.style.width = `${whitePercent}%`;
      }
      if (this.scaleRatioEl) {
        this.scaleRatioEl.textContent = `${whitePercent}% : ${100 - whitePercent}%`;
      }

      // 4. 기보 목록 업데이트
      if (this.historyListEl) {
        const history = this.game.history();
        let rowsHtml = "";
        for (let i = 0; i < history.length; i += 2) {
          const turnNum = Math.floor(i / 2) + 1;
          const whiteMove = history[i] || "";
          const blackMove = history[i + 1] || "";
          rowsHtml += `
            <div class="history-row">
              <span class="history-turn-num">${turnNum}.</span>
              <span class="history-move">${whiteMove}</span>
              <span class="history-move">${blackMove}</span>
            </div>
          `;
        }
        this.historyListEl.innerHTML = rowsHtml;
        this.historyListEl.scrollTop = this.historyListEl.scrollHeight;
      }
    }

    // 승급 모달 팝업 열기
    openPromotionModal(turnColor) {
      if (!this.promoModal) return;
      const promoBtns = this.promoModal.querySelectorAll(".btn-promo-piece");
      promoBtns.forEach((btn) => {
        const pieceType = btn.getAttribute("data-piece");
        btn.textContent = HERO_DATA[turnColor].pieces[pieceType].symbol;
      });
      this.promoModal.classList.add("active");
    }

    // 승급 모달 팝업 닫기
    closePromotionModal() {
      if (this.promoModal) {
        this.promoModal.classList.remove("active");
      }
    }
  }

  // ==========================================================================
  // 5. DOM 로드 완료 시 체스 게임 초기화 및 전역 등록
  // ==========================================================================
  document.addEventListener("DOMContentLoaded", () => {
    window.trojanChess = new TrojanChessGame();
  });
})();
