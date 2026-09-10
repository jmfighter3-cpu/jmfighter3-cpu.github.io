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
  // 3-1. 에이지 오브 미쏠로지(AoM) 스타일 전신 3D 영웅 유닛 SVG 렌더러
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
      <!-- 피부 톤 -->
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

  // 공통 전신 인체 해부학적 기본 템플릿 함수 (다리, 프테루게스 스커트, 근육 흉갑, 견갑)
  const renderHumanBody = (customTorso, customHead, customWeapons) => `
    <!-- 1. 양다리 & 황금 각갑(Greaves) & 가죽 샌들 -->
    <!-- 왼다리 (보는 사람 기준 좌측) -->
    <path d="M38,92 L36,116 L43,118 L45,93 Z" fill="url(#${prefix}-skin)"/>
    <path d="M37,96 L35,115 L43,117 L44,97 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
    <circle cx="40" cy="97" r="3.2" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
    <line x1="36" y1="114" x2="43" y2="116" stroke="#451a03" stroke-width="1.2"/>
    <!-- 오른다리 (보는 사람 기준 우측) -->
    <path d="M55,93 L57,118 L64,116 L62,92 Z" fill="url(#${prefix}-skin)"/>
    <path d="M56,97 L57,117 L64,115 L63,96 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
    <circle cx="60" cy="97" r="3.2" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
    <line x1="57" y1="116" x2="64" y2="114" stroke="#451a03" stroke-width="1.2"/>

    <!-- 2. 진영 튜닉 & 프테루게스(Pteruges) 가죽 스커트 -->
    <path d="M32,74 L68,74 L70,92 L30,92 Z" fill="url(#${prefix}-tunic)" stroke="${strokeColor}" stroke-width="0.6"/>
    <!-- 프테루게스 개별 가죽판 5개 -->
    <rect x="33" y="75" width="6" height="15" rx="1.5" fill="url(#${prefix}-tunic)" stroke="url(#${prefix}-gold)" stroke-width="0.7"/>
    <rect x="40" y="75" width="6" height="16.5" rx="1.5" fill="url(#${prefix}-tunic)" stroke="url(#${prefix}-gold)" stroke-width="0.7"/>
    <rect x="47" y="75" width="6" height="17" rx="1.5" fill="url(#${prefix}-tunic)" stroke="url(#${prefix}-gold)" stroke-width="0.7"/>
    <rect x="54" y="75" width="6" height="16.5" rx="1.5" fill="url(#${prefix}-tunic)" stroke="url(#${prefix}-gold)" stroke-width="0.7"/>
    <rect x="61" y="75" width="6" height="15" rx="1.5" fill="url(#${prefix}-tunic)" stroke="url(#${prefix}-gold)" stroke-width="0.7"/>

    <!-- 3. 전사 허리띠 (Cingulum) -->
    <rect x="32" y="72" width="36" height="5" rx="1" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
    <circle cx="50" cy="74.5" r="2.2" fill="url(#${prefix}-gold)"/>

    <!-- 4. 토르소/흉갑 영역 (커스텀 흉갑 및 팔) -->
    ${customTorso}

    <!-- 5. 두부 및 투구 (커스텀) -->
    ${customHead}

    <!-- 6. 무기 및 특수 장비 -->
    ${customWeapons}
  `;

  let unitGraphic = "";

  switch (hero.role) {
    // 1. 아킬레우스 (Achilles) - 예시 이미지와 100% 동일한 형태의 최강 영웅!
    case 'achilles': {
      const torso = `
        <!-- 황금 근육 흉갑 (Muscle Cuirass) -->
        <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
        <path d="M38,53 Q44,58 48,53 M52,53 Q56,58 62,53" stroke="${strokeColor}" stroke-width="1" fill="none"/>
        <line x1="50" y1="54" x2="50" y2="72" stroke="${strokeColor}" stroke-width="1"/>
        <path d="M43,62 Q50,65 57,62 M44,67 Q50,70 56,67" stroke="${strokeColor}" stroke-width="0.8" fill="none"/>
        <!-- 은빛 다중 견갑 (Steel Layered Pauldrons with Rivets) -->
        <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.9"/>
        <circle cx="28" cy="46" r="0.9" fill="#ffffff"/>
        <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.9"/>
        <circle cx="72" cy="46" r="0.9" fill="#ffffff"/>
        <!-- 왼팔 (약간 굽힌 주먹) -->
        <path d="M27,48 L22,66 L26,68 L32,52 Z" fill="url(#${prefix}-skin)"/>
        <rect x="22" y="60" width="5" height="6" rx="1" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
        <!-- 오른팔 (창을 쥔 팔) -->
        <path d="M68,49 L77,66 L82,64 L73,48 Z" fill="url(#${prefix}-skin)"/>
        <rect x="74" y="60" width="6" height="6" rx="1" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.6"/>
      `;
      const head = `
        <!-- 목 -->
        <path d="M46,37 L54,37 L55,42 L45,42 Z" fill="url(#${prefix}-skin)"/>
        <!-- 얼굴 (비장한 전사 얼굴선) -->
        <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
        <!-- 눈 코 입 -->
        <line x1="47" y1="28" x2="49" y2="28" stroke="#331a08" stroke-width="0.8"/>
        <line x1="51" y1="28" x2="53" y2="28" stroke="#331a08" stroke-width="0.8"/>
        <path d="M50,28 L50,32 L48,33 L52,33" stroke="${strokeColor}" stroke-width="0.7" fill="none"/>
        <!-- 솟구쳐오른 장엄한 로열 블루 말갈기 볏 코린토스 황금 투구 -->
        <path d="M49,3 C40,3 34,14 42,22 C46,22 54,22 58,22 C66,14 60,3 49,3 Z" fill="url(#${prefix}-crest)" stroke="${strokeColor}" stroke-width="1.1"/>
        <path d="M44,7 Q50,15 56,7 M45,12 Q50,18 55,12" stroke="#ffffff" stroke-width="0.8" fill="none"/>
        <path d="M41,18 C39,30 43,36 50,38 C57,36 61,30 59,18 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1"/>
        <path d="M46,22 L49,26 L51,26 L54,22" stroke="${strokeColor}" stroke-width="1" fill="none"/>
      `;
      const weapons = `
        <!-- 비스듬히 쥔 펠레우스 물푸레나무 황금 장창 (Pelian Ash Spear) -->
        <line x1="88" y1="18" x2="22" y2="116" stroke="url(#${prefix}-gold)" stroke-width="2.6"/>
        <polygon points="90,14 84,24 93,20" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
        <polygon points="90,14 87,20 90,20" fill="#ffffff"/>
      `;
      unitGraphic = renderHumanBody(torso, head, weapons);
      break;
    }

    // 2. 헥토르 (Hector) - 트로이 최강 수호자, 눈부신 말갈기 투구와 원형 방패, 장창
    case 'hector': {
      const torso = `
        <!-- 흑요석-청동 근육 흉갑 -->
        <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
        <path d="M38,53 Q44,58 48,53 M52,53 Q56,58 62,53" stroke="${strokeColor}" stroke-width="1" fill="none"/>
        <line x1="50" y1="54" x2="50" y2="72" stroke="${strokeColor}" stroke-width="1"/>
        <!-- 어깨 청동 견갑 -->
        <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.9"/>
        <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.9"/>
        <!-- 왼팔 방패 파지 -->
        <path d="M27,48 L18,66 L23,68 L32,52 Z" fill="url(#${prefix}-skin)"/>
        <!-- 오른팔 창 파지 -->
        <path d="M68,49 L76,66 L81,64 L73,48 Z" fill="url(#${prefix}-skin)"/>
      `;
      const head = `
        <path d="M46,37 L54,37 L55,42 L45,42 Z" fill="url(#${prefix}-skin)"/>
        <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
        <!-- 눈부신 흑적색 말갈기 투구 -->
        <path d="M49,3 C40,3 34,14 42,22 C46,22 54,22 58,22 C66,14 60,3 49,3 Z" fill="url(#${prefix}-crest)" stroke="${strokeColor}" stroke-width="1.1"/>
        <path d="M41,18 C39,30 43,36 50,38 C57,36 61,30 59,18 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1"/>
        <path d="M45,24 L48,27 L52,27 L55,24" stroke="${strokeColor}" stroke-width="1" fill="none"/>
      `;
      const weapons = `
        <!-- 트로이 청동 원형 방패 (왼팔) -->
        <circle cx="22" cy="68" r="16" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.3"/>
        <circle cx="22" cy="68" r="12" fill="none" stroke="url(#${prefix}-gold)" stroke-width="1"/>
        <circle cx="22" cy="68" r="4.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
        <!-- 트로이 청동 장창 (오른손) -->
        <line x1="84" y1="10" x2="68" y2="110" stroke="url(#${prefix}-gold)" stroke-width="2.5"/>
        <polygon points="85,6 80,16 89,14" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
      `;
      unitGraphic = renderHumanBody(torso, head, weapons);
      break;
    }

    // 3. 대 아이아스 (Great Ajax) - 칠중 소가죽 청동 타워 실드와 거대한 장창
    case 'ajax_great': {
      const torso = `
        <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
        <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.9"/>
        <path d="M68,49 L76,66 L81,64 L73,48 Z" fill="url(#${prefix}-skin)"/>
      `;
      const head = `
        <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
        <!-- 중장갑 코린토스 각진 투구 -->
        <path d="M42,16 C40,30 44,36 50,38 C56,36 60,30 58,16 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
        <polygon points="50,6 45,16 55,16" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
      `;
      const weapons = `
        <!-- 거대한 칠중 청동 타워 실드 (좌측 전면 성벽) -->
        <path d="M10,24 C10,18 36,18 36,24 L38,102 L8,102 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.4"/>
        <ellipse cx="23" cy="62" rx="10" ry="24" fill="none" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="3,2"/>
        <circle cx="23" cy="62" r="5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
        <!-- 우측 어깨의 육중한 장창 -->
        <line x1="82" y1="12" x2="72" y2="108" stroke="url(#${prefix}-gold)" stroke-width="2.6"/>
        <polygon points="83,7 78,17 87,15" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
      `;
      unitGraphic = renderHumanBody(torso, head, weapons);
      break;
    }

    // 4. 소 아이아스 (Lesser Ajax) - 날개 투구와 2자루 투창
    case 'ajax_lesser': {
      const torso = `
        <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
        <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
        <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
        <!-- 양팔 투창 투척 자세 -->
        <path d="M27,48 L18,62 L23,64 L30,50 Z" fill="url(#${prefix}-skin)"/>
        <path d="M68,49 L77,63 L82,61 L73,48 Z" fill="url(#${prefix}-skin)"/>
      `;
      const head = `
        <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
        <!-- 날개 달린 날렵한 투구 -->
        <path d="M42,16 C40,30 44,36 50,38 C56,36 60,30 58,16 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1"/>
        <path d="M32,18 Q42,22 38,28 M68,18 Q58,22 62,28" stroke="url(#${prefix}-gold)" stroke-width="1.4" fill="none"/>
      `;
      const weapons = `
        <!-- X자로 교차된 2자루의 바람 투창 -->
        <line x1="20" y1="20" x2="80" y2="108" stroke="url(#${prefix}-gold)" stroke-width="2"/>
        <polygon points="18,17 17,25 24,22" fill="url(#${prefix}-gold)"/>
        <line x1="80" y1="20" x2="20" y2="108" stroke="url(#${prefix}-gold)" stroke-width="2"/>
        <polygon points="82,17 76,22 83,25" fill="url(#${prefix}-gold)"/>
      `;
      unitGraphic = renderHumanBody(torso, head, weapons);
      break;
    }

    // 5. 파트로클로스 (Patroclus) - 청년 전차병 투구와 뽑아 든 장검
    case 'patroclus': {
      const torso = `
        <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
        <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.8"/>
        <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.8"/>
        <path d="M27,48 L22,66 L26,68 L32,52 Z" fill="url(#${prefix}-skin)"/>
        <path d="M68,49 L76,64 L81,62 L73,48 Z" fill="url(#${prefix}-skin)"/>
      `;
      const head = `
        <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
        <!-- 전차마 볏 투구 -->
        <path d="M50,8 C40,8 36,18 42,24 C46,24 54,24 58,24 C64,18 60,8 50,8 Z" fill="url(#${prefix}-crest)" stroke="${strokeColor}" stroke-width="1"/>
        <path d="M42,18 C40,30 44,36 50,38 C56,36 60,30 58,18 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1"/>
      `;
      const weapons = `
        <!-- 오른손의 청동 장검 (Xiphos) -->
        <line x1="78" y1="62" x2="88" y2="24" stroke="url(#${prefix}-steel)" stroke-width="2.6"/>
        <polygon points="89,20 85,28 92,26" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.7"/>
        <line x1="74" y1="60" x2="82" y2="60" stroke="url(#${prefix}-gold)" stroke-width="1.8"/>
      `;
      unitGraphic = renderHumanBody(torso, head, weapons);
      break;
    }

    // 6. 네스토르 (Nestor) - 원로 군주, 풍성한 은빛 수염과 지혜의 황금 지팡이
    case 'nestor': {
      const torso = `
        <!-- 원로의 토가와 갑옷 -->
        <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
        <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-tunic)" stroke="${strokeColor}" stroke-width="0.8"/>
        <!-- 오른손 지팡이 파지 -->
        <path d="M68,49 L76,66 L81,64 L73,48 Z" fill="url(#${prefix}-skin)"/>
      `;
      const head = `
        <!-- 풍성한 은빛 수염 -->
        <path d="M43,30 C40,46 60,46 57,30 Z" fill="#e2e8f0" stroke="${strokeColor}" stroke-width="0.8"/>
        <path d="M44,22 L56,22 L54,34 L46,34 Z" fill="url(#${prefix}-skin)"/>
        <!-- 필로스 황금 투구 -->
        <path d="M42,16 C40,28 44,32 50,33 C56,32 60,28 58,16 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
      `;
      const weapons = `
        <!-- 지혜의 황금 지팡이 (Staff) -->
        <line x1="80" y1="20" x2="80" y2="116" stroke="url(#${prefix}-gold)" stroke-width="2.4"/>
        <circle cx="80" cy="18" r="4.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
        <circle cx="80" cy="18" r="2" fill="#ffffff"/>
      `;
      unitGraphic = renderHumanBody(torso, head, weapons);
      break;
    }

    // 7. 오디세우스 (Odysseus) - 필레우스 모자, 아테나 올빼미 브로치, 두루마리와 단검
    case 'odysseus': {
      const torso = `
        <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
        <!-- 아테나의 올빼미 브로치 -->
        <circle cx="44" cy="46" r="3.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
        <!-- 양팔 두루마리 & 단검 파지 -->
        <path d="M27,48 L22,64 L27,66 L32,52 Z" fill="url(#${prefix}-skin)"/>
        <path d="M68,49 L76,64 L81,62 L73,48 Z" fill="url(#${prefix}-skin)"/>
      `;
      const head = `
        <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
        <!-- 수염 -->
        <path d="M45,32 C45,40 55,40 55,32 Z" fill="#64748b"/>
        <!-- 필레우스 (Pilos) 지략 모자 -->
        <path d="M40,24 C42,12 58,12 60,24 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="1.1"/>
      `;
      const weapons = `
        <!-- 왼손 파피루스 두루마리 -->
        <rect x="18" y="56" width="6" height="16" rx="1.5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.7"/>
        <!-- 오른손 청동 단검 -->
        <line x1="78" y1="62" x2="88" y2="40" stroke="url(#${prefix}-gold)" stroke-width="2.2"/>
        <polygon points="89,37 86,43 92,42" fill="url(#${prefix}-gold)"/>
      `;
      unitGraphic = renderHumanBody(torso, head, weapons);
      break;
    }

    // 8. 디오메데스 (Diomedes) - 아테나의 맹검, 사자 엠블럼 투구
    case 'diomedes': {
      const torso = `
        <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
        <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.9"/>
        <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-steel)" stroke="${strokeColor}" stroke-width="0.9"/>
        <path d="M68,49 L76,64 L81,62 L73,48 Z" fill="url(#${prefix}-skin)"/>
      `;
      const head = `
        <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
        <!-- 사자 문양 볏 투구 -->
        <path d="M50,8 C40,8 36,18 42,24 C46,24 54,24 58,24 C64,18 60,8 50,8 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
        <path d="M42,18 C40,30 44,36 50,38 C56,36 60,30 58,18 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1"/>
      `;
      const weapons = `
        <!-- 번뜩이는 아테나의 청동 맹검 (Broadsword) -->
        <line x1="78" y1="62" x2="88" y2="16" stroke="url(#${prefix}-steel)" stroke-width="3"/>
        <polygon points="89,12 84,20 93,18" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
        <line x1="73" y1="58" x2="83" y2="58" stroke="url(#${prefix}-gold)" stroke-width="2"/>
      `;
      unitGraphic = renderHumanBody(torso, head, weapons);
      break;
    }

    // 9. 아가멤논 (Agamemnon) - 미케네 군주, 황금 홀과 진홍-블루 망토
    case 'agamemnon': {
      const torso = `
        <!-- 총사령관 군주 망토 (Cloak) -->
        <path d="M24,42 C20,70 24,105 28,112 M76,42 C80,70 76,105 72,112" stroke="${isWhite ? '#b91c1c' : '#7f1d1d'}" stroke-width="3" fill="none"/>
        <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
        <circle cx="50" cy="58" r="6" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
        <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
        <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1"/>
        <path d="M68,49 L76,66 L81,64 L73,48 Z" fill="url(#${prefix}-skin)"/>
      `;
      const head = `
        <!-- 군주 수염 -->
        <path d="M43,30 C40,44 60,44 57,30 Z" fill="#331a08"/>
        <path d="M44,22 L56,22 L54,34 L46,34 Z" fill="url(#${prefix}-skin)"/>
        <!-- 미케네 황금 마스크 성관 (Royal Diadem) -->
        <path d="M40,24 L45,14 L50,8 L55,14 L60,24 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1.2"/>
        <circle cx="50" cy="18" r="2.5" fill="#ffffff"/>
      `;
      const weapons = `
        <!-- 총사령관의 황금 홀 (Scepter) -->
        <line x1="80" y1="22" x2="80" y2="116" stroke="url(#${prefix}-gold)" stroke-width="2.6"/>
        <circle cx="80" cy="18" r="5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.9"/>
        <polygon points="80,11 76,17 84,17" fill="url(#${prefix}-gold)"/>
      `;
      unitGraphic = renderHumanBody(torso, head, weapons);
      break;
    }

    // 10. 미르미돈 (Myrmidon) - 아킬레우스 개미 전사대, 슬릿 투구, 원형 방패와 장창
    case 'myrmidon': {
      const torso = `
        <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
        <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
        <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
        <path d="M68,49 L76,66 L81,64 L73,48 Z" fill="url(#${prefix}-skin)"/>
      `;
      const head = `
        <!-- 코린토스 슬릿 안면 투구 -->
        <path d="M42,16 C39,30 43,36 50,38 C57,36 61,30 58,16 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
        <path d="M46,24 L49,28 L51,28 L54,24" stroke="#000000" stroke-width="1.2" fill="none"/>
        <path d="M49,5 C42,5 38,12 44,16 C48,16 52,16 56,16 C62,12 58,5 49,5 Z" fill="url(#${prefix}-crest)"/>
      `;
      const weapons = `
        <!-- 미르미돈 청동 원형 방패 (왼팔) -->
        <circle cx="24" cy="66" r="14" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
        <polygon points="24,58 20,72 28,72" fill="url(#${prefix}-gold)"/>
        <!-- 전방을 겨눈 돌격 청동 창 -->
        <line x1="84" y1="16" x2="72" y2="112" stroke="url(#${prefix}-gold)" stroke-width="2.2"/>
        <polygon points="85,12 81,20 89,18" fill="url(#${prefix}-gold)"/>
      `;
      unitGraphic = renderHumanBody(torso, head, weapons);
      break;
    }

    // 11. 스카이아 관문 (Scaean Gate) - 아폴론의 서쪽 요새 성탑 3D 모델
    case 'scaean_gate': {
      unitGraphic = `
        <!-- 3D 성벽 요새 타워 본체 -->
        <path d="M22,118 L24,42 L20,42 L20,24 L32,24 L32,32 L44,32 L44,24 L56,24 L56,32 L68,32 L68,24 L80,24 L80,42 L76,42 L78,118 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.4"/>
        <!-- 성벽 석재 블록 라인 -->
        <line x1="24" y1="56" x2="76" y2="56" stroke="${strokeColor}" stroke-width="0.8"/>
        <line x1="23" y1="72" x2="77" y2="72" stroke="${strokeColor}" stroke-width="0.8"/>
        <line x1="23" y1="88" x2="77" y2="88" stroke="${strokeColor}" stroke-width="0.8"/>
        <!-- 아폴론의 황금 태양 엠블럼 -->
        <circle cx="50" cy="50" r="7" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.9"/>
        <line x1="50" y1="38" x2="50" y2="42" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
        <line x1="50" y1="58" x2="50" y2="62" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
        <line x1="38" y1="50" x2="42" y2="50" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
        <line x1="58" y1="50" x2="62" y2="50" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
        <!-- 난공불락 아치형 관문 -->
        <path d="M38,118 L38,90 C38,82 62,82 62,90 L62,118 Z" fill="#0f0704" stroke="${strokeColor}" stroke-width="1.2"/>
      `;
      break;
    }

    // 12. 다르다니아 성탑 (Dardanian Tower) - 포세이돈의 동쪽 요새 타워 3D 모델
    case 'dardanian_tower': {
      unitGraphic = `
        <path d="M22,118 L24,42 L20,42 L20,24 L32,24 L32,32 L44,32 L44,24 L56,24 L56,32 L68,32 L68,24 L80,24 L80,42 L76,42 L78,118 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.4"/>
        <line x1="24" y1="56" x2="76" y2="56" stroke="${strokeColor}" stroke-width="0.8"/>
        <line x1="23" y1="72" x2="77" y2="72" stroke="${strokeColor}" stroke-width="0.8"/>
        <line x1="23" y1="88" x2="77" y2="88" stroke="${strokeColor}" stroke-width="0.8"/>
        <!-- 포세이돈의 황금 삼지창 엠블럼 -->
        <line x1="50" y1="40" x2="50" y2="62" stroke="url(#${prefix}-gold)" stroke-width="2"/>
        <path d="M44,44 L44,52 L56,52 L56,44" stroke="url(#${prefix}-gold)" stroke-width="1.5" fill="none"/>
        <line x1="44" y1="44" x2="44" y2="40" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
        <line x1="56" y1="44" x2="56" y2="40" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
        <!-- 청동 빗장 관문 -->
        <path d="M38,118 L38,90 C38,82 62,82 62,90 L62,118 Z" fill="#24140b" stroke="${strokeColor}" stroke-width="1.2"/>
        <line x1="36" y1="102" x2="64" y2="102" stroke="url(#${prefix}-gold)" stroke-width="1.8"/>
      `;
      break;
    }

    // 13. 아이네이아스 (Aeneas) - 사자 가죽을 두른 다르다니아 맹장, 청동 장검
    case 'aeneas': {
      const torso = `
        <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
        <!-- 사자 가죽 어깨 망토 -->
        <path d="M24,42 C18,60 22,80 26,86 M76,42 C82,60 78,80 74,86" stroke="url(#${prefix}-gold)" stroke-width="2.5" fill="none"/>
        <path d="M68,49 L76,64 L81,62 L73,48 Z" fill="url(#${prefix}-skin)"/>
      `;
      const head = `
        <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
        <!-- 다르다니아 맹장의 청동 투구 -->
        <path d="M42,16 C39,30 43,36 50,38 C57,36 61,30 58,16 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
        <path d="M49,6 C40,6 36,15 42,22 C46,22 54,22 58,22 C64,15 60,6 49,6 Z" fill="url(#${prefix}-gold)"/>
      `;
      const weapons = `
        <!-- 청동 장검 (Spatha) -->
        <line x1="78" y1="62" x2="88" y2="20" stroke="url(#${prefix}-gold)" stroke-width="2.6"/>
        <polygon points="89,16 85,24 92,22" fill="url(#${prefix}-gold)"/>
        <line x1="74" y1="58" x2="82" y2="58" stroke="url(#${prefix}-armor)" stroke-width="1.8"/>
      `;
      unitGraphic = renderHumanBody(torso, head, weapons);
      break;
    }

    // 14. 사르페돈 (Sarpedon) - 제우스 아들의 날개 투구와 거대한 양날 전투도끼
    case 'sarpedon': {
      const torso = `
        <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
        <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.9"/>
        <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.9"/>
        <!-- 양손 도끼 파지 -->
        <path d="M27,48 L20,62 L25,64 L32,50 Z" fill="url(#${prefix}-skin)"/>
        <path d="M68,49 L76,64 L81,62 L73,48 Z" fill="url(#${prefix}-skin)"/>
      `;
      const head = `
        <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
        <!-- 제우스 아들의 날개 왕관 투구 -->
        <path d="M42,16 C39,30 43,36 50,38 C57,36 61,30 58,16 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
        <path d="M34,16 Q42,20 38,26 M66,16 Q58,20 62,26" stroke="url(#${prefix}-gold)" stroke-width="1.5" fill="none"/>
      `;
      const weapons = `
        <!-- 거대한 양날 전투 도끼 (Labrys) -->
        <line x1="20" y1="18" x2="80" y2="100" stroke="url(#${prefix}-gold)" stroke-width="2.6"/>
        <!-- 좌측 도끼날 -->
        <path d="M16,12 C10,20 10,32 18,38 L26,26 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
        <!-- 우측 도끼날 -->
        <path d="M28,8 C36,16 36,28 28,34 L20,22 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
      `;
      unitGraphic = renderHumanBody(torso, head, weapons);
      break;
    }

    // 15. 파리스 (Paris) - 트로이 미남 왕자, 프리기안 캡과 아폴론의 황금 복합궁
    case 'paris': {
      const torso = `
        <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
        <!-- 등 뒤의 화살통 스트랩 -->
        <line x1="32" y1="46" x2="68" y2="72" stroke="url(#${prefix}-gold)" stroke-width="2"/>
        <!-- 활 파지 팔 -->
        <path d="M27,48 L18,64 L23,66 L30,52 Z" fill="url(#${prefix}-skin)"/>
        <path d="M68,49 L76,64 L81,62 L73,48 Z" fill="url(#${prefix}-skin)"/>
      `;
      const head = `
        <!-- 수염 없는 미남 왕자의 얼굴선 -->
        <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
        <!-- 앞으로 굽어진 트로이 프리기안 캡 (Phrygian Cap) -->
        <path d="M38,24 C36,12 48,6 56,8 C64,10 62,18 52,16 C48,18 44,20 38,24 Z" fill="url(#${prefix}-crest)" stroke="${strokeColor}" stroke-width="1.1"/>
      `;
      const weapons = `
        <!-- 아폴론의 황금 복합궁 (Composite Bow) -->
        <path d="M14,14 Q26,58 16,104" stroke="url(#${prefix}-gold)" stroke-width="2.6" fill="none"/>
        <line x1="14" y1="14" x2="16" y2="104" stroke="#ffffff" stroke-width="0.7"/>
      `;
      unitGraphic = renderHumanBody(torso, head, weapons);
      break;
    }

    // 16. 헬레노스 (Helenus) - 아폴론의 신탁 예언자, 카두케우스 뱀 지팡이
    case 'helenus': {
      const torso = `
        <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
        <path d="M68,49 L76,66 L81,64 L73,48 Z" fill="url(#${prefix}-skin)"/>
      `;
      const head = `
        <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
        <path d="M45,30 C45,40 55,40 55,30 Z" fill="#64748b"/>
        <!-- 예언자의 신비로운 후드 -->
        <path d="M38,20 C38,10 62,10 62,20 L64,36 C64,44 36,44 36,36 Z" fill="url(#${prefix}-crest)" stroke="${strokeColor}" stroke-width="1"/>
      `;
      const weapons = `
        <!-- 두 마리 뱀이 감긴 황금 지팡이 (Caduceus) -->
        <line x1="80" y1="20" x2="80" y2="116" stroke="url(#${prefix}-gold)" stroke-width="2.2"/>
        <circle cx="80" cy="18" r="3.5" fill="url(#${prefix}-gold)"/>
        <path d="M76,26 Q84,32 76,38 Q84,44 76,50" stroke="url(#${prefix}-gold)" stroke-width="1.3" fill="none"/>
        <path d="M84,26 Q76,32 84,38 Q76,44 84,50" stroke="url(#${prefix}-gold)" stroke-width="1.3" fill="none"/>
      `;
      unitGraphic = renderHumanBody(torso, head, weapons);
      break;
    }

    // 17. 프리아모스 (Priam) - 트로이 노왕, 티아라 왕관, 긴 은빛 수염과 보석 홀
    case 'priam': {
      const torso = `
        <!-- 왕실 진홍빛 가운 -->
        <path d="M24,42 C20,70 24,105 28,112 M76,42 C80,70 76,105 72,112" stroke="#7f1d1d" stroke-width="3" fill="none"/>
        <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
        <circle cx="50" cy="58" r="5" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
        <path d="M68,49 L76,66 L81,64 L73,48 Z" fill="url(#${prefix}-skin)"/>
      `;
      const head = `
        <!-- 가슴까지 길게 내려오는 장엄한 은빛 수염 -->
        <path d="M42,28 C38,50 62,50 58,28 Z" fill="#e2e8f0" stroke="${strokeColor}" stroke-width="0.8"/>
        <path d="M44,20 L56,20 L54,32 L46,32 Z" fill="url(#${prefix}-skin)"/>
        <!-- 트로이 프리기아 티아라 왕관 -->
        <path d="M38,22 C40,10 50,6 56,8 C60,10 62,18 62,24 Z" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="1.2"/>
        <circle cx="50" cy="16" r="2.5" fill="#ffffff"/>
      `;
      const weapons = `
        <!-- 노왕의 보석 홀 (Scepter) -->
        <line x1="80" y1="20" x2="80" y2="116" stroke="url(#${prefix}-gold)" stroke-width="2.6"/>
        <polygon points="80,12 74,20 86,20" fill="url(#${prefix}-gold)" stroke="${strokeColor}" stroke-width="0.8"/>
        <circle cx="80" cy="20" r="3" fill="#f87171"/>
      `;
      unitGraphic = renderHumanBody(torso, head, weapons);
      break;
    }

    // 18. 트로이 보병 (Trojan Phalanx) - 원추형 청동 투구, 타원형 방패와 장창
    case 'trojan_phalanx':
    default: {
      const torso = `
        <path d="M33,48 C32,60 34,73 50,73 C66,73 68,60 67,48 C67,44 60,40 50,40 C40,40 33,44 33,48 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
        <path d="M26,45 C23,40 35,36 38,47 C36,54 28,52 26,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
        <path d="M74,45 C77,40 65,36 62,47 C64,54 72,52 74,45 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="0.8"/>
        <path d="M68,49 L76,66 L81,64 L73,48 Z" fill="url(#${prefix}-skin)"/>
      `;
      const head = `
        <path d="M44,22 L56,22 L54,37 L46,37 Z" fill="url(#${prefix}-skin)"/>
        <!-- 원추형 청동 투구 -->
        <path d="M42,20 C42,12 50,6 58,20 Z" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.1"/>
        <line x1="50" y1="6" x2="50" y2="2" stroke="url(#${prefix}-gold)" stroke-width="1.5"/>
      `;
      const weapons = `
        <!-- 트로이 타원형 방패 (왼팔) -->
        <ellipse cx="22" cy="66" rx="12" ry="18" fill="url(#${prefix}-armor)" stroke="${strokeColor}" stroke-width="1.2"/>
        <ellipse cx="22" cy="66" rx="6" ry="10" fill="none" stroke="url(#${prefix}-gold)" stroke-width="1"/>
        <!-- 전방 겨눈 트로이 장창 -->
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

    // 보드 렌더링 (고정 1:1 종횡비 및 AoM 전신 3D 유닛 모델 적용)
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

            pieceDiv.innerHTML = generateAomHeroUnitSvg(hero);

            squareDiv.appendChild(pieceDiv);

            // 드래그 앤 드롭: 플레이어 조작 가능한 턴 기물인 경우 draggable 활성화
            const isMyTurnPiece = (this.gameMode !== "ai" || piece.color === this.playerColor) && piece.color === currentTurn;
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
    executeMove(from, to, promotionPiece = 'q') {
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
