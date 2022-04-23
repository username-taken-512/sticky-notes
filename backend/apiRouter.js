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

// Create new note
router.post('/note', async (req, res) => {
  let date = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" });
  let note = {
    color: req.body.color,
    body: req.body.body,
    dateCreated: date.substring(0, 16),
    userId: req.user.id
  }
  res.json(await db.createNote(pool, note));
});

// Edit an existing note
router.put('/note/:uuid', async (req, res) => {
  let note = {
    uuid: req.params.uuid,
    color: req.body.color,
    body: req.body.body,
    date_due: req.body.dateDue || null,
    date_done: req.body.dateDone || null
  }
  const result = await db.updateNote(pool, note, req.user.id);

  // If result.results is empty, no row has been modified
  if (result.results === undefined) { res.status(304); };
  res.json(result);
});

// Delete an existing note
router.delete('/note/:uuid', async (req, res) => {
  const result = await db.deleteNote(pool, req.params.uuid, req.user.id);

  // If result.results is empty, no row has been modified
  if (result.results === undefined) { res.status(304); };
  res.json(result);
});

module.exports = router;