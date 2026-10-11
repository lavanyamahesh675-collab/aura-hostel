/**
 * Authentication Module
 */
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      const res = await window.API.post('/api/auth/login', { email, password });
      if (res.success) {
        window.location.href = window.location.pathname.includes('login') ? window.location.pathname.replace(/login(\.html)?$/, 'index.html') : './';
      } else {
        const alertBox = document.getElementById('loginAlertContainer');
        if (alertBox) {
          alertBox.innerHTML = `<div class="alert alert-danger mb-3">${res.message}</div>`;
        }
      }
    });
  }
});
