// Simple WebSocket test script
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', function open() {
  console.log('Connected to WebSocket server');
  
  // Test joining a room
  ws.send(JSON.stringify({
    type: 'join_room',
    roomId: 'test-room-123',
    payload: { userName: 'TestUser' }
  }));
});

ws.on('message', function message(data) {
  const parsed = JSON.parse(data);
  console.log('Received:', parsed);
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('WebSocket connection closed');
});

// Keep the script running for a few seconds
setTimeout(() => {
  ws.close();
  process.exit(0);
}, 3000);