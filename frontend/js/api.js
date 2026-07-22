// frontend/js/api.js
const API_URL = 'http://localhost:5000/api';
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

async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    
    const config = {
        headers,
        ...options
    };
    
    try {
        const response = await fetch(API_URL + endpoint, config);
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

const authAPI = {
    login: (username, password) => {
        return apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },
    checkAuth: () => {
        const token = getToken();
        if (!token) {
            return Promise.resolve({ authenticated: false });
        }
        return apiCall('/auth/check');
    }
};

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

const reportAPI = {
    generate: (type, year) => {
        const params = new URLSearchParams({ type, year }).toString();
        return apiCall('/reports/data?' + params);
    }
};