const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// For PostGre db
const db = require('./db');
const getDbPool = db.getDbPool;
const pool = getDbPool();

const dbTest = db.dbTest;

// Authentication middleware
const auth = require('./auth');
const authenticateToken = auth.authenticateToken;
router.use(authenticateToken);

router.get('/dbTest', async (req, res) => {
  res.json(await dbTest(pool));
});

router.get('/note', async (req, res) => {
  res.json(await db.getNotes(pool, req.user.id));
});

module.exports = router;