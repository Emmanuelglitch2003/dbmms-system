// backend/controllers/reportController.js
const { query } = require('../config/database');

const getReportData = async (req, res) => {
    try {
        const { type, year } = req.query;
        let data = [];
        let title = '';
        
        switch(type) {
            case 'instrument':
                data = await query(`
                    SELECT instrument, COUNT(*) as count
                    FROM members
                    GROUP BY instrument
                    ORDER BY count DESC
                `);
                title = 'Members by Instrument';
                break;
            case 'gender':
                data = await query(`
                    SELECT gender, COUNT(*) as count
                    FROM members
                    GROUP BY gender
                `);
                title = 'Members by Gender';
                break;
            case 'school':
                data = await query(`
                    SELECT institution, COUNT(*) as count
                    FROM members
                    WHERE institution IS NOT NULL AND institution != ''
                    GROUP BY institution
                    ORDER BY count DESC
                    LIMIT 20
                `);
                title = 'Members by School/Institution';
                break;
            case 'occupation':
                data = await query(`
                    SELECT occupation, COUNT(*) as count
                    FROM members
                    WHERE occupation IS NOT NULL AND occupation != ''
                    GROUP BY occupation
                    ORDER BY count DESC
                    LIMIT 20
                `);
                title = 'Members by Occupation';
                break;
            case 'monthly':
                const targetYear = parseInt(year) || new Date().getFullYear();
                data = await query(`
                    SELECT MONTH(created_at) as month, COUNT(*) as count
                    FROM members
                    WHERE YEAR(created_at) = ?
                    GROUP BY MONTH(created_at)
                    ORDER BY month
                `, [targetYear]);
                title = `Monthly Registrations (${targetYear})`;
                break;
            case 'yearly':
                data = await query(`
                    SELECT YEAR(created_at) as year, COUNT(*) as count
                    FROM members
                    GROUP BY YEAR(created_at)
                    ORDER BY year DESC
                `);
                title = 'Yearly Registrations';
                break;
            default:
                return res.status(400).json({ error: 'Invalid report type' });
        }
        
        res.json({
            title,
            type,
            data,
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Report error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getReportData
};