<template>
  <div class="bg-image">
    <div class="header-nav" @click="toHome">
      <v-img class="logo-small" :width="80" :src="presentNowIcon"></v-img>
      <h3 class="logo-text">presentnow</h3>
    </div>
    
    <div class="main-content">
      <div v-if="loading" class="loading-container">
        <v-progress-circular indeterminate color="#e46842" size="64" width="6"></v-progress-circular>
        <p class="loading-text">Loading wishlist...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <v-icon size="64" color="#f44336">mdi-alert-circle</v-icon>
        <h2 class="error-title">{{ error }}</h2>
        <v-btn color="#e46842" size="large" @click="toHome" class="mt-4">
          <v-icon left>mdi-home</v-icon>
          Go Home
        </v-btn>
      </div>
      
      <div v-else class="wishlist-container">
        <div class="page-header">
          <h1 class="wishlist-name">{{ wishListName }}</h1>
        </div>
        
        <!-- Deadline Section -->
        <v-card v-if="deadline" class="deadline-card elevation-4 mx-auto mb-6">
          <v-card-title class="card-title-centered">
            <v-icon color="#e46842" size="large" class="mr-2">mdi-calendar-clock</v-icon>
            Time Remaining
          </v-card-title>
          <v-card-text class="text-center pb-4">
            <div class="deadline-date">{{ formatDeadline(deadline) }}</div>
            <div class="time-remaining" :class="{ 'time-urgent': isUrgent }">
              {{ timeRemaining }}
            </div>
          </v-card-text>
        </v-card>

        <!-- Wishes Section -->
        <v-card class="wishes-card elevation-4 mx-auto">
          <v-card-title class="card-title-centered">
            <v-icon color="#e46842" size="large" class="mr-2">mdi-gift</v-icon>
            Wishlist
          </v-card-title>
          <v-card-text class="pa-6">
            <div v-if="wishes.length === 0" class="empty-state">
              <v-icon size="80" color="#ccc">mdi-gift-outline</v-icon>
              <p>This wishlist is empty</p>
            </div>
            <v-row v-else>
              <v-col v-for="wish in wishes" :key="wish.id" cols="12" sm="6" md="4">
                <v-card 
                  class="wish-card" 
                  :class="{ 
                    'wish-card-clickable': wish.url && !wish.claimed,
                    'wish-card-claimed': wish.claimed 
                  }"
                  elevation="3"
                  @click="handleWishClick(wish)"
                >
                  <div class="wish-card-header">
                    <v-chip v-if="wish.claimed" color="success" size="small" class="claimed-chip">
                      <v-icon size="small" start>mdi-check</v-icon>
                      Claimed
                    </v-chip>
                    <v-icon v-else-if="wish.url" size="small" color="#2196f3" class="link-icon">
                      mdi-link-variant
                    </v-icon>
                  </div>
                  
                  <v-card-title class="wish-title">
                    {{ wish.name || 'Unnamed Wish' }}
                  </v-card-title>
                  
                  <v-card-text class="wish-description">
                    <div v-if="wish.description" class="description-text">
                      {{ wish.description }}
                    </div>
                    <div v-if="wish.claimed && wish.claimerName" class="claimer-info">
                      <v-icon size="small" class="mr-1">mdi-account</v-icon>
                      Claimed by {{ wish.claimerName }}
                    </div>
                  </v-card-text>
                  
                  <v-card-actions v-if="!wish.claimed" class="wish-actions">
                    <v-btn 
                      color="#e46842" 
                      variant="elevated" 
                      block
                      class="claim-btn"
                      @click.stop="openClaimDialog(wish)"
                    >
                      <v-icon start>mdi-hand-heart</v-icon>
                      I'll get this!
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- Claim Dialog -->
    <v-dialog v-model="claimDialog" max-width="500" persistent>
      <v-card class="claim-dialog-card">
        <v-card-title class="claim-dialog-header">
          <v-icon left color="white" size="large">mdi-hand-heart</v-icon>
          <span>Claim This Wish</span>
        </v-card-title>
        <v-card-text class="claim-dialog-content">
          <div class="claim-wish-name">
            <v-icon color="#e46842" class="mr-2">mdi-gift</v-icon>
            {{ selectedWish?.name }}
          </div>
          <p class="claim-instruction">Enter your name to let others know you'll get this gift:</p>
          <v-text-field
            v-model="claimerName"
            variant="outlined"
            placeholder="Your name"
            maxlength="100"
            :error-messages="claimError"
            @input="claimError = ''"
            color="#e46842"
            density="comfortable"
            autofocus
          >
            <template v-slot:prepend-inner>
              <v-icon color="#e46842">mdi-account</v-icon>
            </template>
          </v-text-field>
        </v-card-text>
        <v-card-actions class="claim-dialog-actions">
          <v-btn 
            color="grey" 
            variant="text"
            @click="closeClaimDialog"
            :disabled="claiming"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="#e46842" 
            variant="elevated"
            :loading="claiming"
            :disabled="claiming || !claimerName.trim()"
            @click="claimWish"
            class="claim-submit-btn"
          >
            <v-icon start>mdi-check-circle</v-icon>
            Claim Gift
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import '@fontsource/poppins';
import { onMounted, ref, computed, watch } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { getPublicWishList, publicClaimPresent } from '@/api/client.js';
import presentNowIcon from '@/assets/images/presentnow-icon.png';

