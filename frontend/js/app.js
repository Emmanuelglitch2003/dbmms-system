// frontend/js/app.js
// ============================================
// STATE
// ============================================

// frontend/js/app.js
// ============================================
// APP CONFIGURATION
// ============================================

console.log('🎵 DE-PUNDIT BAND DBMMS v1.0');
console.log(`🔗 API URL: ${typeof API_URL !== 'undefined' ? API_URL : 'Not set'}`);

// ... rest of your app.js code

const state = {
    admin: null,
    members: [],
    currentPage: 'dashboard',
    pagination: null
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 App starting...');
    checkAuth();
    setupNavigation();
});

// ============================================
// AUTHENTICATION
// ============================================
async function checkAuth() {
    try {
        const data = await authAPI.checkAuth();
        console.log('🔍 Auth check:', data);
        
        if (data.authenticated) {
            state.admin = data.admin;
            showDashboard();
            loadPage('dashboard');
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('❌ Auth check error:', error);
        showLogin();
    }
}

function showLogin() {
    console.log('🔐 Showing login page...');
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('dashboard-page').style.display = 'none';
    
    const loginForm = document.getElementById('login-form');
    const newForm = loginForm.cloneNode(true);
    loginForm.parentNode.replaceChild(newForm, loginForm);
    
    newForm.addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
    e.preventDefault();
    console.log('🔐 Login attempt...');
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        showAlert('login-alert', 'Please enter username and password', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('login-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Logging in...';
    submitBtn.disabled = true;
    
    try {
        console.log('📡 Sending login request...');
        const data = await authAPI.login(username, password);
        console.log('✅ Login response:', data);
        
        if (data.token) {
            setToken(data.token);
            state.admin = data.admin;
            
            showAlert('login-alert', '✅ Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                console.log('🚀 Redirecting to dashboard...');
                showDashboard();
                loadPage('dashboard');
            }, 800);
        } else {
            throw new Error('No token received');
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        showAlert('login-alert', '❌ ' + (error.message || 'Login failed'), 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function showDashboard() {
    console.log('📊 Showing dashboard...');
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('dashboard-page').style.display = 'block';
    
    if (state.admin) {
        document.getElementById('admin-name').textContent = state.admin.full_name || state.admin.username;
    }
}

async function handleLogout(e) {
    e.preventDefault();
    console.log('🚪 Logging out...');
    setToken(null);
    state.admin = null;
    showLogin();
    document.getElementById('login-alert').innerHTML = '';
}

// ============================================
// NAVIGATION
// ============================================
function setupNavigation() {
    document.querySelectorAll('[data-page]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const page = el.dataset.page;
            
            if (page === 'logout') {
                handleLogout(e);
                return;
            }
            
            loadPage(page);
        });
    });
}

async function loadPage(page) {
    console.log('📄 Loading page:', page);
    state.currentPage = page;
    
    document.querySelectorAll('.sidebar nav a').forEach(el => {
        el.classList.remove('active');
    });
    const activeLink = document.querySelector(`[data-page="${page}"]`);
    if (activeLink) activeLink.classList.add('active');
    
    const titles = {
        dashboard: 'Dashboard',
        register: 'Register New Member',
        members: 'Members List',
        reports: 'Reports',
        settings: 'Settings'
    };
    document.getElementById('page-title').textContent = titles[page] || page;
    
    const content = document.getElementById('page-content');
    
    try {
        switch(page) {
            case 'dashboard':
                await loadDashboard(content);
                break;
            case 'register':
                await loadRegister(content);
                break;
            case 'members':
                await loadMembers(content);
                break;
            case 'reports':
                await loadReports(content);
                break;
            case 'settings':
                loadSettings(content);
                break;
            default:
                content.innerHTML = '<div class="alert alert-warning">Page not found</div>';
        }
    } catch (error) {
        console.error('❌ Error loading page:', error);
        content.innerHTML = `<div class="alert alert-error">Error loading page: ${error.message}</div>`;
    }
}

// ============================================
// DASHBOARD
// ============================================
async function loadDashboard(container) {
    container.innerHTML = `
        <div class="stats-grid" id="stats-grid">
            <div class="stat-card"><div class="number">...</div><div class="label">Loading...</div></div>
        </div>
        <div class="table-container">
            <h3>📋 Recent Members</h3>
            <div id="recent-members"><div class="loading"><div class="spinner"></div>Loading...</div></div>
        </div>
    `;
    
    try {
        const stats = await memberAPI.getStats();
        console.log('📊 Stats:', stats);
        
        const statsGrid = document.getElementById('stats-grid');
        if (stats && stats.stats) {
            statsGrid.innerHTML = `
                <div class="stat-card"><div class="number">${stats.stats.total || 0}</div><div class="label">Total Members</div></div>
                <div class="stat-card green"><div class="number">${stats.stats.male || 0}</div><div class="label">Male</div></div>
                <div class="stat-card"><div class="number">${stats.stats.female || 0}</div><div class="label">Female</div></div>
                <div class="stat-card warning"><div class="number">${stats.stats.pending || 0}</div><div class="label">Pending</div></div>
                <div class="stat-card green"><div class="number">${stats.stats.today_registrations || 0}</div><div class="label">Today's Registrations</div></div>
            `;
            
            const badge = document.getElementById('memberCount');
            if (badge) badge.textContent = stats.stats.total || 0;
        }
        
        const membersData = await memberAPI.getAll({ limit: 5 });
        const recentContainer = document.getElementById('recent-members');
        
        if (membersData && membersData.members && membersData.members.length > 0) {
            recentContainer.innerHTML = `
                <table>
                    <thead><tr><th>ID</th><th>Name</th><th>Instrument</th><th>Status</th></tr></thead>
                    <tbody>
                        ${membersData.members.map(m => `
                            <tr>
                                <td>${m.membership_id}</td>
                                <td>${m.full_name}</td>
                                <td>${m.instrument}</td>
                                <td><span class="status-badge status-${m.status}">${m.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            recentContainer.innerHTML = '<p style="color:var(--gray);padding:20px;text-align:center;">No members yet. <a href="#" data-page="register" style="color:var(--gold);">Register one!</a></p>';
        }
    } catch (error) {
        console.error('❌ Dashboard error:', error);
        container.innerHTML = `<div class="alert alert-error">Error loading dashboard: ${error.message}</div>`;
    }
}

// ============================================
// REGISTER - COMPLETE FORM
// ============================================
async function loadRegister(container) {
    container.innerHTML = `
        <div class="form-container fade-in">
            <h2>📝 Member Registration</h2>
            <p class="subtitle">Fill in all required fields (*)</p>
            
            <form id="register-form">
                <!-- A. PERSONAL INFORMATION -->
                <div class="form-section">
                    <h3>📋 Personal Information</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Full Name <span class="required">*</span></label>
                            <input type="text" name="full_name" placeholder="Enter full name" required>
                        </div>
                        <div class="form-group">
                            <label>Date of Birth <span class="required">*</span></label>
                            <input type="date" name="date_of_birth" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Gender <span class="required">*</span></label>
                            <select name="gender" required>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Nationality <span class="required">*</span></label>
                            <input type="text" name="nationality" placeholder="e.g., Ghanaian" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Phone (Calls) <span class="required">*</span></label>
                            <input type="text" name="phone_call" placeholder="e.g., 0244123456" required>
                        </div>
                        <div class="form-group">
                            <label>WhatsApp <span class="required">*</span></label>
                            <input type="text" name="whatsapp" placeholder="e.g., 0244123456" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" placeholder="member@example.com">
                            <span class="help-text">Optional</span>
                        </div>
                        <div class="form-group">
                            <label>Digital Address</label>
                            <input type="text" name="digital_address" placeholder="e.g., GA-123-4567">
                            <span class="help-text">Optional</span>
                        </div>
                    </div>
                </div>

                <!-- B. ACADEMIC / PROFESSIONAL -->
                <div class="form-section">
                    <h3>🎓 Academic / Professional</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>School / Institution</label>
                            <input type="text" name="institution" placeholder="Name of school/institution">
                            <span class="help-text">Optional</span>
                        </div>
                        <div class="form-group">
                            <label>Level / Program</label>
                            <input type="text" name="level_program" placeholder="e.g., SHS, University">
                            <span class="help-text">Optional</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Occupation</label>
                        <input type="text" name="occupation" placeholder="Current occupation">
                        <span class="help-text">Optional</span>
                    </div>
                </div>

                <!-- C. MUSICAL INFORMATION -->
                <div class="form-section">
                    <h3>🎵 Musical Information</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Instrument <span class="required">*</span></label>
                            <select name="instrument" id="instrument" required>
                                <option value="">Select Instrument</option>
                                <option value="Trumpet">Trumpet</option>
                                <option value="Trombone">Trombone</option>
                                <option value="Euphonium">Euphonium</option>
                                <option value="Tuba">Tuba</option>
                                <option value="Percussion">Percussion</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group" id="other-instrument-group" style="display:none;">
                            <label>Other Instrument <span class="required">*</span></label>
                            <input type="text" name="other_instrument" placeholder="Specify instrument">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Years of Experience</label>
                            <input type="number" name="years_experience" min="0" placeholder="0">
                            <span class="help-text">Optional</span>
                        </div>
                        <div class="form-group">
                            <label>Previous Band</label>
                            <input type="text" name="previous_band" placeholder="Name of previous band">
                            <span class="help-text">Optional</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Reason for Joining</label>
                        <textarea name="reason_joining" rows="3" placeholder="Why do you want to join DE-PUNDIT BAND?"></textarea>
                        <span class="help-text">Optional</span>
                    </div>
                </div>

                <!-- D. EMERGENCY CONTACT -->
                <div class="form-section">
                    <h3>🆘 Emergency Contact</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Name <span class="required">*</span></label>
                            <input type="text" name="emergency_name" placeholder="Full name" required>
                        </div>
                        <div class="form-group">
                            <label>Relationship <span class="required">*</span></label>
                            <input type="text" name="emergency_relationship" placeholder="e.g., Parent, Spouse, Friend" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Phone <span class="required">*</span></label>
                        <input type="text" name="emergency_phone" placeholder="e.g., 0244123457" required>
                    </div>
                </div>

                <!-- E. MEMBERSHIP DETAILS -->
                <div class="form-section">
                    <h3>🪪 Membership Details</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Membership ID</label>
                            <input type="text" name="membership_id" placeholder="e.g., DPB-2024-0001">
                            <span class="help-text">Leave empty for auto-generation, or enter manually</span>
                        </div>
                        <div class="form-group">
                            <label>Date Received <span class="required">*</span></label>
                            <input type="date" name="date_received" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Approved By</label>
                            <select name="approved_by">
                                <option value="">Select Approver</option>
                                <option value="1">System Administrator</option>
                            </select>
                            <span class="help-text">Optional</span>
                        </div>
                        <div class="form-group">
                            <label>Status <span class="required">*</span></label>
                            <select name="status" required>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div id="register-result"></div>
                
                <div class="form-actions">
                    <button type="button" onclick="loadPage('members')" class="btn btn-secondary">Cancel</button>
                    <button type="submit" class="btn btn-primary" id="register-btn">✨ Register Member</button>
                </div>
            </form>
        </div>
    `;

    // Instrument - Show/hide "Other" field
    document.getElementById('instrument').addEventListener('change', function() {
        const otherGroup = document.getElementById('other-instrument-group');
        if (this.value === 'Other') {
            otherGroup.style.display = 'block';
        } else {
            otherGroup.style.display = 'none';
        }
    });

    // Generate auto membership ID suggestion
    const membershipIdField = document.querySelector('input[name="membership_id"]');
    if (membershipIdField) {
        generateSuggestedId(membershipIdField);
        membershipIdField.addEventListener('focus', function() {
            if (!this.value) {
                generateSuggestedId(this);
            }
        });
    }

    // Form submission
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const btn = document.getElementById('register-btn');
        const resultDiv = document.getElementById('register-result');
        
        // Remove empty membership_id so backend auto-generates
        if (!data.membership_id || data.membership_id.trim() === '') {
            delete data.membership_id;
        }
        
        btn.textContent = '⏳ Registering...';
        btn.disabled = true;
        resultDiv.innerHTML = '';
        
        try {
            const response = await memberAPI.create(data);
            console.log('✅ Member registered:', response);
            resultDiv.innerHTML = `
                <div class="alert alert-success">
                    ✅ Member registered successfully! <br>
                    <strong>Membership ID:</strong> ${response.member.membership_id}
                </div>
            `;
            e.target.reset();
            updateMemberCount();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Generate new suggested ID
            const idField = document.querySelector('input[name="membership_id"]');
            if (idField) {
                setTimeout(() => generateSuggestedId(idField), 500);
            }
        } catch (error) {
            console.error('❌ Registration error:', error);
            resultDiv.innerHTML = `<div class="alert alert-error">❌ ${error.message}</div>`;
        } finally {
            btn.textContent = '✨ Register Member';
            btn.disabled = false;
        }
    });
}

// ============================================
// HELPER: Generate Suggested Membership ID
// ============================================
async function generateSuggestedId(field) {
    try {
        const data = await memberAPI.getAll({ limit: 1 });
        const year = new Date().getFullYear();
        let nextNumber = 1;
        
        if (data && data.members && data.members.length > 0) {
            const lastId = data.members[0].membership_id;
            if (lastId) {
                const parts = lastId.split('-');
                if (parts.length === 3) {
                    const lastNum = parseInt(parts[2]);
                    if (!isNaN(lastNum)) {
                        nextNumber = lastNum + 1;
                    }
                }
            }
        }
        
        const suggestedId = `DPB-${year}-${String(nextNumber).padStart(4, '0')}`;
        field.placeholder = suggestedId;
        field.title = `Suggested: ${suggestedId}`;
        
        const helpText = field.parentElement.querySelector('.help-text');
        if (helpText) {
            helpText.innerHTML = `Suggested: <strong style="color: var(--gold);">${suggestedId}</strong> - leave empty to auto-generate`;
        }
    } catch (error) {
        const year = new Date().getFullYear();
        field.placeholder = `DPB-${year}-0001`;
    }
}

// ============================================
// MEMBERS LIST
// ============================================
async function loadMembers(container) {
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
            <h3 style="color:var(--gold);">All Members</h3>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <input type="text" id="searchInput" placeholder="Search..." style="padding:8px 14px; background:var(--black); border:1px solid #333; border-radius:8px; color:var(--white);">
                <select id="statusFilter" style="padding:8px 14px; background:var(--black); border:1px solid #333; border-radius:8px; color:var(--white);">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <button onclick="applyFilters()" class="btn btn-primary btn-sm">Search</button>
                <button onclick="resetFilters()" class="btn btn-secondary btn-sm">Reset</button>
            </div>
        </div>
        <div id="members-table"><div class="loading"><div class="spinner"></div>Loading...</div></div>
        <div id="pagination" style="margin-top:16px;display:flex;gap:10px;justify-content:center;"></div>
    `;
    
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyFilters();
    });
    
    await fetchMembers();
}

async function fetchMembers(page = 1) {
    const search = document.getElementById('searchInput')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    
    try {
        const data = await memberAPI.getAll({ search, status, page, limit: 20 });
        state.members = data.members || [];
        state.pagination = data.pagination || { total: 0, page: 1, pages: 1 };
        renderMembers();
        renderPagination();
    } catch (error) {
        console.error('❌ Fetch members error:', error);
        document.getElementById('members-table').innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    }
}

function renderMembers() {
    const container = document.getElementById('members-table');
    const members = state.members;
    
    if (!members || members.length === 0) {
        container.innerHTML = '<p style="color:var(--gray);padding:40px;text-align:center;">No members found</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead><tr><th>ID</th><th>Name</th><th>Instrument</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
                ${members.map(m => `
                    <tr>
                        <td><strong>${m.membership_id}</strong></td>
                        <td>${m.full_name}</td>
                        <td>${m.instrument}</td>
                        <td>${m.phone_call}</td>
                        <td><span class="status-badge status-${m.status}">${m.status}</span></td>
                        <td>
                            <button onclick="viewMember('${m.id}')" class="btn btn-secondary btn-sm">👁 View</button>
                            <button onclick="deleteMember('${m.id}')" class="btn btn-danger btn-sm">🗑 Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderPagination() {
    const container = document.getElementById('pagination');
    const { total, page, pages } = state.pagination || { total: 0, page: 1, pages: 1 };
    
    if (pages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = `<span style="color:var(--gray);">Page ${page} of ${pages} (${total} total)</span>`;
    if (page > 1) html += `<button onclick="fetchMembers(${page - 1})" class="btn btn-secondary btn-sm">Previous</button>`;
    if (page < pages) html += `<button onclick="fetchMembers(${page + 1})" class="btn btn-secondary btn-sm">Next</button>`;
    container.innerHTML = html;
}

function applyFilters() {
    fetchMembers(1);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    fetchMembers(1);
}

// ============================================
// VIEW MEMBER
// ============================================
window.viewMember = async function(id) {
    try {
        const data = await memberAPI.getById(id);
        const m = data.member;
        
        const container = document.getElementById('page-content');
        container.innerHTML = `
            <div class="form-container fade-in">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h2 style="color:var(--gold);">👤 Member Profile</h2>
                    <button onclick="loadPage('members')" class="btn btn-secondary btn-sm">← Back</button>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                    <div class="form-group"><label>Membership ID</label><p><strong>${m.membership_id}</strong></p></div>
                    <div class="form-group"><label>Full Name</label><p><strong>${m.full_name}</strong></p></div>
                    <div class="form-group"><label>Date of Birth</label><p><strong>${new Date(m.date_of_birth).toLocaleDateString()}</strong></p></div>
                    <div class="form-group"><label>Gender</label><p><strong>${m.gender}</strong></p></div>
                    <div class="form-group"><label>Nationality</label><p><strong>${m.nationality}</strong></p></div>
                    <div class="form-group"><label>Phone</label><p><strong>${m.phone_call}</strong></p></div>
                    <div class="form-group"><label>WhatsApp</label><p><strong>${m.whatsapp}</strong></p></div>
                    <div class="form-group"><label>Email</label><p><strong>${m.email || 'N/A'}</strong></p></div>
                    <div class="form-group"><label>Instrument</label><p><strong>${m.instrument}</strong></p></div>
                    <div class="form-group"><label>Status</label><p><span class="status-badge status-${m.status}">${m.status}</span></p></div>
                    <div class="form-group"><label>Date Received</label><p><strong>${new Date(m.date_received).toLocaleDateString()}</strong></p></div>
                    <div class="form-group"><label>Emergency Contact</label><p><strong>${m.emergency_name} (${m.emergency_relationship})</strong></p></div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('❌ View member error:', error);
        showAlert('page-content', 'Error loading member: ' + error.message, 'error');
    }
};

// ============================================
// DELETE MEMBER
// ============================================
window.deleteMember = async function(id) {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    try {
        await memberAPI.delete(id);
        showAlert('members-table', '✅ Member deleted successfully', 'success');
        fetchMembers(state.pagination?.page || 1);
        updateMemberCount();
    } catch (error) {
        console.error('❌ Delete error:', error);
        showAlert('members-table', 'Error deleting member: ' + error.message, 'error');
    }
};

// ============================================
// REPORTS
// ============================================
async function loadReports(container) {
    container.innerHTML = `
        <div class="stats-grid" style="grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));">
            ${['instrument','gender','school','occupation','monthly','yearly'].map(t => `
                <div class="stat-card" style="cursor:pointer;" onclick="generateReport('${t}')">
                    <div class="number" style="font-size:28px;">${t === 'instrument' ? '🎵' : t === 'gender' ? '👤' : t === 'school' ? '🏫' : t === 'occupation' ? '💼' : t === 'monthly' ? '📅' : '📆'}</div>
                    <div class="label">${t.charAt(0).toUpperCase() + t.slice(1)} Report</div>
                </div>
            `).join('')}
        </div>
        <div id="report-results"></div>
    `;
}

window.generateReport = async function(type) {
    const container = document.getElementById('report-results');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Generating...</div>';
    
    try {
        const year = type === 'monthly' ? new Date().getFullYear() : null;
        const data = await reportAPI.generate(type, year);
        renderReport(type, data);
    } catch (error) {
        container.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    }
};

function renderReport(type, data) {
    const container = document.getElementById('report-results');
    
    if (!data || !data.data || data.data.length === 0) {
        container.innerHTML = '<div class="alert alert-warning">No data available</div>';
        return;
    }
    
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const rows = data.data.map(d => {
        let label = d.instrument || d.gender || d.institution || d.occupation || d.status || d.month || d.year;
        if (type === 'monthly') label = monthNames[(d.month || 1) - 1];
        return [label, d.count];
    });
    const total = rows.reduce((sum, r) => sum + r[1], 0);
    
    container.innerHTML = `
        <div class="table-container fade-in">
            <h3>${data.title}</h3>
            <table>
                <thead><tr><th>Category</th><th style="text-align:right;">Count</th><th style="text-align:right;">%</th></tr></thead>
                <tbody>
                    ${rows.map(r => `
                        <tr>
                            <td>${r[0]}</td>
                            <td style="text-align:right;">${r[1]}</td>
                            <td style="text-align:right;">${total > 0 ? ((r[1]/total)*100).toFixed(1) : 0}%</td>
                        </tr>
                    `).join('')}
                    <tr style="font-weight:bold;border-top:2px solid var(--gold);">
                        <td>TOTAL</td>
                        <td style="text-align:right;">${total}</td>
                        <td style="text-align:right;">100%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// ============================================
// SETTINGS
// ============================================
function loadSettings(container) {
    container.innerHTML = `
        <div class="form-container fade-in">
            <h2>⚙️ Settings</h2>
            <div style="display:grid; gap:16px;">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" value="${state.admin?.full_name || ''}" disabled>
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" value="${state.admin?.username || ''}" disabled>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" value="${state.admin?.email || ''}" disabled>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <input type="text" value="${state.admin?.role || ''}" disabled>
                </div>
                <div style="border-top:1px solid #333; padding-top:16px;">
                    <p style="color:var(--gray); font-size:13px;">DBMMS v1.0 | Database: MySQL | PHPMyAdmin: <a href="http://localhost/phpmyadmin" target="_blank" style="color:var(--gold);">Open</a></p>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showAlert(containerId, message, type = 'success') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    container.prepend(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

async function updateMemberCount() {
    try {
        const stats = await memberAPI.getStats();
        const badge = document.getElementById('memberCount');
        if (badge && stats && stats.stats) {
            badge.textContent = stats.stats.total || 0;
        }
    } catch (error) {
        // Silent fail
    }
}

// Make functions globally accessible
window.loadPage = loadPage;
window.fetchMembers = fetchMembers;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.viewMember = viewMember;
window.deleteMember = deleteMember;
window.generateReport = generateReport;