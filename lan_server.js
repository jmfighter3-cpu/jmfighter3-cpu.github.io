/**
 * ============================================================================
 * 체스: 트로이 (Chess: Troy) - 내부 공유기(LAN) 로컬 대전 서버 (lan_server.js)
 * ============================================================================
 * 외부 인터넷이나 추가 패키지 설치(npm install) 없이 Node.js 기본 내장 모듈만으로
 * 같은 공유기(Wi-Fi) 내의 모든 기기(PC, 노트북, 스마트폰, 태블릿)에서 
 * 실시간으로 접속하여 체스 게임을 즐길 수 있도록 지원하는 초경량 로컬 웹 서버입니다.
 * 
 * 실행 방법:
 *   node lan_server.js
 *   또는 run_lan_server.bat 더블 클릭
 * ============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// 파일 확장자별 MIME 타입 매핑
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.webm': 'video/webm',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=UTF-8'
};

// 활성 대국 방(Room) 인메모리 저장소
// { [roomCode]: { code, hostConnected, guestConnected, moves: [], lastAction: null, created, lastUpdate } }
const rooms = new Map();

// 1시간 이상 비활성 방 자동 정리
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.lastUpdate > 1000 * 60 * 60) {
      rooms.delete(code);
    }
  }
}, 1000 * 60 * 10);

// 로컬 IPv4 주소 목록 추출
function getLocalIpv4Addresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

// HTTP 요청 본문 파싱 헬퍼
function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Request entity too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// JSON 응답 전송 헬퍼
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// 메인 HTTP 서버 생성
const server = http.createServer(async (req, res) => {
  // CORS 프리플라이트 처리
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // --------------------------------------------------------------------------
  // 0. 로컬 공유기 IP 정보 제공 API (/api/lan-info)
  // --------------------------------------------------------------------------
  if (pathname === '/api/lan-info' && req.method === 'GET') {
    return sendJson(res, 200, { ok: true, ips: getLocalIpv4Addresses(), port: PORT });
  }

  // --------------------------------------------------------------------------
  // 1. 내부 공유기 실시간 대국 방 중계 API (/api/room/*)
  // --------------------------------------------------------------------------
  if (pathname.startsWith('/api/room/')) {
    const endpoint = pathname.replace('/api/room/', '');

    // [API 1] 방 생성 (/api/room/create)
    if (endpoint === 'create' && req.method === 'POST') {
      const body = await readRequestBody(req);
      const code = body.code || String(Math.floor(1000 + Math.random() * 9000));
      
      const newRoom = {
        code: code,
        hostConnected: true,
        guestConnected: false,
        moves: [],
        lastAction: null,
        created: Date.now(),
        lastUpdate: Date.now()
      };
      rooms.set(code, newRoom);

      console.log(`[LAN Match] 🏛️ 새 방 생성됨: 방 번호 [${code}]`);
      return sendJson(res, 200, { ok: true, code, room: newRoom });
    }

    // [API 2] 방 참여 (/api/room/join)
    if (endpoint === 'join' && req.method === 'POST') {
      const body = await readRequestBody(req);
      const code = String(body.code || '').trim();
      const room = rooms.get(code);

      if (!room) {
        return sendJson(res, 404, { ok: false, message: '해당 방 번호를 찾을 수 없습니다.' });
      }

      room.guestConnected = true;
      room.lastUpdate = Date.now();
      console.log(`[LAN Match] 🛡️ 게스트 참전 완료: 방 번호 [${code}]`);
      return sendJson(res, 200, { ok: true, code, room });
    }

    // [API 3] 착수 전송 (/api/room/move)
    if (endpoint === 'move' && req.method === 'POST') {
      const body = await readRequestBody(req);
      const code = String(body.code || '').trim();
      const room = rooms.get(code);

      if (!room) {
        return sendJson(res, 404, { ok: false, message: '방이 존재하지 않습니다.' });
      }

      const moveData = {
        id: room.moves.length + 1,
        from: body.from,
        to: body.to,
        promotion: body.promotion || 'q',
        player: body.player,
        timestamp: Date.now()
      };

      room.moves.push(moveData);
      room.lastUpdate = Date.now();
      return sendJson(res, 200, { ok: true, move: moveData });
    }

    // [API 4] 상태 동기화 폴링 (/api/room/poll?code=XXXX&since=N)
    if (endpoint === 'poll' && req.method === 'GET') {
      const code = parsedUrl.searchParams.get('code');
      const since = parseInt(parsedUrl.searchParams.get('since') || '0', 10);
      const room = rooms.get(code);

      if (!room) {
        return sendJson(res, 404, { ok: false, message: '방이 없습니다.' });
      }

      const newMoves = room.moves.filter(m => m.id > since);
      return sendJson(res, 200, {
        ok: true,
        hostConnected: room.hostConnected,
        guestConnected: room.guestConnected,
        moves: newMoves,
        lastAction: room.lastAction,
        lastUpdate: room.lastUpdate
      });
    }

    // [API 5] 액션 전송 (/api/room/action) - 항복, 무르기 요청/수락, 새 대국
    if (endpoint === 'action' && req.method === 'POST') {
      const body = await readRequestBody(req);
      const code = String(body.code || '').trim();
      const room = rooms.get(code);

      if (!room) {
        return sendJson(res, 404, { ok: false, message: '방이 없습니다.' });
      }

      room.lastAction = {
        type: body.type,
        sender: body.sender,
        payload: body.payload || {},
        id: Date.now()
      };
      room.lastUpdate = Date.now();

      if (body.type === 'rematch') {
        room.moves = [];
      }

      return sendJson(res, 200, { ok: true, action: room.lastAction });
    }
  }

  // --------------------------------------------------------------------------
  // 2. 정적 웹 파일 서비스 (HTML, CSS, JS, Assets)
  // --------------------------------------------------------------------------
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

// 서버 실행 및 로컬 IP 안내 출력
server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpv4Addresses();
  console.log('\n========================================================================');
  console.log('🏛️  [체스: 트로이] 내부 공유기(LAN) 로컬 대전 서버 가동 완료!');
  console.log('------------------------------------------------------------------------');
  console.log(` * 이 컴퓨터에서 접속 주소   : http://localhost:${PORT}`);
  if (ips.length > 0) {
    ips.forEach(ip => {
      console.log(` * 같은 공유기(Wi-Fi) 기기 접속: http://${ip}:${PORT}`);
    });
  } else {
    console.log(` * 포트: ${PORT}`);
  }
  console.log('------------------------------------------------------------------------');
  console.log(' 💡 스마트폰이나 다른 노트북에서 위 IP 주소로 접속하면 바로 게임이 가능합니다.');
  console.log('    종료하려면 콘솔창에서 Ctrl + C 를 누르세요.');
  console.log('========================================================================\n');
});
