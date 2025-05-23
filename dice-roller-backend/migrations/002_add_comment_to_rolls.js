
module.exports = {
  version: 2,
  up: (db) => {
    // Check if column already exists to make this migration idempotent,
    // though strictly speaking, the versioning should prevent it from running if already applied.
    const stmtCheckColumn = db.prepare(`PRAGMA table_info(rolls)`);
    const columns = stmtCheckColumn.all();
    const hasCommentColumn = columns.some(col => col.name === 'comment');

    if (!hasCommentColumn) {
        db.exec(`ALTER TABLE rolls ADD COLUMN comment TEXT`);
        console.log("Added 'comment' column to 'rolls' table.");
    } else {
        console.log("'comment' column already exists in 'rolls' table. Migration 002 finds no changes needed.");
    }
  }
};
