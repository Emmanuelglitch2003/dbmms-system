// backend/controllers/authControllerMongo.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminMongo');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('🔐 Login attempt:', username);

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const admin = await Admin.findOne({ 
            $or: [{ username: username }, { email: username }]
        });

        if (!admin) {
            console.log('❌ User not found:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            console.log('❌ Invalid password for:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        admin.last_login_at = new Date();
        await admin.save();

        const token = jwt.sign(
            {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                full_name: admin.full_name
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Login successful:', admin.username);

        res.json({
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                full_name: admin.full_name,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error.message);
        res.status(500).json({ error: 'Server error during login' });
    }
};

const checkAuth = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.json({ authenticated: false });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await Admin.findById(decoded.id).select('-password_hash');

        if (!admin) {
            return res.json({ authenticated: false });
        }

        res.json({
            authenticated: true,
            admin: {
                id: admin._id,
                full_name: admin.full_name,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.log('❌ Auth check error:', error.message);
        res.json({ authenticated: false });
    }
};

module.exports = {
    login,
    checkAuth
};