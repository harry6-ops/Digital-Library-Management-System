document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const fullname = document.getElementById("fullname").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirm_password = document.getElementById("confirm_password").value;

            if (password !== confirm_password) {
                alert("Passwords do not match!");
                return;
            }

            try {
                const { data, error } = await supabaseClient.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: fullname
                        }
                    }
                });

                if (error) {
                    alert("Sign up failed: " + error.message);
                } else {
                    alert("Account created successfully! You can now log in.");
                    window.location.href = "login.html";
                }
            } catch (err) {
                console.error("Signup error:", err);
                alert("An error occurred during signup.");
            }
        });
    }
});