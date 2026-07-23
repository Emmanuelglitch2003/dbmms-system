// backend/api/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { testConnection } = require('../config/database');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['https://dbmms-system.vercel.app', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/members', require('../routes/memberRoutes'));
app.use('/api/reports', require('../routes/reportRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;