const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import models to register schemas
require('./models/User');
require('./models/Organization');
require('./models/Review');
require('./models/Roadshow');
require('./models/MOU');
require('./models/Country');
require('./models/IndustryCategory');

// Import routes
const organizationRoutes = require('./routes/organizationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const mouRoutes = require('./routes/mouRoutes');
const roadshowRoutes = require('./routes/roadshowRoutes');
const authRoutes = require('./routes/authRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "frame-ancestors": ["'self'", "http://localhost:5173"],
        },
    },
}));

// CORS configuration - must be before rate limiter
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later',
        errorCode: 42901
    }
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files - serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cwie_organization')
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        console.log(`📡 Database: ${mongoose.connection.db.databaseName}`);
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

// MongoDB connection events
mongoose.connection.on('disconnected', () => {
    console.log('❌ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to CWIE Organization Management API',
        version: '1.0.0',
        documentation: '/api',
        health: '/api/health',
        endpoints: {
            auth: '/api/auth',
            organizations: '/api/organizations',
            reviews: '/api/reviews',
            mou: '/api/mou',
            roadshows: '/api/roadshows'
        }
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/mou', mouRoutes);
app.use('/api/roadshows', roadshowRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// API info endpoint
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'CWIE Organization Management API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            organizations: '/api/organizations',
            reviews: '/api/reviews',
            mou: '/api/mou',
            roadshows: '/api/roadshows'
        }
    });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📍 Server URL: http://localhost:${PORT}`);
    console.log(`📋 API Documentation: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
        mongoose.connection.close();
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
        mongoose.connection.close();
        process.exit(0);
    });
});

module.exports = app;