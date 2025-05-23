
const express = require('express');
const cors = require('cors');
const crypto = require('crypto'); // For generating IDs, similar to client-side
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// --- API Endpoints ---

// Rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await db.getRooms();
    res.json(rooms);
  } catch (error) {
    console.error('Failed to get rooms:', error);
    res.status(500).json({ error: 'Failed to retrieve rooms' });
  }
});

app.post('/api/rooms', async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Room name is required and must be a non-empty string.' });
  }
  const id = crypto.randomUUID();
  try {
    const newRoom = await db.addRoom(id, name.trim());
    res.status(201).json(newRoom);
  } catch (error) {
    console.error('Failed to create room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

app.get('/api/rooms/:roomId', async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await db.getRoomById(roomId);
    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ error: 'Room not found' });
    }
  } catch (error) {
    console.error(`Failed to get room ${roomId}:`, error);
    res.status(500).json({ error: 'Failed to retrieve room' });
  }
});

// Rolls
app.post('/api/rooms/:roomId/rolls', async (req, res) => {
  const { roomId } = req.params;
  const { userName, diceType, comment } = req.body; // Added comment

  if (!userName || typeof userName !== 'string' || userName.trim() === '') {
    return res.status(400).json({ error: 'User name is required.' });
  }
  
  const validDiceValues = Object.values(Dice).filter(v => typeof v === 'number');
  if (diceType === undefined || !validDiceValues.includes(Number(diceType))) {
     return res.status(400).json({ error: `Invalid dice type. Valid types are: ${validDiceValues.join(', ')}` });
  }
  
  const actualDiceType = Number(diceType);
  const result = Math.floor(Math.random() * actualDiceType) + 1;
  const newRollId = crypto.randomUUID();
  const timestamp = new Date();

  try {
    const room = await db.getRoomById(roomId); // Check if room exists
    if (!room) {
      return res.status(404).json({ error: 'Room not found. Cannot add roll.' });
    }

    const newRoll = await db.addRoll(newRollId, roomId, userName.trim(), actualDiceType, result, timestamp, comment); // Pass comment
    res.status(201).json(newRoll);
  } catch (error) {
    console.error(`Failed to add roll to room ${roomId}:`, error);
    res.status(500).json({ error: 'Failed to add roll' });
  }
});

// Simple root path
app.get('/', (req, res) => {
  res.send('Dice Roller Backend is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});

const Dice = {
  D4: 4,
  D6: 6,
  D8: 8,
  D10: 10,
  D12: 12,
  D20: 20,
  D100: 100,
};
Object.freeze(Dice);