
module.exports = {
  version: 1,
  up: (db) => {
    const createRoomsTable = `
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
      );
    `;
    const createRollsTable = `
      CREATE TABLE IF NOT EXISTS rolls (
        id TEXT PRIMARY KEY,
        roomId TEXT NOT NULL,
        userName TEXT NOT NULL,
        diceType INTEGER NOT NULL,
        result INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE
      );
    `;
    db.exec(createRoomsTable);
    console.log("Table 'rooms' created or already exists.");
    db.exec(createRollsTable);
    console.log("Table 'rolls' (initial schema) created or already exists.");
  }
};
