// Import required modules
const express = require('express');
const cors = require('cors');
const logger = require('morgan')
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");

// Import routers
const authRouter = require("./routes/authRouter")
const bookRouter = require("./routes/bookRouter")
const authorRouter = require("./routes/authorRouter")
const borrowalRouter = require("./routes/borrowalRouter")
const genreRouter = require("./routes/genreRouter") 
const userRouter = require("./routes/userRouter") 
const reviewRouter = require("./routes/reviewRouter")

// Configure dotenv for environment variables in production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Setup express
const app = express();
const PORT = process.env.PORT || 8080

// Use morgan for logging
app.use(logger("dev"))

// Set middleware to process form data
app.use(express.urlencoded({extended: false}));

// Connect to DB
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to DB on MongoDB Atlas')
  })
  .catch((err) => console.log('DB connection error', err));

// Update CORS to allow localhost and deployed URL (read from env), and allow Vercel previews:
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  'https://libreary-2wdhpoedy-manishs-projects-33afb6d3.vercel.app',
  'https://libreary-git-main-manishs-projects-33afb6d3.vercel.app',
  'https://libreary.vercel.app'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS: allowing origin', origin);
      return callback(null, true);
    }

    // Allow Vercel preview domains automatically (e.g., <name>.vercel.app)
    try {
      const host = new URL(origin).host;
      if (host && host.endsWith('.vercel.app')) {
        console.log('CORS: allowing vercel origin', origin);
        return callback(null, true);
      }
    } catch (e) {
      // ignore URL parse errors
    }

    // Allow localhost with any port
    if (/https?:\/\/localhost(:\d+)?/.test(origin)) {
      console.log('CORS: allowing localhost origin', origin);
      return callback(null, true);
    }

    console.warn('CORS: blocking origin', origin);
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Set middleware to manage sessions
// When behind a proxy (e.g., Render) and serving over HTTPS, enable trust proxy
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      httpOnly: true,
    },
  })
);

// Parse cookies used for session management
app.use(cookieParser(process.env.SESSION_SECRET));

// Parse JSON objects in request bodies
app.use(express.json())

// Use passport authentication middleware
app.use(passport.initialize());
app.use(passport.session());

// Initialise passport as authentication middleware
const initializePassport = require("./passport-config");
initializePassport(passport);

// Implement routes for REST API
app.use("/api/auth", authRouter)
app.use("/api/book", bookRouter);
app.use("/api/author", authorRouter);
app.use("/api/borrowal", borrowalRouter);
app.use("/api/genre", genreRouter);
app.use("/api/user", userRouter); 
app.use("/api/review", reviewRouter);

app.get('/', (req, res) => res.send('Welcome to Library Management System'));

// Bind the server to the port provided by the environment (Render sets PORT). This must be enabled
// for the platform to detect an open port.
app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
