// backend/models/MemberMongo.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    membership_id: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    date_of_birth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    nationality: { type: String, required: true },
    phone_call: { type: String, required: true },
    whatsapp: { type: String, required: true },
    email: { type: String, default: null },
    digital_address: { type: String, default: null },
    institution: { type: String, default: null },
    level_program: { type: String, default: null },
    occupation: { type: String, default: null },
    instrument: { type: String, required: true },
    other_instrument: { type: String, default: null },
    years_experience: { type: Number, default: 0 },
    previous_band: { type: String, default: null },
    reason_joining: { type: String, default: null },
    emergency_name: { type: String, required: true },
    emergency_relationship: { type: String, required: true },
    emergency_phone: { type: String, required: true },
    date_received: { type: Date, required: true },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    photo_url: { type: String, default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

memberSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Member', memberSchema);