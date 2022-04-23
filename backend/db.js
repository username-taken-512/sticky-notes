// Dabatase interaction

function getDbPool() {
  // Creates and/or returns connection pool for db
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://qbuwogoactaler:789dbde528d3bca42c8642c82f0a6bf98f9364bc508733f7b6513cfc9af89caf@ec2-34-246-227-219.eu-west-1.compute.amazonaws.com:5432/d4ceut2b8fdle3',
    ssl: {
      rejectUnauthorized: false
    }
  });
  return pool;
}

async function dbTest(pool) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users');
    const results = { 'results': (result) ? result.rows : null };
    client.release();
    return results;
  } catch (error) {
    console.error(error);
    return { _error: 'error' };
  }
}

// Create new user
async function createUser(pool, user) {
  const text = `INSERT INTO users (username, password, first_name, last_name) 
                VALUES($1, $2, $3, $4) RETURNING *`;
  const values = [user.username, user.password, user.first_name, user.last_name];

  return await runQuery(pool, text, values, false);
}

// Get single user by username
async function getUser(pool, username) {
  const text = `SELECT * FROM users WHERE username = $1`;
  const values = [username];

  return await runQuery(pool, text, values, true);
}

// Updates refreshToken on user in db
async function updateUserRefreshToken(pool, userId, refreshToken) {
  const text = `UPDATE users SET refresh_token = $2 WHERE id = $1;`;
  const values = [userId, refreshToken];

  return await runQuery(pool, text, values, true);
}

// Get all notes for a user
async function getNotes(pool, userId) {
  const text = `SELECT * FROM notes WHERE user_id = $1`;
  const values = [userId];

  return await runQuery(pool, text, values, false);
}

// Create a new note
async function createNote(pool, note) {
  const text = `INSERT INTO notes (color, body, date_created, user_id)
                VALUES ($1, $2, $3, $4)
                RETURNING *`;
  const values = [note.color, note.body, note.dateCreated, note.userId];
  return await runQuery(pool, text, values, true);
}

// Runs the query in db
async function runQuery(pool, text, values, singleResult = false) {
  try {
    const client = await pool.connect();
    const result = await client.query(text, values);

    let results;
    if (singleResult) {
      results = { 'results': (result) ? result.rows[0] : null };
    } else {
      results = { 'results': (result) ? result.rows : null };
    }
    client.release();
    return results;
  } catch (error) {
    console.error(error);
    return { _error: 'db error' };
  }
}

module.exports = {
  getDbPool: getDbPool,
  dbTest: dbTest,
  createUser: createUser,
  getUser: getUser,
  updateUserRefreshToken: updateUserRefreshToken,
  getNotes: getNotes,
  createNote: createNote
};