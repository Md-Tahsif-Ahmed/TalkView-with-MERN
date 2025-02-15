import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import passport from 'passport'
import session from 'express-session';
import { generateToken } from './middleware/token.js';
import crypto from 'crypto';

// Auth
import register from './routes/auth/register.js';
import login from './routes/auth/login.js';
import logout from './routes/auth/logout.js';
import load_user from './routes/auth/load_user.js';

// Social
import follow_user from './routes/social/follow_user.js';
import create_post from './routes/feed/create_post.js';
import create_feed from './routes/feed/create_feed.js';
import get_posts from './routes/feed/get_posts.js';
import giphy_search from './routes/feed/giphy_search.js';
import giphy_trending from './routes/feed/giphy_trending.js';
import get_profile from './routes/social/get_profile.js';
import online_users from './routes/social/online_users.js';
import upvote_post from './routes/feed/upvote_post.js';
import downvote_post from './routes/feed/downvote_post.js';
import edit_post from './routes/feed/edit_post.js';
import delete_post from './routes/feed/delete_post.js';

// Profile
import edit_profile from './routes/profile/edit_profile.js';

// Sockets
import { Server } from 'socket.io';
import newConnection from './sockets/handlers/new_connection.js';

// Middleware
// import tracker from './middleware/tracker.js';
import { verifyToken } from './middleware/token.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Update the security headers middleware
app.use((req, res, next) => {
    // Generate a unique nonce for each request
    const nonce = crypto.randomBytes(16).toString('base64');
    
    res.header('Content-Security-Policy', 
        "default-src 'self' https://*.facebook.com; " +
        `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}' ` +
        "https://*.facebook.com https://*.fbcdn.net https://*.facebook.net " +
        "https://connect.facebook.net https://*.google-analytics.com https://*.google.com; " +
        "style-src 'self' 'unsafe-inline' https://*.facebook.com; " +
        "img-src 'self' data: blob: https://*.facebook.com https://*.fbcdn.net https://*.facebook.net; " +
        "font-src 'self' data: https://*.facebook.com https://*.fbcdn.net https://*.facebook.net; " +
        "connect-src 'self' https://*.facebook.com https://*.fbcdn.net https://*.facebook.net; " +
        "frame-src 'self' https://*.facebook.com https://www.facebook.com; " +
        "media-src 'self' https://*.facebook.com https://*.fbcdn.net;"
    );
    
    // Make nonce available to your views/templates if needed
    res.locals.nonce = nonce;
    next();
});

// Session configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

// Initialize passport with session support
app.use(passport.initialize());
app.use(passport.session());

// Apply rate limiter only to registration to prevent abuse
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 registration requests per hour
  message: 'Too many registration attempts, please try again later',
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
});

const dbURI =
  process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : process.env.DEV_DB_URI;
const devOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const prodOrigins = ['https://talktobeavs.onrender.com'];
export const FEED_ID = process.env.NODE_ENV === 'production' ? process.env.FEED_ID : process.env.DEV_DB_FEED_ID;
const origin = process.env.NODE_ENV === 'production' ? prodOrigins : devOrigins;

app.disable('x-powered-by');
app.use(
    cors({
        origin: origin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        optionsSuccessStatus: 200,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(tracker)

// Routes
// app.use('/api', limiter);
app.use('/api/auth/register', registrationLimiter, register);
app.use('/api/auth/login', login);
app.use('/api/auth/logout', logout);
app.use('/api/auth/load_user', verifyToken, load_user);
app.get('/api/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);
app.get('/api/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
        session: false
    }),
    (req, res) => {
        try {
            const token = generateToken(req.user);
            const { password, ...userWithoutPassword } = req.user.toObject();
            
            res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}`);
        } catch (error) {
            console.error('Callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
        }
    }
);

// Add these Facebook routes after your Google routes
app.get('/api/auth/facebook',
    passport.authenticate('facebook', {
        scope: ['email', 'public_profile']
    })
);

app.get('/api/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
        session: false
    }),
    (req, res) => {
        try {
            const token = generateToken(req.user);
            const { password, ...userWithoutPassword } = req.user.toObject();
            
            res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}`);
        } catch (error) {
            console.error('Facebook Callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
        }
    }
);

app.use('/api/social/follow_user', verifyToken, follow_user);
app.use('/api/social/get_profile', verifyToken, get_profile);
app.use('/api/social/online_users', verifyToken, online_users);

app.use('/api/feed/create_post', verifyToken, create_post);
app.use('/api/feed/create_feed', verifyToken, create_feed);
app.use('/api/feed/get_posts', verifyToken, get_posts);
app.use('/api/feed/giphy_search', verifyToken, giphy_search);
app.use('/api/feed/giphy_trending', verifyToken, giphy_trending);
app.use('/api/feed/upvote_post', verifyToken, upvote_post);
app.use('/api/feed/downvote_post', verifyToken, downvote_post);
app.use('/api/feed/edit_post', verifyToken, edit_post);
app.use('/api/feed/delete_post', verifyToken, delete_post);
app.use('/api/profile/edit_profile', verifyToken, edit_profile);

// Default Route
app.get('/', (req, res) => {
  res.send('Hello TalkToBeavs!');
});
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('[Backend ⚡️]: Connected to MongoDB');
  })
  .catch((err) => {
    console.log(err);
  });

const server = app.listen(PORT, () => {
  console.log(`[Backend ⚡️]: Server is running on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: origin,
  },
});

io.on('connection', (socket) => {
  newConnection(socket, io);
});
