/**
 * ═══════════════════════════════════════════════════════════════════════
 *                    NICOTINE - MAIN APPLICATION
 *                         Frontend JavaScript
 * ═══════════════════════════════════════════════════════════════════════
 */

const API_URL = 'http://localhost:5000/api';
let currentUser = null;
let currentLang = 'en';

// ═══════════════════════════════════════════════════════════════════════
// AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════

async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        localStorage.setItem('token', data.token);
        currentUser = data.user;
        
        showDashboard();
        loadDashboardData();
        
    } catch (error) {
        alert('Login Error: ' + error.message);
    }
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    window.location.reload();
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        showLoginPage();
        return false;
    }
    return true;
}

// ═══════════════════════════════════════════════════════════════════════
// API UTILITIES
// ═══════════════════════════════════════════════════════════════════════

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include'
    });
    
    if (response.status === 401) {
        logout();
        throw new Error('Unauthorized');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }
    
    return data;
}

// ═══════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNav = document.querySelector(`[data-page="${pageId}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    updateUserInfo();
}

function updateUserInfo() {
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.fullName;
        document.getElementById('userRole').textContent = currentUser.role;
    }
}

// ═══════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════

async function loadDashboardData() {
    try {
        const stats = await apiRequest('/dashboard/stats');
        
        document.getElementById('totalPatients').textContent = stats.totalPatients || 0;
        document.getElementById('todayAppointments').textContent = stats.todayAppointments || 0;
        document.getElementById('activeUsers').textContent = stats.activeUsers || 0;
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ═══════════════════════════════════════════════════════════════════════
// PATIENTS
// ═══════════════════════════════════════════════════════════════════════

async function loadPatients(searchTerm = '') {
    try {
        const endpoint = searchTerm ? 
            `/patients/search?q=${encodeURIComponent(searchTerm)}` : 
            '/patients';
            
        const data = await apiRequest(endpoint);
        displayPatients(data.patients || []);
        
    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

function displayPatients(patients) {
    const container = document.getElementById('patientsGrid');
    
    if (patients.length === 0) {
        container.innerHTML = '<p class="text-center">No patients found</p>';
        return;
    }
    
    container.innerHTML = patients.map(patient => `
        <div class="card" onclick="viewPatient('${patient._id}')">
            <div class="card-header">
                <div>
                    <h3 class="card-title">${patient.fullName}</h3>
                    <p class="text-secondary">MRN: ${patient.mrn}</p>
                </div>
                <span class="card-badge badge-${patient.isActive ? 'completed' : 'pending'}">
                    ${patient.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>
            <div class="card-content">
                <p>📧 ${patient.email || 'N/A'}</p>
                <p>📱 ${patient.phoneNumber || 'N/A'}</p>
                <p>🎂 Age: ${patient.age || 'N/A'} | Gender: ${patient.gender || 'N/A'}</p>
            </div>
        </div>
    `).join('');
}

async function addPatient(formData) {
    try {
        await apiRequest('/patients', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        closeModal('patientModal');
        loadPatients();
        alert('Patient added successfully!');
        
    } catch (error) {
        alert('Error adding patient: ' + error.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════

async function loadAnalytics(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const data = await apiRequest(`/analytics?${queryParams}`);
        
        displayAnalyticsSummary(data.summary);
        renderCharts(data);
        
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function displayAnalyticsSummary(summary) {
    document.getElementById('analyticsSummary').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue">👥</div>
                <div class="stat-details">
                    <h3>${summary.totalPatients || 0}</h3>
                    <p>Total Patients</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">✅</div>
                <div class="stat-details">
                    <h3>${summary.completedVisits || 0}</h3>
                    <p>Completed Visits</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon purple">📊</div>
                <div class="stat-details">
                    <h3>${summary.averageAge || 0}</h3>
                    <p>Average Age</p>
                </div>
            </div>
        </div>
    `;
}

function renderCharts(data) {
    // Gender Distribution Chart
    if (data.genderDistribution && document.getElementById('genderChart')) {
        const ctx = document.getElementById('genderChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(data.genderDistribution),
                datasets: [{
                    data: Object.values(data.genderDistribution),
                    backgroundColor: ['#2563eb', '#10b981', '#8b5cf6']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    // Age Distribution Chart
    if (data.ageDistribution && document.getElementById('ageChart')) {
        const ctx = document.getElementById('ageChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(data.ageDistribution),
                datasets: [{
                    label: 'Patients by Age Group',
                    data: Object.values(data.ageDistribution),
                    backgroundColor: '#2563eb'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════
// MODAL UTILITIES
// ═══════════════════════════════════════════════════════════════════════

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// INTERNATIONALIZATION
// ═══════════════════════════════════════════════════════════════════════

const translations = {
    en: {
        dashboard: 'Dashboard',
        patients: 'Patients',
        analytics: 'Analytics',
        settings: 'Settings'
    },
    ar: {
        dashboard: 'لوحة التحكم',
        patients: 'المرضى',
        analytics: 'التحليلات',
        settings: 'الإعدادات'
    },
    de: {
        dashboard: 'Dashboard',
        patients: 'Patienten',
        analytics: 'Analytik',
        settings: 'Einstellungen'
    }
};

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.setAttribute('lang', lang);
    
    if (lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
    }
    
    // Update UI text
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        showDashboard();
        loadDashboardData();
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            login(email, password);
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const pageId = item.getAttribute('data-page');
            showPage(pageId);
            
            // Load data based on page
            if (pageId === 'patientsPage') {
                loadPatients();
            } else if (pageId === 'analyticsPage') {
                loadAnalytics();
            }
        });
    });
    
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            loadPatients(e.target.value);
        });
    }
});
