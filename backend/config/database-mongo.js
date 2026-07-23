// backend/config/database-mongo.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Atlas connected!');
        console.log(`📊 Database: ${conn.connection.db.databaseName}`);
        console.log(`🔗 Host: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        throw error;
    }
};

// Helper functions
const query = async (model, filter = {}, options = {}) => {
    return await model.find(filter, options);
};

const queryOne = async (model, filter = {}) => {
    return await model.findOne(filter);
};

const generateMembershipId = async (Member) => {
    const year = new Date().getFullYear();
    const prefix = `DPB-${year}-`;
    
    const lastMember = await Member.findOne({
        membership_id: { $regex: `^${prefix}` }
    }).sort({ membership_id: -1 });
    
    let sequence = 1;
    if (lastMember && lastMember.membership_id) {
        const parts = lastMember.membership_id.split('-');
        if (parts.length === 3) {
            const lastSeq = parseInt(parts[2]);
            if (!isNaN(lastSeq)) {
                sequence = lastSeq + 1;
            }
        }
    }
    
    return `${prefix}${String(sequence).padStart(4, '0')}`;
};

module.exports = {
    connectDB,
    query,
    queryOne,
    generateMembershipId
};