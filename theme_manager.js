// Tracking Manager for Centralized Logging
const TrackingManager = {
    LOG_KEY: 'admin_activity_logs_2026',
    MAX_LOGS: 1000,

    log(event, details = {}) {
        const session = JSON.parse(localStorage.getItem('sales_dashboard_session') || '{}');
        const user = session.data ? (session.data.name || session.data.id || 'Unknown') : 'Guest';
        const role = session.role || 'none';
        
        const newLog = {
            id: Date.now() + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toLocaleString('ko-KR'),
            event,
            user,
            role,
            details,
            page: window.location.pathname.split('/').pop() || 'index.html'
        };

        const logs = JSON.parse(localStorage.getItem(this.LOG_KEY) || '[]');
        logs.unshift(newLog); // Newest first
        
        // Keep logs clean
        if (logs.length > this.MAX_LOGS) logs.pop();
        
        localStorage.setItem(this.LOG_KEY, JSON.stringify(logs));
        console.log(`[Tracking] ${event} recorded for ${user}`);
    }
};

// Theme Manager for 2026 Management Hub - Premium Robust Edition
const ThemeManager = {
    themes: {
        default: {
            '--primary': '#4f46e5',
            '--primary-hover': '#4338ca',
            '--bg-body': '#f8fafc',
            '--text-main': '#1e293b',
            '--text-muted': '#64748b',
            '--surface-bg': '#ffffff',
            '--border-color': '#e2e8f0',
            '--nav-bg': '#f1f5f9',
            '--nav-btn-bg': '#f8fafc',
            '--nav-btn-active': '#ffffff',
            '--shadow-sm': '0 2px 4px rgba(0,0,0,0.05)',
            '--shadow-md': '0 4px 15px rgba(0,0,0,0.08)'
        },
        dark: {
            '--primary': '#6366f1',
            '--primary-hover': '#818cf8',
            '--bg-body': '#0f172a',
            '--text-main': '#f8fafc',
            '--text-muted': '#94a3b8',
            '--surface-bg': '#1e293b',
            '--border-color': '#334155',
            '--nav-bg': '#1e293b',
            '--nav-btn-bg': '#0f172a',
            '--nav-btn-active': '#334155',
            '--shadow-sm': '0 2px 4px rgba(0,0,0,0.2)',
            '--shadow-md': '0 4px 15px rgba(0,0,0,0.3)'
        },
        emerald: {
            '--primary': '#10b981',
            '--primary-hover': '#059669',
            '--bg-body': '#f0fdf4',
            '--text-main': '#064e3b',
            '--text-muted': '#327d6a',
            '--surface-bg': '#ffffff',
            '--border-color': '#d1fae5',
            '--nav-bg': '#ecfdf5',
            '--nav-btn-bg': '#ffffff',
            '--nav-btn-active': '#d1fae5',
            '--shadow-sm': '0 2px 4px rgba(6,78,59,0.05)',
            '--shadow-md': '0 4px 15px rgba(6,78,59,0.08)'
        },
        sunset: {
            '--primary': '#f59e0b',
            '--primary-hover': '#d97706',
            '--bg-body': '#fffbeb',
            '--text-main': '#78350f',
            '--text-muted': '#b45309',
            '--surface-bg': '#ffffff',
            '--border-color': '#fef3c7',
            '--nav-bg': '#fff7ed',
            '--nav-btn-bg': '#ffffff',
            '--nav-btn-active': '#ffedd5',
            '--shadow-sm': '0 2px 4px rgba(120,53,15,0.05)',
            '--shadow-md': '0 4px 15px rgba(120,53,15,0.08)'
        }
    },

    init() {
        // Use DOMContentLoaded for safer execution
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.run());
        } else {
            this.run();
        }
    },

    run() {
        const savedTheme = localStorage.getItem('dashboard_theme') || 'default';
        this.applyTheme(savedTheme);
        this.injectGlobalStyles();
        this.standardizeNavigation();
        this.createThemeSelector();
        
        // Log page view
        TrackingManager.log('PAGE_VIEW', { title: document.title });
    },

    injectGlobalStyles() {
        const style = document.createElement('style');
        style.id = 'theme-manager-styles';
        style.textContent = `
            :root {
                --transition-ease: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            body { 
                background-color: var(--bg-body) !important; 
                color: var(--text-main) !important;
                transition: var(--transition-ease) !important;
            }
            .premium-nav-hub {
                display: flex !important;
                align-items: center !important;
                background: var(--nav-bg) !important;
                padding: 6px !important;
                border-radius: 24px !important;
                gap: 4px !important;
                box-shadow: var(--shadow-sm) !important;
                width: fit-content !important;
                margin-left: auto !important;
                border: 1px solid var(--border-color) !important;
                position: relative;
            }
            .premium-nav-btn {
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                padding: 10px 20px !important;
                border-radius: 20px !important;
                border: none !important;
                background: transparent !important;
                color: var(--text-muted) !important;
                font-size: 14px !important;
                font-weight: 700 !important;
                cursor: pointer !important;
                transition: var(--transition-ease) !important;
                white-space: nowrap !important;
                text-decoration: none !important;
            }
            .premium-nav-btn:hover {
                background: rgba(255, 255, 255, 0.5) !important;
                color: var(--primary) !important;
                transform: translateY(-1px) !important;
            }
            .premium-nav-btn.active {
                background: var(--nav-btn-active) !important;
                color: var(--primary) !important;
                box-shadow: var(--shadow-sm) !important;
            }
            .premium-nav-btn.gear-btn {
                padding: 10px !important;
                font-size: 18px !important;
            }
            .premium-nav-btn.logout {
                background: #fee2e2 !important;
                color: #ef4444 !important;
                border: 1px solid #fecaca !important;
                margin-left: 8px !important;
                padding: 10px 16px !important;
            }
            .premium-nav-btn.logout:hover {
                background: #fecaca !important;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2) !important;
            }
            .premium-nav-btn.disabled {
                opacity: 0.4 !important;
                cursor: not-allowed !important;
                filter: grayscale(1) !important;
            }
            
            /* Admin Dropdown Styles */
            .admin-menu-dropdown {
                position: absolute;
                top: calc(100% + 10px);
                right: 0;
                background: var(--surface-bg);
                border: 1px solid var(--border-color);
                border-radius: 16px;
                box-shadow: var(--shadow-md);
                padding: 8px;
                display: none;
                flex-direction: column;
                min-width: 180px;
                z-index: 10000;
                animation: slideDown 0.2s ease-out;
            }
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .admin-menu-dropdown.show { display: flex; }
            .admin-menu-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 16px;
                border-radius: 10px;
                color: var(--text-main);
                text-decoration: none;
                font-size: 13px;
                font-weight: 600;
                transition: all 0.2s;
            }
            .admin-menu-item:hover {
                background: var(--nav-bg);
                color: var(--primary);
            }
            .admin-menu-item i { width: 16px; text-align: center; font-size: 14px; opacity: 0.7; }

            .nav-divider {
                width: 1px !important;
                height: 20px !important;
                background: var(--border-color) !important;
                margin: 0 8px !important;
                opacity: 0.6 !important;
            }
            /* Style 1 overrides - Extra Rounded & Premium Shadows */
            .card, .filter-container, .table-card, .kpi-box, .chart-container, .table-section, .header-control-box {
                border-radius: 24px !important;
                border: 1px solid var(--border-color) !important;
                box-shadow: var(--shadow-md) !important;
                background: var(--surface-bg) !important;
                overflow: hidden !important;
            }
            .btn, .btn-sm, .filter-btn, .kpi-card, .tab-btn {
                border-radius: 20px !important;
                transition: var(--transition-ease) !important;
            }
            .btn-group, .small-toggle, .filter-group, .tab-nav {
                border-radius: 24px !important;
                background: var(--nav-bg) !important;
                padding: 4px !important;
                border: 1px solid var(--border-color) !important;
                display: flex;
                width: fit-content !important;
            }
        `;
        document.head.appendChild(style);
    },

    applyTheme(themeName) {
        const theme = this.themes[themeName] || this.themes.default;
        const root = document.documentElement;
        Object.keys(theme).forEach(key => {
            root.style.setProperty(key, theme[key]);
        });
        localStorage.setItem('dashboard_theme', themeName);
        document.body.className = `theme-${themeName}`;
    },

    standardizeNavigation() {
        const navItems = [
            { icon: 'fa-map-marked-alt', text: '지도/방문', href: 'map_dashboard.html' },
            { icon: 'fa-sync-alt', text: '재계약/리텐션', href: 'index.html' },
            { icon: 'fa-exclamation-triangle', text: '정지/부실', href: '정지부실_실적현황.html' },
            { icon: 'fa-coins', text: '리텐션P값', href: '리텐션P값 실적현황.html' }
        ];

        const adminItems = [
            { icon: 'fa-history', text: '활동 모니터링', href: 'ADMIN_LOGS.html' },
            { icon: 'fa-file-alt', text: '개발 보고서', href: 'https://bough38-web.github.io/dashboard-2026/PROJECT_REPORT.html', target: '_blank' },
            { icon: 'fa-book', text: '사용 매뉴얼', href: 'https://bough38-web.github.io/dashboard-2026/USER_MANUAL.html', target: '_blank' }
        ];

        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const navContainers = document.querySelectorAll('.nav-buttons, .header .nav-hub-btn-container');
        
        navContainers.forEach(container => {
            container.innerHTML = '';
            container.className = 'premium-nav-hub';
            
            navItems.forEach(item => {
                const btn = document.createElement('a');
                btn.href = item.href;
                btn.className = `premium-nav-btn`;
                
                const isPageMatch = (item.href === currentPath) || 
                                   (item.href === 'index.html' && (currentPath === '' || currentPath.includes('2026년')));
                
                if (isPageMatch) btn.classList.add('active');
                
                btn.innerHTML = `<i class="fas ${item.icon}"></i><span>${item.text}</span>`;
                container.appendChild(btn);
            });

            // Gear Icon with Dropdown
            const gearWrapper = document.createElement('div');
            gearWrapper.style.position = 'relative';
            
            const gearBtn = document.createElement('button');
            gearBtn.className = 'premium-nav-btn gear-btn';
            gearBtn.innerHTML = `<i class="fas fa-cog"></i>`;
            gearBtn.title = '설정 및 관리자 도구';
            
            const dropdown = document.createElement('div');
            dropdown.className = 'admin-menu-dropdown';
            
            adminItems.forEach(admin => {
                const link = document.createElement('a');
                link.href = admin.href;
                link.className = 'admin-menu-item';
                if (admin.target) link.target = admin.target;
                link.innerHTML = `<i class="fas ${admin.icon}"></i><span>${admin.text}</span>`;
                dropdown.appendChild(link);
            });

            gearBtn.onclick = (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            };

            document.addEventListener('click', () => dropdown.classList.remove('show'));
            dropdown.onclick = (e) => e.stopPropagation();

            gearWrapper.appendChild(gearBtn);
            gearWrapper.appendChild(dropdown);
            container.appendChild(gearWrapper);

            // Add Divider
            const divider = document.createElement('div');
            divider.className = 'nav-divider';
            container.appendChild(divider);

            // Add Logout
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'premium-nav-btn logout';
            logoutBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i><span>로그아웃</span>`;
            logoutBtn.onclick = () => {
                if (confirm('로그아웃 하시겠습니까?')) {
                    TrackingManager.log('LOGOUT');
                    localStorage.removeItem('sales_dashboard_session');
                    location.href = 'login.html';
                }
            };
            container.appendChild(logoutBtn);
        });
    },

    createThemeSelector() {
        const nav = document.querySelector('.premium-nav-hub');
        if (!nav) return;

        const selector = document.createElement('div');
        selector.style.display = 'flex';
        selector.style.gap = '6px';
        selector.style.padding = '6px';
        selector.style.background = 'rgba(0,0,0,0.05)';
        selector.style.borderRadius = '20px';
        selector.style.marginRight = '12px';
        selector.id = 'theme-selector';

        Object.keys(this.themes).forEach(t => {
            const btn = document.createElement('div');
            btn.style.width = '14px';
            btn.style.height = '14px';
            btn.style.borderRadius = '50%';
            btn.style.cursor = 'pointer';
            btn.style.background = this.themes[t]['--primary'];
            btn.style.border = '2px solid rgba(255,255,255,0.8)';
            btn.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.1)';
            btn.title = t.charAt(0).toUpperCase() + t.slice(1);
            btn.onclick = () => this.applyTheme(t);
            selector.appendChild(btn);
        });

        nav.insertBefore(selector, nav.firstChild);
    }
};

ThemeManager.init();
