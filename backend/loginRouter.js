// Router for login / register routes

// Imports for JWT / hashing
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = require('./auth')
const authenticateToken = auth.authenticateToken;
const generateAccessToken = auth.generateAccessToken;

// Express imports / setup
const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// For PostGre db
const db = require('./db');
const getDbPool = db.getDbPool;
const pool = getDbPool();

//let refreshTokens = []; // Store in db?

// Returns user info
router.get('/', authenticateToken, async (req, res) => {
  const user = (await db.getUser(pool, req.user.username)).results || null;
  if (user.password) { delete user.password; } // Delete password before sending
  res.json(user);
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const salt = await bcrypt.genSalt();  // Generate salt
    const hashedPassword = await bcrypt.hash(req.body.password, salt);  // Hash password

    const user = {
      username: req.body.username,
      password: hashedPassword,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
    };
    const results = await db.createUser(pool, user);
    delete results.password;

    if (!(results._error)) {
      res.status(201).json({ result: 'User created' });
    } else {
      res.status(500).json({ _error: 'db error' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ _error: 'error' });
  }
});

// Login - Sends accessToken and refreshToken
router.post('/login', async (req, res) => {
  // Get user from database
  const user = (await db.getUser(pool, req.body.username)).results || null;

  // If user doesn't exist
  if (user === null) {
    res.status(403).json({ _error: 'Invalid credentials' });
    return;
  }

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {

      // Generate token
      const accessToken = generateAccessToken({ username: user.username, id: user.id });
      const refreshToken = jwt.sign({ username: user.username, id: user.id }, process.env.REFRESH_TOKEN_SECRET);
      //refreshTokens.push(refreshToken);

      const result = db.updateUserRefreshToken(pool, 4, refreshToken);

      res.json({ accessToken: accessToken, refreshToken: refreshToken });
    } else {
      res.status(403).json({ _error: 'Invalid credentials' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ _error: 'error' });
  }
});

// Logout 
router.delete('/login', (req, res) => {
  //refreshTokens = refreshTokens.filter(token => token !== req.body.token);

  jwt.verify(req.body.token, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
    console.log(user);
    if (!error) {
      db.updateUserRefreshToken(pool, user.id, '');
      res.status(204).json({ result: 'Logged out successfully' });
    } else {
      res.status(400).json({ result: 'Invalid token for logout' });
    }
  });
});


// Refresh accessToken by using refreshToken
router.post('/token', (req, res) => {
  const refreshToken = req.body.token;

  // If refresh token is not included or is not valid, return error
  if (refreshToken === null) { return res.status(401).json({ _error: 'A refresh token must be included' }); }
  //if (!refreshTokens.includes(refreshToken)) { return res.status(403).json({ _error: 'Valid refresh token required' }); }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) { return res.status(403).json({ _error: 'Valid refresh token required' }); }

    // Return a newly generated access token
    const accessToken = generateAccessToken({ username: user.username, id: user.id });
    res.json({ accessToken: accessToken });
  });
});

module.exports = router;