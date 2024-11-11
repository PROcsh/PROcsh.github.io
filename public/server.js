const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const port = 3000;

// WebSocket 서버 생성
const wss = new WebSocket.Server({ noServer: true });

const rooms = {}; // 방을 관리하는 객체

// WebSocket 연결 처리
wss.on('connection', ws => {
    let currentRoomID = null;

    ws.on('message', message => {
        const data = JSON.parse(message);

        // 클라이언트가 룸에 참가할 때
        if (data.type === 'join') {
            currentRoomID = data.roomID;
            if (!rooms[currentRoomID]) {
                rooms[currentRoomID] = [];
            }
            rooms[currentRoomID].push(ws);
            console.log(`룸 ${currentRoomID}에 참여`);

            // 참여한 클라이언트에게 룸 ID와 링크를 알려줌
            const link = `http://localhost:${port}?room=${currentRoomID}`; // 링크 생성
            ws.send(JSON.stringify({
                roomID: currentRoomID,
                link: link // 생성된 링크를 전송
            }));
        }

        // WebRTC 시그널링 메시지 처리
        if (data.offer || data.answer || data.iceCandidate) {
            rooms[currentRoomID].forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    });

    ws.on('close', () => {
        if (currentRoomID && rooms[currentRoomID]) {
            const index = rooms[currentRoomID].indexOf(ws);
            if (index > -1) {
                rooms[currentRoomID].splice(index, 1);
            }
            console.log(`룸 ${currentRoomID}에서 나갔습니다.`);
        }
    });
});

// HTTP 서버에서 WebSocket 서버를 사용하도록 설정
app.server = app.listen(port, () => {
    console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});

app.server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// 정적 파일 제공 (HTML 파일 포함)
app.use(express.static(path.join(__dirname, 'public')));
