require('dotenv').config();
const app = require('./src/app');
const connectDb = require('./src/config/db');

const PORT = process.env.PORT || 8080;

// Start accepting requests only after MongoDB is ready.
let server;
connectDb()
    .then(() => {
        server = app.listen(PORT, () => {
            console.log(`🚀 [hotel booking Server] Listening on port ${PORT} (${process.env.NODE_ENV || 'development'} mode)`);
        });
    })
    .catch((error) => {
        console.error('[Startup Error] Database connection failed:', error.message);
        process.exitCode = 1;
    });

// Process Error Handlers for Production Resilience
process.on('unhandledRejection', (err) => {
    console.error('💥 UNHANDLED REJECTION! Shutting down gracefully...', err);
    if (server) server.close(() => process.exit(1));
    else process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION! Shutting down...', err);
    process.exit(1);
});

// Graceful Termination              (Container / Hosting Platforms)
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    if (server) {
        server.close(() => {
            console.log('💥 Process terminated!');
        });
    }
});
