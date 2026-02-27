const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ─── Database Setup ───
let db = null;
let useMemory = true;
let memoryCards = [];

if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  useMemory = false;
}

async function initDB() {
  if (!db) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      company_name TEXT DEFAULT '',
      site_name TEXT NOT NULL,
      product_name TEXT NOT NULL,
      construction_date TEXT DEFAULT '',
      arrival_date TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'estimate_request',
      notes TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('PostgreSQL connected & cards table ready');
}

// ─── API Routes ───

// GET /api/cards — 全カード取得
app.get('/api/cards', async (req, res) => {
  try {
    if (useMemory) {
      return res.json(memoryCards);
    }
    const result = await db.query('SELECT * FROM cards ORDER BY created_at ASC');
    const cards = result.rows.map(row => ({
      id: row.id,
      companyName: row.company_name,
      siteName: row.site_name,
      productName: row.product_name,
      constructionDate: row.construction_date,
      arrivalDate: row.arrival_date,
      status: row.status,
      notes: row.notes
    }));
    res.json(cards);
  } catch (err) {
    console.error('GET /api/cards error:', err);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// POST /api/cards — 新規カード作成
app.post('/api/cards', async (req, res) => {
  try {
    const { id, companyName, siteName, productName, constructionDate, arrivalDate, status, notes } = req.body;
    if (useMemory) {
      memoryCards.push(req.body);
      return res.json(req.body);
    }
    await db.query(
      `INSERT INTO cards (id, company_name, site_name, product_name, construction_date, arrival_date, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, companyName || '', siteName, productName, constructionDate || '', arrivalDate || '', status, notes || '']
    );
    res.json(req.body);
  } catch (err) {
    console.error('POST /api/cards error:', err);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// PUT /api/cards/:id — カード更新
app.put('/api/cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, siteName, productName, constructionDate, arrivalDate, status, notes } = req.body;
    if (useMemory) {
      memoryCards = memoryCards.map(c => c.id === id ? req.body : c);
      return res.json(req.body);
    }
    await db.query(
      `UPDATE cards SET company_name=$1, site_name=$2, product_name=$3, construction_date=$4, arrival_date=$5, status=$6, notes=$7
       WHERE id=$8`,
      [companyName || '', siteName, productName, constructionDate || '', arrivalDate || '', status, notes || '', id]
    );
    res.json(req.body);
  } catch (err) {
    console.error('PUT /api/cards/:id error:', err);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// DELETE /api/cards/:id — カード削除
app.delete('/api/cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (useMemory) {
      memoryCards = memoryCards.filter(c => c.id !== id);
      return res.json({ success: true });
    }
    await db.query('DELETE FROM cards WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/cards/:id error:', err);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// ─── Start Server ───
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Storage: ${useMemory ? 'In-Memory (no DATABASE_URL)' : 'PostgreSQL'}`);
    });
  })
  .catch(err => {
    console.error('DB init failed:', err);
    process.exit(1);
  });
