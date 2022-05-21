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

// For GA Reporting API interaction
const ga = require('./gaReporting');
const getVisitorData30Days = ga.getVisitorData30Days;

router.get('/notes', async (req, res) => {
  res.json(await db.getNotes(pool, req.user.id));
});

// Create new note
router.post('/notes', async (req, res) => {
  console.log(req);
  let date = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" });
  let note = {
    content: req.body.content,
    dateCreated: date.substring(0, 16),
    dateDue: req.body.date_due,
    userId: req.user.id
  }
  res.json(await db.createNote(pool, note));
});

// Edit an existing note
router.put('/notes/:uuid', async (req, res) => {
  let note = {
    uuid: req.params.uuid,
    content: req.body.content,
    dateDue: req.body.date_due,
    dateDone: req.body.date_done
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

// Returns notes summary statistics for the user
router.get('/notes/summary', async (req, res) => {
  res.json(await db.getNotesSummary(pool, req.user.id));
});

// Returns GA site statistics - all
router.get('/statistics', async (req, res) => {
  res.json(await getVisitorData30Days());
});

// Returns GA site statistics - browsers
router.get('/statistics/browsers', async (req, res) => {
  // 'dimensions': 'ga:deviceCategory,ga:operatingSystem,ga:browser,ga:browserVersion,ga:region,ga:language'
  const data = await getVisitorData30Days();
  let processedData = {};

  data.forEach(element => {
    if (!processedData[element[2]]) {
      processedData[element[2]] = parseInt(0);
    }
    processedData[element[2]] += parseInt(element[6]);
  });
  res.json(processedData);
});

module.exports = router;