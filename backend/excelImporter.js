const xlsx = require('xlsx');
const db = require('./db');

function importExcel(filePath, batchId) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO auth_codes (serial_number, auth_code, batch_id)
    VALUES (?, ?, ?)
  `);

  data.forEach(row => {
    stmt.run(row['Serial number'], row['Authentication Code'], batchId);
  });

  stmt.finalize();
}

module.exports = importExcel;
