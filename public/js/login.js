// Login page script
// Display error message from URL query params
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  const errorMsg = document.getElementById('error-msg');

  if (error === 'auth_failed') {
    errorMsg.textContent = 'فشل تسجيل الدخول عبر ديسكورد، حاول مرة أخرى.';
    errorMsg.style.display = 'block';
  }
});
