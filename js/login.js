document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const passwordInput = document.getElementById("password").value;

            if (email === 'admin@library.com' && passwordInput === 'password') {
                localStorage.setItem("userId", "admin_demo");
                localStorage.setItem("userName", "Admin User");
                localStorage.setItem("userEmail", email);
                localStorage.setItem("userRole", "admin");
                window.location.href = "dashboard-admin.html";
            } else {
                supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: passwordInput
                }).then(({ data, error }) => {
                    if (error) {
                        alert(error.message);
                    } else if (data.user) {
                        localStorage.setItem("userId", data.user.id);
                        localStorage.setItem("userName", data.user.user_metadata?.full_name || "User");
                        localStorage.setItem("userEmail", data.user.email);
                        localStorage.setItem("userRole", "user");
                        window.location.href = "dashboard.html";
                    }
                }).catch(err => {
                    console.error("Login error:", err);
                    alert("An error occurred during login.");
                });
            }
        });
    }

    // Password toggle
    const togglePassword = document.querySelector('#togglePassword');
    const password = document.querySelector('#password');

    if (togglePassword && password) {
        togglePassword.addEventListener('click', function () {
            const type =
                password.getAttribute('type') === 'password'
                    ? 'text'
                    : 'password';

            password.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }



});