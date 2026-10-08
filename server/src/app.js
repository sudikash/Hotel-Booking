const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const bookingRoutes = require('./routes/booking.routes');
const uploadRoutes = require('./routes/upload.routes');


const app = express();

// Security Headers with cross-origin media support
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Dynamic CORS Origin Resolution
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        const envOrigins = process.env.CORS_ORIGIN 
            ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) 
            : [];
            
        if (
            envOrigins.includes(origin) ||
            process.env.NODE_ENV !== 'production' ||
            /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
            return callback(null, origin);
        }
        return callback(null, origin);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

// Static Files (Frontend)
const frontendPath = path.join(__dirname, '../../client/dist');
app.use(express.static(frontendPath));

// Health Check Endpoint for Deployment Probes (Render, Railway, Heroku, AWS)
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
    
    res.status(200).json({
        status: 'OK',
        appName: 'hotelbooking API',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: dbStatusMap[dbState] || 'Unknown'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/uploads', uploadRoutes);

// Catch-all for undefined API routes
app.use('/api', (req, res) => {
    res.status(404).json({ message: `API endpoint '${req.originalUrl}' not found.` });
});

// SPA Fallback: Serve index.html for all non-API GET requests
app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
        if (req.method === 'GET') {
            return res.sendFile(path.join(frontendPath, 'index.html'));
        }
        return res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
    }
    next();
});

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('[Global Error Handler]', err);
    res.status(err.status || 500).json({
        message: err.message || 'An unexpected error occurred on the server.',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});

module.exports = app;

