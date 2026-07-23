// frontend/js/config.js
// ============================================
// APPLICATION CONFIGURATION
// ============================================

const CONFIG = {
    // Application name
    APP_NAME: 'DE-PUNDIT BAND DBMMS',
    APP_VERSION: '1.0.0',
    
    // API Configuration - Auto-detects environment
    get API_URL() {
        const isLocal = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
        
        // UPDATE THIS URL AFTER DEPLOYMENT!
        return isLocal 
            ? 'http://localhost:5000/api'
            : 'https://dbmms-system.vercel.app/api'; // ← CHANGE THIS!
    },
    
    // Feature flags
    FEATURES: {
        enablePhotoUpload: false,
        enableQRCode: false,
        enableEmailNotifications: false
    },
    
    // Security
    SESSION_TIMEOUT: 1800, // 30 minutes in seconds
    MAX_LOGIN_ATTEMPTS: 5,
    
    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    
    // Date format
    DATE_FORMAT: 'YYYY-MM-DD',
    DISPLAY_DATE_FORMAT: 'MMM DD, YYYY'
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

console.log('📋 Config loaded:', CONFIG.APP_NAME, 'v' + CONFIG.APP_VERSION);