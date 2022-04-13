const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// For PostGre db
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://qbuwogoactaler:789dbde528d3bca42c8642c82f0a6bf98f9364bc508733f7b6513cfc9af89caf@ec2-34-246-227-219.eu-west-1.compute.amazonaws.com:5432/d4ceut2b8fdle3',
  ssl: {
    rejectUnauthorized: false
  }
});

router.get('/dbTest', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users');
    const results = { 'results': (result) ? result.rows : null };
    res.json(results);
    client.release();
  } catch (err) {
    console.error(err);
    res.json({ _error: 'error' });
  }
});

module.exports = router;