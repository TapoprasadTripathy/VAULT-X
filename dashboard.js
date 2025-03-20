document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuth().then(user => {
      if (!user) return; // Auth check will redirect if needed
      
      // Load user's savings goals
      loadGoals();
      
      // Load transactions
      loadTransactions();
    });
    
    // Load savings goals
    async function loadGoals() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/savings-goals`);
        if (!response.ok) throw new Error('Failed to load goals');
        
        const goals = await response.json();
        
        // Update summary cards
        updateSummaryCards(goals);
        
        // Render goals list
        renderGoals(goals);
      } catch (error) {
        console.error('Error loading goals:', error);
      }
    }
    
    // Load transactions
    async function loadTransactions() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/transactions`);
        if (!response.ok) throw new Error('Failed to load transactions');
        
        const transactions = await response.json();
        renderTransactions(transactions);
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    }
    
    // Update summary cards with data
    function updateSummaryCards(goals) {
      const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
      const totalGoals = goals.length;
      const activeGoals = goals.filter(goal => !goal.completed).length;
      
      document.getElementById('total-saved').textContent = formatCurrency(totalSaved);
      document.getElementById('total-goals').textContent = totalGoals.toString();
      document.getElementById('active-goals').textContent = activeGoals.toString();
    }
    
    // Render goals list
    function renderGoals(goals) {
      const container = document.getElementById('goals-container');
      const emptyState = document.getElementById('empty-goals');
      
      if (goals.length === 0) {
        emptyState.classList.remove('hidden');
        return;
      }
      
      // Hide empty state
      emptyState.classList.add('hidden');
      
      // Clear existing goals (except empty state)
      Array.from(container.children).forEach(child => {
        if (child.id !== 'empty-goals') {
          child.remove();
        }
      });
      
      // Add goal cards
      goals.forEach(goal => {
        const progressPercentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
        const daysRemaining = calculateDaysRemaining(goal.createdAt, goal.lockPeriodDays);
        
        const goalCard = document.createElement('div');
        goalCard.className = 'bg-card border border-border rounded-lg shadow-sm overflow-hidden';
        goalCard.innerHTML = `
          <div class="p-5">
            <div class="flex items-center justify-between">
              <h4 class="font-medium text-foreground">${goal.title}</h4>
              <div class="bg-primary/10 px-2 py-1 rounded text-xs font-medium text-primary">
                ${goal.completed ? 'Completed' : 'Active'}
              </div>
            </div>
            
            <div class="mt-4 flex items-center">
              <div class="progress-ring" style="width: 60px; height: 60px;">
                <svg width="60" height="60">
                  <circle class="progress-ring-circle" stroke="#27272a" stroke-width="4" fill="transparent" r="26" cx="30" cy="30" />
                  <circle class="progress-ring-circle" stroke="#0056FC" stroke-width="4" fill="transparent" r="26" cx="30" cy="30" 
                    stroke-dasharray="${2 * Math.PI * 26}" 
                    stroke-dashoffset="${2 * Math.PI * 26 * (1 - progressPercentage / 100)}" />
                </svg>
                <span class="absolute text-xs font-medium">${progressPercentage}%</span>
              </div>
              
              <div class="ml-4">
                <p class="text-sm text-muted-foreground">Target: ${formatCurrency(goal.targetAmount)}</p>
                <p class="text-sm text-muted-foreground">Saved: ${formatCurrency(goal.currentAmount)}</p>
                <p class="text-sm text-muted-foreground">${daysRemaining} days remaining</p>
              </div>
            </div>
            
            <div class="mt-4 flex justify-between">
              <button class="text-sm text-primary hover:text-primary/90 font-medium add-funds" data-goal-id="${goal.id}">Add funds</button>
              <button class="text-sm text-muted-foreground hover:text-foreground">Details</button>
            </div>
          </div>
        `;
        
        container.appendChild(goalCard);
      });
      
      // Add event listeners for "Add funds" buttons
      document.querySelectorAll('.add-funds').forEach(button => {
        button.addEventListener('click', function() {
          const goalId = this.getAttribute('data-goal-id');
          promptAddFunds(goalId);
        });
      });
    }
    
    // Render transactions
    function renderTransactions(transactions) {
      const tableBody = document.getElementById('transactions-table');
      const emptyRow = document.getElementById('empty-transactions');
      
      if (transactions.length === 0) {
        emptyRow.classList.remove('hidden');
        return;
      }
      
      // Hide empty state
      emptyRow.classList.add('hidden');
      
      // Clear existing transactions (except empty row)
      Array.from(tableBody.children).forEach(child => {
        if (child.id !== 'empty-transactions') {
          child.remove();
        }
      });
      
      // Add transaction rows
      transactions.slice(0, 10).forEach(transaction => {
        const row = document.createElement('tr');
        const date = new Date(transaction.createdAt);
        
        row.innerHTML = `
          <td>${transaction.type}</td>
          <td>${date.toLocaleDateString()}</td>
          <td>${transaction.goalTitle}</td>
          <td>${formatCurrency(transaction.amount)}</td>
        `;
        
        tableBody.appendChild(row);
      });
    }
    
    // Calculate days remaining
    function calculateDaysRemaining(createdAt, lockPeriodDays) {
      const startDate = new Date(createdAt);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + lockPeriodDays);
      
      const today = new Date();
      const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      
      return Math.max(0, daysRemaining);
    }
    
    // Add funds to a goal
    function promptAddFunds(goalId) {
      const amount = prompt('Enter amount to deposit:');
      if (!amount) return;
      
      const numAmount = parseFloat(amount);
      
      if (isNaN(numAmount) || numAmount <= 0) {
        alert('Please enter a valid amount');
        return;
      }
      
      addFunds(goalId, numAmount);
    }
    
    async function addFunds(goalId, amount) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            goalId,
            amount,
            type: 'Deposit'
          })
        });
        
        if (!response.ok) throw new Error('Failed to add funds');
        
        // Reload data
        loadGoals();
        loadTransactions();
        
        alert('Funds added successfully!');
      } catch (error) {
        console.error('Error adding funds:', error);
        alert('Failed to add funds: ' + error.message);
      }
    }
  });