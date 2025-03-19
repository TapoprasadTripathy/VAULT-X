document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    
    // Check if user is already logged in
    checkAuth().then(user => {
      if (user) {
        window.location.href = 'dashboard.html';
      }
    });
    
    // Toggle between login and register forms
    showRegisterBtn.addEventListener('click', function() {
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
      authTitle.textContent = 'Create a new account';
      authSubtitle.innerHTML = 'Or <button id="show-login-alt" class="font-medium text-primary hover:text-primary/90">sign in to your account</button>';
      
      // Add event listener to the new "sign in" button
      document.getElementById('show-login-alt').addEventListener('click', function() {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        authTitle.textContent = 'Sign in to your account';
        authSubtitle.innerHTML = 'Or <button id="show-register" class="font-medium text-primary hover:text-primary/90">create a new account</button>';
        
        // Re-add event listener to the new "create account" button
        document.getElementById('show-register').addEventListener('click', showRegisterBtn.onclick);
      });
    });
    
    showLoginBtn.addEventListener('click', function() {
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      authTitle.textContent = 'Sign in to your account';
      authSubtitle.innerHTML = 'Or <button id="show-register-alt" class="font-medium text-primary hover:text-primary/90">create a new account</button>';
      
      // Add event listener to the new "create account" button
      document.getElementById('show-register-alt').addEventListener('click', function() {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        authTitle.textContent = 'Create a new account';
        authSubtitle.innerHTML = 'Or <button id="show-login-alt" class="font-medium text-primary hover:text-primary/90">sign in to your account</button>';
        
        // Re-add event listener to the new "sign in" button
        document.getElementById('show-login-alt').addEventListener('click', showLoginBtn.onclick);
      });
    });
  
    // Form submission handling
    document.getElementById('login-form-element').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      
      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';
      
      fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Login failed');
        }
        return response.json();
      })
      .then(() => {
        window.location.href = 'dashboard.html';
      })
      .catch(error => {
        alert('Login failed: ' + error.message);
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
    });
    
    document.getElementById('register-form-element').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const username = document.getElementById('register-username').value;
      const password = document.getElementById('register-password').value;
      
      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Registering...';
      
      fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, username, password })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Registration failed');
        }
        return response.json();
      })
      .then(() => {
        window.location.href = 'dashboard.html';
      })
      .catch(error => {
        alert('Registration failed: ' + error.message);
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
    });
  });