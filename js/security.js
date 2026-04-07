/**
 * Bibliora Security Module
 * ─────────────────────────────────────────────
 * Features:
 *  1. Brute-force / rate-limit protection (5 attempts → 15-min lockout)
 *  2. Session expiry (8 hours by default, reset on activity)
 *  3. Inactivity auto-logout (30 minutes of no mouse/key events)
 *  4. Auth guards for user & admin dashboards
 *  5. Secure session storage helpers
 */

const BiblioraAuth = (() => {

    /* ── Constants ── */
    const MAX_ATTEMPTS    = 5;
    const LOCKOUT_MS      = 15 * 60 * 1000;   // 15 minutes
    const SESSION_TTL_MS  = 8  * 60 * 60 * 1000; // 8 hours
    const IDLE_TIMEOUT_MS = 30 * 60 * 1000;   // 30 minutes

    /* ── Keys ── */
    const K = {
        attempts : 'bib_loginAttempts',
        lockUntil: 'bib_lockUntil',
        session  : 'bib_session',
        lastActive: 'bib_lastActive',
    };

    /* ══════════════════════════════════════════
       BRUTE-FORCE PROTECTION
    ══════════════════════════════════════════ */

    function getLockUntil() {
        return parseInt(localStorage.getItem(K.lockUntil) || '0', 10);
    }

    function getAttempts() {
        return parseInt(localStorage.getItem(K.attempts) || '0', 10);
    }

    /** Returns { locked: bool, remainingSec: number } */
    function lockoutStatus() {
        const until = getLockUntil();
        if (!until) return { locked: false, remainingSec: 0 };
        const remaining = until - Date.now();
        if (remaining <= 0) {
            localStorage.removeItem(K.lockUntil);
            localStorage.removeItem(K.attempts);
            return { locked: false, remainingSec: 0 };
        }
        return { locked: true, remainingSec: Math.ceil(remaining / 1000) };
    }

    function recordFailedAttempt() {
        const attempts = getAttempts() + 1;
        localStorage.setItem(K.attempts, attempts);
        if (attempts >= MAX_ATTEMPTS) {
            const lockUntil = Date.now() + LOCKOUT_MS;
            localStorage.setItem(K.lockUntil, lockUntil);
        }
        return { attempts, locked: attempts >= MAX_ATTEMPTS };
    }

    function clearAttempts() {
        localStorage.removeItem(K.attempts);
        localStorage.removeItem(K.lockUntil);
    }

    function remainingAttemptsWarning() {
        const attempts = getAttempts();
        const left = MAX_ATTEMPTS - attempts;
        if (left <= 2 && left > 0) return `${left} attempt${left === 1 ? '' : 's'} remaining before lockout.`;
        return null;
    }

    /* ══════════════════════════════════════════
       SESSION MANAGEMENT
    ══════════════════════════════════════════ */

    function createSession(userData) {
        const session = {
            userId   : userData.userId,
            userName : userData.userName,
            userEmail: userData.userEmail,
            userRole : userData.userRole,
            createdAt: Date.now(),
            expiresAt: Date.now() + SESSION_TTL_MS,
        };
        localStorage.setItem(K.session, JSON.stringify(session));
        localStorage.setItem(K.lastActive, Date.now());

        // Also set individual keys for existing dashboard-base.js compatibility
        localStorage.setItem('userId',    userData.userId);
        localStorage.setItem('userName',  userData.userName);
        localStorage.setItem('userEmail', userData.userEmail);
        localStorage.setItem('userRole',  userData.userRole);
    }

    function getSession() {
        try {
            const raw = localStorage.getItem(K.session);
            if (!raw) return null;
            const session = JSON.parse(raw);
            if (Date.now() > session.expiresAt) {
                clearSession();
                return null;
            }
            return session;
        } catch {
            return null;
        }
    }

    function clearSession() {
        localStorage.removeItem(K.session);
        localStorage.removeItem(K.lastActive);
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userPicture');
        localStorage.removeItem('userMembership');
    }

    function refreshSession() {
        const session = getSession();
        if (!session) return;
        session.expiresAt = Date.now() + SESSION_TTL_MS;
        localStorage.setItem(K.session, JSON.stringify(session));
        localStorage.setItem(K.lastActive, Date.now());
    }

    function isAuthenticated() {
        return getSession() !== null;
    }

    function isAdmin() {
        const session = getSession();
        return session && session.userRole === 'admin';
    }

    /* ══════════════════════════════════════════
       INACTIVITY TIMEOUT
    ══════════════════════════════════════════ */

    let idleTimer = null;

    function resetIdleTimer() {
        clearTimeout(idleTimer);
        localStorage.setItem(K.lastActive, Date.now());
        idleTimer = setTimeout(() => {
            clearSession();
            window.location.replace('login.html?reason=idle');
        }, IDLE_TIMEOUT_MS);
    }

    function startInactivityWatcher() {
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
        events.forEach(ev => document.addEventListener(ev, resetIdleTimer, { passive: true }));
        resetIdleTimer(); // start the clock
    }

    /* ══════════════════════════════════════════
       AUTH GUARDS
    ══════════════════════════════════════════ */

    function requireAuth(redirectTo = 'login.html') {
        if (!isAuthenticated()) {
            window.location.replace(redirectTo + '?reason=auth');
            return false;
        }
        return true;
    }

    function requireAdmin(redirectTo = 'login.html') {
        if (!isAdmin()) {
            clearSession();
            window.location.replace(redirectTo + '?reason=auth');
            return false;
        }
        return true;
    }

    function redirectIfLoggedIn(redirectTo = 'dashboard.html') {
        const session = getSession();
        if (!session) return;
        if (session.userRole === 'admin') {
            window.location.replace('dashboard-admin.html');
        } else {
            window.location.replace(redirectTo);
        }
    }

    /* ══════════════════════════════════════════
       LOGIN URL REASON BANNER
    ══════════════════════════════════════════ */

    function showLoginReason() {
        const params = new URLSearchParams(window.location.search);
        const reason = params.get('reason');
        if (!reason) return;

        const messages = {
            idle : { text: 'You were signed out due to inactivity.', type: 'error' },
            auth : { text: 'Please sign in to continue.',             type: 'error' },
            reset: { text: 'Password reset. Please sign in.',         type: 'success' },
        };

        const msg = messages[reason];
        if (!msg) return;

        // Works with any page that has #msgBox and #msgText
        const box  = document.getElementById('msgBox');
        const text = document.getElementById('msgText');
        if (box && text) {
            box.className = 'msg-box ' + msg.type;
            const icon = box.querySelector('i');
            if (icon) {
                icon.className = msg.type === 'error'
                    ? 'fas fa-circle-exclamation'
                    : 'fas fa-circle-check';
            }
            text.textContent = msg.text;
        }
    }

    /* ══════════════════════════════════════════
       PUBLIC API
    ══════════════════════════════════════════ */
    return {
        // Brute-force
        lockoutStatus,
        recordFailedAttempt,
        clearAttempts,
        remainingAttemptsWarning,

        // Session
        createSession,
        getSession,
        clearSession,
        refreshSession,
        isAuthenticated,
        isAdmin,

        // Inactivity
        startInactivityWatcher,

        // Guards
        requireAuth,
        requireAdmin,
        redirectIfLoggedIn,

        // UI helpers
        showLoginReason,
    };
})();

// Expose globally
window.BiblioraAuth = BiblioraAuth;
