const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();

// API Routes
const loginRouter = require('./backend/loginRouter');
app.use('/api/users', loginRouter);

const apiRouter = require('./backend/apiRouter');
app.use('/api', apiRouter);

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));