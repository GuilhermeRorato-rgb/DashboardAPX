const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Configuração ──────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) console.warn('[AVISO] Defina a variável ADMIN_PASSWORD!');

// ── Supabase (storage persistente, recomendado no Render) ─────────────────────
// Configure as variáveis SUPABASE_URL e SUPABASE_KEY para ativar.
// Sem elas, o servidor usa um arquivo local (funciona no Railway/VPS).
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const USE_SUPABASE = !!(SUPABASE_URL && SUPABASE_KEY);

const DATA_DIR  = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'dashboard.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ── Helpers de leitura / escrita ──────────────────────────────────────────────
async function readData() {
  if (USE_SUPABASE) {
    const r = await fetch(
      `${SUPABASE_URL}/storage/v1/object/apex-dashboard/data.json`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`Supabase read error: ${r.status}`);
    return await r.json();
  }
  if (!fs.existsSync(DATA_FILE)) return null;
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

async function writeData(payload) {
  if (USE_SUPABASE) {
    const r = await fetch(
      `${SUPABASE_URL}/storage/v1/object/apex-dashboard/data.json`,
      {
        method : 'POST',
        headers: {
          apikey        : SUPABASE_KEY,
          Authorization : `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'x-upsert'    : 'true',
        },
        body: JSON.stringify(payload),
      }
    );
    if (!r.ok) {
      const msg = await r.text().catch(() => r.status);
      throw new Error(`Supabase write error: ${msg}`);
    }
    return;
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(payload));
}

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── GET /api/data — público ───────────────────────────────────────────────────
app.get('/api/data', async (req, res) => {
  try {
    const data = await readData();
    res.json(data ?? null);
  } catch (e) {
    console.error('Erro ao ler dados:', e.message);
    res.status(500).json({ error: 'Erro interno ao ler dados.' });
  }
});

// ── POST /api/data — somente admin ───────────────────────────────────────────
app.post('/api/data', async (req, res) => {
  const pwd      = req.headers['x-admin-password'];
  const expected = ADMIN_PASSWORD || 'apex@2024';

  if (!pwd || pwd !== expected) {
    return res.status(401).json({ error: 'Senha incorreta.' });
  }
  if (!req.body || !Array.isArray(req.body.data)) {
    return res.status(400).json({ error: 'Payload inválido.' });
  }

  try {
    await writeData(req.body);
    console.log(`[${new Date().toISOString()}] Publicado — ${req.body.data.length} ativos.`);
    res.json({ ok: true });
  } catch (e) {
    console.error('Erro ao salvar dados:', e.message);
    res.status(500).json({ error: 'Erro ao salvar: ' + e.message });
  }
});

// ── Healthcheck (para UptimeRobot manter o serviço acordado) ─────────────────
app.get('/ping', (req, res) => res.send('ok'));

// ── Fallback → index.html ─────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  const storage = USE_SUPABASE ? 'Supabase' : 'arquivo local';
  console.log(`Apex Dashboard → porta ${PORT} | storage: ${storage}`);
});
