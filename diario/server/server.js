require('dotenv').config();

const crypto = require('crypto');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const db = require('./db');
const { backupEntryToGithub, isConfigured: githubConfigured } = require('./githubBackup');

const PORT = process.env.PORT || 3000;
const DIARY_PASSWORD = process.env.DIARY_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const COOKIE_NAME = 'diario_session';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

if (!DIARY_PASSWORD) {
  console.warn(
    '[diario] Aviso: a variável de ambiente DIARY_PASSWORD não está definida. Configure-a antes de usar em produção.'
  );
}

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function requireAuth(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Não autenticado.' });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Sessão expirada, faça login novamente.' });
  }
}

app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (!DIARY_PASSWORD || !password || !timingSafeEqual(password, DIARY_PASSWORD)) {
    return res.status(401).json({ error: 'Senha incorreta.' });
  }
  const token = jwt.sign({ sub: 'diario' }, JWT_SECRET, { expiresIn: '30d' });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.json({ ok: true, githubBackupEnabled: githubConfigured() });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

app.get('/api/session', (req, res) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.json({ authenticated: false });
  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ authenticated: true, githubBackupEnabled: githubConfigured() });
  } catch {
    res.json({ authenticated: false });
  }
});

app.get('/api/entries', requireAuth, (req, res) => {
  const entries = db.listEntries().map((e) => ({
    date: e.date,
    updatedAt: e.updated_at,
    preview: e.content.slice(0, 120),
  }));
  res.json({ entries });
});

app.get('/api/entries/:date', requireAuth, (req, res) => {
  const { date } = req.params;
  if (!DATE_RE.test(date)) return res.status(400).json({ error: 'Data inválida.' });
  const entry = db.getEntry(date);
  res.json({ date, content: entry ? entry.content : '', updatedAt: entry ? entry.updated_at : null });
});

app.put('/api/entries/:date', requireAuth, async (req, res) => {
  const { date } = req.params;
  const { content } = req.body || {};
  if (!DATE_RE.test(date)) return res.status(400).json({ error: 'Data inválida.' });
  if (typeof content !== 'string') return res.status(400).json({ error: 'Conteúdo inválido.' });

  const saved = db.upsertEntry(date, content);
  const backup = await backupEntryToGithub(date, content);

  res.json({ ok: true, updatedAt: saved.updated_at, backup });
});

app.delete('/api/entries/:date', requireAuth, (req, res) => {
  const { date } = req.params;
  if (!DATE_RE.test(date)) return res.status(400).json({ error: 'Data inválida.' });
  db.deleteEntry(date);
  res.json({ ok: true });
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(PORT, () => {
  console.log(`[diario] servidor rodando na porta ${PORT}`);
});
