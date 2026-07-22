// backend/test-login.js
const bcrypt = require('bcryptjs');
const { queryOne } = require('./config/database');

async function testLogin() {
    try {
        console.log('🔍 Testing login...\n');
        
        // Get admin from database
        const admin = await queryOne('SELECT * FROM admins WHERE username = ?', ['admin']);
        
        if (!admin) {
            console.log('❌ Admin not found in database');
            console.log('💡 Run this SQL to insert admin:');
            console.log(`
INSERT INTO admins (full_name, username, email, password_hash, role) 
VALUES ('System Administrator', 'admin', 'admin@depundit.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');
            `);
            return;
        }
        
        console.log('👤 Admin found:');
        console.log('   ID:', admin.id);
        console.log('   Username:', admin.username);
        console.log('   Email:', admin.email);
        console.log('   Role:', admin.role);
        console.log('   Hash length:', admin.password_hash.length);
        console.log('   Hash preview:', admin.password_hash.substring(0, 30) + '...');
        console.log('');
        
        // Test with correct password
        const password = 'Admin@2024';
        console.log('🔑 Testing password:', password);
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        console.log('   Result:', isMatch ? '✅ MATCH!' : '❌ NO MATCH');
        
        if (!isMatch) {
            console.log('\n⚠️ Password doesn\'t match!');
            console.log('💡 Generate a new hash:');
            
            // Generate new hash
            const newHash = bcrypt.hashSync('Admin@2024', 10);
            console.log('   New hash:', newHash);
            console.log('\n💡 Run this SQL to update:');
            console.log(`UPDATE admins SET password_hash = '${newHash}' WHERE username = 'admin';`);
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testLogin();