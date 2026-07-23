// backend/models/ActivityLogMongo.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    action: { type: String, required: true },
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    ip_address: { type: String, required: true },
    user_agent: { type: String, default: null },
    details: { type: mongoose.Schema.Types.Mixed, default: null },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);