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
    // [ADMIN CONTROL] Dashboard Expiration Setting
    CONFIG: {
        EXPIRY_DATE: '2026-12-31', // 형식: YYYY-MM-DD
        ADMIN_CODE: '0303',        // 잠금 해제 코드
        BASE_URL: ''               // 내보내기 시 주입되는 기본 URL (공백이면 상대경로 유지)
    },

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
        // Export 시 주입된 설정이 있다면 가장 먼저 반영
        if (window.DASHBOARD_EXPORT_CONFIG) {
            this.CONFIG.EXPIRY_DATE = window.DASHBOARD_EXPORT_CONFIG.EXPIRY_DATE;
            this.CONFIG.BASE_URL = window.DASHBOARD_EXPORT_CONFIG.BASE_URL || '';
        }

        if (this.checkExpiration()) return; // 만료 시 실행 중단

        const savedTheme = localStorage.getItem('dashboard_theme') || 'default';
        this.applyTheme(savedTheme);
        this.injectGlobalStyles();
        this.standardizeNavigation();
        this.createThemeSelector();
        
        // Log page view
        TrackingManager.log('PAGE_VIEW', { title: document.title });
    },

    getDailyCode() {
        // 한국 시간 기준 YYYYMMDD 생성
        const now = new Date();
        const kstStr = new Intl.DateTimeFormat('ko-KR', {
            timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(now).replace(/\. /g, '').replace(/\./g, ''); // "20240318"
        
        // 날짜와 어드민 코드를 조합한 간단한 해시 (보안보다는 편의용 가상번호)
        const seed = parseInt(kstStr) + parseInt(this.CONFIG.ADMIN_CODE);
        return (seed % 10000).toString().padStart(4, '0');
    },

    checkExpiration() {
        // 1. 관리자 연장 날짜(localStorage)가 있는지 확인
        const overrideStr = localStorage.getItem('dashboard_expiry_override');
        const expiryStr = overrideStr || this.CONFIG.EXPIRY_DATE;
        const expiryDate = new Date(expiryStr);
        
        // 한국 시간(KST) 기준으로 '오늘' 계산
        const kstDateStr = new Intl.DateTimeFormat('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(new Date());
        
        const today = new Date(kstDateStr.replace(/\. /g, '-').replace(/\./g, ''));
        today.setHours(0, 0, 0, 0);
        expiryDate.setHours(0, 0, 0, 0);

        // 정지부실 실적현황 등에서 세션 해제 확인
        if (sessionStorage.getItem('dashboard_unlocked') === 'true') {
            return false;
        }

        // 2. 일회성 가상번호 인증 확인
        const dailyCode = this.getDailyCode();
        if (sessionStorage.getItem('daily_code_verified') === dailyCode) {
            return false;
        }

        if (today > expiryDate) {
            this.showLockOverlay();
            return true;
        }
        return false;
    },

    showLockOverlay() {
        const dailyCode = this.getDailyCode();
        
        // 스타일 주입
        const style = document.createElement('style');
        style.textContent = `
            #expiry-lock-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: #0f172a; z-index: 1000000; display: flex; align-items: center; justify-content: center;
                color: white; font-family: 'Pretendard', sans-serif;
            }
            .lock-card {
                background: #1e293b; padding: 50px 40px; border-radius: 32px; 
                border: 2px solid #ef4444; text-align: center; max-width: 500px; width: 95%;
                box-shadow: 0 0 100px rgba(239, 68, 68, 0.2);
            }
            .admin-dashboard { display: none; text-align: left; }
            .lock-warning-badge {
                background: #ef4444; color: white; padding: 6px 16px; border-radius: 50px;
                font-weight: 900; font-size: 13px; margin-bottom: 24px; display: inline-block;
            }
            .lock-card h2 { font-size: 28px; margin-bottom: 16px; font-weight: 900; }
            .lock-card p { color: #94a3b8; margin-bottom: 30px; line-height: 1.6; font-size: 16px; }
            .lock-input {
                width: 100%; padding: 18px; border-radius: 16px; border: 2px solid #334155;
                background: #0f172a; color: white; text-align: center;
                font-size: 24px; letter-spacing: 8px; outline: none; margin-bottom: 20px;
            }
            .lock-btn {
                width: 100%; padding: 16px; border-radius: 16px; background: #ef4444;
                color: white; border: none; font-weight: 800; font-size: 16px; cursor: pointer; transition: 0.2s;
            }
            .lock-btn:hover { background: #dc2626; transform: scale(1.02); }
            .admin-link { color: #475569; font-size: 12px; margin-top: 20px; cursor: pointer; text-decoration: underline; }
            
            /* 관리자 화면 스타일 */
            .admin-item { background: #0f172a; padding: 15px; border-radius: 12px; margin-bottom: 10px; border: 1px solid #334155; }
            .admin-item label { display: block; font-size: 12px; color: #64748b; margin-bottom: 5px; }
            .admin-item .val { font-size: 18px; font-weight: 700; color: #818cf8; }
            .admin-btn-secondary { background: #334155; color: white; padding: 10px; border-radius: 8px; border: none; width: 100%; cursor: pointer; margin-top: 5px; }
        `;
        document.head.appendChild(style);

        const overlay = document.createElement('div');
        overlay.id = 'expiry-lock-overlay';
        overlay.innerHTML = `
            <div class="lock-card" id="lock-main-card">
                <div id="user-view">
                    <div class="lock-warning-badge">ACCESS EXPIRED</div>
                    <h2>프로그램 사용 만료</h2>
                    <p>사용 기한이 만료되었습니다. 관리자에게 문의하여<br><b>'오늘의 가상번호'</b>를 입력하거나 승인을 받으세요.</p>
                    <input type="password" id="lock-code" class="lock-input" placeholder="••••">
                    <button class="lock-btn" id="unlock-btn">인증 코드 입력</button>
                    <div id="admin-login-link" class="admin-link">관리자 전용 설정</div>
                </div>

                <div id="admin-view" class="admin-dashboard">
                    <h2 style="color:#818cf8">Admin Management</h2>
                    <p style="margin-bottom:20px">관리자 권한으로 시스템을 제어합니다.</p>
                    
                    <div class="admin-item">
                        <label>오늘의 가상번호 (Daily Code)</label>
                        <div class="val">${dailyCode}</div>
                    </div>

                    <div class="admin-item">
                        <label>로컬 기간 연장 설정</label>
                        <input type="date" id="new-expiry-date" class="lock-input" style="font-size:16px; letter-spacing:0; padding:10px; height:auto; margin-top:5px">
                        <button class="lock-btn" id="extend-expiry-btn" style="background:#4f46e5">이 기기에서 기간 연장</button>
                    </div>

                    <button class="admin-btn-secondary" id="back-to-lock">뒤로 가기</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const userView = document.getElementById('user-view');
        const adminView = document.getElementById('admin-view');
        const lockInput = document.getElementById('lock-code');
        const unlockBtn = document.getElementById('unlock-btn');
        const adminLink = document.getElementById('admin-login-link');

        // 가상번호 또는 관리자 번호 체크
        const handleUnlock = () => {
            const val = lockInput.value;
            if (val === dailyCode) {
                sessionStorage.setItem('daily_code_verified', dailyCode);
                overlay.remove();
                location.reload();
            } else if (val === this.CONFIG.ADMIN_CODE) {
                userView.style.display = 'none';
                adminView.style.display = 'block';
                document.getElementById('lock-main-card').style.borderColor = '#4f46e5';
            } else {
                lockInput.value = '';
                lockInput.placeholder = 'INVALID';
                setTimeout(() => { lockInput.placeholder = '••••'; }, 1000);
            }
        };

        unlockBtn.onclick = handleUnlock;
        lockInput.onkeyup = (e) => { if (e.key === 'Enter') handleUnlock(); };
        adminLink.onclick = () => { lockInput.focus(); alert('관리자 암호를 입력창에 입력해주세요.'); };

        // 관리자 기능: 기간 연장
        document.getElementById('extend-expiry-btn').onclick = () => {
            const newDate = document.getElementById('new-expiry-date').value;
            if (!newDate) return alert('날짜를 선택해주세요.');
            localStorage.setItem('dashboard_expiry_override', newDate);
            alert('이 기기에서의 사용 기한이 ' + newDate + '까지로 연장되었습니다.');
            overlay.remove();
            location.reload();
        };

        document.getElementById('back-to-lock').onclick = () => {
            adminView.style.display = 'none';
            userView.style.display = 'block';
            document.getElementById('lock-main-card').style.borderColor = '#ef4444';
        };
    },

    showExportModal() {
        // 전용 스타일 주입
        const styleId = 'export-modal-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .modal-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px);
                    z-index: 200000; display: flex; align-items: center; justify-content: center;
                }
                .export-modal {
                    background: var(--surface-bg); padding: 40px; border-radius: 24px;
                    width: 420px; box-shadow: var(--shadow-md); border: 1px solid var(--border-color);
                    text-align: center; color: var(--text-main); font-family: 'Pretendard', sans-serif;
                }
                .export-modal h2 { margin-bottom: 20px; font-weight: 800; }
                .export-modal input {
                    width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--border-color);
                    margin-bottom: 16px; font-size: 15px; outline: none;
                }
                .daily-code-box {
                    background: #f8fafc; border: 1px dashed #cbd5e1; padding: 12px; border-radius: 12px;
                    margin-bottom: 20px; text-align: center;
                }
                .daily-code-box span { font-size: 20px; font-weight: 800; color: #4f46e5; letter-spacing: 2px; }
                .export-modal .btn-group { display: flex; gap: 10px; margin-top: 20px; }
                .export-modal .btn { flex: 1; padding: 12px; border-radius: 12px; cursor: pointer; font-weight: 700; border: none; }
                .export-btn { background: #4f46e5; color: white; }
                .cancel-btn { background: #f1f5f9; color: #64748b; }
            `;
            document.head.appendChild(style);
        }

        const dailyCode = this.getDailyCode();
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="export-modal">
                <h2>대시보드 내보내기 (보안)</h2>
                
                <div class="daily-code-box">
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">오늘의 일회성 가상번호 (사용자 공유용)</div>
                    <span>${dailyCode}</span>
                </div>

                <div style="text-align: left; margin-bottom: 15px;">
                    <label style="font-size: 12px; font-weight: 700; color: #64748b;">관리자 암호 확인</label>
                    <input type="password" id="export-pw" placeholder="••••">
                    <label style="font-size: 12px; font-weight: 700; color: #64748b;">내보낼 파일의 만료일 설정</label>
                    <input type="date" id="export-expiry" value="${this.CONFIG.EXPIRY_DATE}">
                </div>
                
                <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
                    ※ 설정한 날짜에 맞춰 자동으로 잠기는 독립형 파일이 생성됩니다.<br>
                    ※ 관리자는 파일 생성 후에도 가상번호를 통해 원격 승인이 가능합니다.
                </p>

                <div class="btn-group">
                    <button class="btn cancel-btn" id="export-cancel">취소</button>
                    <button class="btn export-btn" id="export-confirm">보안 파일 다운로드</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('export-cancel').onclick = () => modal.remove();
        document.getElementById('export-confirm').onclick = () => {
            const pw = document.getElementById('export-pw').value;
            const expiry = document.getElementById('export-expiry').value;
            
            if (pw !== this.CONFIG.ADMIN_CODE) {
                alert('관리자 암호가 틀렸습니다.');
                return;
            }
            
            if (!expiry) {
                alert('만료일을 설정해주세요.');
                return;
            }

            this.performExport(expiry);
            modal.remove();
        };
    },

    performExport(newExpiry) {
        const baseUrl = 'https://bough38-web.github.io/dashboard-2026/';
        const version = "2026.03.18.v9"; 

        // 1. 내보내기 전 현재 열려있는 모달 스타일 및 요소 임시 제거 (결과물에 포함되지 않도록)
        const modals = document.querySelectorAll('.modal-overlay, #expiry-lock-overlay');
        modals.forEach(m => m.style.display = 'none');
        
        // 스냅샷 촬영
        let html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

        // 모달 다시 표시 (현재 화면 유지용)
        modals.forEach(m => m.style.display = 'flex');

        // 2. 상대 경로를 절대 경로로 변환
        html = html.replace(/(src|href)="(?!(http|https|#|javascript:))([^"]+)"/g, `$1="${baseUrl}$3"`);

        // 3. [Advanced Fix] Auth Guard만 정밀 타겟팅하여 무력화
        html = html.replace(/(\(function\(\)\s*\{)(?=[^}]*sales_dashboard_session)/g, '$1if(window.DASHBOARD_EXPORT_CONFIG)return;');

        // 4. 보안 설정 스크립트 주입 (최상단)
        const overrideScript = `
    <script>
        // [Security] Standalone Dashboard Configuration (Built-in v9)
        window.DASHBOARD_EXPORT_CONFIG = {
            EXPIRY_DATE: "${newExpiry}",
            BASE_URL: "${baseUrl}",
            VERSION: "${version}",
            EXPORTED_AT: "${new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'})}"
        };
        // 즉시 반영 명령
        if (typeof ThemeManager !== 'undefined') {
            ThemeManager.CONFIG.EXPIRY_DATE = "${newExpiry}";
            ThemeManager.CONFIG.BASE_URL = "${baseUrl}";
        }
    </script>
`;
        html = html.replace(/<head>/i, '<head>' + overrideScript);

        // 5. 불필요한 내보내기용 스타일 제거 (결과물 최적화)
        html = html.replace(/<style id="export-modal-styles">.*?<\/style>/s, '');

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `2026_Dashboard_Export_${newExpiry}.html`;
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        TrackingManager.log('DASHBOARD_EXPORT', { expiry: newExpiry, version: version });
        alert('보안 대시보드가 성공적으로 생성되었습니다!\\n\\n파일명: ' + filename + '\\n\\n※ 오늘의 가상번호: ' + this.getDailyCode());
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
            { icon: 'fa-coins', text: '리텐션P값', href: '리텐션P값 실적현황.html' },
            { icon: 'fa-user-slash', text: '해지율', view: 'termination' },
            { icon: 'fa-list-check', text: '기관별 현황(요약)', view: 'summary' }
        ];

        const adminItems = [
            { icon: 'fa-download', text: '대시보드 내보내기 (보안)', action: () => this.showExportModal() },
            { icon: 'fa-history', text: '활동 모니터링', href: 'ADMIN_LOGS.html' },
            { icon: 'fa-file-alt', text: '개발 보고서', href: 'https://bough38-web.github.io/dashboard-2026/PROJECT_REPORT.html', target: '_blank' },
            { icon: 'fa-book', text: '사용 매뉴얼', href: 'https://bough38-web.github.io/dashboard-2026/USER_MANUAL.html', target: '_blank' }
        ];

        const currentPath = decodeURIComponent(window.location.pathname.split('/').pop() || 'index.html');
        const isIndex = (currentPath === 'index.html' || currentPath === '' || currentPath.includes('2026') || currentPath.includes('대시보드'));
        
        console.log(`[ThemeManager] Standardizing Navigation. Path: ${currentPath}, isIndex: ${isIndex}`);

        const navContainers = document.querySelectorAll('.nav-buttons, .header .nav-hub-btn-container');
        
        navContainers.forEach(container => {
            container.innerHTML = '';
            container.className = 'premium-nav-hub';
            
            navItems.forEach(item => {
                const btn = document.createElement('a');
                btn.className = `premium-nav-btn`;
                btn.innerHTML = `<i class="fas ${item.icon}"></i><span>${item.text}</span>`;
                
                if (item.href) {
                    // 내보내기 모드인 경우 기본 URL을 앞에 붙여 절대 경로로 만듭니다.
                    btn.href = this.CONFIG.BASE_URL ? (this.CONFIG.BASE_URL + item.href) : item.href;
                    if ((item.href === currentPath) || (item.href === 'index.html' && isIndex)) {
                        if (!item.view) btn.classList.add('active');
                    }
                }

                if (item.view) {
                    btn.id = 'nav-' + item.view;
                    if (isIndex) {
                        btn.href = 'javascript:void(0)';
                        btn.onclick = (e) => { 
                            e.preventDefault(); 
                            console.log(`[ThemeManager] View Switch: ${item.view}`);
                            if (typeof switchView === 'function') switchView(item.view); 
                            else console.error('switchView function not found');
                        };
                    } else {
                        btn.href = `index.html?view=${item.view}`;
                    }
                }

                container.appendChild(btn);
                console.log(`[ThemeManager] Injected button: ${item.text} (view: ${item.view || 'none'})`);
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
                if (admin.href) {
                    link.href = admin.href;
                } else {
                    link.href = 'javascript:void(0)';
                    link.onclick = (e) => { e.preventDefault(); admin.action(); };
                }
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
                    if (this.CONFIG.BASE_URL) {
                        location.href = this.CONFIG.BASE_URL + 'login.html';
                    } else {
                        location.href = 'login.html';
                    }
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
