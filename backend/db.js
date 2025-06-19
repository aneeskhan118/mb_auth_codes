const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/data/auth.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS auth_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serial_number TEXT,
      auth_code TEXT UNIQUE,
      is_used INTEGER DEFAULT 0,
      batch_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
