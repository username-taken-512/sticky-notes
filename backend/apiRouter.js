const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// For PostGre db
const db = require('./db');
const getDbPool = db.getDbPool;
const pool = getDbPool();

// Authentication middleware
const auth = require('./auth');
const authenticateToken = auth.authenticateToken;
router.use(authenticateToken);

router.get('/notes', async (req, res) => {
  res.json(await db.getNotes(pool, req.user.id));
});

// Create new note
router.post('/notes', async (req, res) => {
  let date = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" });
  let note = {
    content: req.body.content,
    dateCreated: date.substring(0, 16),
    userId: req.user.id
  }
  res.json(await db.createNote(pool, note));
});

// Edit an existing note
router.put('/notes/:uuid', async (req, res) => {
  let note = {
    uuid: req.params.uuid,
    content: req.body.content,
    date_due: req.body.dateDue || null,
    date_done: req.body.dateDone || null
  }
  const result = await db.updateNote(pool, note, req.user.id);

  // If result is empty, no row has been modified
  if (result === undefined) { res.status(304); };
  res.json(result);
});

// Delete an existing note
router.delete('/notes/:uuid', async (req, res) => {
  const result = await db.deleteNote(pool, req.params.uuid, req.user.id);

  // If result is empty, no row has been modified
  if (result === undefined) { res.status(304); };
  res.json(result);
});

module.exports = router;