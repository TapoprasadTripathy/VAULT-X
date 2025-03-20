document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuth().then(user => {
      if (!user) return; // Auth check will redirect if needed
      
      // Load rewards data
      loadRewards();
      
      // Load reward progress
      loadRewardProgress();
    });
    
    // Load rewards
    async function loadRewards() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/rewards`);
        if (!response.ok) throw new Error('Failed to load rewards');
        
        const rewards = await response.json();
        renderRewards(rewards);
      } catch (error) {
        console.error('Error loading rewards:', error);
      }
    }
    
    // Load reward progress
    async function loadRewardProgress() {
      try {
        // Get goals for progress
        const goalsResponse = await fetch(`${API_BASE_URL}/api/savings-goals`);
        if (!goalsResponse.ok) throw new Error('Failed to load goals');
        
        const goals = await goalsResponse.json();
        
        // Calculate progress
        const completedGoals = goals.filter(goal => goal.completed).length;
        const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
        
        // Update progress bars
        updateGoalsProgress(completedGoals);
        updateSavingsProgress(totalSaved);
      } catch (error) {
        console.error('Error loading reward progress:', error);
      }
    }
    
    // Render rewards
    function renderRewards(rewards) {
      const availableContainer = document.getElementById('available-rewards');
      const redeemedContainer = document.getElementById('redeemed-rewards');
      const emptyAvailable = document.getElementById('empty-available-rewards');
      const emptyRedeemed = document.getElementById('empty-redeemed-rewards');
      
      // Split rewards
      const available = rewards.filter(reward => !reward.redeemed);
      const redeemed = rewards.filter(reward => reward.redeemed);
      
      // Handle available rewards
      if (available.length === 0) {
        emptyAvailable.classList.remove('hidden');
      } else {
        emptyAvailable.classList.add('hidden');
        
        // Clear existing rewards (except empty state)
        Array.from(availableContainer.children).forEach(child => {
          if (child.id !== 'empty-available-rewards') {
            child.remove();
          }
        });
        
        // Add reward cards
        available.forEach(reward => {
          const rewardCard = document.createElement('div');
          rewardCard.className = 'bg-card border border-border rounded-lg shadow-sm relative';
          
          const badgeType = reward.type === 'cashback' ? 'yellow' : 'green';
          const badgeText = reward.type.charAt(0).toUpperCase() + reward.type.slice(1);
          
          rewardCard.innerHTML = `
            <div class="absolute top-4 right-4 bg-${badgeType}-500/10 px-2 py-1 rounded-full">
              <span class="text-xs font-medium text-${badgeType}-500">${badgeText}</span>
            </div>
            <div class="p-6">
              <h4 class="font-semibold text-foreground text-lg">${reward.title}</h4>
              <p class="text-muted-foreground mt-1">${reward.description}</p>
              
              <div class="mt-4 flex items-center text-sm text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="ml-2">Expires in ${reward.expiresInDays} days</span>
              </div>
              
              <div class="mt-6">
                <button class="w-full py-2 px-4 bg-primary text-white rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary redeem-btn" data-reward-id="${reward.id}">
                  Redeem
                </button>
              </div>
            </div>
          `;
          
          availableContainer.appendChild(rewardCard);
        });
        
        // Add event listeners for redeem buttons
        document.querySelectorAll('.redeem-btn').forEach(button => {
          button.addEventListener('click', function() {
            const rewardId = this.getAttribute('data-reward-id');
            redeemReward(rewardId);
          });
        });
      }
      
      // Handle redeemed rewards
      if (redeemed.length === 0) {
        emptyRedeemed.classList.remove('hidden');
      } else {
        emptyRedeemed.classList.add('hidden');
        
        // Clear existing redeemed rewards (except empty state)
        Array.from(redeemedContainer.children).forEach(child => {
          if (child.id !== 'empty-redeemed-rewards') {
            child.remove();
          }
        });
        
        // Add redeemed reward cards
        redeemed.forEach(reward => {
          const rewardCard = document.createElement('div');
          rewardCard.className = 'bg-card border border-border rounded-lg shadow-sm relative opacity-75';
          
          const badgeType = reward.type === 'cashback' ? 'yellow' : 'green';
          const badgeText = reward.type.charAt(0).toUpperCase() + reward.type.slice(1);
          
          rewardCard.innerHTML = `
            <div class="absolute top-4 right-4 bg-${badgeType}-500/10 px-2 py-1 rounded-full">
              <span class="text-xs font-medium text-${badgeType}-500">${badgeText}</span>
            </div>
            <div class="p-6">
              <h4 class="font-semibold text-foreground text-lg">${reward.title}</h4>
              <p class="text-muted-foreground mt-1">${reward.description}</p>

