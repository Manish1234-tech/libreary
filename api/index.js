const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

// Simple mongoose connection caching for serverless
const MONGO_URI = process.env.MONGO_URI;
async function connectDB() {
  if (!MONGO_URI) {
    console.warn('MONGO_URI not set — skipping DB connect');
    return;
  }
  if (global._mongoClientPromise) return global._mongoClientPromise;
  global._mongoClientPromise = mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await global._mongoClientPromise;
    console.log('Connected to DB');
  } catch (err) {
    console.log('DB connection error', err);
  }
}
connectDB();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-me',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(passport.initialize());
app.use(passport.session());

// Initialize passport config from server folder
try {
  const initializePassport = require('../server/passport-config');
  initializePassport(passport);
} catch (e) {
  console.warn('Could not load passport-config from server/:', e && e.message);
}

// Mount routers from `server/routes` without `/api` prefix — Vercel will route `/api/*` here
try {
  app.use('/auth', require('../server/routes/authRouter'));
  app.use('/book', require('../server/routes/bookRouter'));
  app.use('/author', require('../server/routes/authorRouter'));
  app.use('/borrowal', require('../server/routes/borrowalRouter'));
  app.use('/genre', require('../server/routes/genreRouter'));
  app.use('/user', require('../server/routes/userRouter'));
  app.use('/review', require('../server/routes/reviewRouter'));
} catch (err) {
  console.warn('Could not mount some routers from server/:', err && err.message);
}

app.get('/', (req, res) => res.send('Express running on Vercel 🚀'));

module.exports = app;
