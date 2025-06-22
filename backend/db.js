const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const xlsx = require('xlsx');

// Correct path to the DB
const db = new sqlite3.Database(path.join(__dirname, 'data/auth.db'));

// Create table if it doesn't exist
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

// Validation logic
function validateCode(code) {
  return new Promise((resolve, reject) => {
    if (!code) return reject('Code is missing');

    const query = `SELECT * FROM auth_codes WHERE auth_code = ?`;
    db.get(query, [code], (err, row) => {
      if (err) return reject(err);

      if (!row) return resolve('Un-Authorize product');
      if (row.is_used) return resolve('Authentication code is already used.');

      db.run(`UPDATE auth_codes SET is_used = 1 WHERE id = ?`, [row.id], (err) => {
        if (err) return reject(err);
        return resolve('Authentic product.');
      });
    });
  });
}

function importExcel(filePath) {
  try {
    console.log('Reading file:', filePath);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error('No sheets found in the Excel file');
    console.log('Sheet name:', sheetName);

    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    console.log('Parsed data:', data);

    if (!data.length) throw new Error('No data found in the Excel sheet');

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO auth_codes (serial_number, auth_code)
      VALUES (?, ?)
    `);

    data.forEach((row, index) => {
      try {
        if (!row['Serial number'] || !row['Authentication Code']) {
          console.warn(`Skipping row ${index}: missing data - ${JSON.stringify(row)}`);
          return;
        }
        console.log(`Inserting row ${index}:`, row);
        stmt.run(row['Serial number'], row['Authentication Code']);
      } catch (dbErr) {
        console.error(`Database error for row ${index}:`, dbErr.message);
        throw dbErr; // Rethrow to ensure the error propagates
      }
    });

    stmt.finalize();
    console.log('Database insertion complete');
  } catch (err) {
    console.error('Excel import error:', err.stack); // Log full stack trace
    throw err; // Rethrow to be caught in app.js
  }
}

// ✅ Export both db and validateCode
module.exports = {
  db,
  validateCode,
  importExcel
};
