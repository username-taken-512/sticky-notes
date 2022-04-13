const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// For PostGre db
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'database-url',
  ssl: {
    rejectUnauthorized: false
  }
});

router.get('/dbTest', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM User');
    const results = { 'results': (result) ? result.rows : null };
    res.json(results);
    client.release();
  } catch (err) {
    console.error(err);
    res.json({ _error: 'error' });
  }
});

module.exports = router;