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
  // 1. 에이지 오브 미쏠로지(AoM) 스타일 트로이 영웅 고유 카탈로그
  const HERO_CATALOG = {
    // === 아카이아 연합군 (White / 그리스) ===
    'w_r1': { id: 'w_r1', type: 'r', color: 'w', name: '대(大) 아이아스 (Great Ajax)', title: '칠중 소가죽 방패의 난공불락 성벽', shortName: '대 아이아스', symbol: '♖', role: 'ajax_great' },
    'w_n1': { id: 'w_n1', type: 'n', color: 'w', name: '파트로클로스 (Patroclus)', title: '아킬레우스의 가장 소중한 전우, 용맹한 전차병', shortName: '파트로클로스', symbol: '♘', role: 'patroclus' },
    'w_b1': { id: 'w_b1', type: 'b', color: 'w', name: '오디세우스 (Odysseus)', title: '이타카의 왕, 지략과 지혜의 영웅', shortName: '오디세우스', symbol: '♗', role: 'odysseus' },
    'w_q':  { id: 'w_q',  type: 'q', color: 'w', name: '아킬레우스 (Achilles)', title: '펠레우스의 아들, 일리아스 최강의 영웅', shortName: '아킬레우스', symbol: '♕', role: 'achilles' },
    'w_k':  { id: 'w_k',  type: 'k', color: 'w', name: '아가멤논 (Agamemnon)', title: '미케네의 군주, 아카이아 연합군 총사령관', shortName: '아가멤논', symbol: '♔', role: 'agamemnon' },
    'w_b2': { id: 'w_b2', type: 'b', color: 'w', name: '디오메데스 (Diomedes)', title: '아테나의 가호로 신들에게 상처를 입힌 아르고스 왕', shortName: '디오메데스', symbol: '♗', role: 'diomedes' },
    'w_n2': { id: 'w_n2', type: 'n', color: 'w', name: '네스토르 (Nestor)', title: '필로스의 지혜로운 원로 전차병 군주', shortName: '네스토르', symbol: '♘', role: 'nestor' },
    'w_r2': { id: 'w_r2', type: 'r', color: 'w', name: '소(小) 아이아스 (Lesser Ajax)', title: '로크리스의 명장, 바람처럼 날렵한 투창의 영웅', shortName: '소 아이아스', symbol: '♖', role: 'ajax_lesser' },
    'w_p':  { id: 'w_p',  type: 'p', color: 'w', name: '미르미돈 정예병 (Myrmidons)', title: '아킬레우스 직속 최정예 개미 전사대', shortName: '미르미돈', symbol: '♙', role: 'myrmidon' },

    // === 트로이 수호군 (Black / 일리온) ===
    'b_r1': { id: 'b_r1', type: 'r', color: 'b', name: '스카이아 관문 (Scaean Gate)', title: '아폴론이 축성한 서쪽의 난공불락 성벽 타워', shortName: '스카이아 문', symbol: '♜', role: 'scaean_gate' },
    'b_n1': { id: 'b_n1', type: 'n', color: 'b', name: '아이네이아스 (Aeneas)', title: '아프로디테의 아들, 다르다니아의 용맹한 맹장', shortName: '아이네이아스', symbol: '♞', role: 'aeneas' },
    'b_b1': { id: 'b_b1', type: 'b', color: 'b', name: '파리스 (Paris)', title: '트로이의 미남 왕자, 아폴론의 황금 활을 든 궁수', shortName: '파리스', symbol: '♝', role: 'paris' },
    'b_q':  { id: 'b_q',  type: 'q', color: 'b', name: '헥토르 (Hector)', title: '눈부신 투구의 조국 수호자, 트로이의 불멸의 방패', shortName: '헥토르', symbol: '♛', role: 'hector' },
    'b_k':  { id: 'b_k',  type: 'k', color: 'b', name: '프리아모스 (Priam)', title: '트로이의 성군, 일리오스의 위대한 노왕', shortName: '프리아모스', symbol: '♚', role: 'priam' },
    'b_b2': { id: 'b_b2', type: 'b', color: 'b', name: '헬레노스 (Helenus)', title: '아폴론의 신탁을 전하는 트로이의 예언자 왕자', shortName: '헬레노스', symbol: '♝', role: 'helenus' },
    'b_n2': { id: 'b_n2', type: 'n', color: 'b', name: '사르페돈 (Sarpedon)', title: '제우스의 아들, 리키아의 용맹한 영웅왕', shortName: '사르페돈', symbol: '♞', role: 'sarpedon' },
    'b_r2': { id: 'b_r2', type: 'r', color: 'b', name: '다르다니아 성탑 (Dardanian Tower)', title: '포세이돈의 가호가 깃든 동쪽의 요새 타워', shortName: '다르다니아 탑', symbol: '♜', role: 'dardanian_tower' },
    'b_p':  { id: 'b_p',  type: 'p', color: 'b', name: '트로이 팔랑크스 (Trojan Phalanx)', title: '조국의 대지를 사수하는 불굴의 트로이 보병대', shortName: '트로이 보병', symbol: '♟', role: 'trojan_phalanx' }
  };

  // 기본 단일 키 매핑 (폴백 및 체스 타입 단독 조회용)
  HERO_CATALOG['w_r'] = HERO_CATALOG['w_r1'];
  HERO_CATALOG['w_n'] = HERO_CATALOG['w_n1'];
  HERO_CATALOG['w_b'] = HERO_CATALOG['w_b1'];
  HERO_CATALOG['b_r'] = HERO_CATALOG['b_r1'];
  HERO_CATALOG['b_n'] = HERO_CATALOG['b_n1'];
  HERO_CATALOG['b_b'] = HERO_CATALOG['b_b1'];

  // 초기 8x8 보드 칸별 고유 영웅 매핑
  const INITIAL_PIECE_MAP = {
    // 백군 (아카이아 연합군)
    'a1': 'w_r1', 'b1': 'w_n1', 'c1': 'w_b1', 'd1': 'w_q',
    'e1': 'w_k',  'f1': 'w_b2', 'g1': 'w_n2', 'h1': 'w_r2',
    'a2': 'w_p',  'b2': 'w_p',  'c2': 'w_p',  'd2': 'w_p',
    'e2': 'w_p',  'f2': 'w_p',  'g2': 'w_p',  'h2': 'w_p',

    // 흑군 (트로이 수호군)
    'a8': 'b_r1', 'b8': 'b_n1', 'c8': 'b_b1', 'd8': 'b_q',
    'e8': 'b_k',  'f8': 'b_b2', 'g8': 'b_n2', 'h8': 'b_r2',
    'a7': 'b_p',  'b7': 'b_p',  'c7': 'b_p',  'd7': 'b_p',
    'e7': 'b_p',  'f7': 'b_p',  'g7': 'b_p',  'h7': 'b_p'
  };

  const HERO_DATA = {
    w: { name: "아카이아 연합군 (그리스)", leader: "총사령관 아가멤논", crest: "🏛️" },
    b: { name: "트로이 수호군 (일리온)", leader: "위대한 노왕 프리아모스", crest: "🛡️" }
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
  // 3-1. 에이지 오브 미쏠로지(AoM) 스타일 트로이 영웅 조각상 SVG 렌더러
  // ==========================================================================
  function generateAomHeroSvg(hero) {
    if (!hero) return "";
    const isWhite = hero.color === 'w';
    const prefix = isWhite ? 'aom-wh' : 'aom-bl';
    const strokeColor = isWhite ? '#b45309' : '#d97706';
    const baseStroke = isWhite ? '#92400e' : '#f59e0b';
    const nameColor = isWhite ? '#78350f' : '#fde68a';
    const badgeBg = isWhite ? 'rgba(255, 255, 255, 0.94)' : 'rgba(28, 25, 23, 0.96)';
    const badgeColor = isWhite ? '#b45309' : '#fbbf24';

    // AoM 특유의 빛나는 영웅 오라 그라디언트 및 필터
    const defs = isWhite ? `
      <defs>
        <linearGradient id="${prefix}-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="#faf6ee"/>
          <stop offset="70%" stop-color="#ebe0cd"/>
          <stop offset="100%" stop-color="#cbbbaa"/>
        </linearGradient>
        <linearGradient id="${prefix}-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="35%" stop-color="#f59e0b"/>
          <stop offset="85%" stop-color="#b45309"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
        <radialGradient id="${prefix}-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fef08a" stop-opacity="0.85"/>
          <stop offset="60%" stop-color="#f59e0b" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="${prefix}-plinth" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#f5efe6"/>
          <stop offset="100%" stop-color="#d8c7b0"/>
        </linearGradient>
      </defs>
    ` : `
      <defs>
        <linearGradient id="${prefix}-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7c6553"/>
          <stop offset="35%" stop-color="#4a3526"/>
          <stop offset="75%" stop-color="#241810"/>
          <stop offset="100%" stop-color="#0f0905"/>
        </linearGradient>
        <linearGradient id="${prefix}-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24"/>
          <stop offset="45%" stop-color="#d97706"/>
          <stop offset="85%" stop-color="#92400e"/>
          <stop offset="100%" stop-color="#451a03"/>
        </linearGradient>
        <radialGradient id="${prefix}-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.85"/>
          <stop offset="60%" stop-color="#b45309" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#78350f" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="${prefix}-plinth" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#4d3b2f"/>
          <stop offset="25%" stop-color="#2e2016"/>
          <stop offset="100%" stop-color="#140c07"/>
        </linearGradient>
      </defs>
    `;

    // 에이지 오브 미쏠로지 영웅 발밑의 황금빛 영웅 오라 (AoM Radiant Hero Aura Ring)
    const aomAura = `
      <ellipse cx="50" cy="114" rx="46" ry="9" fill="url(#${prefix}-aura)"/>
      <ellipse cx="50" cy="114" rx="44" ry="7.5" fill="none" stroke="${strokeColor}" stroke-width="1.1" stroke-dasharray="4,2"/>
    `;

    // 고대 그리스 주춧돌 받침대 (Classical Plinth)
    const plinth = `
      <rect x="16" y="88" width="68" height="5" rx="1.5" fill="url(#${prefix}-plinth)" stroke="${baseStroke}" stroke-width="0.8"/>
      <rect x="20" y="93" width="60" height="15" fill="url(#${prefix}-plinth)" stroke="${baseStroke}" stroke-width="0.8"/>
      <rect x="12" y="108" width="76" height="7" rx="2" fill="url(#${prefix}-plinth)" stroke="${baseStroke}" stroke-width="1"/>
      <text x="50" y="104" font-family="'Cinzel', 'Pretendard Variable', serif" font-size="6.5" font-weight="900" fill="${nameColor}" text-anchor="middle" letter-spacing="0.01em">${hero.shortName}</text>
    `;

    // 우측 상단 체스 룰 인장 뱃지
    const badge = `
      <g transform="translate(74, 5)">
        <circle cx="9" cy="9" r="9" fill="${badgeBg}" stroke="${baseStroke}" stroke-width="1"/>
        <text x="9" y="13" font-size="11" font-weight="900" fill="${badgeColor}" text-anchor="middle">${hero.symbol}</text>
      </g>
    `;

    let heroFigure = "";

    // 18종 고유 영웅 모델링 분기 (role 기반)
    switch (hero.role) {
      // 1. 대 아이아스 (칠중 청동 타워 실드 + 거대한 장창)
      case 'ajax_great':
        heroFigure = `
          <!-- 거대한 칠중 청동 타워 실드 (좌측 전면 성벽) -->
          <path d="M12,20 C12,12 56,12 56,20 L58,88 L10,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1.3"/>
          <ellipse cx="34" cy="48" rx="18" ry="24" fill="none" stroke="${strokeColor}" stroke-width="0.9" stroke-dasharray="3,2"/>
          <circle cx="34" cy="48" r="6" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
          <!-- 우측 어깨 뒤로 솟은 거대한 장창 -->
          <line x1="68" y1="8" x2="68" y2="88" stroke="url(#${prefix}-gold)" stroke-width="2.2"/>
          <polygon points="68,4 64,12 72,12" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 육중한 전사 흉상 -->
          <path d="M38,88 C40,66 48,58 64,58 C76,58 82,66 84,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M50,28 C48,46 52,58 64,60 C76,58 78,46 76,28 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M55,38 L60,38 L60,46 L68,46 L68,38 L73,38" stroke="${strokeColor}" stroke-width="1" fill="none"/>
        `;
        break;

      // 2. 소 아이아스 (바람의 2자루 투창 + 날개 장식 투구)
      case 'ajax_lesser':
        heroFigure = `
          <!-- 등 뒤로 교차된 2자루의 날렵한 투창 -->
          <line x1="26" y1="8" x2="74" y2="88" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
          <polygon points="24,6 22,13 29,10" fill="url(#${prefix}-gold)"/>
          <line x1="74" y1="8" x2="26" y2="88" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
          <polygon points="76,6 78,13 71,10" fill="url(#${prefix}-gold)"/>
          <!-- 어깨 경갑 -->
          <path d="M25,88 C27,70 36,65 50,65 C64,65 73,70 75,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
          <!-- 바람의 날개 장식 투구 -->
          <path d="M50,12 C40,12 36,22 42,28 C46,28 54,28 58,28 C64,22 60,12 50,12 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <path d="M30,22 Q40,26 36,32 M70,22 Q60,26 64,32" stroke="url(#${prefix}-gold)" stroke-width="1.2" fill="none"/>
          <path d="M38,28 C36,44 42,58 50,60 C58,58 64,44 62,28 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M50,38 L50,45 L47,47 L53,47" stroke="${strokeColor}" stroke-width="0.8" fill="none"/>
        `;
        break;

      // 3. 파트로클로스 (전차마 볏 투구 + 돌격 청년 전사)
      case 'patroclus':
        heroFigure = `
          <!-- 어깨 흉갑 -->
          <path d="M22,88 C24,68 34,63 50,63 C66,63 76,68 78,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
          <path d="M36,74 C44,79 56,79 64,74" stroke="${strokeColor}" stroke-width="0.8" fill="none"/>
          <!-- 전차마의 볏을 형상화한 전차병 투구 -->
          <path d="M50,8 C38,8 32,18 40,26 C46,26 54,26 60,26 C68,18 62,8 50,8 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.9"/>
          <path d="M46,12 C48,8 52,8 54,12" stroke="#ffffff" stroke-width="0.8" fill="none"/>
          <path d="M36,26 C34,44 40,58 50,60 C60,58 66,44 64,26 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M42,36 C42,48 58,48 58,36 Z" fill="${isWhite ? '#f8f4ec' : '#2c1e14'}" stroke="${strokeColor}" stroke-width="0.7"/>
          <path d="M50,38 L50,44 L48,46 L52,46" stroke="${strokeColor}" stroke-width="0.8" fill="none"/>
        `;
        break;

      // 4. 네스토르 (황금 전차 투구 + 원로의 지혜 지팡이 + 풍성한 수염)
      case 'nestor':
        heroFigure = `
          <!-- 오른손에 쥔 지혜의 황금 지팡이 -->
          <line x1="20" y1="18" x2="24" y2="88" stroke="url(#${prefix}-gold)" stroke-width="2"/>
          <circle cx="20" cy="16" r="3.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 어깨 및 원로의 토가 -->
          <path d="M24,88 C26,68 36,63 52,63 C66,63 76,68 78,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
          <!-- 풍성한 원로의 턱수염 -->
          <path d="M37,48 C36,70 66,70 65,48 C65,42 37,42 37,48 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M43,54 C46,64 50,70 52,70 C54,70 58,64 61,54" stroke="${strokeColor}" stroke-width="0.8" fill="none"/>
          <path d="M40,36 C40,48 62,48 62,36 C62,28 40,28 40,36 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
          <!-- 필로스 원로의 황금 투구 -->
          <path d="M36,28 C38,14 64,14 66,28 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
          <circle cx="51" cy="20" r="2.5" fill="#ffffff"/>
        `;
        break;

      // 5. 오디세우스 (필레우스 모자 + 지략의 두루마리 + 올빼미 흉갑)
      case 'odysseus':
        heroFigure = `
          <!-- 어깨 키톤과 아테나의 올빼미 흉갑 브로치 -->
          <path d="M22,88 C25,70 35,66 50,66 C65,66 75,70 78,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
          <circle cx="50" cy="76" r="4.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 지략의 파피루스 두루마리 (좌측) -->
          <rect x="18" y="56" width="7" height="18" rx="1.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.7"/>
          <!-- 지혜로운 수염과 얼굴 -->
          <path d="M37,48 C36,65 64,65 63,48 C63,42 37,42 37,48 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
          <path d="M38,36 C38,48 62,48 62,36 C62,28 38,28 38,36 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
          <path d="M49,34 L49,42 L46,44 L54,44" stroke="${strokeColor}" stroke-width="0.9" fill="none"/>
          <!-- 필레우스 (Pilos) 지략 모자 -->
          <path d="M34,36 C36,16 64,16 66,36 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1.1"/>
          <path d="M33,36 Q38,40 37,44 M67,36 Q62,40 63,44" stroke="${strokeColor}" stroke-width="1.2" fill="none"/>
        `;
        break;

      // 6. 디오메데스 (아테나의 맹검 + 사자 엠블럼 투구)
      case 'diomedes':
        heroFigure = `
          <!-- 오른손의 번뜩이는 영웅의 청동 장검 -->
          <line x1="22" y1="12" x2="22" y2="88" stroke="url(#${prefix}-gold)" stroke-width="2.5"/>
          <polygon points="22,6 18,16 26,16" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.7"/>
          <line x1="16" y1="28" x2="28" y2="28" stroke="${strokeColor}" stroke-width="1.5"/>
          <!-- 어깨 사자 흉갑 -->
          <path d="M26,88 C28,68 36,62 52,62 C66,62 76,68 78,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <!-- 아테나의 사자 문양 투구 볏 -->
          <path d="M52,8 C40,8 36,18 42,26 C48,26 56,26 62,26 C68,18 64,8 52,8 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M38,26 C36,44 42,58 52,60 C62,58 68,44 66,26 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M44,38 L48,38 L48,46 L56,46 L56,38 L60,38" stroke="${strokeColor}" stroke-width="1" fill="none"/>
        `;
        break;

      // 7. 아킬레우스 (펠레우스의 청동 창 + 솟구친 황금 말갈기 투구)
      case 'achilles':
        heroFigure = `
          <!-- 전설의 펠레우스 물푸레나무 청동 창 -->
          <line x1="78" y1="4" x2="78" y2="88" stroke="url(#${prefix}-gold)" stroke-width="2.4"/>
          <polygon points="78,0 73,12 83,12" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 어깨 근육 흉갑 -->
          <path d="M20,88 C22,66 32,62 50,62 C68,62 74,66 76,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M34,70 C42,75 48,75 50,78 C52,75 58,75 66,70" stroke="${strokeColor}" stroke-width="0.8" fill="none"/>
          <!-- 솟구쳐오른 장대한 황금 말갈기 투구 볏 -->
          <path d="M50,4 C36,4 28,14 36,28 C42,28 58,28 64,28 C72,14 64,4 50,4 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1.1"/>
          <path d="M42,8 Q50,16 58,8 M44,14 Q50,21 56,14" stroke="#ffffff" stroke-width="0.9" fill="none"/>
          <!-- 코린토스 투구 안면 -->
          <path d="M34,28 C32,46 36,60 50,63 C64,60 68,46 66,28 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M40,38 L48,38 L48,48 L44,53 L56,53 L52,48 L52,38 L60,38" fill="#451a03" stroke="${strokeColor}" stroke-width="0.8"/>
        `;
        break;

      // 8. 아가멤논 (미케네 황금 마스크 성관 + 총사령관의 황금 홀 + 진홍 망토)
      case 'agamemnon':
        heroFigure = `
          <!-- 총사령관의 황금 홀 (Scepter) -->
          <line x1="20" y1="12" x2="20" y2="88" stroke="url(#${prefix}-gold)" stroke-width="2.2"/>
          <circle cx="20" cy="10" r="4.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 어깨 및 진홍빛 군주 망토 -->
          <path d="M22,88 C24,68 34,64 50,64 C66,64 76,68 78,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
          <path d="M34,65 C38,76 44,88 44,88 M66,65 C62,76 56,88 56,88" stroke="${strokeColor}" stroke-width="0.8" fill="none"/>
          <!-- 풍성한 곱슬 턱수염 -->
          <path d="M36,46 C35,66 65,66 64,46 C64,42 36,42 36,46 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
          <path d="M38,36 C38,48 62,48 62,36 C62,28 38,28 38,36 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
          <!-- 미케네 황금 마스크 성관 (Royal Diadem) -->
          <path d="M34,26 L42,32 L50,20 L58,32 L66,26 L64,36 L36,36 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1.1"/>
          <circle cx="50" cy="27" r="2.5" fill="#ffffff" stroke="${strokeColor}" stroke-width="0.6"/>
        `;
        break;

      // 9. 스카이아 관문 (아폴론의 태양 엠블럼 + 서쪽 난공불락 성벽 타워)
      case 'scaean_gate':
        heroFigure = `
          <!-- 트로이 성탑 타워 흉벽 (Battlement) -->
          <path d="M24,88 L28,38 L20,38 L20,20 L32,20 L32,28 L42,28 L42,20 L54,20 L54,28 L64,28 L64,20 L76,20 L76,38 L68,38 L72,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1.2"/>
          <!-- 아폴론의 태양 엠블럼 -->
          <circle cx="48" cy="46" r="6" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <line x1="48" y1="36" x2="48" y2="40" stroke="url(#${prefix}-gold)" stroke-width="1.2"/>
          <line x1="48" y1="52" x2="48" y2="56" stroke="url(#${prefix}-gold)" stroke-width="1.2"/>
          <line x1="38" y1="46" x2="42" y2="46" stroke="url(#${prefix}-gold)" stroke-width="1.2"/>
          <line x1="54" y1="46" x2="58" y2="46" stroke="url(#${prefix}-gold)" stroke-width="1.2"/>
          <!-- 아치형 스카이아 성문 -->
          <path d="M40,88 L40,65 C40,58 56,58 56,65 L56,88 Z" fill="#000000" stroke="${strokeColor}" stroke-width="1.2"/>
        `;
        break;

      // 10. 다르다니아 성탑 (포세이돈의 삼지창 엠블럼 + 동쪽 요새 타워)
      case 'dardanian_tower':
        heroFigure = `
          <!-- 동쪽 요새 타워 흉벽 -->
          <path d="M24,88 L28,38 L20,38 L20,20 L32,20 L32,28 L42,28 L42,20 L54,20 L54,28 L64,28 L64,20 L76,20 L76,38 L68,38 L72,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1.2"/>
          <!-- 포세이돈의 삼지창 엠블럼 -->
          <line x1="48" y1="36" x2="48" y2="56" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
          <path d="M42,40 L42,48 L54,48 L54,40" stroke="url(#${prefix}-gold)" stroke-width="1.2" fill="none"/>
          <line x1="42" y1="40" x2="42" y2="36" stroke="url(#${prefix}-gold)" stroke-width="1.2"/>
          <line x1="54" y1="40" x2="54" y2="36" stroke="url(#${prefix}-gold)" stroke-width="1.2"/>
          <!-- 청동 빗장 관문 -->
          <path d="M40,88 L40,65 C40,58 56,58 56,65 L56,88 Z" fill="#140c07" stroke="${strokeColor}" stroke-width="1.2"/>
          <line x1="38" y1="76" x2="58" y2="76" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
        `;
        break;

      // 11. 아이네이아스 (다르다니아 용장 투구 + 사자 어깨 갑옷)
      case 'aeneas':
        heroFigure = `
          <!-- 어깨 갑옷 -->
          <path d="M22,88 C24,68 34,63 50,63 C66,63 76,68 78,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
          <path d="M50,8 C40,8 34,18 42,26 C46,26 54,26 58,26 C66,18 60,8 50,8 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
          <!-- 다르다니아 맹장의 투구 안면 -->
          <path d="M36,26 C34,44 40,58 50,60 C60,58 66,44 64,26 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M42,36 C42,48 58,48 58,36 Z" fill="#2c1e14" stroke="${strokeColor}" stroke-width="0.7"/>
          <path d="M50,38 L50,44 L48,46 L52,46" stroke="${strokeColor}" stroke-width="0.8" fill="none"/>
        `;
        break;

      // 12. 사르페돈 (제우스의 날개 투구 + 양날 전투 도끼 Labrys)
      case 'sarpedon':
        heroFigure = `
          <!-- 등에 멘 양날 전투 도끼 (Labrys) -->
          <line x1="20" y1="12" x2="80" y2="84" stroke="url(#${prefix}-gold)" stroke-width="2"/>
          <path d="M16,8 C12,14 12,24 18,30 L26,20 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <path d="M28,6 C34,12 34,22 28,28 L20,18 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 어깨 흉갑 -->
          <path d="M26,88 C28,68 36,63 50,63 C64,63 72,68 74,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <!-- 제우스 아들의 날개 장식 투구 -->
          <path d="M50,10 C40,10 36,20 42,26 C46,26 54,26 58,26 C64,20 60,10 50,10 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.9"/>
          <path d="M34,26 C32,44 38,58 50,60 C62,58 68,44 66,26 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M44,38 L48,38 L48,46 L52,46 L52,38 L56,38" stroke="${strokeColor}" stroke-width="1" fill="none"/>
        `;
        break;

      // 13. 파리스 (아폴론의 황금 복합궁 + 프리기안 캡)
      case 'paris':
        heroFigure = `
          <!-- 어깨에 멘 아폴론의 황금 활 (Composite Bow) -->
          <path d="M18,12 Q28,48 20,84" stroke="url(#${prefix}-gold)" stroke-width="2.4" fill="none"/>
          <line x1="18" y1="12" x2="20" y2="84" stroke="#ffffff" stroke-width="0.6"/>
          <!-- 어깨 튜닉 -->
          <path d="M24,88 C26,70 36,66 50,66 C64,66 74,70 76,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
          <!-- 미남 왕자의 부드러운 얼굴선 -->
          <path d="M38,36 C38,52 62,52 62,36 C62,26 38,26 38,36 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M50,34 L50,42 L47,44 L53,44" stroke="${strokeColor}" stroke-width="0.9" fill="none"/>
          <!-- 트로이 프리기안 캡 (Phrygian Cap) -->
          <path d="M34,34 C34,16 48,8 58,10 C68,12 66,24 54,20 C48,22 42,26 34,34 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1.1"/>
        `;
        break;

      // 14. 헬레노스 (아폴론의 신탁 뱀 지팡이 Caduceus + 예언자 후드)
      case 'helenus':
        heroFigure = `
          <!-- 아폴론 신탁의 뱀 지팡이 (Caduceus) -->
          <line x1="22" y1="14" x2="22" y2="88" stroke="url(#${prefix}-gold)" stroke-width="2"/>
          <circle cx="22" cy="12" r="3" fill="url(#${prefix}-gold)"/>
          <path d="M18,20 Q26,26 18,32 Q26,38 18,44" stroke="url(#${prefix}-gold)" stroke-width="1.2" fill="none"/>
          <!-- 예언자의 제단 가운 -->
          <path d="M26,88 C28,68 36,64 52,64 C66,64 74,68 76,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
          <!-- 예언자의 후드와 긴 수염 -->
          <path d="M38,48 C37,66 65,66 64,48 C64,42 38,42 38,48 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M36,28 C36,14 66,14 66,28 L68,44 C68,52 34,52 34,44 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
        `;
        break;

      // 15. 헥토르 (눈부신 말갈기 투구 + 원형 청동 방패 + 장창)
      case 'hector':
        heroFigure = `
          <!-- 트로이 청동 장창 -->
          <line x1="80" y1="4" x2="80" y2="88" stroke="url(#${prefix}-gold)" stroke-width="2.4"/>
          <polygon points="80,0 75,12 85,12" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 어깨와 트로이 원형 방패 -->
          <path d="M22,88 C24,66 32,62 50,62 C68,62 76,66 78,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1.1"/>
          <circle cx="28" cy="72" r="14" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
          <circle cx="28" cy="72" r="5" fill="#1c1917" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 장엄한 눈부신 트로이 말갈기 투구 -->
          <path d="M50,4 C36,4 28,14 35,28 C42,28 58,28 65,28 C72,14 64,4 50,4 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1.1"/>
          <path d="M34,28 C32,46 36,60 50,63 C64,60 68,46 66,28 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1.1"/>
          <path d="M40,38 L48,38 L48,48 L44,53 L56,53 L52,48 L52,38 L60,38" fill="#d97706" stroke="${strokeColor}" stroke-width="0.8"/>
        `;
        break;

      // 16. 프리아모스 (트로이 티아라 성관 + 긴 은빛 수염 + 보석 홀)
      case 'priam':
        heroFigure = `
          <!-- 노왕의 보석 홀 (Scepter) -->
          <line x1="20" y1="12" x2="20" y2="88" stroke="url(#${prefix}-gold)" stroke-width="2.2"/>
          <polygon points="20,6 15,14 25,14" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 어깨와 왕의 숄 -->
          <path d="M22,88 C24,68 34,64 50,64 C66,64 76,68 78,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <!-- 가슴까지 내려오는 긴 수염 -->
          <path d="M35,46 C34,70 66,70 65,46 C65,42 35,42 35,46 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M42,52 C45,62 48,72 50,75 C52,72 55,62 58,52" stroke="${strokeColor}" stroke-width="0.9" fill="none"/>
          <path d="M38,36 C38,48 62,48 62,36 C62,28 38,28 38,36 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <!-- 트로이 프리기아 티아라 성관 -->
          <path d="M34,30 C36,14 48,10 56,12 C62,14 66,22 66,32 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1.1"/>
          <circle cx="50" cy="22" r="2.5" fill="#fde68a" stroke="${strokeColor}" stroke-width="0.6"/>
        `;
        break;

      // 17. 미르미돈 (아킬레우스 직속 개미 전사대)
      case 'myrmidon':
        heroFigure = `
          <path d="M24,88 C26,70 34,66 50,66 C66,66 74,70 76,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
          <path d="M36,24 C34,44 38,60 50,63 C62,60 66,44 64,24 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M40,38 L48,38 L48,50 L45,54 L55,54 L52,50 L52,38 L60,38" fill="#3b2210" stroke="${strokeColor}" stroke-width="0.8"/>
          <path d="M36,24 C42,18 58,18 64,24" stroke="${strokeColor}" stroke-width="1.2" fill="none"/>
        `;
        break;

      // 18. 트로이 팔랑크스 (트로이 수호 보병대)
      case 'trojan_phalanx':
      default:
        heroFigure = `
          <path d="M24,88 C26,70 34,66 50,66 C66,66 74,70 76,88 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="0.9"/>
          <path d="M36,32 C38,16 62,16 64,32 C66,48 62,60 50,63 C38,60 34,48 36,32 Z" fill="url(#${prefix}-body)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M48,16 L50,8 L52,16 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <path d="M40,38 L48,38 L48,48 L52,48 L52,38 L60,38" stroke="${strokeColor}" stroke-width="1" fill="none"/>
        `;
        break;
    }

    return `
      <svg viewBox="0 0 100 125" class="statue-svg aom-hero-svg" xmlns="http://www.w3.org/2000/svg">
        ${defs}
        <g class="statue-group">
          ${aomAura}
          ${heroFigure}
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

      // 기물 고유 식별자 위치 추적 맵 및 이력 스택 (쌍둥이 기물 고유 모델링 보존)
      this.piecePositions = { ...INITIAL_PIECE_MAP };
      this.positionHistory = [];

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
      this.piecePositions = { ...INITIAL_PIECE_MAP };
      this.positionHistory = [];
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

          // 5. 기물 렌더링 (에이지 오브 미쏠로지 영웅 유닛 & 조각상 흉상 모델링)
          if (piece) {
            const pieceDiv = document.createElement("div");
            const isWhite = piece.color === 'w';
            const heroId = this.piecePositions[squareName] || `${piece.color}_${piece.type}`;
            const hero = HERO_CATALOG[heroId] || HERO_CATALOG[`${piece.color}_${piece.type}`];

            pieceDiv.className = `piece statue-piece ${isWhite ? "white-piece" : "black-piece"} ${hero ? hero.role : ""}`;
            pieceDiv.title = hero ? `${hero.name} — ${hero.title}` : "";

            pieceDiv.innerHTML = generateAomHeroSvg(hero);

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
      // 1. 이동할 기물과 대상 칸의 기물 고유 ID 보존
      const movingHeroId = this.piecePositions[from];
      const targetHeroId = this.piecePositions[to];

      // 2. chess.js를 통한 체스 룰 검증 및 착수
      const move = this.game.move({
        from: from,
        to: to,
        promotion: promotionPiece
      });

      if (!move) return;

      // 3. 무르기(Undo) 지원을 위해 착수 전 위치 스냅샷 보관
      this.positionHistory.push({ ...this.piecePositions });

      // 4. 특수 이동에 따른 기물 위치 맵(piecePositions) 정밀 갱신
      if (move.flags.includes('k')) {
        // 킹사이드 캐슬링: 킹(e열 -> g열), 룩(h열 -> f열)
        if (from === 'e1' && to === 'g1') {
          this.piecePositions['f1'] = this.piecePositions['h1'];
          delete this.piecePositions['h1'];
        } else if (from === 'e8' && to === 'g8') {
          this.piecePositions['f8'] = this.piecePositions['h8'];
          delete this.piecePositions['h8'];
        }
      } else if (move.flags.includes('q')) {
        // 퀸사이드 캐슬링: 킹(e열 -> c열), 룩(a열 -> d열)
        if (from === 'e1' && to === 'c1') {
          this.piecePositions['d1'] = this.piecePositions['a1'];
          delete this.piecePositions['a1'];
        } else if (from === 'e8' && to === 'c8') {
          this.piecePositions['d8'] = this.piecePositions['a8'];
          delete this.piecePositions['a8'];
        }
      } else if (move.flags.includes('e')) {
        // 앙파상(En Passant): 포획된 적 폰은 이동 목표칸이 아닌 (to의 열, from의 행)에 위치
        const epVictimSquare = to[0] + from[1];
        delete this.piecePositions[epVictimSquare];
      }

      // 승급(Promotion) 처리: 보병이 새로운 고유 영웅으로 변모
      if (move.promotion) {
        const promoMap = {
          'w': { q: 'w_q', r: 'w_r1', b: 'w_b1', n: 'w_n1' },
          'b': { q: 'b_q', r: 'b_r1', b: 'b_b1', n: 'b_n1' }
        };
        this.piecePositions[to] = (promoMap[move.color] && promoMap[move.color][move.promotion]) || `${move.color}_${move.promotion}`;
      } else {
        this.piecePositions[to] = movingHeroId || `${move.color}_${move.piece}`;
      }
      delete this.piecePositions[from];

      // 잡힌 기물 기록 및 사운드/대사 처리
      if (move.captured) {
        const victimColor = move.color === 'w' ? 'b' : 'w';
        const capturedHeroId = move.flags.includes('e')
          ? (this.positionHistory[this.positionHistory.length - 1][to[0] + from[1]])
          : targetHeroId;
        const capturedHero = HERO_CATALOG[capturedHeroId] || HERO_CATALOG[`${victimColor}_${move.captured}`];
        this.capturedPieces[victimColor].push(capturedHero ? capturedHero.symbol : move.captured);
        this.sound.playCapture();

        // 서사 대사 출력 (포획한 영웅의 고유 명칭 반영)
        const captureLine = BATTLE_DIALOGUES.captures[move.captured] || "적을 포획하였습니다!";
        const actorHero = HERO_CATALOG[movingHeroId] || HERO_CATALOG[`${move.color}_${move.piece}`];
        const actorName = actorHero ? actorHero.shortName : (move.color === 'w' ? '아카이아 영웅' : '트로이 영웅');
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
        if (this.positionHistory.length >= 2) {
          this.positionHistory.pop();
          this.piecePositions = this.positionHistory.pop();
        } else if (this.positionHistory.length === 1) {
          this.positionHistory.pop();
          this.piecePositions = { ...INITIAL_PIECE_MAP };
        }
      } else {
        this.game.undo();
        if (this.positionHistory.length >= 1) {
          this.piecePositions = this.positionHistory.pop();
        }
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
          const hero = HERO_CATALOG[`${victimColor}_${m.captured}`];
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
        const hero = HERO_CATALOG[`${turnColor}_${pieceType}`];
        btn.textContent = hero ? hero.symbol : pieceType;
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
