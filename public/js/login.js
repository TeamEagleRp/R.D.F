// Login page script
document.addEventListener('DOMContentLoaded', () => {
  // Display error message from URL query params
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  const errorMsg = document.getElementById('error-msg');

  const messages = {
    auth_failed: 'فشل تسجيل الدخول عبر ديسكورد، حاول مرة أخرى.',
    not_in_guild: 'يجب أن تكون عضواً في سيرفر LSPD للدخول.',
    service_unavailable: 'البوت غير متصل حالياً. حاول مرة أخرى بعد قليل.',
  };
  if (error && messages[error]) {
    errorMsg.textContent = messages[error];
    errorMsg.style.display = 'block';
  }

  // Set the Discord login button to the configured backend login URL
  const loginBtn = document.getElementById('discord-login-btn');
  if (loginBtn && window.LOGIN_URL) {
    loginBtn.href = window.LOGIN_URL;
  }
});
