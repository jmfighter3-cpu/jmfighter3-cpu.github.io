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
    'w_r1': {
      id: 'w_r1', type: 'r', color: 'w',
      name: '대(大) 아이아스 (Great Ajax)',
      title: '칠중 소가죽 방패의 난공불락 성벽',
      shortName: '대 아이아스', symbol: '♖', role: 'ajax_great',
      factionName: '아카이아 연합군 (그리스)',
      chessRole: '룩 (Rook / 퀸사이드)',
      moveDesc: '상하좌우 직선 방향으로 원하는 칸만큼 이동 (캐슬링 가능)',
      lore: '텔라몬의 아들이자 헤라클레스에 버금가는 거인 영웅. 청동을 덧댄 거대한 칠중 소가죽 타워 실드로 트로이군의 맹공을 홀로 저지한 그리스의 불멸의 성벽입니다.'
    },
    'w_n1': {
      id: 'w_n1', type: 'n', color: 'w',
      name: '파트로클로스 (Patroclus)',
      title: '아킬레우스의 가장 소중한 전우, 용맹한 전차병',
      shortName: '파트로클로스', symbol: '♘', role: 'patroclus',
      factionName: '아카이아 연합군 (그리스)',
      chessRole: '나이트 (Knight / 퀸사이드)',
      moveDesc: 'L자형(2칸 직진 후 1칸 직각)으로 기물을 뛰어넘어 도약 이동',
      lore: '아킬레우스의 가장 깊은 영혼의 동반자. 아킬레우스의 갑옷을 입고 출격하여 불타는 그리스 함선을 구원하고 트로이 전선을 뒤흔든 돌격 장수입니다.'
    },
    'w_b1': {
      id: 'w_b1', type: 'b', color: 'w',
      name: '오디세우스 (Odysseus)',
      title: '이타카의 왕, 지략과 지혜의 영웅',
      shortName: '오디세우스', symbol: '♗', role: 'odysseus',
      factionName: '아카이아 연합군 (그리스)',
      chessRole: '비숍 (Bishop / 퀸사이드)',
      moveDesc: '대각선 방향으로 원하는 칸만큼 이동 (자신과 같은 색 칸만 이동)',
      lore: '지혜의 여신 아테나의 총애를 받는 이타카의 군주. 수많은 난관을 뛰어난 지략으로 타개하며 불후의 걸작 \'트로이 목마\'를 고안해 전쟁을 승리로 이끈 지혜의 화신입니다.'
    },
    'w_q': {
      id: 'w_q', type: 'q', color: 'w',
      name: '아킬레우스 (Achilles)',
      title: '펠레우스의 아들, 일리아스 최강의 영웅',
      shortName: '아킬레우스', symbol: '♕', role: 'achilles',
      factionName: '아카이아 연합군 (그리스)',
      chessRole: '퀸 (Queen / 최강의 기물)',
      moveDesc: '상하좌우 및 대각선 전 방향으로 거리 제한 없이 직선 이동',
      lore: '바다의 여신 테티스와 펠레우스의 아들. 헤파이토스가 벼려낸 눈부신 황금 갑옷과 펠레우스의 청동 장창으로 전장을 지배하는 일리아스 최고의 무신(武神)입니다.'
    },
    'w_k': {
      id: 'w_k', type: 'k', color: 'w',
      name: '아가멤논 (Agamemnon)',
      title: '미케네의 군주, 아카이아 연합군 총사령관',
      shortName: '아가멤논', symbol: '♔', role: 'agamemnon',
      factionName: '아카이아 연합군 (그리스)',
      chessRole: '킹 (King / 총사령관)',
      moveDesc: '상하좌우 및 대각선 모든 방향으로 1칸 이동 (체크메이트 시 패배)',
      lore: '제우스의 가호를 받는 미케네의 황금빛 군주이자 10만 그리스 대군의 총사령관. 황금 홀(Scepter)과 왕관을 쥐고 연합군 전체를 통솔합니다.'
    },
    'w_b2': {
      id: 'w_b2', type: 'b', color: 'w',
      name: '디오메데스 (Diomedes)',
      title: '아테나의 가호로 신들에게 상처를 입힌 아르고스 왕',
      shortName: '디오메데스', symbol: '♗', role: 'diomedes',
      factionName: '아카이아 연합군 (그리스)',
      chessRole: '비숍 (Bishop / 킹사이드)',
      moveDesc: '대각선 방향으로 원하는 칸만큼 이동 (자신과 같은 색 칸만 이동)',
      lore: '아르고스의 젊은 패왕. 아테나의 불꽃 투구를 쓰고 인간의 몸으로 전쟁의 신 아레스와 미의 여신 아프로디테를 찔러 물리친 불패의 맹장입니다.'
    },
    'w_n2': {
      id: 'w_n2', type: 'n', color: 'w',
      name: '네스토르 (Nestor)',
      title: '필로스의 지혜로운 원로 전차병 군주',
      shortName: '네스토르', symbol: '♘', role: 'nestor',
      factionName: '아카이아 연합군 (그리스)',
      chessRole: '나이트 (Knight / 킹사이드)',
      moveDesc: 'L자형(2칸 직진 후 1칸 직각)으로 기물을 뛰어넘어 도약 이동',
      lore: '3대에 걸친 전란을 겪은 필로스의 노왕. 뛰어난 전차전의 대가이자 꿀처럼 달콤한 화술과 경륜으로 아카이아 영웅들의 갈등을 봉합하고 승리의 길을 인도합니다.'
    },
    'w_r2': {
      id: 'w_r2', type: 'r', color: 'w',
      name: '소(小) 아이아스 (Lesser Ajax)',
      title: '로크리스의 명장, 바람처럼 날렵한 투창의 영웅',
      shortName: '소 아이아스', symbol: '♖', role: 'ajax_lesser',
      factionName: '아카이아 연합군 (그리스)',
      chessRole: '룩 (Rook / 킹사이드)',
      moveDesc: '상하좌우 직선 방향으로 원하는 칸만큼 이동 (캐슬링 가능)',
      lore: '오일레우스의 아들. 그리스 진영에서 아킬레우스 다음으로 빠른 발을 가졌으며, 바람처럼 날카로운 쌍투창으로 적진을 휩쓰는 날렵한 돌격 명장입니다.'
    },
    'w_p': {
      id: 'w_p', type: 'p', color: 'w',
      name: '미르미돈 정예병 (Myrmidons)',
      title: '아킬레우스 직속 최정예 개미 전사대',
      shortName: '미르미돈', symbol: '♙', role: 'myrmidon',
      factionName: '아카이아 연합군 (그리스)',
      chessRole: '폰 (Pawn / 최전선 보병)',
      moveDesc: '전방으로 1칸 전진 (최초 이동 시 2칸 가능), 대각선 1칸 포획, 끝 도달 시 승급',
      lore: '제우스가 개미(Myrmex)를 강인한 인간으로 변모시켜 탄생한 아킬레우스의 직속 친위대. 한 치의 물러섬 없는 완벽한 군율과 용맹으로 진격합니다.'
    },

    // === 트로이 수호군 (Black / 일리온) ===
    'b_r1': {
      id: 'b_r1', type: 'r', color: 'b',
      name: '스카이아 관문 (Scaean Gate)',
      title: '아폴론이 축성한 서쪽의 난공불락 성벽 타워',
      shortName: '스카이아 문', symbol: '♜', role: 'scaean_gate',
      factionName: '트로이 수호군 (일리온)',
      chessRole: '룩 (Rook / 퀸사이드)',
      moveDesc: '상하좌우 직선 방향으로 원하는 칸만큼 이동 (캐슬링 가능)',
      lore: '트로이 성의 서쪽 주 출입문. 태양신 아폴론이 친히 단단한 암석을 깎아 축성한 거대한 석조 관문 타워로, 수많은 그리스 장수들의 진격을 가로막은 요새입니다.'
    },
    'b_n1': {
      id: 'b_n1', type: 'n', color: 'b',
      name: '아이네이아스 (Aeneas)',
      title: '아프로디테의 아들, 다르다니아의 용맹한 맹장',
      shortName: '아이네이아스', symbol: '♞', role: 'aeneas',
      factionName: '트로이 수호군 (일리온)',
      chessRole: '나이트 (Knight / 퀸사이드)',
      moveDesc: 'L자형(2칸 직진 후 1칸 직각)으로 기물을 뛰어넘어 도약 이동',
      lore: '미의 여신 아프로디테와 안키세스의 아들이자 헥토르에 버금가는 트로이 2대 영웅. 훗날 불타는 조국을 탈출하여 로마 제국의 시조가 되는 불멸의 숙명을 지녔습니다.'
    },
    'b_b1': {
      id: 'b_b1', type: 'b', color: 'b',
      name: '파리스 (Paris)',
      title: '트로이의 미남 왕자, 아폴론의 황금 활을 든 궁수',
      shortName: '파리스', symbol: '♝', role: 'paris',
      factionName: '트로이 수호군 (일리온)',
      chessRole: '비숍 (Bishop / 퀸사이드)',
      moveDesc: '대각선 방향으로 원하는 칸만큼 이동 (자신과 같은 색 칸만 이동)',
      lore: '트로이의 둘째 왕자이자 황금 사과 신화의 주인공. 아폴론의 은총이 담긴 황금 복합궁을 메고 원거리에서 적장의 허점을 정확히 저격하는 명사수입니다.'
    },
    'b_q': {
      id: 'b_q', type: 'q', color: 'b',
      name: '헥토르 (Hector)',
      title: '눈부신 투구의 조국 수호자, 트로이의 불멸의 방패',
      shortName: '헥토르', symbol: '♛', role: 'hector',
      factionName: '트로이 수호군 (일리온)',
      chessRole: '퀸 (Queen / 최강의 기물)',
      moveDesc: '상하좌우 및 대각선 전 방향으로 거리 제한 없이 직선 이동',
      lore: '프리아모스의 맏아들이자 트로이군의 총사령관. 눈부시게 빛나는 말갈기 투구를 휘날리며 가족과 백성을 지키기 위해 홀로 아카이아 대군을 격퇴한 위대한 수호신입니다.'
    },
    'b_k': {
      id: 'b_k', type: 'k', color: 'b',
      name: '프리아모스 (Priam)',
      title: '트로이의 성군, 일리오스의 위대한 노왕',
      shortName: '프리아모스', symbol: '♚', role: 'priam',
      factionName: '트로이 수호군 (일리온)',
      chessRole: '킹 (King / 총사령관)',
      moveDesc: '상하좌우 및 대각선 모든 방향으로 1칸 이동 (체크메이트 시 패배)',
      lore: '신들이 축성한 황금 도시 트로이의 국부. 50명의 용맹한 자식들과 함께 거대한 아카이아 원정군에 맞서 조국의 영광과 백성의 안녕을 지키는 자애로운 군주입니다.'
    },
    'b_b2': {
      id: 'b_b2', type: 'b', color: 'b',
      name: '헬레노스 (Helenus)',
      title: '아폴론의 신탁을 전하는 트로이의 예언자 왕자',
      shortName: '헬레노스', symbol: '♝', role: 'helenus',
      factionName: '트로이 수호군 (일리온)',
      chessRole: '비숍 (Bishop / 킹사이드)',
      moveDesc: '대각선 방향으로 원하는 칸만큼 이동 (자신과 같은 색 칸만 이동)',
      lore: '아폴론 신에게 직접 예언 능력을 부여받은 트로이의 왕자. 카두세우스 성스러운 지팡이를 들고 전장의 흐름과 올림포스 신들의 숨은 뜻을 꿰뚫어 봅니다.'
    },
    'b_n2': {
      id: 'b_n2', type: 'n', color: 'b',
      name: '사르페돈 (Sarpedon)',
      title: '제우스의 아들, 리키아의 용맹한 영웅왕',
      shortName: '사르페돈', symbol: '♞', role: 'sarpedon',
      factionName: '트로이 수호군 (일리온)',
      chessRole: '나이트 (Knight / 킹사이드)',
      moveDesc: 'L자형(2칸 직진 후 1칸 직각)으로 기물을 뛰어넘어 도약 이동',
      lore: '최고신 제우스의 혈통을 이어받은 리키아의 군주. 양날 전투 도끼(Labrys)를 휘두르며 그리스군의 함선 방어벽을 가장 먼저 돌파한 최전선 돌격의 영웅입니다.'
    },
    'b_r2': {
      id: 'b_r2', type: 'r', color: 'b',
      name: '다르다니아 성탑 (Dardanian Tower)',
      title: '포세이돈의 가호가 깃든 동쪽의 요새 타워',
      shortName: '다르다니아 탑', symbol: '♜', role: 'dardanian_tower',
      factionName: '트로이 수호군 (일리온)',
      chessRole: '룩 (Rook / 킹사이드)',
      moveDesc: '상하좌우 직선 방향으로 원하는 칸만큼 이동 (캐슬링 가능)',
      lore: '바다와 지진의 신 포세이돈의 가호가 서린 트로이 동쪽의 난공불락 요새 성탑. 청동 삼지창 문양으로 도시의 동쪽 전선을 철통같이 수호합니다.'
    },
    'b_p': {
      id: 'b_p', type: 'p', color: 'b',
      name: '트로이 팔랑크스 (Trojan Phalanx)',
      title: '조국의 대지를 사수하는 불굴의 트로이 보병대',
      shortName: '트로이 보병', symbol: '♟', role: 'trojan_phalanx',
      factionName: '트로이 수호군 (일리온)',
      chessRole: '폰 (Pawn / 최전선 보병)',
      moveDesc: '전방으로 1칸 전진 (최초 이동 시 2칸 가능), 대각선 1칸 포획, 끝 도달 시 승급',
      lore: '가족과 성스러운 조국을 수호하기 위해 뭉친 트로이의 청동 중장보병대. 거대한 방패벽과 빽빽한 장창 밀집 대형으로 적의 돌파를 단호히 분쇄합니다.'
    }  };

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
  // 3. 체스 AI 평가 함수 및 미니맥스 엔진 (Minimax with PST & Tactical Extension)
  // ==========================================================================
  const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

  // 기물 위치 가치 테이블 (Piece-Square Tables: 중앙 장악, 전개 및 킹 안전 보상)
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

  const ROOK_PST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [15, 20, 20, 20, 20, 20, 20, 15], // 7랭크 침투 압박
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ];

  const QUEEN_PST = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,   0,  5,  5,  5,  5,  0, -5],
    [0,    0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ];

  const KING_MIDGAME_PST = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ];

  function evaluateBoard(game, isHades = false) {
    if (game.in_checkmate()) {
      return game.turn() === 'w' ? -99999 : 99999;
    }
    if (game.in_draw()) return 0;

    let totalScore = 0;
    const board = game.board();
    let wBishops = 0, bBishops = 0;
    const wPawnCols = new Array(8).fill(0);
    const bPawnCols = new Array(8).fill(0);

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        let val = PIECE_VALUES[piece.type] || 0;

        // 위치 가치 가산
        let pstVal = 0;
        const pstRow = piece.color === 'w' ? r : 7 - r;
        if (piece.type === 'p') {
          pstVal = PAWN_PST[pstRow][c];
          if (piece.color === 'w') wPawnCols[c]++; else bPawnCols[c]++;
        } else if (piece.type === 'n') {
          pstVal = KNIGHT_PST[pstRow][c];
        } else if (piece.type === 'b') {
          pstVal = BISHOP_PST[pstRow][c];
          if (piece.color === 'w') wBishops++; else bBishops++;
        } else if (piece.type === 'r') {
          pstVal = ROOK_PST[pstRow][c];
        } else if (piece.type === 'q') {
          pstVal = QUEEN_PST[pstRow][c];
        } else if (piece.type === 'k') {
          pstVal = KING_MIDGAME_PST[pstRow][c];
        }

        val += pstVal;

        if (piece.color === 'w') {
          totalScore += val;
        } else {
          totalScore -= val;
        }
      }
    }

    // 비숍 쌍(Bishop Pair) 협공 보너스
    if (wBishops >= 2) totalScore += 30;
    if (bBishops >= 2) totalScore -= 30;

    // 체크 위협 가산
    if (game.in_check()) {
      totalScore += (game.turn() === 'w' ? -35 : 35);
    }

    // 하데스 특화: 폰 구조(더블 폰 감점) 정밀 계산
    if (isHades) {
      for (let c = 0; c < 8; c++) {
        if (wPawnCols[c] > 1) totalScore -= (wPawnCols[c] - 1) * 15;
        if (bPawnCols[c] > 1) totalScore += (bPawnCols[c] - 1) * 15;
      }
    }

    return totalScore;
  }

  function minimax(game, depth, alpha, beta, isMaximizing, isHades = false) {
    if (depth <= 0 || game.game_over()) {
      return evaluateBoard(game, isHades);
    }

    const moves = game.moves();
    if (moves.length === 0) return evaluateBoard(game, isHades);

    // 수 정렬: 체크메이트(#), 체크(+), 포획(x) 우선 정렬하여 Alpha-Beta 가지치기 극대화
    moves.sort((a, b) => {
      const sA = a.includes('#') ? 1000 : (a.includes('+') ? 300 : (a.includes('x') ? 150 : 0));
      const sB = b.includes('#') ? 1000 : (b.includes('+') ? 300 : (b.includes('x') ? 150 : 0));
      return sB - sA;
    });

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        const moveStr = moves[i];
        game.move(moveStr);

        // 하데스 난이도: 포획 또는 체크인 치명적 수일 때 1-ply 전술 심화 연장(Tactical Extension)
        let nextDepth = depth - 1;
        if (isHades && depth === 1 && (moveStr.includes('x') || moveStr.includes('+'))) {
          nextDepth = 1;
        }

        const ev = minimax(game, nextDepth, alpha, beta, false, false);
        game.undo();

        maxEval = Math.max(maxEval, ev);
        alpha = Math.max(alpha, ev);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < moves.length; i++) {
        const moveStr = moves[i];
        game.move(moveStr);

        let nextDepth = depth - 1;
        if (isHades && depth === 1 && (moveStr.includes('x') || moveStr.includes('+'))) {
          nextDepth = 1;
        }

        const ev = minimax(game, nextDepth, alpha, beta, true, false);
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
    // 난이도 4: 하데스 (Hades - 깊이 3 + 치명적 전술 1-ply 확장 & 심연 평가 모델)
    const isHades = (difficulty === "hades");
    const depth = (isHades || difficulty === "olympian") ? 3 : 2;
    const isMaximizing = game.turn() === 'w';

    let bestMove = null;
    let bestVal = isMaximizing ? -Infinity : Infinity;

    // 루트 수 탐색 시 MVV-LVA(Most Valuable Victim) 포획 수 및 체크 수 최우선 정렬
    moves.sort((a, b) => {
      let sA = 0, sB = 0;
      if (a.captured) sA += (PIECE_VALUES[a.captured] || 100) * 10 - (PIECE_VALUES[a.piece] || 100);
      if (b.captured) sB += (PIECE_VALUES[b.captured] || 100) * 10 - (PIECE_VALUES[b.piece] || 100);
      if (a.san && a.san.includes('#')) sA += 5000;
      if (b.san && b.san.includes('#')) sB += 5000;
      if (a.san && a.san.includes('+')) sA += 300;
      if (b.san && b.san.includes('+')) sB += 300;
      return sB - sA;
    });

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      game.move(move);
      const ev = minimax(game, depth - 1, -Infinity, Infinity, !isMaximizing, isHades);
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
  // 3-1. 에이지 오브 미쏠로지(AoM) 스타일 전신 3D 영웅 유닛 SVG 렌더러 (양팔 및 인체 해부학적 완비)
  // ==========================================================================
  function generateAomHeroUnitSvg(hero) {
    if (!hero) return "";
    const isWhite = hero.color === 'w';
    const prefix = isWhite ? 'aom-wh' : 'aom-bl';
    const strokeColor = isWhite ? '#b45309' : '#d97706';
    const baseStroke = isWhite ? '#92400e' : '#f59e0b';
    const nameColor = isWhite ? '#78350f' : '#fde68a';
    const badgeBg = isWhite ? 'rgba(255, 255, 255, 0.95)' : 'rgba(28, 25, 23, 0.96)';
    const badgeColor = isWhite ? '#b45309' : '#fbbf24';
    const nameplateBg = isWhite ? 'rgba(255, 255, 255, 0.92)' : 'rgba(28, 25, 23, 0.94)';
  
    const defs = `
      <defs>
        <!-- 피부 톤 쉐이더 -->
        <linearGradient id="${prefix}-skin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fed7aa"/>
          <stop offset="45%" stop-color="#fba471"/>
          <stop offset="100%" stop-color="#c26338"/>
        </linearGradient>
  
        <!-- 견갑 강철 메탈릭 -->
        <linearGradient id="${prefix}-steel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="#e2e8f0"/>
          <stop offset="70%" stop-color="#94a3b8"/>
          <stop offset="100%" stop-color="#475569"/>
        </linearGradient>
  
        <!-- 진영 의복 (아카이아: 로열 블루, 트로이: 크림슨 레드) -->
        <linearGradient id="${prefix}-tunic" x1="0%" y1="0%" x2="100%" y2="100%">
          ${isWhite ? `
            <stop offset="0%" stop-color="#3b82f6"/>
            <stop offset="45%" stop-color="#1d4ed8"/>
            <stop offset="100%" stop-color="#172554"/>
          ` : `
            <stop offset="0%" stop-color="#ef4444"/>
            <stop offset="45%" stop-color="#b91c1c"/>
            <stop offset="100%" stop-color="#450a0a"/>
          `}
        </linearGradient>
  
        <!-- 투구 볏 말갈기 (아카이아: 코발트 블루, 트로이: 플레임 레드) -->
        <linearGradient id="${prefix}-crest" x1="0%" y1="0%" x2="0%" y2="100%">
          ${isWhite ? `
            <stop offset="0%" stop-color="#60a5fa"/>
            <stop offset="40%" stop-color="#2563eb"/>
            <stop offset="100%" stop-color="#1e3a8a"/>
          ` : `
            <stop offset="0%" stop-color="#f87171"/>
            <stop offset="40%" stop-color="#dc2626"/>
            <stop offset="100%" stop-color="#450a0a"/>
          `}
        </linearGradient>
  
        <!-- 갑옷 청동/황금빛 쉐이더 -->
        <linearGradient id="${prefix}-armor" x1="0%" y1="0%" x2="100%" y2="100%">
          ${isWhite ? `
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="25%" stop-color="#f59e0b"/>
            <stop offset="65%" stop-color="#d97706"/>
            <stop offset="100%" stop-color="#78350f"/>
          ` : `
            <stop offset="0%" stop-color="#b45309"/>
            <stop offset="30%" stop-color="#643e26"/>
            <stop offset="70%" stop-color="#321c10"/>
            <stop offset="100%" stop-color="#120703"/>
          `}
        </linearGradient>
  
        <!-- 황금 포인트 및 무기 광택 -->
        <linearGradient id="${prefix}-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fffbeb"/>
          <stop offset="35%" stop-color="#fbbf24"/>
          <stop offset="80%" stop-color="#d97706"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
  
        <!-- 발밑 지면 3D 드롭 섀도우 -->
        <radialGradient id="aom-ground-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.65"/>
          <stop offset="60%" stop-color="#000000" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
  
        <!-- 에이지 오브 미쏠로지 영웅 황금 오라 펄스 링 -->
        <radialGradient id="${prefix}-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fef08a" stop-opacity="0.85"/>
          <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
        </radialGradient>

        <!-- 나이트: 말 코트(털) 쉐이더 (아카이아: 백마/은빛, 트로이: 흑마/적토마) -->
        <linearGradient id="${prefix}-horse" x1="0%" y1="0%" x2="100%" y2="100%">
          ${isWhite ? `
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="35%" stop-color="#f1f5f9"/>
            <stop offset="70%" stop-color="#cbd5e1"/>
            <stop offset="100%" stop-color="#94a3b8"/>
          ` : `
            <stop offset="0%" stop-color="#78350f"/>
            <stop offset="35%" stop-color="#451a03"/>
            <stop offset="75%" stop-color="#260e02"/>
            <stop offset="100%" stop-color="#140601"/>
          `}
        </linearGradient>

        <!-- 룩: 성벽 석재 쉐이더 (고대 미케네 거석 요새 대리석 및 석벽) -->
        <linearGradient id="${prefix}-wall" x1="0%" y1="0%" x2="100%" y2="100%">
          ${isWhite ? `
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="30%" stop-color="#e2e8f0"/>
            <stop offset="70%" stop-color="#cbd5e1"/>
            <stop offset="100%" stop-color="#64748b"/>
          ` : `
            <stop offset="0%" stop-color="#78350f"/>
            <stop offset="35%" stop-color="#54260a"/>
            <stop offset="75%" stop-color="#3b1704"/>
            <stop offset="100%" stop-color="#1c0a02"/>
          `}
        </linearGradient>

        <!-- 비숍: 길게 늘어뜨린 로브(히마티온) 음영 쉐이더 -->
        <linearGradient id="${prefix}-robe" x1="0%" y1="0%" x2="100%" y2="100%">
          ${isWhite ? `
            <stop offset="0%" stop-color="#60a5fa"/>
            <stop offset="25%" stop-color="#2563eb"/>
            <stop offset="65%" stop-color="#1d4ed8"/>
            <stop offset="100%" stop-color="#0f172a"/>
          ` : `
            <stop offset="0%" stop-color="#f87171"/>
            <stop offset="25%" stop-color="#dc2626"/>
            <stop offset="65%" stop-color="#991b1b"/>
            <stop offset="100%" stop-color="#450a0a"/>
          `}
        </linearGradient>
      </defs>
    `;
  
    // 1. 발밑 3D 지면 그림자 및 AoM 영웅 오라 링
    const baseGround = `
      <!-- 지면 부드러운 드롭 섀도우 -->
      <ellipse cx="50" cy="120" rx="34" ry="7" fill="url(#aom-ground-shadow)"/>
      <!-- AoM 영웅 오라 링 -->
      <ellipse cx="50" cy="120" rx="32" ry="5.5" fill="url(#${prefix}-aura)"/>
      <ellipse cx="50" cy="120" rx="30" ry="5" fill="none" stroke="${strokeColor}" stroke-width="1.2" stroke-dasharray="4,2"/>
    `;
  
    // 2. 우측 상단 체스 룰 인장 뱃지
    const badge = `
      <g transform="translate(74, 4)">
        <circle cx="9" cy="9" r="9" fill="${badgeBg}" stroke="${baseStroke}" stroke-width="1.1"/>
        <text x="9" y="13" font-size="11" font-weight="900" fill="${badgeColor}" text-anchor="middle">${hero.symbol}</text>
      </g>
    `;
  
    // 3. 하단 영웅 이름 네임플레이트
    const nameplate = `
      <g transform="translate(0, 123)">
        <rect x="14" y="0" width="72" height="10" rx="3" fill="${nameplateBg}" stroke="${baseStroke}" stroke-width="0.9"/>
        <text x="50" y="7.5" font-family="'Cinzel', sans-serif" font-size="6.5" font-weight="900" fill="${nameColor}" text-anchor="middle" letter-spacing="0.02em">${hero.shortName}</text>
      </g>
    `;
  
    // 공통 인체 해부학적 기본 보병 골격 템플릿 함수 (다리, 프테루게스 스커트, 벨트)
    const renderHumanBody = (customTorso, customHead, customWeapons) => `
      <!-- 1. 양다리 & 황금 각갑(Greaves) & 가죽 샌들 -->
      <path d="M38,92 L36,116 L43,118 L45,93 Z" fill="url(#${prefix}-skin)"/>
      <path d="M37,96 L35,115 L43,117 L44,97 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
      <circle cx="40" cy="97" r="3.2" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
      <line x1="36" y1="114" x2="43" y2="116" stroke="#451a03" stroke-width="1.2"/>
      <path d="M55,93 L57,118 L64,116 L62,92 Z" fill="url(#${prefix}-skin)"/>
      <path d="M56,97 L57,117 L64,115 L63,96 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
      <circle cx="60" cy="97" r="3.2" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
      <line x1="57" y1="116" x2="64" y2="114" stroke="#451a03" stroke-width="1.2"/>
  
      <!-- 2. 진영 튜닉 & 프테루게스(Pteruges) 가죽 스커트 -->
      <path d="M32,74 L68,74 L70,92 L30,92 Z" fill="url(#${prefix}-tunic)" stroke="${strokeColor}" stroke-width="0.6"/>
      <rect x="33" y="75" width="6" height="15" rx="1.5" fill="url(#${prefix}-tunic)" stroke="url(#${prefix}-gold)" stroke-width="0.7"/>
      <rect x="40" y="75" width="6" height="16.5" rx="1.5" fill="url(#${prefix}-tunic)" stroke="url(#${prefix}-gold)" stroke-width="0.7"/>
      <rect x="47" y="75" width="6" height="17" rx="1.5" fill="url(#${prefix}-tunic)" stroke="url(#${prefix}-gold)" stroke-width="0.7"/>
      <rect x="54" y="75" width="6" height="16.5" rx="1.5" fill="url(#${prefix}-tunic)" stroke="url(#${prefix}-gold)" stroke-width="0.7"/>
      <rect x="61" y="75" width="6" height="15" rx="1.5" fill="url(#${prefix}-tunic)" stroke="url(#${prefix}-gold)" stroke-width="0.7"/>
  
      <!-- 3. 전사 허리띠 (Cingulum) -->
      <rect x="32" y="72" width="36" height="5" rx="1" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
      <circle cx="50" cy="74.5" r="2.2" fill="url(#${prefix}-gold)"/>
  
      <!-- 4. 토르소/흉갑 및 양팔 영역 -->
      ${customTorso}
      <!-- 5. 두부 및 투구 -->
      ${customHead}
      <!-- 6. 무기 및 특수 장비 -->
      ${customWeapons}
    `;

    // [특수 모델 1] 나이트: 말을 탄 모습의 기마 영웅 템플릿 함수 (Mounted Knight)
    const renderMountedHero = (customTorso, customHead, customWeapons) => `
      <!-- 1. 말 꼬리 (Horse Tail) -->
      <path d="M72,82 C82,86 86,96 84,110 C81,114 77,112 78,102 C79,94 74,90 70,88 Z" fill="url(#${prefix}-crest)" stroke="${strokeColor}" stroke-width="0.7"/>

      <!-- 2. 말 뒷다리 (Hind Legs) -->
      <path d="M68,88 L72,102 L70,116 L66,116 L67,100 L64,88 Z" fill="url(#${prefix}-horse)" opacity="0.85"/>
      <rect x="66" y="114" width="5" height="3" rx="0.8" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.5"/>
      <path d="M62,86 L66,100 L64,118 L59,118 L60,98 L56,86 Z" fill="url(#${prefix}-horse)" stroke="${strokeColor}" stroke-width="0.7"/>
      <rect x="59" y="115.5" width="5.5" height="3" rx="0.8" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.5"/>

      <!-- 3. 말 몸통 (Horse Body) -->
      <ellipse cx="48" cy="85" rx="23" ry="13" fill="url(#${prefix}-horse)" stroke="${strokeColor}" stroke-width="0.9"/>
      <path d="M58,76 C68,78 72,88 66,96" stroke="${strokeColor}" stroke-width="0.8" fill="none" opacity="0.6"/>

      <!-- 4. 말 앞다리 (Forelegs) -->
      <path d="M26,88 L23,102 L26,112 L22,112 L20,100 L23,88 Z" fill="url(#${prefix}-horse)" opacity="0.85"/>
      <rect x="22" y="110" width="4.5" height="2.5" rx="0.8" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.5"/>
      <path d="M32,86 L30,100 L32,118 L27,118 L26,98 L29,86 Z" fill="url(#${prefix}-horse)" stroke="${strokeColor}" stroke-width="0.7"/>
      <rect x="27" y="115.5" width="5.5" height="3" rx="0.8" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.5"/>

      <!-- 5. 마갑 & 안장보 (Peytral & Saddle Cloth) -->
      <path d="M24,76 C20,84 28,94 36,92 C32,86 28,80 28,76 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
      <circle cx="27" cy="85" r="2.2" fill="url(#${prefix}-gold)"/>
      <path d="M36,73 L60,73 L62,88 L34,88 Z" fill="url(#${prefix}-tunic)" stroke="url(#${prefix}-gold)" stroke-width="0.8"/>
      <path d="M37,86 L59,86" stroke="url(#${prefix}-gold)" stroke-width="1.2" stroke-dasharray="2,1"/>
      <line x1="47" y1="73" x2="47" y2="92" stroke="#451a03" stroke-width="1.2"/>

      <!-- 6. 말 목 & 휘날리는 갈기 (Neck & Mane) -->
      <path d="M38,82 C34,70 30,58 24,50 C28,52 36,62 42,74 Z" fill="url(#${prefix}-horse)" stroke="${strokeColor}" stroke-width="0.8"/>
      <path d="M25,48 C29,56 34,64 36,72 C35,66 31,58 26,50 Z" fill="url(#${prefix}-crest)"/>
      <path d="M22,52 Q26,60 30,68" stroke="${strokeColor}" stroke-width="0.8" fill="none"/>

      <!-- 7. 말 머리, 귀, 눈, 청동 고삐 (Head, Ears, Bridle) -->
      <path d="M26,48 L17,54 L13,58 L14,62 L18,61 L23,54 Z" fill="url(#${prefix}-horse)" stroke="${strokeColor}" stroke-width="0.8"/>
      <polygon points="24,46 26,40 28,47" fill="url(#${prefix}-horse)" stroke="${strokeColor}" stroke-width="0.6"/>
      <polygon points="27,47 29,42 31,48" fill="url(#${prefix}-horse)" stroke="${strokeColor}" stroke-width="0.6"/>
      <circle cx="21" cy="51" r="1.1" fill="#1e293b"/>
      <circle cx="15" cy="60" r="0.7" fill="#1e293b"/>
      <path d="M22,48 L17,53 L19,56 L24,51 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.5"/>
      <line x1="16" y1="59" x2="23" y2="52" stroke="url(#${prefix}-gold)" stroke-width="0.8"/>
      <circle cx="16" cy="59" r="1.2" fill="url(#${prefix}-gold)"/>
      <path d="M16,59 C24,62 30,66 38,65" stroke="url(#${prefix}-gold)" stroke-width="1" fill="none"/>

      <!-- 8. 말을 탄 기수의 허벅지 & 황금 각갑 & 등자 (Rider's Leg & Stirrup) -->
      <path d="M42,66 L49,66 L47,85 L41,85 Z" fill="url(#${prefix}-tunic)"/>
      <path d="M41,74 L47,74 L46,92 L40,92 Z" fill="url(#${prefix}-skin)"/>
      <path d="M41,78 L46,78 L45,92 L40,92 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.7"/>
      <ellipse cx="43" cy="93" rx="3.5" ry="2" fill="none" stroke="url(#${prefix}-gold)" stroke-width="1"/>

      <!-- 9. 기마 영웅 상체 토르소, 두부, 무기 -->
      ${customTorso}
      ${customHead}
      ${customWeapons}
    `;

    // [특수 모델 2] 비숍: 바닥까지 로브를 길게 늘어뜨린 모습의 현자/사제 템플릿 함수 (Robed Bishop)
    const renderRobedHero = (customTorso, customHead, customWeapons) => `
      <!-- 1. 지면 살짝 보이는 황금 가죽 샌들 앞코 (Sandal Tips) -->
      <ellipse cx="40" cy="118" rx="4.5" ry="2" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
      <ellipse cx="60" cy="118" rx="4.5" ry="2" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>

      <!-- 2. 바닥까지 우아하게 늘어뜨린 긴 고대 로브 (Himation / Long Robe) -->
      <path d="M30,70 C24,85 22,104 28,118 L72,118 C78,104 76,85 70,70 Z" fill="url(#${prefix}-robe)" stroke="${strokeColor}" stroke-width="1.1"/>

      <!-- 3. 흘러내리는 로브의 우아한 세로 & 사선 주름선 (Deep Drapery Folds) -->
      <path d="M46,70 C43,86 44,106 44,118 M54,70 C57,86 56,106 56,118" stroke="${strokeColor}" stroke-width="0.9" fill="none" opacity="0.75"/>
      <path d="M49,72 C48,88 49,106 49,118" stroke="url(#${prefix}-gold)" stroke-width="1" fill="none"/>
      <path d="M36,72 C32,88 34,106 33,117" stroke="${strokeColor}" stroke-width="0.8" fill="none" opacity="0.65"/>
      <path d="M38,76 C35,92 38,108 37,117" stroke="url(#${prefix}-tunic)" stroke-width="0.8" fill="none"/>
      <path d="M64,72 C68,88 66,106 67,117" stroke="${strokeColor}" stroke-width="0.8" fill="none" opacity="0.65"/>
      <path d="M62,76 C65,92 62,108 63,117" stroke="url(#${prefix}-tunic)" stroke-width="0.8" fill="none"/>

      <!-- 4. 로브 하단 황금 메안드로스 자수 밑단 (Embroidered Hem) -->
      <path d="M28,116 Q50,120 72,116" stroke="url(#${prefix}-gold)" stroke-width="1.8" fill="none"/>
      <path d="M29,113 Q50,117 71,113" stroke="url(#${prefix}-gold)" stroke-width="0.8" stroke-dasharray="2,1.5" fill="none"/>

      <!-- 5. 허리 띠 (Girdle / Zoster) -->
      <rect x="29" y="69" width="42" height="5" rx="1.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
      <circle cx="50" cy="71.5" r="2.4" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.6"/>

      <!-- 6. 어깨 및 양팔에서 늘어뜨려진 숄/의복 자락 (Draped Shawl) -->
      <path d="M22,46 C16,60 18,78 22,86 L26,84 C22,76 21,60 26,48 Z" fill="url(#${prefix}-robe)" stroke="${strokeColor}" stroke-width="0.6"/>
      <path d="M78,46 C84,60 82,78 78,86 L74,84 C78,76 79,60 74,48 Z" fill="url(#${prefix}-robe)" stroke="${strokeColor}" stroke-width="0.6"/>

      <!-- 7. 상체 토르소, 두부, 무기 -->
      ${customTorso}
      ${customHead}
      ${customWeapons}
    `;

    // [특수 모델 3] 룩: 견고한 요새 성벽을 밟고 선 모습의 아카이아 수호신 템플릿 함수 (Rampart Rook)
    const renderRampartHero = (customTorso, customHead, customWeapons) => `
      <!-- 1. 미케네식 견고한 거석 요새 성벽 (Cyclopean Fortress Rampart) -->
      <path d="M12,94 L88,94 L90,122 L10,122 Z" fill="url(#${prefix}-wall)" stroke="${strokeColor}" stroke-width="1.3"/>

      <!-- 거석 아슐라 석재 블록 라인 (Stone Seams & Texture) -->
      <line x1="11" y1="102" x2="89" y2="102" stroke="${strokeColor}" stroke-width="0.9"/>
      <line x1="10" y1="111" x2="90" y2="111" stroke="${strokeColor}" stroke-width="0.9"/>
      <line x1="10" y1="119" x2="90" y2="119" stroke="${strokeColor}" stroke-width="0.8"/>
      <line x1="32" y1="94" x2="32" y2="102" stroke="${strokeColor}" stroke-width="0.8"/>
      <line x1="68" y1="94" x2="68" y2="102" stroke="${strokeColor}" stroke-width="0.8"/>
      <line x1="20" y1="102" x2="20" y2="111" stroke="${strokeColor}" stroke-width="0.8"/>
      <line x1="50" y1="102" x2="50" y2="111" stroke="${strokeColor}" stroke-width="0.8"/>
      <line x1="80" y1="102" x2="80" y2="111" stroke="${strokeColor}" stroke-width="0.8"/>
      <line x1="36" y1="111" x2="36" y2="119" stroke="${strokeColor}" stroke-width="0.8"/>
      <line x1="64" y1="111" x2="64" y2="119" stroke="${strokeColor}" stroke-width="0.8"/>

      <!-- 성벽 중앙 황금 메안드로스 성곽 장식 띠 -->
      <rect x="18" y="104.5" width="64" height="4.5" rx="1" fill="rgba(0,0,0,0.25)" stroke="url(#${prefix}-gold)" stroke-width="0.8"/>
      <line x1="22" y1="106.8" x2="78" y2="106.8" stroke="url(#${prefix}-gold)" stroke-width="1.2" stroke-dasharray="3,2"/>

      <!-- 2. 성곽 흉벽 치성 (Battlements / Crenellated Merlons) -->
      <rect x="12" y="85" width="16" height="10" rx="1.5" fill="url(#${prefix}-wall)" stroke="${strokeColor}" stroke-width="1"/>
      <line x1="14" y1="88" x2="26" y2="88" stroke="#ffffff" stroke-width="0.6" opacity="0.6"/>
      <rect x="42" y="87" width="16" height="8" rx="1.5" fill="url(#${prefix}-wall)" stroke="${strokeColor}" stroke-width="1"/>
      <line x1="44" y1="90" x2="56" y2="90" stroke="#ffffff" stroke-width="0.6" opacity="0.6"/>
      <rect x="72" y="85" width="16" height="10" rx="1.5" fill="url(#${prefix}-wall)" stroke="${strokeColor}" stroke-width="1"/>
      <line x1="74" y1="88" x2="86" y2="88" stroke="#ffffff" stroke-width="0.6" opacity="0.6"/>

      <!-- 3. 성벽 위를 밟고 선 영웅의 두 다리와 황금 각갑 -->
      <path d="M34,74 L32,92 L39,94 L41,75 Z" fill="url(#${prefix}-skin)"/>
      <path d="M33,76 L32,91 L39,93 L40,77 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
      <circle cx="36" cy="78" r="2.8" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.5"/>
      <path d="M59,75 L61,94 L68,92 L66,74 Z" fill="url(#${prefix}-skin)"/>
      <path d="M60,77 L61,93 L68,91 L67,76 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
      <circle cx="64" cy="78" r="2.8" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.5"/>

      <!-- 4. 진영 튜닉 & 프테루게스(Pteruges) 가죽 스커트 -->
      <path d="M28,68 L72,68 L74,78 L26,78 Z" fill="url(#${prefix}-tunic)" stroke="${strokeColor}" stroke-width="0.6"/>
      <rect x="30" y="69" width="6" height="10" rx="1" fill="url(#${prefix}-tunic)" stroke="url(#${prefix}-gold)" stroke-width="0.6"/>
      <rect x="38" y="69" width="6" height="11" rx="1" fill="url(#${prefix}-tunic)" stroke="url(#${prefix}-gold)" stroke-width="0.6"/>
      <rect x="47" y="69" width="6" height="11.5" rx="1" fill="url(#${prefix}-tunic)" stroke="url(#${prefix}-gold)" stroke-width="0.6"/>
      <rect x="56" y="69" width="6" height="11" rx="1" fill="url(#${prefix}-tunic)" stroke="url(#${prefix}-gold)" stroke-width="0.6"/>
      <rect x="64" y="69" width="6" height="10" rx="1" fill="url(#${prefix}-tunic)" stroke="url(#${prefix}-gold)" stroke-width="0.6"/>

      <!-- 5. 전사 허리띠 (Cingulum) -->
      <rect x="28" y="66" width="44" height="4.5" rx="1" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
      <circle cx="50" cy="68.2" r="2" fill="url(#${prefix}-gold)"/>

      <!-- 6. 상체 토르소, 두부, 무기 -->
      ${customTorso}
      ${customHead}
      ${customWeapons}
    `;
  
    let unitGraphic = "";
  
    switch (hero.role) {
      // 1. 아킬레우스 (Achilles) - 최강 영웅, 완벽한 양팔 근육과 황금 장창
      case 'achilles': {
        const torso = `
          <!-- 황금 근육 흉갑 (Muscle Cuirass) -->
          <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
          <path d="M38,53 Q44,58 48,53 M52,53 Q56,58 62,53" stroke="${strokeColor}" stroke-width="1" fill="none"/>
          <line x1="50" y1="54" x2="50" y2="72" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M43,62 Q50,65 57,62 M44,67 Q50,70 56,67" stroke="${strokeColor}" stroke-width="0.8" fill="none"/>
          <!-- 은빛 강철 견갑 (좌/우) -->
          <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.9"/>
          <circle cx="28" cy="46" r="0.9" fill="#ffffff"/>
          <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.9"/>
          <circle cx="72" cy="46" r="0.9" fill="#ffffff"/>
          <!-- 왼팔 (전투 주먹 & 황금 완갑) -->
          <path d="M28,48 L18,63 L24,66 L33,52 Z" fill="url(#${prefix}-skin)"/>
          <rect x="18" y="58" width="6" height="7" rx="1.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="21" cy="67" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
          <!-- 오른팔 (장창을 쥔 팔 & 완갑) -->
          <path d="M68,49 L78,63 L83,61 L73,48 Z" fill="url(#${prefix}-skin)"/>
          <rect x="75" y="58" width="6" height="7" rx="1.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="78" cy="65" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
        `;
        const head = `
          <path d="M46,37 L54,37 L55,42 L45,42 Z" fill="url(#${prefix}-skin)"/>
          <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
          <line x1="47" y1="28" x2="49" y2="28" stroke="#331a08" stroke-width="0.8"/>
          <line x1="51" y1="28" x2="53" y2="28" stroke="#331a08" stroke-width="0.8"/>
          <path d="M50,28 L50,32 L48,33 L52,33" stroke="${strokeColor}" stroke-width="0.7" fill="none"/>
          <path d="M49,3 C40,3 34,14 42,22 C46,22 54,22 58,22 C66,14 60,3 49,3 Z" fill="url(#${prefix}-crest)" stroke="${strokeColor}" stroke-width="1.1"/>
          <path d="M44,7 Q50,15 56,7 M45,12 Q50,18 55,12" stroke="#ffffff" stroke-width="0.8" fill="none"/>
          <path d="M41,18 C39,30 43,36 50,38 C57,36 61,30 59,18 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M46,22 L49,26 L51,26 L54,22" stroke="${strokeColor}" stroke-width="1" fill="none"/>
        `;
        const weapons = `
          <line x1="88" y1="18" x2="22" y2="116" stroke="url(#${prefix}-gold)" stroke-width="2.6"/>
          <polygon points="90,14 84,24 93,20" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <polygon points="90,14 87,20 90,20" fill="#ffffff"/>
        `;
        unitGraphic = renderHumanBody(torso, head, weapons);
        break;
      }
  
      // 2. 헥토르 (Hector) - 트로이 총사령관, 왼팔 방패 결착 & 오른팔 장창 파지
      case 'hector': {
        const torso = `
          <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
          <path d="M38,53 Q44,58 48,53 M52,53 Q56,58 62,53" stroke="${strokeColor}" stroke-width="1" fill="none"/>
          <line x1="50" y1="54" x2="50" y2="72" stroke="${strokeColor}" stroke-width="1"/>
          <!-- 어깨 청동 견갑 (좌/우) -->
          <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.9"/>
          <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.9"/>
          <!-- 왼팔 (방패 손잡이 파지) -->
          <path d="M28,48 L18,63 L23,66 L33,52 Z" fill="url(#${prefix}-skin)"/>
          <rect x="17" y="58" width="6" height="7" rx="1.5" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.7"/>
          <circle cx="21" cy="67" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.6"/>
          <!-- 오른팔 (창을 든 팔) -->
          <path d="M68,49 L77,63 L82,61 L73,48 Z" fill="url(#${prefix}-skin)"/>
          <rect x="74" y="58" width="6" height="7" rx="1.5" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.7"/>
          <circle cx="78" cy="65" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.6"/>
        `;
        const head = `
          <path d="M46,37 L54,37 L55,42 L45,42 Z" fill="url(#${prefix}-skin)"/>
          <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
          <path d="M49,3 C40,3 34,14 42,22 C46,22 54,22 58,22 C66,14 60,3 49,3 Z" fill="url(#${prefix}-crest)" stroke="${strokeColor}" stroke-width="1.1"/>
          <path d="M41,18 C39,30 43,36 50,38 C57,36 61,30 59,18 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M45,24 L48,27 L52,27 L55,24" stroke="${strokeColor}" stroke-width="1" fill="none"/>
        `;
        const weapons = `
          <!-- 트로이 청동 원형 방패 (왼팔) -->
          <circle cx="21" cy="67" r="16" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.3"/>
          <circle cx="21" cy="67" r="12" fill="none" stroke="url(#${prefix}-gold)" stroke-width="1"/>
          <circle cx="21" cy="67" r="4.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 트로이 청동 장창 (오른손) -->
          <line x1="84" y1="10" x2="68" y2="110" stroke="url(#${prefix}-gold)" stroke-width="2.5"/>
          <polygon points="85,6 80,16 89,14" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
        `;
        unitGraphic = renderHumanBody(torso, head, weapons);
        break;
      }
  
      // 3. 대 아이아스 (Great Ajax) - 왼팔 타워 실드 단단히 파지 & 오른팔 육중한 장창
      case 'ajax_great': {
        const torso = `
          <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
          <!-- 어깨 거대 강철 견갑 (좌/우 둘 다 완비) -->
          <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="1"/>
          <!-- 왼팔 (거대 타워 실드 지탱 완갑 및 손) -->
          <path d="M28,48 L17,62 L22,65 L32,52 Z" fill="url(#${prefix}-skin)"/>
          <rect x="16" y="58" width="6" height="7" rx="1.5" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.7"/>
          <circle cx="20" cy="66" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.6"/>
          <!-- 오른팔 (장창을 든 우측 팔 및 완갑) -->
          <path d="M68,49 L76,64 L81,62 L73,48 Z" fill="url(#${prefix}-skin)"/>
          <rect x="74" y="58" width="6" height="7" rx="1.5" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.7"/>
          <circle cx="78" cy="65" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.6"/>
        `;
        const head = `
          <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
          <path d="M42,16 C40,30 44,36 50,38 C56,36 60,30 58,16 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
          <polygon points="50,6 45,16 55,16" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
        `;
        const weapons = `
          <!-- 거대한 칠중 청동 타워 실드 -->
          <path d="M10,24 C10,18 36,18 36,24 L38,102 L8,102 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.4"/>
          <ellipse cx="23" cy="62" rx="10" ry="24" fill="none" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="3,2"/>
          <circle cx="23" cy="62" r="5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 우측 어깨의 육중한 장창 -->
          <line x1="82" y1="12" x2="72" y2="108" stroke="url(#${prefix}-gold)" stroke-width="2.6"/>
          <polygon points="83,7 78,17 87,15" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
        `;
        unitGraphic = renderRampartHero(torso, head, weapons);
        break;
      }
  
      // 4. 소 아이아스 (Lesser Ajax) - 양팔에 투창을 쥔 날렵한 맹장
      case 'ajax_lesser': {
        const torso = `
          <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
          <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
          <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 왼팔 투창 파지 -->
          <path d="M28,48 L19,62 L24,65 L32,52 Z" fill="url(#${prefix}-skin)"/>
          <rect x="19" y="58" width="5.5" height="6" rx="1" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="22" cy="65" r="3" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
          <!-- 오른팔 투창 파지 -->
          <path d="M68,49 L77,63 L82,61 L73,48 Z" fill="url(#${prefix}-skin)"/>
          <rect x="75" y="58" width="5.5" height="6" rx="1" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="78" cy="64" r="3" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
        `;
        const head = `
          <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
          <path d="M42,16 C40,30 44,36 50,38 C56,36 60,30 58,16 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M32,18 Q42,22 38,28 M68,18 Q58,22 62,28" stroke="url(#${prefix}-gold)" stroke-width="1.4" fill="none"/>
        `;
        const weapons = `
          <line x1="20" y1="20" x2="80" y2="108" stroke="url(#${prefix}-gold)" stroke-width="2"/>
          <polygon points="18,17 17,25 24,22" fill="url(#${prefix}-gold)"/>
          <line x1="80" y1="20" x2="20" y2="108" stroke="url(#${prefix}-gold)" stroke-width="2"/>
          <polygon points="82,17 76,22 83,25" fill="url(#${prefix}-gold)"/>
        `;
        unitGraphic = renderRampartHero(torso, head, weapons);
        break;
      }
  
      // 5. 파트로클로스 (Patroclus) - 왼팔 버클러 방패 파지 & 오른팔 청동 장검 거치
      case 'patroclus': {
        const torso = `
          <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
          <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.8"/>
          <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 왼팔 (청동 버클러 방패 지탱) -->
          <path d="M28,48 L18,63 L23,66 L33,52 Z" fill="url(#${prefix}-skin)"/>
          <rect x="18" y="58" width="6" height="6.5" rx="1" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="21" cy="66" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
          <!-- 오른팔 (검을 쥔 팔) -->
          <path d="M68,49 L77,63 L82,61 L73,48 Z" fill="url(#${prefix}-skin)"/>
          <rect x="74" y="57" width="6" height="6.5" rx="1" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="78" cy="64" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
        `;
        const head = `
          <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
          <path d="M50,8 C40,8 36,18 42,24 C46,24 54,24 58,24 C64,18 60,8 50,8 Z" fill="url(#${prefix}-crest)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M42,18 C40,30 44,36 50,38 C56,36 60,30 58,18 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1"/>
        `;
        const weapons = `
          <!-- 왼팔 원형 소형 방패 (Buckler) -->
          <circle cx="20" cy="66" r="11" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
          <circle cx="20" cy="66" r="4" fill="url(#${prefix}-gold)"/>
          <!-- 오른손의 청동 장검 (Xiphos) -->
          <line x1="78" y1="62" x2="88" y2="24" stroke="url(#${prefix}-steel)" stroke-width="2.6"/>
          <polygon points="89,20 85,28 92,26" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.7"/>
          <line x1="74" y1="60" x2="82" y2="60" stroke="url(#${prefix}-gold)" stroke-width="1.8"/>
        `;
        unitGraphic = renderMountedHero(torso, head, weapons);
        break;
      }
  
      // 6. 네스토르 (Nestor) - 왼팔 토가 옷자락 단정히 거치 & 오른팔 황금 지혜의 지팡이
      case 'nestor': {
        const torso = `
          <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
          <!-- 원로 양쪽 견갑/의복 숄더 -->
          <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-tunic)" stroke="${strokeColor}" stroke-width="0.8"/>
          <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-tunic)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 왼팔 (원로의 의복 옷자락을 품위 있게 짚은 팔) -->
          <path d="M28,48 L20,62 L25,65 L33,52 Z" fill="url(#${prefix}-skin)"/>
          <rect x="20" y="58" width="5.5" height="6.5" rx="1" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="24" cy="67" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.6"/>
          <!-- 오른팔 (황금 지팡이 굳게 파지) -->
          <path d="M68,49 L76,64 L81,62 L73,48 Z" fill="url(#${prefix}-skin)"/>
          <rect x="74" y="58" width="5.5" height="6.5" rx="1" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="78" cy="65" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.6"/>
        `;
        const head = `
          <path d="M43,30 C40,46 60,46 57,30 Z" fill="#e2e8f0" stroke="${strokeColor}" stroke-width="0.8"/>
          <path d="M44,22 L56,22 L54,34 L46,34 Z" fill="url(#${prefix}-skin)"/>
          <path d="M42,16 C40,28 44,32 50,33 C56,32 60,28 58,16 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
        `;
        const weapons = `
          <line x1="80" y1="20" x2="80" y2="116" stroke="url(#${prefix}-gold)" stroke-width="2.4"/>
          <circle cx="80" cy="18" r="4.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <circle cx="80" cy="18" r="2" fill="#ffffff"/>
        `;
        unitGraphic = renderMountedHero(torso, head, weapons);
        break;
      }
  
      // 7. 오디세우스 (Odysseus) - 왼손 지략의 파피루스 & 오른손 날렵한 청동 단검
      case 'odysseus': {
        const torso = `
          <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
          <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.8"/>
          <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.8"/>
          <circle cx="44" cy="46" r="3.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 왼팔 (두루마리 펼친 팔) -->
          <path d="M28,48 L18,63 L23,66 L32,52 Z" fill="url(#${prefix}-skin)"/>
          <rect x="18" y="58" width="5.5" height="6.5" rx="1" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="21" cy="66" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
          <!-- 오른팔 (단검 쥔 팔) -->
          <path d="M68,49 L76,64 L81,62 L73,48 Z" fill="url(#${prefix}-skin)"/>
          <rect x="74" y="58" width="5.5" height="6.5" rx="1" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="78" cy="65" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
        `;
        const head = `
          <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
          <path d="M45,32 C45,40 55,40 55,32 Z" fill="#64748b"/>
          <path d="M40,24 C42,12 58,12 60,24 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="1.1"/>
        `;
        const weapons = `
          <!-- 왼손 파피루스 두루마리 -->
          <rect x="17" y="56" width="7" height="17" rx="1.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.7"/>
          <line x1="19" y1="60" x2="23" y2="60" stroke="#78350f" stroke-width="0.7"/>
          <line x1="19" y1="64" x2="23" y2="64" stroke="#78350f" stroke-width="0.7"/>
          <!-- 오른손 청동 단검 -->
          <line x1="78" y1="62" x2="88" y2="40" stroke="url(#${prefix}-gold)" stroke-width="2.2"/>
          <polygon points="89,37 86,43 92,42" fill="url(#${prefix}-gold)"/>
        `;
        unitGraphic = renderRobedHero(torso, head, weapons);
        break;
      }
  
      // 8. 디오메데스 (Diomedes) - 왼팔 아테나 방패 파지 & 오른팔 아테나의 맹검
      case 'diomedes': {
        const torso = `
          <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
          <!-- 좌우 강철 견갑 -->
          <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.9"/>
          <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.9"/>
          <!-- 왼팔 (아테나 원형 방패 지탱) -->
          <path d="M28,48 L18,63 L23,66 L33,52 Z" fill="url(#${prefix}-skin)"/>
          <rect x="18" y="58" width="6" height="6.5" rx="1" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="21" cy="66" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
          <!-- 오른팔 (맹검 높이 든 팔) -->
          <path d="M68,49 L77,63 L82,61 L73,48 Z" fill="url(#${prefix}-skin)"/>
          <rect x="74" y="57" width="6" height="6.5" rx="1" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="78" cy="64" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
        `;
        const head = `
          <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
          <path d="M50,8 C40,8 36,18 42,24 C46,24 54,24 58,24 C64,18 60,8 50,8 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M42,18 C40,30 44,36 50,38 C56,36 60,30 58,18 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1"/>
        `;
        const weapons = `
          <!-- 왼손 아테나 청동 방패 -->
          <circle cx="20" cy="66" r="12" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
          <circle cx="20" cy="66" r="5" fill="url(#${prefix}-gold)"/>
          <!-- 오른손 아테나의 청동 맹검 (Broadsword) -->
          <line x1="78" y1="62" x2="88" y2="16" stroke="url(#${prefix}-steel)" stroke-width="3"/>
          <polygon points="89,12 84,20 93,18" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <line x1="73" y1="58" x2="83" y2="58" stroke="url(#${prefix}-gold)" stroke-width="2"/>
        `;
        unitGraphic = renderRobedHero(torso, head, weapons);
        break;
      }
  
      // 9. 아가멤논 (Agamemnon) - 아카이아 총사령관, 왼팔 군주 망토 파지 & 오른팔 황금 홀
      case 'agamemnon': {
        const torso = `
          <!-- 총사령관 군주 망토 (Cloak) -->
          <path d="M24,42 C20,70 24,105 28,112 M76,42 C80,70 76,105 72,112" stroke="${isWhite ? '#b91c1c' : '#7f1d1d'}" stroke-width="3" fill="none"/>
          <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
          <circle cx="50" cy="58" r="6" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 황금 견갑 (좌/우) -->
          <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
          <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
          <!-- 왼팔 (군주의 붉은 망토 깃을 단정히 쥔 팔) -->
          <path d="M28,48 L19,63 L24,66 L33,52 Z" fill="url(#${prefix}-skin)"/>
          <rect x="19" y="58" width="6" height="7" rx="1.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.7"/>
          <circle cx="23" cy="68" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.6"/>
          <!-- 오른팔 (황금 홀을 위엄 있게 쥔 팔) -->
          <path d="M68,49 L76,64 L81,62 L73,48 Z" fill="url(#${prefix}-skin)"/>
          <rect x="74" y="58" width="6" height="7" rx="1.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.7"/>
          <circle cx="78" cy="65" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.6"/>
        `;
        const head = `
          <path d="M43,30 C40,44 60,44 57,30 Z" fill="#331a08"/>
          <path d="M44,22 L56,22 L54,34 L46,34 Z" fill="url(#${prefix}-skin)"/>
          <path d="M40,24 L45,14 L50,8 L55,14 L60,24 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1.2"/>
          <circle cx="50" cy="18" r="2.5" fill="#ffffff"/>
        `;
        const weapons = `
          <line x1="80" y1="22" x2="80" y2="116" stroke="url(#${prefix}-gold)" stroke-width="2.6"/>
          <circle cx="80" cy="18" r="5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.9"/>
          <polygon points="80,11 76,17 84,17" fill="url(#${prefix}-gold)"/>
        `;
        unitGraphic = renderHumanBody(torso, head, weapons);
        break;
      }
  
      // 10. 미르미돈 (Myrmidon) - 왼팔 개미 전사 방패 결착 & 오른팔 돌격 창
      case 'myrmidon': {
        const torso = `
          <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
          <!-- 어깨 청동 견갑 (좌/우 둘 다 완비) -->
          <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
          <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 왼팔 (방패 단단히 파지) -->
          <path d="M28,48 L18,63 L23,66 L33,52 Z" fill="url(#${prefix}-skin)"/>
          <rect x="18" y="58" width="6" height="6.5" rx="1" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="22" cy="67" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
          <!-- 오른팔 (창 굳게 쥔 팔) -->
          <path d="M68,49 L76,64 L81,62 L73,48 Z" fill="url(#${prefix}-skin)"/>
          <rect x="74" y="58" width="6" height="6.5" rx="1" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="78" cy="65" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
        `;
        const head = `
          <path d="M42,16 C39,30 43,36 50,38 C57,36 61,30 58,16 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
          <path d="M46,24 L49,28 L51,28 L54,24" stroke="#000000" stroke-width="1.2" fill="none"/>
          <path d="M49,5 C42,5 38,12 44,16 C48,16 52,16 56,16 C62,12 58,5 49,5 Z" fill="url(#${prefix}-crest)"/>
        `;
        const weapons = `
          <!-- 미르미돈 청동 원형 방패 (왼팔) -->
          <circle cx="22" cy="67" r="14" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
          <polygon points="22,59 18,73 26,73" fill="url(#${prefix}-gold)"/>
          <!-- 전방을 겨눈 돌격 청동 창 (오른손) -->
          <line x1="84" y1="16" x2="72" y2="112" stroke="url(#${prefix}-gold)" stroke-width="2.2"/>
          <polygon points="85,12 81,20 89,18" fill="url(#${prefix}-gold)"/>
        `;
        unitGraphic = renderHumanBody(torso, head, weapons);
        break;
      }
  
      // 11. 스카이아 관문 (Scaean Gate) - 성벽 요새 타워
      case 'scaean_gate': {
        unitGraphic = `
          <path d="M22,118 L24,42 L20,42 L20,24 L32,24 L32,32 L44,32 L44,24 L56,24 L56,32 L68,32 L68,24 L80,24 L80,42 L76,42 L78,118 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.4"/>
          <line x1="24" y1="56" x2="76" y2="56" stroke="${strokeColor}" stroke-width="0.8"/>
          <line x1="23" y1="72" x2="77" y2="72" stroke="${strokeColor}" stroke-width="0.8"/>
          <line x1="23" y1="88" x2="77" y2="88" stroke="${strokeColor}" stroke-width="0.8"/>
          <circle cx="50" cy="50" r="7" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.9"/>
          <line x1="50" y1="38" x2="50" y2="42" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
          <line x1="50" y1="58" x2="50" y2="62" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
          <line x1="38" y1="50" x2="42" y2="50" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
          <line x1="58" y1="50" x2="62" y2="50" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
          <path d="M38,118 L38,90 C38,82 62,82 62,90 L62,118 Z" fill="#0f0704" stroke="${strokeColor}" stroke-width="1.2"/>
        `;
        break;
      }
  
      // 12. 다르다니아 성탑 (Dardanian Tower) - 포세이돈 요새 타워
      case 'dardanian_tower': {
        unitGraphic = `
          <path d="M22,118 L24,42 L20,42 L20,24 L32,24 L32,32 L44,32 L44,24 L56,24 L56,32 L68,32 L68,24 L80,24 L80,42 L76,42 L78,118 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.4"/>
          <line x1="24" y1="56" x2="76" y2="56" stroke="${strokeColor}" stroke-width="0.8"/>
          <line x1="23" y1="72" x2="77" y2="72" stroke="${strokeColor}" stroke-width="0.8"/>
          <line x1="23" y1="88" x2="77" y2="88" stroke="${strokeColor}" stroke-width="0.8"/>
          <line x1="50" y1="40" x2="50" y2="62" stroke="url(#${prefix}-gold)" stroke-width="2"/>
          <path d="M44,44 L44,52 L56,52 L56,44" stroke="url(#${prefix}-gold)" stroke-width="1.5" fill="none"/>
          <line x1="44" y1="44" x2="44" y2="40" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
          <line x1="56" y1="44" x2="56" y2="40" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
          <path d="M38,118 L38,90 C38,82 62,82 62,90 L62,118 Z" fill="#24140b" stroke="${strokeColor}" stroke-width="1.2"/>
          <line x1="36" y1="102" x2="64" y2="102" stroke="url(#${prefix}-gold)" stroke-width="1.8"/>
        `;
        break;
      }
  
      // 13. 아이네이아스 (Aeneas) - 사자 가죽을 두른 다르다니아 맹장, 양팔 완비 & 청동 검
      case 'aeneas': {
        const torso = `
          <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
          <!-- 사자 가죽 어깨 망토 및 견갑 (좌/우) -->
          <path d="M24,42 C18,60 22,80 26,86 M76,42 C82,60 78,80 74,86" stroke="url(#${prefix}-gold)" stroke-width="2.5" fill="none"/>
          <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
          <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 왼팔 (사자 방패 지탱) -->
          <path d="M28,48 L18,63 L23,66 L33,52 Z" fill="url(#${prefix}-skin)"/>
          <rect x="18" y="58" width="6" height="6.5" rx="1" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="21" cy="66" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
          <!-- 오른팔 (검을 쥔 팔) -->
          <path d="M68,49 L76,64 L81,62 L73,48 Z" fill="url(#${prefix}-skin)"/>
          <rect x="74" y="58" width="6" height="6.5" rx="1" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="78" cy="65" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
        `;
        const head = `
          <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
          <path d="M42,16 C39,30 43,36 50,38 C57,36 61,30 58,16 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
          <path d="M49,6 C40,6 36,15 42,22 C46,22 54,22 58,22 C64,15 60,6 49,6 Z" fill="url(#${prefix}-gold)"/>
        `;
        const weapons = `
          <!-- 왼손 트로이 원형 방패 -->
          <circle cx="20" cy="66" r="11" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
          <polygon points="20,60 17,70 23,70" fill="url(#${prefix}-gold)"/>
          <!-- 오른손 청동 장검 (Spatha) -->
          <line x1="78" y1="62" x2="88" y2="20" stroke="url(#${prefix}-gold)" stroke-width="2.6"/>
          <polygon points="89,16 85,24 92,22" fill="url(#${prefix}-gold)"/>
          <line x1="74" y1="58" x2="82" y2="58" stroke="url(#${prefix}-armor)" stroke-width="1.8"/>
        `;
        unitGraphic = renderMountedHero(torso, head, weapons);
        break;
      }
  
      // 14. 사르페돈 (Sarpedon) - 제우스 아들의 날개 투구와 양손으로 쥔 양날 전투도끼
      case 'sarpedon': {
        const torso = `
          <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
          <!-- 어깨 청동 견갑 (좌/우) -->
          <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.9"/>
          <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.9"/>
          <!-- 양손 도끼 파지 자세: 왼팔(하단 자루) & 오른팔(상단 자루) -->
          <path d="M28,48 L22,62 L27,65 L33,52 Z" fill="url(#${prefix}-skin)"/>
          <rect x="21" y="58" width="6" height="6.5" rx="1" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="25" cy="65" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
  
          <path d="M68,49 L74,62 L79,60 L73,48 Z" fill="url(#${prefix}-skin)"/>
          <rect x="72" y="57" width="6" height="6.5" rx="1" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="76" cy="64" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
        `;
        const head = `
          <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
          <path d="M42,16 C39,30 43,36 50,38 C57,36 61,30 58,16 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
          <path d="M34,16 Q42,20 38,26 M66,16 Q58,20 62,26" stroke="url(#${prefix}-gold)" stroke-width="1.5" fill="none"/>
        `;
        const weapons = `
          <!-- 거대한 양날 전투 도끼 (Labrys) -->
          <line x1="20" y1="18" x2="80" y2="100" stroke="url(#${prefix}-gold)" stroke-width="2.6"/>
          <path d="M16,12 C10,20 10,32 18,38 L26,26 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <path d="M28,8 C36,16 36,28 28,34 L20,22 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
        `;
        unitGraphic = renderMountedHero(torso, head, weapons);
        break;
      }
  
      // 15. 파리스 (Paris) - 왼손 활대 지탱 & 오른손 시위 당김 자세의 완벽한 양팔
      case 'paris': {
        const torso = `
          <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
          <!-- 어깨 가죽 견갑 (좌/우) -->
          <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.7"/>
          <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.7"/>
          <line x1="32" y1="46" x2="68" y2="72" stroke="url(#${prefix}-gold)" stroke-width="2"/>
          <!-- 왼팔 (황금 활을 앞으로 곧게 뻗은 팔) -->
          <path d="M28,48 L17,60 L21,64 L31,52 Z" fill="url(#${prefix}-skin)"/>
          <rect x="16" y="56" width="5.5" height="6.5" rx="1" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="18" cy="62" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
          <!-- 오른팔 (활시위를 가슴 쪽으로 당긴 팔) -->
          <path d="M68,49 L78,61 L82,58 L73,48 Z" fill="url(#${prefix}-skin)"/>
          <rect x="74" y="56" width="5.5" height="6.5" rx="1" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="73" cy="60" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
        `;
        const head = `
          <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
          <path d="M38,24 C36,12 48,6 56,8 C64,10 62,18 52,16 C48,18 44,20 38,24 Z" fill="url(#${prefix}-crest)" stroke="${strokeColor}" stroke-width="1.1"/>
        `;
        const weapons = `
          <!-- 아폴론의 황금 복합궁 (Composite Bow) -->
          <path d="M14,14 Q26,58 16,104" stroke="url(#${prefix}-gold)" stroke-width="2.6" fill="none"/>
          <line x1="14" y1="14" x2="72" y2="60" stroke="#ffffff" stroke-width="0.8"/>
          <line x1="72" y1="60" x2="16" y2="104" stroke="#ffffff" stroke-width="0.8"/>
          <!-- 화살촉 -->
          <line x1="72" y1="60" x2="16" y2="60" stroke="url(#${prefix}-gold)" stroke-width="1.8"/>
          <polygon points="14,60 18,57 18,63" fill="url(#${prefix}-gold)"/>
        `;
        unitGraphic = renderRobedHero(torso, head, weapons);
        break;
      }
  
      // 16. 헬레노스 (Helenus) - 왼팔 신비로운 제단 로브 옷자락 & 오른팔 카두세우스 지팡이
      case 'helenus': {
        const torso = `
          <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
          <!-- 어깨 사제 견갑/로브 (좌/우) -->
          <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-crest)" stroke="${strokeColor}" stroke-width="0.8"/>
          <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-crest)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 왼팔 (신탁을 기원하며 가슴에 올린 예언자의 손) -->
          <path d="M28,48 L20,62 L25,65 L33,52 Z" fill="url(#${prefix}-skin)"/>
          <rect x="20" y="58" width="5.5" height="6.5" rx="1" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="25" cy="67" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
          <!-- 오른팔 (뱀 지팡이 높이 든 팔) -->
          <path d="M68,49 L76,64 L81,62 L73,48 Z" fill="url(#${prefix}-skin)"/>
          <rect x="74" y="58" width="5.5" height="6.5" rx="1" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="78" cy="65" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
        `;
        const head = `
          <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
          <path d="M45,30 C45,40 55,40 55,30 Z" fill="#64748b"/>
          <path d="M38,20 C38,10 62,10 62,20 L64,36 C64,44 36,44 36,36 Z" fill="url(#${prefix}-crest)" stroke="${strokeColor}" stroke-width="1"/>
        `;
        const weapons = `
          <line x1="80" y1="20" x2="80" y2="116" stroke="url(#${prefix}-gold)" stroke-width="2.2"/>
          <circle cx="80" cy="18" r="3.5" fill="url(#${prefix}-gold)"/>
          <path d="M76,26 Q84,32 76,38 Q84,44 76,50" stroke="url(#${prefix}-gold)" stroke-width="1.3" fill="none"/>
          <path d="M84,26 Q76,32 84,38 Q76,44 84,50" stroke="url(#${prefix}-gold)" stroke-width="1.3" fill="none"/>
        `;
        unitGraphic = renderRobedHero(torso, head, weapons);
        break;
      }
  
      // 17. 프리아모스 (Priam) - 트로이 노왕, 왼팔 왕실 가운 파지 & 오른팔 보석 홀
      case 'priam': {
        const torso = `
          <path d="M24,42 C20,70 24,105 28,112 M76,42 C80,70 76,105 72,112" stroke="#7f1d1d" stroke-width="3" fill="none"/>
          <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
          <circle cx="50" cy="58" r="5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 황금 견갑 (좌/우 둘 다 완비) -->
          <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.9"/>
          <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.9"/>
          <!-- 왼팔 (진홍빛 왕실 가운 깃을 점잖게 잡은 노왕의 손) -->
          <path d="M28,48 L19,63 L24,66 L33,52 Z" fill="url(#${prefix}-skin)"/>
          <rect x="19" y="58" width="6" height="7" rx="1.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.7"/>
          <circle cx="23" cy="68" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.6"/>
          <!-- 오른팔 (보석 홀을 위엄 있게 쥔 손) -->
          <path d="M68,49 L76,64 L81,62 L73,48 Z" fill="url(#${prefix}-skin)"/>
          <rect x="74" y="58" width="6" height="7" rx="1.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.7"/>
          <circle cx="78" cy="65" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.6"/>
        `;
        const head = `
          <path d="M42,28 C38,50 62,50 58,28 Z" fill="#e2e8f0" stroke="${strokeColor}" stroke-width="0.8"/>
          <path d="M44,20 L56,20 L54,32 L46,32 Z" fill="url(#${prefix}-skin)"/>
          <path d="M38,22 C40,10 50,6 56,8 C60,10 62,18 62,24 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1.2"/>
          <circle cx="50" cy="16" r="2.5" fill="#ffffff"/>
        `;
        const weapons = `
          <line x1="80" y1="20" x2="80" y2="116" stroke="url(#${prefix}-gold)" stroke-width="2.6"/>
          <polygon points="80,12 74,20 86,20" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
          <circle cx="80" cy="20" r="3" fill="#f87171"/>
        `;
        unitGraphic = renderHumanBody(torso, head, weapons);
        break;
      }
  
      // 18. 트로이 보병 (Trojan Phalanx) - 왼팔 타원형 방패 결착 & 오른팔 돌격 장창 파지
      case 'trojan_phalanx':
      default: {
        const torso = `
          <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
          <!-- 어깨 청동 견갑 (좌/우 둘 다 완비) -->
          <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
          <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
          <!-- 왼팔 (타원형 방패 단단히 지탱) -->
          <path d="M28,48 L18,63 L23,66 L33,52 Z" fill="url(#${prefix}-skin)"/>
          <rect x="18" y="58" width="6" height="6.5" rx="1" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="21" cy="67" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
          <!-- 오른팔 (팔랑크스 장창 쥔 손) -->
          <path d="M68,49 L76,64 L81,62 L73,48 Z" fill="url(#${prefix}-skin)"/>
          <rect x="74" y="58" width="6" height="6.5" rx="1" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.6"/>
          <circle cx="78" cy="65" r="3.2" fill="url(#${prefix}-skin)" stroke="${strokeColor}" stroke-width="0.5"/>
        `;
        const head = `
          <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
          <path d="M42,20 C42,12 50,6 58,20 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
          <line x1="50" y1="6" x2="50" y2="2" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
        `;
        const weapons = `
          <!-- 트로이 타원형 방패 (왼팔) -->
          <ellipse cx="21" cy="67" rx="12" ry="18" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
          <ellipse cx="21" cy="67" rx="6" ry="10" fill="none" stroke="url(#${prefix}-gold)" stroke-width="1"/>
          <!-- 전방 겨눈 트로이 장창 (오른손) -->
          <line x1="84" y1="16" x2="72" y2="112" stroke="url(#${prefix}-gold)" stroke-width="2.2"/>
          <polygon points="85,12 81,20 89,18" fill="url(#${prefix}-gold)"/>
        `;
        unitGraphic = renderHumanBody(torso, head, weapons);
        break;
      }
    }
  
    return `
      <svg viewBox="0 0 100 135" class="statue-svg aom-unit-svg" xmlns="http://www.w3.org/2000/svg">
        ${defs}
        <g class="statue-group">
          ${baseGround}
          ${unitGraphic}
          ${nameplate}
          ${badge}
        </g>
      </svg>
    `;
  }

  const generateAomHeroSvg = generateAomHeroUnitSvg; // 하위 호환성 및 별칭 매핑

  // ==========================================================================
  // 3.5. 내부 공유기(LAN) 및 온라인 P2P 대전 매니저 (LanMatchManager)
  // ==========================================================================
  class LanMatchManager {
    constructor(game) {
      this.game = game;
      this.roomCode = null;
      this.role = null; // 'host' (White) | 'guest' (Black)
      this.connected = false;
      this.peer = null;
      this.conn = null;
      this.broadcastChannel = null;
      this.httpPollTimer = null;
      this.lastPollMoveId = 0;
      this.processedMsgIds = new Set();
    }

    isConnected() {
      return this.connected;
    }

    setConnected(status, message = "") {
      this.connected = status;
      if (this.game.lanStatusBadge && this.game.lanStatusText) {
        if (status) {
          this.game.lanStatusBadge.classList.add("connected");
          this.game.lanStatusBadge.classList.remove("waiting");
          this.game.lanStatusText.textContent = message || "⚔️ 대국 연결됨 (실시간 동기화 중)";
        } else {
          this.game.lanStatusBadge.classList.remove("connected");
          this.game.lanStatusBadge.classList.add("waiting");
          this.game.lanStatusText.textContent = message || "대기 중...";
        }
      }
      this.game.updateStatusAndPanels();
    }

    // 방 만들기 (Host - White)
    createRoom(roomCode) {
      this.cleanup();
      this.roomCode = roomCode;
      this.role = 'host';
      this.setConnected(false, `방 [${roomCode}] 대기실 개설됨 (전우 접속 대기 중...)`);

      // 1. 같은 브라우저 다중 탭 즉시 통신 (BroadcastChannel)
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          this.broadcastChannel = new BroadcastChannel(`troy_chess_room_${roomCode}`);
          this.broadcastChannel.onmessage = (e) => this.handleIncomingMessage(e.data);
        } catch (e) {
          console.warn("BroadcastChannel 초기화 실패:", e);
        }
      }

      // 2. PeerJS WebRTC P2P (공유기 및 인터넷 직결)
      if (typeof Peer !== 'undefined') {
        try {
          const peerId = `troy-chess-${roomCode}`;
          this.peer = new Peer(peerId, { debug: 1 });
          this.peer.on('open', (id) => {
            console.log(`[LAN P2P] 호스트 Peer 준비 완료: ${id}`);
          });
          this.peer.on('connection', (conn) => {
            console.log(`[LAN P2P] 게스트가 접속했습니다!`);
            this.conn = conn;
            this.setupDataConnection(conn);
          });
          this.peer.on('error', (err) => {
            console.warn(`[LAN P2P] 호스트 Peer 경고:`, err);
          });
        } catch (e) {
          console.warn("PeerJS 호스트 생성 예외:", e);
        }
      }

      // 3. 로컬 LAN 서버 중계 폴링 (lan_server.js 가동 환경)
      if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
        fetch('/api/room/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: roomCode })
        }).then(r => r.json()).then(data => {
          if (data && data.ok) {
            this.startHttpPolling(roomCode);
          }
        }).catch(() => {});
      }
    }

    // 방 참가하기 (Guest - Black)
    joinRoom(roomCode) {
      this.cleanup();
      this.roomCode = roomCode;
      this.role = 'guest';
      this.setConnected(false, `방 [${roomCode}] 호스트에 연결 시도 중...`);

      // 1. BroadcastChannel 초기화 및 접속 알림
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          this.broadcastChannel = new BroadcastChannel(`troy_chess_room_${roomCode}`);
          this.broadcastChannel.onmessage = (e) => this.handleIncomingMessage(e.data);
          // 호스트에게 게스트 입장 메시지 전송
          setTimeout(() => {
            this.sendMessage({ type: 'join_request', code: roomCode, sender: 'guest' });
          }, 300);
        } catch (e) {
          console.warn("BroadcastChannel 초기화 실패:", e);
        }
      }

      // 2. PeerJS WebRTC P2P 접속 시도
      if (typeof Peer !== 'undefined') {
        try {
          this.peer = new Peer({ debug: 1 });
          this.peer.on('open', (id) => {
            console.log(`[LAN P2P] 게스트 Peer 생성됨: ${id}`);
            const hostPeerId = `troy-chess-${roomCode}`;
            const conn = this.peer.connect(hostPeerId, { reliable: true });
            this.conn = conn;
            this.setupDataConnection(conn);
          });
          this.peer.on('error', (err) => {
            console.warn(`[LAN P2P] 게스트 Peer 경고:`, err);
          });
        } catch (e) {
          console.warn("PeerJS 게스트 접속 예외:", e);
        }
      }

      // 3. 로컬 LAN 서버 접속 (lan_server.js 가동 환경)
      if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
        fetch('/api/room/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: roomCode })
        }).then(r => r.json()).then(data => {
          if (data && data.ok) {
            this.setConnected(true, `방 [${roomCode}] 입장 완료! (트로이 수호군/후공)`);
            this.startHttpPolling(roomCode);
          }
        }).catch(() => {});
      }
    }

    // WebRTC DataChannel 이벤트 리스너 바인딩
    setupDataConnection(conn) {
      conn.on('open', () => {
        console.log("[LAN P2P] DataChannel 개방됨!");
        this.setConnected(true, `전우와 연결되었습니다! 대국을 시작합니다.`);
        if (this.role === 'guest') {
          this.sendMessage({ type: 'join_request', code: this.roomCode, sender: 'guest' });
        } else {
          this.sendMessage({ type: 'ready_response', code: this.roomCode, sender: 'host' });
        }
      });

      conn.on('data', (data) => {
        this.handleIncomingMessage(data);
      });

      conn.on('close', () => {
        console.log("[LAN P2P] DataChannel 종료됨");
        this.setConnected(false, "전우와의 연결이 끊어졌습니다.");
      });

      conn.on('error', (err) => {
        console.warn("[LAN P2P] DataChannel 에러:", err);
      });
    }

    // 메시지 브로드캐스팅 전송 (DataChannel + BroadcastChannel + HTTP 중계)
    sendMessage(payload) {
      if (!payload.msgId) {
        payload.msgId = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      }
      this.processedMsgIds.add(payload.msgId);

      // (1) BroadcastChannel 전송
      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage(payload);
        } catch (e) {}
      }

      // (2) PeerJS WebRTC DataChannel 전송
      if (this.conn && this.conn.open) {
        try {
          this.conn.send(payload);
        } catch (e) {}
      }

      // (3) 로컬 HTTP 서버 전송 (이동 착수의 경우)
      if (payload.type === 'move' && typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
        fetch('/api/room/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: this.roomCode,
            from: payload.from,
            to: payload.to,
            promotion: payload.promotion,
            player: this.role
          })
        }).catch(() => {});
      } else if (payload.type && typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
        fetch('/api/room/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: this.roomCode,
            type: payload.type,
            sender: this.role,
            payload: payload
          })
        }).catch(() => {});
      }
    }

    // 수신된 메시지 처리 및 중복 방지
    handleIncomingMessage(data) {
      if (!data || typeof data !== 'object') return;
      if (data.msgId && this.processedMsgIds.has(data.msgId)) return;
      if (data.msgId) this.processedMsgIds.add(data.msgId);

      switch (data.type) {
        case 'join_request':
          console.log("[LAN Match] 상대방 입장 요청 수신");
          this.setConnected(true, `전우가 참전했습니다! (아카이아 연합군 선공)`);
          this.sendMessage({ type: 'ready_response', code: this.roomCode, sender: 'host' });
          break;

        case 'ready_response':
          console.log("[LAN Match] 호스트 준비 응답 수신");
          this.setConnected(true, `대국이 시작되었습니다! (트로이 수호군 후공)`);
          break;

        case 'move':
          console.log("[LAN Match] 상대방 착수 수신:", data.from, "->", data.to);
          this.game.executeRemoteMove(data.from, data.to, data.promotion || 'q');
          break;

        case 'resign':
          this.game.handleRemoteResign(data.sender);
          break;

        case 'undo_request':
          if (confirm("상대방 전우가 한 수 무르기를 요청했습니다. 수락하시겠습니까?")) {
            this.sendMessage({ type: 'undo_accept', sender: this.role });
            this.game.executeRemoteUndo();
          } else {
            this.sendMessage({ type: 'undo_reject', sender: this.role });
          }
          break;

        case 'undo_accept':
          alert("상대방이 무르기 요청을 수락했습니다.");
          this.game.executeRemoteUndo();
          break;

        case 'undo_reject':
          alert("상대방이 무르기 요청을 거절했습니다.");
          break;

        case 'rematch':
          if (confirm("상대방이 재대결을 요청했습니다. 새로 시작하시겠습니까?")) {
            this.sendMessage({ type: 'rematch_accept', sender: this.role });
            this.game.resetGame(false);
          }
          break;

        case 'rematch_accept':
          alert("재대결이 성사되었습니다. 새로운 대국을 시작합니다!");
          this.game.resetGame(false);
          break;
      }
    }

    // HTTP 폴링 루프 (lan_server.js 전용 백업)
    startHttpPolling(roomCode) {
      if (this.httpPollTimer) clearInterval(this.httpPollTimer);
      this.httpPollTimer = setInterval(async () => {
        try {
          const res = await fetch(`/api/room/poll?code=${encodeURIComponent(roomCode)}&since=${this.lastPollMoveId}`);
          if (!res.ok) return;
          const data = await res.json();
          if (!data || !data.ok) return;

          // 호스트/게스트 연결 상태 갱신
          if (!this.connected && data.hostConnected && data.guestConnected) {
            this.setConnected(true, `대국 연결 완료 (LAN 중계 서버)`);
          }

          // 신규 착수 동기화
          if (Array.isArray(data.moves)) {
            for (const m of data.moves) {
              if (m.id > this.lastPollMoveId) {
                this.lastPollMoveId = m.id;
                // 자신이 보낸 수가 아닐 때만 적용
                if (m.player !== this.role) {
                  this.game.executeRemoteMove(m.from, m.to, m.promotion || 'q');
                }
              }
            }
          }

          // 신규 액션(항복, 무르기 등) 동기화
          if (data.lastAction && data.lastAction.sender !== this.role) {
            this.handleIncomingMessage({
              type: data.lastAction.type,
              sender: data.lastAction.sender,
              msgId: `http_action_${data.lastAction.type}_${data.lastUpdate}`
            });
          }
        } catch (e) {}
      }, 750);
    }

    // 연결 종료 및 정리
    cleanup() {
      if (this.httpPollTimer) {
        clearInterval(this.httpPollTimer);
        this.httpPollTimer = null;
      }
      if (this.broadcastChannel) {
        try { this.broadcastChannel.close(); } catch (e) {}
        this.broadcastChannel = null;
      }
      if (this.conn) {
        try { this.conn.close(); } catch (e) {}
        this.conn = null;
      }
      if (this.peer) {
        try { this.peer.destroy(); } catch (e) {}
        this.peer = null;
      }
      this.connected = false;
      this.roomCode = null;
      this.role = null;
      this.processedMsgIds.clear();
      this.lastPollMoveId = 0;
    }
  }

  // ==========================================================================
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
      this.aiDifficulty = 'heroic'; // 'recruit', 'heroic', 'olympian', 'hades'
      this.specialMode = true;      // 트로이 서사 특수 모드 활성화 여부
      this.trojanHorseUsed = false; // 트로이 목마 전술 사용 여부

      // 선택 및 드래그 상태
      this.selectedSquare = null;
      this.draggedSquare = null;
      this.legalMovesForSelected = [];
      this.pendingPromotion = null; // 승급 대기 중인 착수 정보 { from, to }

      // 잡힌 기물 기록
      this.capturedPieces = { w: [], b: [] };

      // 기물 고유 식별자 위치 추적 맵 및 이력 스택 (쌍둥이 기물 고유 모델링 보존)
      this.piecePositions = { ...INITIAL_PIECE_MAP };
      this.positionHistory = [];

      // 내부 공유기(LAN) 및 온라인 P2P 대전 상태
      this.lanManager = new LanMatchManager(this);
      this.lanMyColor = 'w';        // LAN 모드에서 내 진영 ('w': 백, 'b': 흑)
      this.lanRole = null;          // 'host' | 'guest'
      this.lanRoomCodeVal = '';

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

      // 내부 공유기(LAN) 대기실 및 대국 UI 요소 캐싱
      this.lanMatchPanel = document.getElementById("lanMatchPanel");
      this.lanStatusBadge = document.getElementById("lanStatusBadge");
      this.lanStatusText = document.getElementById("lanStatusText");
      this.btnLanCreateRoom = document.getElementById("btnLanCreateRoom");
      this.lanRoomDisplay = document.getElementById("lanRoomDisplay");
      this.lanRoomCodeEl = document.getElementById("lanRoomCode");
      this.btnCopyRoomCode = document.getElementById("btnCopyRoomCode");
      this.inputRoomCode = document.getElementById("inputRoomCode");
      this.btnLanJoinRoom = document.getElementById("btnLanJoinRoom");
      this.lanTurnBanner = document.getElementById("lanTurnBanner");
      this.lanTurnIcon = document.getElementById("lanTurnIcon");
      this.lanTurnText = document.getElementById("lanTurnText");

      // 프로모션 모달
      this.promoModal = document.getElementById("promotionModal");

      // 전술 기물 상세 설명 툴팁 요소 초기화 및 캐싱
      this.tooltipEl = document.getElementById("chessTacticalTooltip");
      if (!this.tooltipEl) {
        this.tooltipEl = document.createElement("div");
        this.tooltipEl.id = "chessTacticalTooltip";
        this.tooltipEl.className = "chess-tactical-tooltip";
        document.body.appendChild(this.tooltipEl);
      }
    }

    bindEvents() {
      // 모드 및 난이도 변경 이벤트
      if (this.selectGameMode) {
        this.selectGameMode.addEventListener("change", (e) => {
          this.gameMode = e.target.value;
          const isAi = this.gameMode === "ai";
          const isLan = this.gameMode === "lan";

          if (this.selectDifficulty) {
            this.selectDifficulty.parentElement.style.display = isAi ? "flex" : "none";
          }
          if (this.selectSide) {
            this.selectSide.parentElement.style.display = isLan ? "none" : "flex";
          }
          if (this.lanMatchPanel) {
            this.lanMatchPanel.style.display = isLan ? "block" : "none";
          }

          if (isLan) {
            this.detectLanInfo();
          } else {
            if (this.lanManager) this.lanManager.cleanup();
            if (this.lanTurnBanner) this.lanTurnBanner.style.display = "none";
            if (this.lanRoomDisplay) this.lanRoomDisplay.style.display = "none";
            if (this.lanStatusText) this.lanStatusText.textContent = "대국 대기실 미입장";
          }
          this.resetGame();
        });
      }

      // LAN 대국 버튼 이벤트
      if (this.btnLanCreateRoom) {
        this.btnLanCreateRoom.addEventListener("click", () => this.handleLanCreateRoom());
      }
      if (this.btnLanJoinRoom) {
        this.btnLanJoinRoom.addEventListener("click", () => this.handleLanJoinRoom());
      }
      if (this.inputRoomCode) {
        this.inputRoomCode.addEventListener("keydown", (e) => {
          if (e.key === "Enter") this.handleLanJoinRoom();
        });
      }
      if (this.btnCopyRoomCode) {
        this.btnCopyRoomCode.addEventListener("click", () => this.handleCopyRoomCode());
      }

      if (this.selectDifficulty) {
        this.selectDifficulty.addEventListener("change", (e) => {
          this.aiDifficulty = e.target.value;
          if (this.aiDifficulty === "hades") {
            this.setDialogue("💀 심연의 명왕 하데스가 지하세계의 옥좌에서 눈을 떴습니다. '필멸자여, 타르타로스의 시험을 견뎌보아라.'");
          } else if (this.aiDifficulty === "olympian") {
            this.setDialogue("⚡ 올림포스의 신들이 전장을 내려다봅니다. '신들의 섭리를 거스르는 자는 번개를 맞으리라.'");
          }
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
        this.btnNewGame.addEventListener("click", () => {
          if (this.gameMode === "lan" && this.lanManager && this.lanManager.isConnected()) {
            this.lanManager.sendMessage({ type: 'rematch', sender: this.lanRole });
          }
          this.resetGame();
        });
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

    // 보드 렌더링 (고정 1:1 종횡비 및 AoM 전신 3D 유닛 모델 적용)
    render() {
      if (!this.boardEl) return;
      this.boardEl.innerHTML = "";

      const boardState = this.game.board();
      const lastMove = this.game.history({ verbose: true }).slice(-1)[0];
      const isCheck = this.game.in_check();
      const currentTurn = this.game.turn();

      // 뷰 방향: 플레이어가 흑(b)이면 보드를 뒤집어서 표시 (LAN 모드에서는 내 진영 lanMyColor 반영)
      const isFlipped = (this.gameMode === "lan") ? (this.lanMyColor === 'b') : (this.playerColor === 'b');

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

          // 2. 마지막 착수 칸 하이라이트 (출발 칸 및 도착 칸 분기)
          if (lastMove && (lastMove.from === squareName || lastMove.to === squareName)) {
            squareDiv.classList.add("last-move");
            if (lastMove.to === squareName) {
              squareDiv.classList.add("last-move-to");
            } else {
              squareDiv.classList.add("last-move-from");
            }
          }

          // 3. 체크 상태인 킹 하이라이트
          if (isCheck && piece && piece.type === 'k' && piece.color === currentTurn) {
            squareDiv.classList.add("in-check");
          }

          // 4. 착수 가능 힌트 점 및 포획 링 표시 (포획 대상일 때 명확한 붉은 링)
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

          // 5. 기물 렌더링 (에이지 오브 미쏠로지 전신 3D 유닛 모델링)
          if (piece) {
            const pieceDiv = document.createElement("div");
            const isWhite = piece.color === 'w';
            const heroId = this.piecePositions[squareName] || `${piece.color}_${piece.type}`;
            const hero = HERO_CATALOG[heroId] || HERO_CATALOG[`${piece.color}_${piece.type}`];

            pieceDiv.className = `piece statue-piece ${isWhite ? "white-piece" : "black-piece"} ${hero ? hero.role : ""}`;
            pieceDiv.title = hero ? `${hero.name} — ${hero.title}` : "";

            // 직전 움직인 기물에 붉은 테두리(Red Border) 강조 클래스 부여
            if (lastMove && lastMove.to === squareName) {
              pieceDiv.classList.add("last-moved-piece");
            }

            pieceDiv.innerHTML = generateAomHeroUnitSvg(hero);

            squareDiv.appendChild(pieceDiv);

            // 드래그 앤 드롭: 플레이어 조작 가능한 턴 기물인 경우 draggable 활성화
            const isMyTurnPiece = (this.gameMode === "lan")
              ? (piece.color === this.lanMyColor && currentTurn === this.lanMyColor && this.lanManager && this.lanManager.isConnected())
              : ((this.gameMode !== "ai" || piece.color === this.playerColor) && piece.color === currentTurn);

            if (isMyTurnPiece && !this.game.game_over() && !this.pendingPromotion) {
              squareDiv.setAttribute("draggable", "true");
              squareDiv.addEventListener("dragstart", (e) => this.handleDragStart(e, squareName));
              squareDiv.addEventListener("dragend", (e) => this.handleDragEnd(e));
            }
          }

          // 드래그 대상 칸 이벤트 (모든 칸이 착수 목적지가 될 수 있으므로 등록)
          squareDiv.addEventListener("dragover", (e) => this.handleDragOver(e, squareName));
          squareDiv.addEventListener("dragleave", (e) => this.handleDragLeave(e, squareName));
          squareDiv.addEventListener("drop", (e) => this.handleDrop(e, squareName));

          // 커서 호버 시 기물 상세 설명 툴팁 이벤트
          squareDiv.addEventListener("mouseenter", (e) => this.handleSquareMouseEnter(e, squareName));
          squareDiv.addEventListener("mousemove", (e) => this.handleSquareMouseMove(e));
          squareDiv.addEventListener("mouseleave", () => this.handleSquareMouseLeave());

          // 칸 클릭 이벤트
          squareDiv.addEventListener("click", () => this.handleSquareClick(squareName));

          this.boardEl.appendChild(squareDiv);
        }
      }

      this.updateStatusAndPanels();
    }

    // 칸 클릭 인터랙션 처리 (클릭 착수 및 적 기물 포획 완벽 지원)
    handleSquareClick(squareName) {
      // 게임 종료 상태이거나 승급 대기 중이면 무시
      if (this.game.game_over() || this.pendingPromotion) return;

      const currentTurn = this.game.turn();

      // AI 턴일 때 플레이어의 조작 방지
      if (this.gameMode === "ai" && currentTurn !== this.playerColor) {
        return;
      }

      // LAN 모드일 때: 상대방 턴이거나 아직 연결되지 않았으면 클릭 조작 차단
      if (this.gameMode === "lan") {
        if (!this.lanManager || !this.lanManager.isConnected()) {
          this.setDialogue("⚠️ 아직 전우(상대방)가 대국실에 입장하지 않았습니다. 대기해주세요.");
          return;
        }
        if (currentTurn !== this.lanMyColor) {
          this.setDialogue("🛡️ 지금은 상대방(전우)의 착수 차례입니다.");
          return;
        }
      }

      // 1. 이미 선택된 기물이 있는 경우
      if (this.selectedSquare) {
        // (1) 이미 선택된 기물을 다시 클릭한 경우 -> 선택 해제 (토글 지원)
        if (this.selectedSquare === squareName) {
          this.selectedSquare = null;
          this.legalMovesForSelected = [];
          this.render();
          return;
        }

        // (2) 유효한 착수/포획 경로인지 확인
        let targetMove = this.legalMovesForSelected.find(m => m.to === squareName);

        // 앙파상 특수 처리: 사용자가 목표 빈 칸이 아닌 포획될 적 폰 위치를 직접 클릭한 경우 대응
        if (!targetMove) {
          const epMove = this.legalMovesForSelected.find(m => m.flags.includes('e'));
          if (epMove && squareName === epMove.to[0] + this.selectedSquare[1]) {
            targetMove = epMove;
          }
        }

        // 유효한 이동 경로인 경우 -> 착수 진행
        if (targetMove) {
          // 승급(Promotion) 여부 확인
          if (targetMove.flags.includes('p')) {
            this.pendingPromotion = { from: this.selectedSquare, to: targetMove.to };
            this.openPromotionModal(currentTurn);
            return;
          }

          this.executeMove(this.selectedSquare, targetMove.to);
          this.selectedSquare = null;
          this.legalMovesForSelected = [];
          return;
        }
      }

      // 2. 기물 선택 처리 (현재 차례의 기물만 선택 가능)
      const pieceAtSquare = this.game.get(squareName);
      if (pieceAtSquare && pieceAtSquare.color === currentTurn) {
        this.selectedSquare = squareName;
        this.legalMovesForSelected = this.game.moves({ square: squareName, verbose: true });
        this.render();
      } else {
        // 빈 칸이거나 선택 불가능한 상대 기물 클릭 시 선택 해제
        this.selectedSquare = null;
        this.legalMovesForSelected = [];
        this.render();
      }
    }

    // 드래그 앤 드롭 시작 핸들러
    handleDragStart(e, squareName) {
      this.hideTooltip();
      if (this.game.game_over() || this.pendingPromotion) {
        e.preventDefault();
        return;
      }
      const currentTurn = this.game.turn();
      if (this.gameMode === "ai" && currentTurn !== this.playerColor) {
        e.preventDefault();
        return;
      }
      if (this.gameMode === "lan") {
        if (!this.lanManager || !this.lanManager.isConnected()) {
          e.preventDefault();
          return;
        }
        if (currentTurn !== this.lanMyColor) {
          e.preventDefault();
          return;
        }
      }
      const piece = this.game.get(squareName);
      if (!piece || piece.color !== currentTurn) {
        e.preventDefault();
        return;
      }

      this.draggedSquare = squareName;
      this.selectedSquare = squareName;
      this.legalMovesForSelected = this.game.moves({ square: squareName, verbose: true });
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", squareName);

      // 드래그 중인 칸 시각 피드백
      e.currentTarget.classList.add("dragging");

      // 이동 가능 경로 힌트 표시 (기존 DOM 유지하여 드래그 중단 방지)
      this.highlightLegalSquares();
    }

    // 드래그 오버 핸들러 (착수 가능 칸이면 drop 허용 및 시각 피드백)
    handleDragOver(e, squareName) {
      if (!this.draggedSquare) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      if (this.isLegalTarget(this.draggedSquare, squareName)) {
        e.currentTarget.classList.add("drag-over");
      }
    }

    // 드래그 리브 핸들러
    handleDragLeave(e, squareName) {
      e.currentTarget.classList.remove("drag-over");
    }

    // 드롭 핸들러 (기물 착수 및 적 기물 포획 처리)
    handleDrop(e, squareName) {
      e.preventDefault();
      e.currentTarget.classList.remove("drag-over");
      if (!this.draggedSquare) return;

      const fromSquare = this.draggedSquare;
      this.draggedSquare = null;

      let targetMove = this.legalMovesForSelected.find(m => m.to === squareName);
      if (!targetMove) {
        const epMove = this.legalMovesForSelected.find(m => m.flags.includes('e'));
        if (epMove && squareName === epMove.to[0] + fromSquare[1]) {
          targetMove = epMove;
        }
      }

      if (targetMove) {
        if (targetMove.flags.includes('p')) {
          this.pendingPromotion = { from: fromSquare, to: targetMove.to };
          this.openPromotionModal(this.game.turn());
          return;
        }
        this.executeMove(fromSquare, targetMove.to);
        this.selectedSquare = null;
        this.legalMovesForSelected = [];
      } else {
        this.selectedSquare = null;
        this.legalMovesForSelected = [];
        this.render();
      }
    }

    // 드래그 종료 핸들러
    handleDragEnd(e) {
      this.draggedSquare = null;
      if (e.currentTarget) {
        e.currentTarget.classList.remove("dragging");
      }
      if (this.boardEl) {
        this.boardEl.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over"));
        this.boardEl.querySelectorAll(".dragging").forEach(el => el.classList.remove("dragging"));
      }
    }

    // 이동 유효성 확인 헬퍼
    isLegalTarget(fromSquare, toSquare) {
      if (!this.legalMovesForSelected || this.legalMovesForSelected.length === 0) return false;
      if (this.legalMovesForSelected.some(m => m.to === toSquare)) return true;
      const epMove = this.legalMovesForSelected.find(m => m.flags.includes('e'));
      if (epMove && toSquare === epMove.to[0] + fromSquare[1]) return true;
      return false;
    }

    // DOM을 파괴하지 않고 착수 힌트 표시 (HTML5 드래그 보존)
    highlightLegalSquares() {
      if (!this.boardEl) return;
      this.boardEl.querySelectorAll(".move-dot, .capture-ring").forEach(el => el.remove());
      this.boardEl.querySelectorAll(".square.selected").forEach(el => el.classList.remove("selected"));

      const fromSq = this.boardEl.querySelector(`[data-square="${this.selectedSquare}"]`);
      if (fromSq) fromSq.classList.add("selected");

      for (const move of this.legalMovesForSelected) {
        const targetSq = this.boardEl.querySelector(`[data-square="${move.to}"]`);
        if (targetSq) {
          if (move.captured) {
            const ring = document.createElement("div");
            ring.className = "capture-ring";
            targetSq.appendChild(ring);
          } else {
            const dot = document.createElement("div");
            dot.className = "move-dot";
            targetSq.appendChild(dot);
          }
        }
      }
    }

    // 마우스 진입 시 기물 설명 툴팁 표시
    handleSquareMouseEnter(e, squareName) {
      if (this.draggedSquare || this.pendingPromotion) return;

      const piece = this.game.get(squareName);
      if (!piece) {
        this.hideTooltip();
        return;
      }

      const heroId = this.piecePositions[squareName] || `${piece.color}_${piece.type}`;
      const hero = HERO_CATALOG[heroId] || HERO_CATALOG[`${piece.color}_${piece.type}`];
      if (!hero) {
        this.hideTooltip();
        return;
      }

      this.showTooltip(e, hero, squareName);
    }

    // 마우스 이동 시 툴팁 위치 갱신 (스마트 커서 추종)
    handleSquareMouseMove(e) {
      if (this.tooltipEl && this.tooltipEl.classList.contains("visible")) {
        this.positionTooltip(e.clientX, e.clientY);
      }
    }

    // 마우스 벗어날 때 툴팁 숨김
    handleSquareMouseLeave() {
      this.hideTooltip();
    }

    // 전술 기물 툴팁 렌더링 및 페이드인
    showTooltip(e, hero, squareName) {
      if (!this.tooltipEl) return;

      const isWhite = hero.color === 'w';
      const factionBadgeColor = isWhite ? '#f59e0b' : '#fb923c';
      const factionIcon = isWhite ? '🏛️' : '🛡️';

      this.tooltipEl.innerHTML = `
        <div class="tooltip-header">
          <div class="tooltip-avatar-ring">
            <span class="tooltip-symbol">${hero.symbol}</span>
          </div>
          <div class="tooltip-title-box">
            <div class="tooltip-faction-badge" style="color: ${factionBadgeColor};">
              ${factionIcon} ${hero.factionName || (isWhite ? '아카이아 연합군' : '트로이 수호군')} · ${hero.chessRole || hero.shortName}
            </div>
            <h3 class="tooltip-hero-name">${hero.name}</h3>
            <span class="tooltip-epithet">"${hero.title}"</span>
          </div>
        </div>
        <div class="tooltip-divider"></div>
        <div class="tooltip-section">
          <div class="tooltip-label">⚔️ 전술 행마 규칙</div>
          <div class="tooltip-move-desc">${hero.moveDesc || '체스 기본 규칙에 따라 이동'}</div>
        </div>
        <div class="tooltip-section">
          <div class="tooltip-label">📜 호메로스 서사 & 신화 무구</div>
          <div class="tooltip-lore">${hero.lore || hero.title}</div>
        </div>
      `;

      this.tooltipEl.style.display = "block";
      this.positionTooltip(e.clientX, e.clientY);

      // 다음 브라우저 렌더링 프레임에 부드럽게 페이드인 클래스 추가
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => {
          if (this.tooltipEl) this.tooltipEl.classList.add("visible");
        });
      } else {
        this.tooltipEl.classList.add("visible");
      }
    }

    // 툴팁 위치 계산 (화면 경계 클램핑으로 잘림 방지)
    positionTooltip(clientX, clientY) {
      if (!this.tooltipEl) return;
      const offset = 18;
      const tooltipWidth = this.tooltipEl.offsetWidth || 300;
      const tooltipHeight = this.tooltipEl.offsetHeight || 190;
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

      let left = clientX + offset;
      let top = clientY + offset;

      // 화면 우측 클램핑
      if (left + tooltipWidth > viewportWidth - 16) {
        left = clientX - tooltipWidth - offset;
      }
      if (left < 16) left = 16;

      // 화면 하단 클램핑
      if (top + tooltipHeight > viewportHeight - 16) {
        top = clientY - tooltipHeight - offset;
      }
      if (top < 16) top = 16;

      this.tooltipEl.style.left = `${left}px`;
      this.tooltipEl.style.top = `${top}px`;
    }

    // 툴팁 숨기기
    hideTooltip() {
      if (!this.tooltipEl) return;
      this.tooltipEl.classList.remove("visible");
      setTimeout(() => {
        if (this.tooltipEl && !this.tooltipEl.classList.contains("visible")) {
          this.tooltipEl.style.display = "none";
        }
      }, 180);
    }

    // 착수 실행
    executeMove(from, to, promotionPiece = 'q', isRemote = false) {
      this.hideTooltip();
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

      // LAN 모드에서 로컬 사용자의 착수일 때: 원격 상대방에게 실시간 브로드캐스트
      if (!isRemote && this.gameMode === "lan" && this.lanManager) {
        this.lanManager.sendMessage({
          type: 'move',
          from: from,
          to: to,
          promotion: promotionPiece,
          player: this.lanRole
        });
      }

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
        if (this.gameMode === "ai" && this.game.turn() === this.playerColor && this.aiDifficulty === "hades" && Math.random() < 0.35) {
          const hadesQuotes = [
            "💀 하데스: '네 모든 행마는 이미 타르타로스의 명부에 적혀 있다.'",
            "💀 하데스: '필멸자의 허세는 저승의 문 앞에서 부질없이 흩어질 뿐...'",
            "💀 하데스: '스틱스 강변에 네 전사들의 영혼이 하나둘 쌓여가는구나.'",
            "💀 하데스: '어둠 속에서 계산된 침묵의 일격이다.'"
          ];
          this.setDialogue(hadesQuotes[Math.floor(Math.random() * hadesQuotes.length)]);
        } else if (Math.random() < 0.4) {
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
    undoMove(isRemote = false) {
      if (!isRemote && this.gameMode === "lan") {
        if (this.lanManager && this.lanManager.isConnected()) {
          this.lanManager.sendMessage({ type: 'undo_request', sender: this.lanRole });
          this.setDialogue("상대방에게 한 수 무르기 요청을 보냈습니다. 승인을 기다립니다...");
        } else {
          alert("LAN 대국 중에는 연결된 전우가 있을 때만 무르기를 요청할 수 있습니다.");
        }
        return;
      }

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
      const resignedColor = (this.gameMode === "lan") ? this.lanMyColor : this.game.turn();
      const winner = resignedColor === 'w' ? 'b' : 'w';

      if (this.gameMode === "lan" && this.lanManager) {
        this.lanManager.sendMessage({ type: 'resign', sender: this.lanRole });
      }

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

      // 5. 내부 공유기(LAN) 모드 턴 배너 및 상태 실시간 갱신
      if (this.gameMode === "lan" && this.lanTurnBanner) {
        this.lanTurnBanner.style.display = "flex";
        if (!this.lanManager || !this.lanManager.isConnected()) {
          if (this.lanTurnIcon) this.lanTurnIcon.textContent = "⏳";
          if (this.lanTurnText) {
            this.lanTurnText.textContent = this.lanRole === 'host'
              ? `방 [${this.lanRoomCodeVal || '----'}] 대기실 생성됨: 상대방이 방 번호로 접속하기를 기다리는 중...`
              : "호스트 전장에 연결을 시도하는 중...";
          }
        } else {
          const isMyTurn = (turn === this.lanMyColor);
          if (this.lanTurnIcon) this.lanTurnIcon.textContent = isMyTurn ? "⚔️" : "🛡️";
          if (this.lanTurnText) {
            const mySideName = this.lanMyColor === 'w' ? '아카이아 연합군 (백)' : '트로이 수호군 (흑)';
            const oppSideName = this.lanMyColor === 'w' ? '트로이 수호군 (흑)' : '아카이아 연합군 (백)';
            this.lanTurnText.textContent = isMyTurn
              ? `【나의 턴】 당신(${mySideName})의 차례입니다. 전장의 기물을 착수하세요!`
              : `【상대방 턴】 상대방(${oppSideName})이 착수를 고심하고 있습니다...`;
          }
        }
      } else if (this.lanTurnBanner) {
        this.lanTurnBanner.style.display = "none";
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

    // ========================================================================
    // 내부 공유기(LAN) / 온라인 P2P 대전 헬퍼 메서드
    // ========================================================================

    // 방 생성 (Host)
    handleLanCreateRoom() {
      const code = String(Math.floor(1000 + Math.random() * 9000));
      this.lanRoomCodeVal = code;
      this.lanMyColor = 'w';
      this.playerColor = 'w';
      this.lanRole = 'host';

      if (this.lanRoomDisplay) this.lanRoomDisplay.style.display = "flex";
      if (this.lanRoomCodeEl) this.lanRoomCodeEl.textContent = code;

      this.lanManager.createRoom(code);
      this.resetGame(false);
      this.setDialogue(`🏛️ 대국 대기실 [${code}]이 생성되었습니다! 같은 공유기나 브라우저의 전우에게 방 번호를 알려주세요.`);
    }

    // 방 참여 (Guest)
    handleLanJoinRoom() {
      const code = (this.inputRoomCode ? this.inputRoomCode.value.trim() : "");
      if (!code || code.length < 4) {
        alert("4자리 방 번호를 올바르게 입력해주세요. (예: 1234)");
        return;
      }
      this.lanRoomCodeVal = code;
      this.lanMyColor = 'b';
      this.playerColor = 'b';
      this.lanRole = 'guest';

      this.lanManager.joinRoom(code);
      this.resetGame(false);
      this.setDialogue(`🛡️ 방 [${code}] 접속을 시도합니다. 트로이 수호군(흑/후공)으로 참전합니다.`);
    }

    // 방 번호 복사
    handleCopyRoomCode() {
      if (!this.lanRoomCodeVal) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(this.lanRoomCodeVal).then(() => {
          if (this.btnCopyRoomCode) {
            const original = this.btnCopyRoomCode.textContent;
            this.btnCopyRoomCode.textContent = "✅ 복사됨!";
            setTimeout(() => { if (this.btnCopyRoomCode) this.btnCopyRoomCode.textContent = original; }, 1500);
          }
        }).catch(() => {
          prompt("방 번호를 수동으로 복사하세요:", this.lanRoomCodeVal);
        });
      } else {
        prompt("방 번호를 수동으로 복사하세요:", this.lanRoomCodeVal);
      }
    }

    // LAN 서버 주소 감지 및 접속 안내 표시
    detectLanInfo() {
      if (typeof window === 'undefined' || !window.location.protocol.startsWith('http')) return;
      fetch('/api/lan-info')
        .then(r => r.json())
        .then(data => {
          if (data && data.ok && Array.isArray(data.ips) && data.ips.length > 0) {
            const ip = data.ips[0];
            const port = data.port || 3000;
            const lanUrl = `http://${ip}:${port}`;
            const descEl = this.lanMatchPanel ? this.lanMatchPanel.querySelector('.lan-desc') : null;
            if (descEl) {
              descEl.innerHTML = `같은 Wi-Fi 내의 스마트폰/PC에서 <strong>${lanUrl}</strong> 로 접속하여 함께 대국할 수 있습니다.`;
            }
          }
        })
        .catch(() => {});
    }

    // 원격 상대방의 착수 실행
    executeRemoteMove(from, to, promotion = 'q') {
      this.executeMove(from, to, promotion, true);
    }

    // 원격 무르기 실행
    executeRemoteUndo() {
      this.undoMove(true);
    }

    // 상대방 기권 수신 처리
    handleRemoteResign(sender) {
      if (this.game.game_over()) return;
      const winner = this.lanMyColor === 'w' ? '아카이아 연합군 (백)' : '트로이 수호군 (흑)';
      this.sound.playVictory();
      this.setDialogue(`🏳️ 상대방이 기권을 선언했습니다! ${winner}의 명예로운 승리!`);
    }
  }

  // ==========================================================================
  // 5. DOM 로드 완료 시 체스 게임 초기화 및 전역 등록
  // ==========================================================================
  document.addEventListener("DOMContentLoaded", () => {
    window.trojanChess = new TrojanChessGame();
  });
})();
