// Common user state and auth functions
const API_BASE_URL = '';  // Empty for same-origin

// State management
let currentUser = null;

// Function to check authentication status
async function checkAuth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user`);
    if (response.status === 401) {
      // Not logged in, redirect to auth page if not already there
      if (!window.location.pathname.includes('auth.html') && 
          !window.location.pathname.includes('index.html')) {
        window.location.href = 'auth.html';
      }
      return null;
    }
    
    const user = await response.json();
    currentUser = user;
    return user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return null;
  }
}

// Logout function
async function logout() {
  try {
    await fetch(`${API_BASE_URL}/api/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    window.location.href = 'auth.html';
  } catch (error) {
    console.error('Error logging out:', error);
    alert('Failed to log out. Please try again.');
  }
}

// Function to initialize navigation
function initNavigation() {
  const logoutButtons = document.querySelectorAll('[data-logout]');
  logoutButtons.forEach(button => {
    button.addEventListener('click', logout);
  });
}

// Formatter for currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', initNavigation);