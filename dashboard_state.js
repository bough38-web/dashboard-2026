/**
 * Dashboard State Management Utility
 * Handles persistence of filters and themes across pages.
 */

const STATE_KEY = 'dashboard_2026_state';

const DashboardState = {
    defaults: {
        currentView: 'hq',
        currentMonth: '2월',
        currentTheme: 'default',
        expertMode: false
    },

    load() {
        const saved = localStorage.getItem(STATE_KEY);
        return saved ? JSON.parse(saved) : { ...this.defaults };
    },

    save(state) {
        const current = this.load();
        const updated = { ...current, ...state };
        localStorage.setItem(STATE_KEY, JSON.stringify(updated));
        return updated;
    },

    set(key, value) {
        const state = {};
        state[key] = value;
        this.save(state);
    },

    get(key) {
        return this.load()[key];
    },

    syncUI() {
        const state = this.load();
        
        // Apply Theme
        this.applyTheme(state.currentTheme);

        // Apply Expert Mode
        if (state.expertMode) {
            document.body.classList.add('expert-mode');
        } else {
            document.body.classList.remove('expert-mode');
        }

        return state;
    },

    applyTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        this.set('currentTheme', themeName);
    },

    logout() {
        if (confirm('로그아웃 하시겠습니까?')) {
            localStorage.removeItem('sales_dashboard_session');
            location.href = 'login.html';
        }
    }
};

// Global logout hook
window.logout = () => DashboardState.logout();

// Initialize on script load
DashboardState.syncUI();
