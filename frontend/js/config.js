// backend/config/database.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dbmms',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Execute query
const query = async (sql, params = []) => {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Query error:', error.message);
        throw error;
    }
};

// Get single row
const queryOne = async (sql, params = []) => {
    const rows = await query(sql, params);
    return rows[0] || null;
};

// Generate membership ID
const generateMembershipId = async () => {
    const year = new Date().getFullYear();
    const prefix = `DPB-${year}-`;
    
    const sql = `SELECT membership_id FROM members WHERE membership_id LIKE ? ORDER BY membership_id DESC LIMIT 1`;
    const result = await queryOne(sql, [`${prefix}%`]);
    
    let sequence = 1;
    if (result && result.membership_id) {
        const parts = result.membership_id.split('-');
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
    pool,
    query,
    queryOne,
    testConnection,
    generateMembershipId
};