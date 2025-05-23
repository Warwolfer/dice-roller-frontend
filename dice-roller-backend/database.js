
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const DB_PATH = path.join(dataDir, 'diceroller.db');

let db;

function runMigrations(dbInstance) {
  const migrationsDir = path.join(__dirname, 'migrations');
  let currentDbVersion = 0;
  try {
    currentDbVersion = dbInstance.pragma('user_version', { simple: true });
  } catch (e) {
    console.warn("Could not read user_version, assuming 0. Error:", e.message);
    // This might happen if the DB is new or PRAGMA isn't supported in some edge case.
    // For new DBs, user_version will be 0 anyway.
  }
  
  console.log(`Current database schema version: ${currentDbVersion}`);

  let appliedMigration = false;

  try {
    if (!fs.existsSync(migrationsDir)) {
      console.log('Migrations directory does not exist. Skipping migrations.');
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort((a, b) => { // Sort by numerical prefix
        const numA = parseInt(a.split('_')[0], 10);
        const numB = parseInt(b.split('_')[0], 10);
        if (isNaN(numA) || isNaN(numB)) { // Handle files not matching expected format
            if (isNaN(numA) && !isNaN(numB)) return 1; // Non-numeric first
            if (!isNaN(numA) && isNaN(numB)) return -1; // Numeric first
            return a.localeCompare(b); // Fallback to string compare
        }
        return numA - numB;
      });

    for (const file of migrationFiles) {
      const migration = require(path.join(migrationsDir, file));
      if (migration && typeof migration.version === 'number' && typeof migration.up === 'function') {
        if (migration.version > currentDbVersion) {
          console.log(`Applying migration: ${file} (to version ${migration.version})`);
          const transaction = dbInstance.transaction(() => {
            migration.up(dbInstance);
            dbInstance.pragma(`user_version = ${migration.version}`);
          });
          transaction(); // Execute the transaction
          console.log(`Successfully applied migration ${file}. Database is now at version ${migration.version}.`);
          currentDbVersion = migration.version; // Update currentDbVersion for the loop
          appliedMigration = true;
        }
      } else {
        console.warn(`Skipping invalid migration file: ${file}. It must export 'version' (number) and 'up' (function).`);
      }
    }

    if (!appliedMigration && migrationFiles.length > 0) {
      console.log('Database schema is up to date.');
    } else if (migrationFiles.length === 0) {
        console.log('No valid migrations found in migrations directory.');
    }

  } catch (err) {
    console.error('Failed to apply migrations:', err.message);
    console.error('Database may be in an inconsistent state. Please check migrations and database schema.');
    throw err; 
  }
}


try {
  db = new Database(DB_PATH /*, { verbose: console.log } */); // verbose can be too chatty
  console.log('Connected to the SQLite database using better-sqlite3.');
  runMigrations(db); // Run migrations after connecting
} catch (err) {
  console.error('Error during database setup or migration:', err.message);
  process.exit(1);
}


// Helper function to get rolls for a specific room
function getRollsForRoomDbQuery(roomIdToQuery) {
  return new Promise((resolve, reject) => {
    const rollsSql = `SELECT id, userName, diceType, result, timestamp, comment FROM rolls WHERE roomId = ? ORDER BY timestamp DESC`;
    try {
      const stmt = db.prepare(rollsSql);
      const rollRows = stmt.all(roomIdToQuery);
      const rolls = rollRows.map(roll => ({
        ...roll,
        timestamp: new Date(roll.timestamp), 
        comment: roll.comment || undefined 
      }));
      resolve(rolls);
    } catch (err) {
      console.error(`Error fetching rolls for room ${roomIdToQuery} with better-sqlite3:`, err.message);
      reject(err);
    }
  });
}

// --- Room Functions ---
function addRoom(id, name) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO rooms (id, name) VALUES (?, ?)`;
    try {
      const stmt = db.prepare(sql);
      stmt.run(id, name);
      resolve({ id, name, rolls: [] }); 
    } catch (err) {
      console.error(`Error adding room with better-sqlite3:`, err.message);
      reject(err);
    }
  });
}

function getRooms() {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id, name FROM rooms ORDER BY name`;
    try {
      const stmt = db.prepare(sql);
      const rows = stmt.all();
      const rooms = rows.map(r => ({ ...r, rolls: [] })); 
      resolve(rooms);
    } catch (err) {
      console.error(`Error getting rooms with better-sqlite3:`, err.message);
      reject(err);
    }
  });
}

function getRoomById(roomId) {
  return new Promise((resolve, reject) => {
    const roomSql = `SELECT id, name FROM rooms WHERE id = ?`;
    try {
      const roomStmt = db.prepare(roomSql);
      const roomRow = roomStmt.get(roomId);

      if (!roomRow) {
        resolve(null); 
        return;
      }

      getRollsForRoomDbQuery(roomId)
        .then(rolls => {
          resolve({ ...roomRow, rolls });
        })
        .catch(rollError => {
          reject(rollError);
        });
    } catch (err) {
      console.error(`Error getting room by ID ${roomId} with better-sqlite3:`, err.message);
      reject(err);
    }
  });
}

// --- Roll Functions ---
function addRoll(id, roomId, userName, diceType, result, timestamp, comment) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO rolls (id, roomId, userName, diceType, result, timestamp, comment) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const isoTimestamp = timestamp instanceof Date ? timestamp.toISOString() : new Date(timestamp).toISOString();
    const commentToStore = comment && comment.trim() !== '' ? comment.trim() : null;

    try {
      const stmt = db.prepare(sql);
      stmt.run(id, roomId, userName, diceType, result, isoTimestamp, commentToStore);
      resolve({
        id,
        roomId,
        userName,
        diceType,
        result,
        timestamp: new Date(isoTimestamp),
        comment: commentToStore || undefined
      });
    } catch (err) {
      console.error(`Error adding roll with better-sqlite3:`, err.message);
      reject(err);
    }
  });
}

module.exports = {
  addRoom,
  getRooms,
  getRoomById,
  addRoll,
};
