/**
 * Shared Dashboard Logic
 * Handles sidebar toggle, dark mode, user info display, and logout.
 */

document.addEventListener('DOMContentLoaded', function () {
    initializeSidebar();
    initializeDarkMode();
    initializeUserInfo();
    initializeDropdowns();
    initializeLogout();
});

function initializeSidebar() {
    // Sidebar toggle for mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function (e) {
            if (window.innerWidth <= 1024 &&
                sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Active nav item
    const navLinks = document.querySelectorAll('.nav-item');
    const currentPath = window.location.pathname.split('/').pop();

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }

        link.addEventListener('click', function () {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function initializeDarkMode() {
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    const toggleSwitch = document.querySelector('.toggle-switch');

    // Check saved preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        if (toggleSwitch) toggleSwitch.classList.add('active');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
            if (toggleSwitch) toggleSwitch.classList.toggle('active');

            // Save preference
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });
    }
}

function initializeUserInfo() {
    const userName = localStorage.getItem('userName') || 'User';
    const userRole = localStorage.getItem('userRole') || 'Member';
    const userEmail = localStorage.getItem('userEmail');
    const userPicture = localStorage.getItem('userPicture');

    // Update name elements
    const nameElements = document.querySelectorAll('#userName, #displayName, .user-name, #dropdownName');
    nameElements.forEach(el => el.textContent = userName);

    // Update welcome title specifically
    const welcomeElements = document.querySelectorAll('.welcome-title');
    welcomeElements.forEach(el => {
        el.textContent = `Welcome back, ${userName}!`;
    });

    // Update email elements
    if (userEmail) {
        const emailElements = document.querySelectorAll('#userEmail, #dropdownEmail, .user-email');
        emailElements.forEach(el => el.textContent = userEmail);
    }

    // Update role elements if any
    const roleElements = document.querySelectorAll('.user-role');
    roleElements.forEach(el => el.textContent = userRole);

    // Update avatar
    const avatarElements = document.querySelectorAll('.user-avatar, .avatar');
    avatarElements.forEach(avatar => {
        if (userPicture) {
            avatar.innerHTML = `<img src="${userPicture}" alt="${userName}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            avatar.textContent = getInitials(userName);
        }
    });

    // Background sync to fetch updated user metadata from Supabase
    if (typeof supabaseClient !== 'undefined') {
        supabaseClient.auth.getUser().then(async ({ data: { user } }) => {
            if (user) {
                let newName = user.user_metadata?.full_name || localStorage.getItem('userName');
                
                // Fetch from public users table in case it was edited manually by admin or user
                try {
                    const { data: dbUser } = await supabaseClient.from('users').select('full_name, name').eq('id', user.id).single();
                    if (dbUser) {
                        if (dbUser.full_name) newName = dbUser.full_name;
                        else if (dbUser.name) newName = dbUser.name;
                    }
                } catch(e) {}

                if (newName && newName !== localStorage.getItem('userName')) {
                    // Update localStorage
                    localStorage.setItem('userName', newName);
                    
                    // Update UI elements dynamically
                    nameElements.forEach(el => el.textContent = newName);
                    welcomeElements.forEach(el => { el.textContent = `Welcome back, ${newName}!`; });
                    if (!userPicture) {
                        avatarElements.forEach(avatar => { avatar.textContent = getInitials(newName); });
                    }

                    // Keep BiblioraAuth session object in sync
                    if (typeof BiblioraAuth !== 'undefined') {
                        const session = BiblioraAuth.getSession();
                        if (session) {
                            session.userName = newName;
                            localStorage.setItem('bib_session', JSON.stringify(session));
                        }
                    }
                }
            }
        }).catch(err => console.error('Error syncing user info:', err));
    }
}

function initializeLogout() {
    const logoutBtn = document.getElementById('logoutBtn') || document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }

    window.logout = function () {
        if (typeof BiblioraAuth !== 'undefined') {
            BiblioraAuth.clearSession();
        } else {
            // Fallback if security.js not loaded
            ['userEmail','userRole','userName','userId','userPicture','userMembership',
             'bib_session','bib_lastActive'].forEach(k => localStorage.removeItem(k));
        }
        window.location.href = 'login.html';
    };

    // Refresh session TTL on every dashboard page view
    if (typeof BiblioraAuth !== 'undefined') {
        BiblioraAuth.refreshSession();
    }
}

function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function initializeDropdowns() {
    // Elements
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');

    const notifBtn = document.getElementById('notifBtn');
    const notifDropdown = document.getElementById('notifDropdown');

    const msgBtn = document.getElementById('msgBtn');
    const msgDropdown = document.getElementById('msgDropdown');

    const dropdowns = [userDropdown, notifDropdown, msgDropdown];
    const triggers = [userAvatar, notifBtn, msgBtn];

    // Helper to close all dropdowns except one
    function closeAllDropdowns(except = null) {
        dropdowns.forEach(dropdown => {
            if (dropdown && dropdown !== except) {
                dropdown.classList.remove('show');
            }
        });
    }

    // Toggle handlers
    if (userAvatar && userDropdown) {
        userAvatar.addEventListener('click', function (e) {
            e.stopPropagation();
            if (userDropdown.classList.contains('show')) {
                userDropdown.classList.remove('show');
            } else {
                closeAllDropdowns();
                userDropdown.classList.add('show');
            }
        });
    }

    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (notifDropdown.classList.contains('show')) {
                notifDropdown.classList.remove('show');
            } else {
                closeAllDropdowns();
                notifDropdown.classList.add('show');
            }
        });
    }

    if (msgBtn && msgDropdown) {
        msgBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (msgDropdown.classList.contains('show')) {
                msgDropdown.classList.remove('show');
            } else {
                closeAllDropdowns();
                msgDropdown.classList.add('show');
            }
        });
    }

    // Close when clicking outside
    document.addEventListener('click', function (e) {
        if (!triggers.some(trigger => trigger && trigger.contains(e.target)) &&
            !dropdowns.some(dropdown => dropdown && dropdown.contains(e.target))) {
            closeAllDropdowns();
        }
    });
}