// Login page script
document.addEventListener('DOMContentLoaded', () => {
  // Display error message from URL query params
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  const errorMsg = document.getElementById('error-msg');

  if (error === 'auth_failed') {
    errorMsg.textContent = 'فشل تسجيل الدخول عبر ديسكورد، حاول مرة أخرى.';
    errorMsg.style.display = 'block';
  }

  // Set the Discord login button to the configured backend login URL
  const loginBtn = document.getElementById('discord-login-btn');
  if (loginBtn && window.LOGIN_URL) {
    loginBtn.href = window.LOGIN_URL;
  }
});
