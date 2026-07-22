// backend/controllers/memberController.js
const { query, queryOne, generateMembershipId } = require('../config/database');

// ============================================
// GET ALL MEMBERS
// ============================================
const getMembers = async (req, res) => {
    try {
        const { search, status, page = 1, limit = 20 } = req.query;
        let conditions = [];
        let params = [];
        
        if (search) {
            conditions.push('(membership_id LIKE ? OR full_name LIKE ? OR phone_call LIKE ? OR email LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        if (status) {
            conditions.push('status = ?');
            params.push(status);
        }
        
        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        const sql = `
            SELECT * FROM members 
            ${whereClause} 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;
        
        const countSql = `SELECT COUNT(*) as total FROM members ${whereClause}`;
        
        const members = await query(sql, [...params, parseInt(limit), offset]);
        const countResult = await queryOne(countSql, params);
        
        res.json({
            members,
            pagination: {
                total: countResult?.total || 0,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil((countResult?.total || 0) / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// ============================================
// GET SINGLE MEMBER
// ============================================
const getMember = async (req, res) => {
    try {
        const { id } = req.params;
        const member = await queryOne('SELECT * FROM members WHERE id = ?', [id]);
        
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        res.json({ member });
    } catch (error) {
        console.error('Get member error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// ============================================
// CREATE MEMBER - Supports Manual ID
// ============================================
const createMember = async (req, res) => {
    try {
        const memberData = req.body;
        console.log('📝 Creating member with data:', memberData);
        
        // Check if membership_id was provided manually
        let membership_id = memberData.membership_id;
        
        if (membership_id && membership_id.trim() !== '') {
            membership_id = membership_id.trim();
            console.log('📝 Using manual membership ID:', membership_id);
            
            const existing = await queryOne(
                'SELECT id FROM members WHERE membership_id = ?',
                [membership_id]
            );
            if (existing) {
                return res.status(400).json({ 
                    error: 'Membership ID already exists. Please use a different ID or leave empty for auto-generation.' 
                });
            }
        } else {
            membership_id = await generateMembershipId();
            console.log('📝 Auto-generated membership ID:', membership_id);
        }
        
        // Handle 'Other' instrument
        let instrument = memberData.instrument;
        if (instrument === 'Other' && memberData.other_instrument) {
            instrument = memberData.other_instrument;
        }
        
        let approved_by = null;
        if (memberData.status === 'approved') {
            approved_by = req.adminId || null;
        }
        
        const toNull = (value) => {
            if (value === undefined || value === null || value === '') {
                return null;
            }
            return value;
        };
        
        const sql = `
            INSERT INTO members (
                membership_id, full_name, date_of_birth, gender, nationality,
                phone_call, whatsapp, email, digital_address,
                institution, level_program, occupation,
                instrument, other_instrument, years_experience,
                previous_band, reason_joining,
                emergency_name, emergency_relationship, emergency_phone,
                date_received, approved_by, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            membership_id,
            toNull(memberData.full_name),
            toNull(memberData.date_of_birth),
            toNull(memberData.gender),
            toNull(memberData.nationality),
            toNull(memberData.phone_call),
            toNull(memberData.whatsapp),
            toNull(memberData.email),
            toNull(memberData.digital_address),
            toNull(memberData.institution),
            toNull(memberData.level_program),
            toNull(memberData.occupation),
            toNull(instrument),
            toNull(memberData.other_instrument),
            toNull(memberData.years_experience) || 0,
            toNull(memberData.previous_band),
            toNull(memberData.reason_joining),
            toNull(memberData.emergency_name),
            toNull(memberData.emergency_relationship),
            toNull(memberData.emergency_phone),
            toNull(memberData.date_received),
            toNull(approved_by),
            toNull(memberData.status) || 'pending'
        ];
        
        console.log('📊 SQL Values:', values);
        
        const result = await query(sql, values);
        console.log('✅ Member inserted, ID:', result.insertId);
        
        const newMember = await queryOne('SELECT * FROM members WHERE id = ?', [result.insertId]);
        
        res.status(201).json({
            message: 'Member created successfully',
            member: newMember,
            autoGenerated: !memberData.membership_id || memberData.membership_id.trim() === ''
        });
    } catch (error) {
        console.error('❌ Create member error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                error: 'Membership ID already exists. Please use a different ID or leave empty for auto-generation.' 
            });
        }
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};

// ============================================
// UPDATE MEMBER
// ============================================
const updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        delete updateData.membership_id;
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        const toNull = (value) => {
            if (value === undefined || value === null || value === '') {
                return null;
            }
            return value;
        };
        
        const fields = [];
        const values = [];
        
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(toNull(updateData[key]));
            }
        });
        
        values.push(id);
        const sql = `UPDATE members SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
        await query(sql, values);
        
        const updatedMember = await queryOne('SELECT * FROM members WHERE id = ?', [id]);
        res.json({
            message: 'Member updated successfully',
            member: updatedMember
        });
    } catch (error) {
        console.error('Update member error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// ============================================
// DELETE MEMBER
// ============================================
const deleteMember = async (req, res) => {
    try {
        const { id } = req.params;
        
        const member = await queryOne('SELECT membership_id, full_name FROM members WHERE id = ?', [id]);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        await query('DELETE FROM members WHERE id = ?', [id]);
        
        res.json({
            message: 'Member deleted successfully',
            deleted_member: member
        });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// ============================================
// GET MEMBER STATISTICS
// ============================================
const getMemberStats = async (req, res) => {
    try {
        const [total, male, female, pending, approved, rejected] = await Promise.all([
            queryOne('SELECT COUNT(*) as count FROM members'),
            queryOne("SELECT COUNT(*) as count FROM members WHERE gender = 'Male'"),
            queryOne("SELECT COUNT(*) as count FROM members WHERE gender = 'Female'"),
            queryOne("SELECT COUNT(*) as count FROM members WHERE status = 'pending'"),
            queryOne("SELECT COUNT(*) as count FROM members WHERE status = 'approved'"),
            queryOne("SELECT COUNT(*) as count FROM members WHERE status = 'rejected'")
        ]);
        
        const today = new Date().toISOString().split('T')[0];
        const todayRegistrations = await queryOne(
            'SELECT COUNT(*) as count FROM members WHERE DATE(created_at) = ?',
            [today]
        );
        
        res.json({
            stats: {
                total: total?.count || 0,
                male: male?.count || 0,
                female: female?.count || 0,
                pending: pending?.count || 0,
                approved: approved?.count || 0,
                rejected: rejected?.count || 0,
                today_registrations: todayRegistrations?.count || 0
            }
        });
    } catch (error) {
        console.error('Get member stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getMembers,
    getMember,
    createMember,
    updateMember,
    deleteMember,
    getMemberStats
};