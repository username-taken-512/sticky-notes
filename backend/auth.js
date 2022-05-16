// Methods below are used to generate and verify authentication tokens (JWT)

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Header format: 'Bearer [token]' (example: 'Bearer DFQ512112DFSDFASFWEFG123123SDFSADF')
  const token = authHeader && authHeader.split(' ')[1]; // Get only the [token] part

  if (token === null) {
    return res.status(401).json({ _error: 'A token is required' });
  }   // If no token in header, return error

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) {
      return res.status(403).json({ _error: 'Invalid token' });
    }  // If authentication failed, return error

    req.user = user;
    delete req.user.refresh_token;

    next(); // If valid token, continue to the desired route
  })
}

// Generate token (login)
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30min' });
}

module.exports = {
  authenticateToken: authenticateToken,
  generateAccessToken: generateAccessToken,
};