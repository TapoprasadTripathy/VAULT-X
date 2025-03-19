document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuth().then(user => {
      if (!user) return; // Auth check will redirect if needed
    });
    
    // Handle form submission
    const goalForm = document.getElementById('goal-form');
    
    goalForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form values
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const targetAmount = parseFloat(document.getElementById('targetAmount').value);
      const lockPeriodDays = parseInt(document.getElementById('lockPeriodDays').value, 10);
      
      // Validate inputs
      if (!title || !description || isNaN(targetAmount) || isNaN(lockPeriodDays)) {
        alert('Please fill in all fields with valid values');
        return;
      }
      
      if (targetAmount <= 0) {
        alert('Target amount must be greater than zero');
        return;
      }
      
      if (lockPeriodDays <= 0) {
        alert('Lock period must be at least 1 day');
        return;
      }
      
      // Show loading state
      const submitBtn = goalForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating...';
      
      try {
        // Submit goal
        const response = await fetch(`${API_BASE_URL}/api/savings-goals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title,
            description,
            targetAmount,
            lockPeriodDays,
            currentAmount: 0,
            completed: false
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create goal');
        }
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      } catch (error) {
        console.error('Error creating goal:', error);
        alert('Failed to create goal: ' + error.message);
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  });