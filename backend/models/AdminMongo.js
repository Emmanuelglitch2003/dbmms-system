// backend/models/AdminMongo.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'admin', 'viewer'], default: 'admin' },
    last_login_at: { type: Date, default: null },
    created_at: { type: Date, default: Date.now }
});

adminSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
};

module.exports = mongoose.model('Admin', adminSchema);