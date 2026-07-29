const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DIARY_DB_PATH || path.join(__dirname, 'data', 'diario.db');

require('fs').mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    date TEXT PRIMARY KEY,
    content TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

function listEntries() {
  return db
    .prepare('SELECT date, content, updated_at FROM entries ORDER BY date DESC')
    .all();
}

function getEntry(date) {
  return db.prepare('SELECT date, content, created_at, updated_at FROM entries WHERE date = ?').get(date);
}

function upsertEntry(date, content) {
  const now = new Date().toISOString();
  const existing = getEntry(date);
  if (existing) {
    db.prepare('UPDATE entries SET content = ?, updated_at = ? WHERE date = ?').run(content, now, date);
  } else {
    db.prepare(
      'INSERT INTO entries (date, content, created_at, updated_at) VALUES (?, ?, ?, ?)'
    ).run(date, content, now, now);
  }
  return getEntry(date);
}

function deleteEntry(date) {
  db.prepare('DELETE FROM entries WHERE date = ?').run(date);
}

module.exports = { listEntries, getEntry, upsertEntry, deleteEntry };
