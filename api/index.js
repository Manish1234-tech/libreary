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

// CORS configuration - allow frontend origins and Vercel preview domains
const allowedOrigins = [
  'https://libreary.vercel.app',
  'https://libreary-gqj4.vercel.app',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    // allow listed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    // allow any Vercel preview or production domain under vercel.app
    try {
      const url = new URL(origin);
      if (url.hostname && url.hostname.endsWith('.vercel.app')) return callback(null, true);
    } catch (e) {
      // ignore parse error
    }
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Make sure preflight requests are handled
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Session middleware (note: for serverless, consider persistent store)
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

// DB connection caching for serverless
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

// Initialize passport config if available
try {
  const initializePassport = require('../server/passport-config');
  initializePassport(passport);
} catch (e) {
  console.warn('Could not load passport-config:', e && e.message);
}

// Mount routers
try {
  app.use('/auth', require('../server/routes/authRouter'));
  app.use('/book', require('../server/routes/bookRouter'));
  app.use('/author', require('../server/routes/authorRouter'));
  app.use('/borrowal', require('../server/routes/borrowalRouter'));
  app.use('/genre', require('../server/routes/genreRouter'));
  app.use('/user', require('../server/routes/userRouter'));
  app.use('/review', require('../server/routes/reviewRouter'));
} catch (err) {
  console.warn('Could not mount some routers:', err && err.message);
}

app.get('/', (req, res) => res.send('Express running on Vercel 🚀'));

module.exports = app;