const route = useRoute();
const router = useRouter();

const wishListName = ref('');
const deadline = ref(null);
const wishes = ref([]);
const loading = ref(true);
const error = ref(null);

// Claim dialog state
const claimDialog = ref(false);
const selectedWish = ref(null);
const claimerName = ref('');
const claiming = ref(false);
const claimError = ref('');

// Session storage key for claimer name
const CLAIMER_NAME_KEY = 'presentnow_claimer_name';

function toHome() {
  router.push('/');
}

function formatDeadline(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

const timeRemaining = computed(() => {
  if (!deadline.value) return '';
  
  const now = new Date();
  const end = new Date(deadline.value);
  const diff = end - now;
  
  if (diff <= 0) {
    return 'Expired';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
});

const isUrgent = computed(() => {
  if (!deadline.value) return false;
  const now = new Date();
  const end = new Date(deadline.value);
  const diff = end - now;
  const daysRemaining = diff / (1000 * 60 * 60 * 24);
  return daysRemaining <= 7 && daysRemaining > 0;
});

function handleWishClick(wish) {
  // If wish is claimed, do nothing
  if (wish.claimed) {
    return;
  }
  
  // If wish has URL, open it
  if (wish.url) {
    openWishLink(wish.url);
  }
}

function openWishLink(url) {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function openClaimDialog(wish) {
  selectedWish.value = wish;
  
  // Try to load saved claimer name from session storage
  const savedName = sessionStorage.getItem(CLAIMER_NAME_KEY);
  if (savedName) {
    claimerName.value = savedName;
  }
  
  claimDialog.value = true;
}

function closeClaimDialog() {
  claimDialog.value = false;
  selectedWish.value = null;
  claimError.value = '';
}

async function claimWish() {
  if (!claimerName.value.trim()) {
    claimError.value = 'Please enter your name';
    return;
  }
  
  if (!selectedWish.value) {
    claimError.value = 'No wish selected';
    return;
  }
  
  claiming.value = true;
  try {
    const trimmedName = claimerName.value.trim();
    
    // Use the new claim endpoint
    const updatedPresent = await publicClaimPresent(selectedWish.value.id, trimmedName);
    
    // Save claimer name to session storage for future claims
    sessionStorage.setItem(CLAIMER_NAME_KEY, trimmedName);
    
    // Update the local wish object with the response data
    const wishIndex = wishes.value.findIndex(w => w.id === selectedWish.value.id);
    if (wishIndex !== -1) {
      wishes.value[wishIndex] = updatedPresent;
    }
    
    closeClaimDialog();
  } catch (e) {
    console.error('Failed to claim wish:', e);
    claimError.value = 'Failed to claim. Please try again.';
  } finally {
    claiming.value = false;
  }
}

watch(wishListName, (newName) => {
  if (newName) {
    document.title = `${newName} - presentnow`;
  }
});

onMounted(async () => {
  try {
    const wishListId = route.params.id;
    if (!wishListId) {
      error.value = 'No wishlist ID provided';
      loading.value = false;
      return;
    }

    const wishList = await getPublicWishList(wishListId);
    if (wishList) {
      wishListName.value = wishList.name || 'Unnamed Wishlist';
      
      if (wishList.expires) {
        deadline.value = wishList.expires;
      }
      
      if (Array.isArray(wishList.presentIdeas)) {
        wishes.value = wishList.presentIdeas;
      }
    } else {
      error.value = 'Wishlist not found';
    }
  } catch (e) {
    console.error('Failed to load wishlist:', e);
    error.value = 'Failed to load wishlist';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.bg-image {
  background-image: url('@/assets/images/background.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  width: 100%;
  padding: 2rem 1rem;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  margin-bottom: 2rem;
  width: fit-content;
}

.header-nav:hover {
  transform: scale(1.05);
}

.logo-small {
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
}

.logo-text {
  color: #e46842;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 4rem 2rem;
  animation: fadeIn 0.5s ease-in;
}

.loading-text {
  margin-top: 1.5rem;
  font-size: 1.2rem;
  color: #666;
  font-weight: 500;
}

.error-title {
  margin-top: 1rem;
  color: #f44336;
  font-weight: 600;
}

.wishlist-container {
  animation: fadeIn 0.6s ease-in;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.wishlist-name {
  color: #e46842;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.deadline-card,
.wishes-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px !important;
  animation: slideUp 0.5s ease-out;
}

.deadline-card {
  max-width: 600px;
}

.card-title-centered {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  padding: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.deadline-date {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1rem;
}

.time-remaining {
  font-size: 2rem;
  font-weight: 700;
  color: #e46842;
}

.time-urgent {
  color: #f44336;
  animation: pulse 2s ease-in-out infinite;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}

.empty-state p {
  margin-top: 1rem;
  font-size: 1.2rem;
}

.wish-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px !important;
  transition: all 0.3s ease;
  background: white;
  border-left: 4px solid transparent;
}

.wish-card:not(.wish-card-claimed) {
  border-left-color: #e46842;
}

.wish-card-clickable {
  cursor: pointer;
}

.wish-card-clickable:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.wish-card-claimed {
  opacity: 0.7;
  background: #f5f5f5;
  border-left-color: #4caf50;
}

.wish-card-header {
  padding: 0.75rem 1rem 0;
  display: flex;
  justify-content: flex-end;
  min-height: 36px;
}

.claimed-chip {
  font-weight: 600;
}

.link-icon {
  opacity: 0.7;
}

.wish-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  padding: 0.5rem 1rem;
  word-break: break-word;
}

.wish-description {
  padding: 0 1rem 1rem;
  flex-grow: 1;
}

.description-text {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.claimer-info {
  color: #4caf50;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  margin-top: 0.75rem;
}

.wish-actions {
  padding: 0 1rem 1rem;
}

.claim-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.claim-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(228, 104, 66, 0.3) !important;
}

.claim-dialog-card {
  border-radius: 16px !important;
  overflow: hidden;
}

.claim-dialog-header {
  background: linear-gradient(135deg, #e46842 0%, #d94d27 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.4rem;
  font-weight: 700;
}

.claim-dialog-content {
  padding: 2rem 1.5rem 1.5rem;
}

.claim-wish-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.claim-instruction {
  color: #666;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.claim-dialog-actions {
  padding: 1rem 1.5rem 1.5rem;
  justify-content: space-between;
}

.claim-submit-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@media (max-width: 960px) {
  .wishlist-name {
    font-size: 2rem;
  }
  
  .time-remaining {
    font-size: 1.5rem;
  }
}

@media (max-width: 600px) {
  .bg-image {
    padding: 1rem 0.5rem;
  }
  
  .wishlist-name {
    font-size: 1.8rem;
  }
  
  .card-title-centered {
    font-size: 1.2rem;
    padding: 1rem;
  }
  
  .time-remaining {
    font-size: 1.3rem;
  }
  
  .wishes-card {
    margin: 0;
  }
  
  .wish-card {
    margin-bottom: 0.75rem;
  }
  
  .wish-title {
    font-size: 1rem;
  }
  
  .claim-btn {
    font-size: 0.9rem;
  }
  
  .claim-dialog-card {
    margin: 1rem;
  }
  
  .claim-dialog-header {
    padding: 1rem;
    font-size: 1.2rem;
  }
  
  .claim-dialog-content {
    padding: 1.5rem 1rem 1rem;
  }
  
  .claim-wish-name {
    font-size: 1.1rem;
    padding: 0.75rem;
  }
  
  .claim-instruction {
    font-size: 0.9rem;
  }
  
  .claim-dialog-actions {
    padding: 0.75rem 1rem 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .claim-dialog-actions .v-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .header-nav {
    margin-bottom: 1rem;
  }
  
  .logo-small {
    width: 60px !important;
  }
  
  .logo-text {
    font-size: 1.2rem;
  }
  
  .wishlist-name {
    font-size: 1.5rem;
    padding: 0 0.5rem;
  }
  
  .page-header {
    margin-bottom: 1.5rem;
  }
  
  .deadline-card,
  .wishes-card {
    border-radius: 12px !important;
  }
}
</style>
