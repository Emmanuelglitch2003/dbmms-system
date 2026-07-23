// frontend/js/api.js
// ============================================
// ENVIRONMENT DETECTION
// ============================================

const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname === '';

// ============================================
// API URL - Auto-detects environment
// ============================================

// UPDATE THIS URL AFTER DEPLOYMENT!
const API_URL = isLocal 
    ? 'http://localhost:5000/api'
    : 'https://dbmms-system.vercel.app/api';

console.log(`🌐 Running in ${isLocal ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
console.log(`📡 API URL: ${API_URL}`);

// ============================================
// TOKEN MANAGEMENT
// ============================================

let authToken = null;

function setToken(token) {
    authToken = token;
    if (token) {
        localStorage.setItem('authToken', token);
        console.log('🔑 Token stored');
    } else {
        localStorage.removeItem('authToken');
        console.log('🗑️ Token removed');
    }
}

function getToken() {
    if (!authToken) {
        authToken = localStorage.getItem('authToken');
    }
    return authToken;
}

// ============================================
// API CALL FUNCTION
// ============================================

async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    
    const config = {
        headers: headers,
        credentials: 'include',
        ...options
    };
    
    try {
        const url = API_URL + endpoint;
        console.log(`📡 API Call: ${url}`);
        
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                setToken(null);
            }
            throw new Error(data.error || data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('❌ API Error:', error.message);
        throw error;
    }
}

// ============================================
// AUTH API
// ============================================

const authAPI = {
    login: (username, password) => {
        return apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },
    logout: () => {
        setToken(null);
        return Promise.resolve({ message: 'Logout successful' });
    },
    checkAuth: () => {
        const token = getToken();
        if (!token) {
            return Promise.resolve({ authenticated: false });
        }
        return apiCall('/auth/check');
    }
};

// ============================================
// MEMBER API
// ============================================

const memberAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall('/members?' + query);
    },
    getById: (id) => {
        return apiCall('/members/' + id);
    },
    create: (data) => {
        return apiCall('/members', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    update: (id, data) => {
        return apiCall('/members/' + id, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    delete: (id) => {
        return apiCall('/members/' + id, { method: 'DELETE' });
    },
    getStats: () => {
        return apiCall('/members/stats');
    }
};

// ============================================
// REPORT API
// ============================================

const reportAPI = {
    generate: (type, year) => {
        const params = new URLSearchParams({ type, year }).toString();
        return apiCall('/reports/data?' + params);
    }
};

// ============================================
// EXPOSE FOR GLOBAL ACCESS
// ============================================

window.setToken = setToken;
window.getToken = getToken;
window.authAPI = authAPI;
window.memberAPI = memberAPI;
window.reportAPI = reportAPI;
window.API_URL = API_URL;

console.log('✅ API Module Loaded Successfully!');
console.log(`🔗 Connected to: ${API_URL}`);