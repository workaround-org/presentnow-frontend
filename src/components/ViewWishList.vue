<template>
  <div class="bg-image">
    <div class="position-absolute mt-n10" @click="toHome" style="cursor: pointer;">
      <v-img class="mb-n1 ml-5" :width="100" :src="presentNowIcon"></v-img>
      <h3 :style="{ color: '#e46842' }" class="ml-4">presentnow</h3>
    </div>
    <div class="text-center mt-10">
      <div v-if="loading" class="text-h4 font-weight-bold">Loading wishlist...</div>
      <div v-else-if="error" class="text-h4 font-weight-bold text-red">{{ error }}</div>
      <div v-else>
        <div :style="{ color: '#e46842' }" class="text-h3 font-weight-bold mb-3">
          {{ wishListName }}
        </div>
        
        <!-- Deadline Section -->
        <v-card v-if="deadline" class="mx-auto mb-6" max-width="600">
          <v-card-title class="text-center text-h5 font-weight-bold">
            <v-icon left color="#e46842" class="mr-2">mdi-calendar-clock</v-icon>
            Time Remaining
          </v-card-title>
          <v-card-text class="text-center">
            <div class="text-h6 mb-2">{{ formatDeadline(deadline) }}</div>
            <div class="text-h4 font-weight-bold" :style="{ color: '#e46842' }">
              {{ timeRemaining }}
            </div>
          </v-card-text>
        </v-card>

        <!-- Wishes Section -->
        <v-card class="mx-auto mb-10" max-width="1000">
          <v-card-title class="text-center text-h4 mb-4 font-weight-bold">Wishes</v-card-title>
          <v-card-text>
            <div v-if="wishes.length === 0" class="text-center text-h6 text-grey mb-4">
              No wishes yet
            </div>
            <div v-else>
              <!-- Wishes Grid -->
              <v-row>
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
                    <v-card-title class="text-h6 font-weight-bold d-flex align-center justify-space-between">
                      <span>{{ wish.name || 'Unnamed Wish' }}</span>
                      <v-chip v-if="wish.claimed" color="success" size="small" class="ml-2">
                        <v-icon small left>mdi-check</v-icon>
                        Claimed
                      </v-chip>
                    </v-card-title>
                    <v-card-text class="pb-2">
                      <div v-if="wish.description" class="text-body-1 mb-2">
                        {{ wish.description }}
                      </div>
                      <div v-if="wish.claimed && wish.claimerName" class="text-caption text-grey mt-2">
                        <v-icon small class="mr-1">mdi-account</v-icon>
                        Claimed by: {{ wish.claimerName }}
                      </div>
                    </v-card-text>
                    <v-card-actions v-if="!wish.claimed" class="justify-center pt-0 pb-3">
                      <v-btn 
                        color="#e46842" 
                        variant="elevated" 
                        icon="mdi-hand-heart"
                        size="default"
                        @click.stop="openClaimDialog(wish)"
                      >
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
              
              <!-- Random Picker Button (only show if there are multiple unclaimed wishes) -->
              <div v-if="wishes.filter(w => !w.claimed).length > 1" class="text-center mt-6">
                <v-btn
                  color="#e46842"
                  variant="elevated"
                  size="large"
                  prepend-icon="mdi-dice-6"
                  @click="openRandomPicker"
                  class="random-picker-btn"
                >
                  Feeling Lucky?
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- Claim Dialog -->
    <v-dialog v-model="claimDialog" max-width="500">
      <v-card>
        <v-card-title class="text-center text-h5 font-weight-bold">
          Claim This Wish
        </v-card-title>
        <v-card-text>
          <div class="text-body-1 mb-4">
            You're about to claim: <strong>{{ selectedWish?.name }}</strong>
          </div>
          <v-text-field
            v-model="claimerName"
            variant="outlined"
            label="Your Name"
            placeholder="Enter your name"
            maxlength="100"
            :error-messages="claimError"
            @input="claimError = ''"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn 
            color="grey" 
            variant="text"
            @click="closeClaimDialog"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="#e46842" 
            variant="elevated"
            :loading="claiming"
            :disabled="claiming || !claimerName.trim()"
            @click="claimWish"
          >
            Claim
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Random Picker Dialog -->
    <v-dialog v-model="randomPickerDialog" max-width="800" persistent>
      <v-card class="case-opening-card">
        <v-card-title class="text-center text-h4 font-weight-bold case-title">
          <v-icon left color="#e46842" class="mr-2">mdi-package-variant</v-icon>
        </v-card-title>
        
        <v-card-text class="case-content">
          <!-- Case Opening Animation Container -->
          <div class="case-container">
            <div class="case-frame">
              <div class="case-selector"></div>
              <div class="case-items" ref="caseItems" :class="{ 'spinning': isSpinning }">
                <div 
                  v-for="(item, index) in displayItems" 
                  :key="`item-${index}`"
                  class="case-item"
                  :class="{ 'selected': selectedIndex === index }"
                >
                  <div class="item-card">
                    <div class="item-name">{{ item.name || 'Unnamed Wish' }}</div>
                    <div class="item-description">{{ item.description || 'No description' }}</div>
                    <v-chip v-if="item.claimed" color="error" size="small" class="mt-2">
                      Claimed
                    </v-chip>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Result Display -->
          <div v-if="showResult" class="result-container">
            <div>
              <h3 class="text-h4 font-weight-bold mb-4" :style="{ color: '#e46842' }">
                {{ randomlySelectedWish?.name }}
              </h3>
              <div class="text-body-1 mb-4">
                {{ randomlySelectedWish?.description }}
              </div>
              <div v-if="randomlySelectedWish?.claimed" class="text-h6 text-red mb-4">
                ⚠️ This wish has already beexn claimed!
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div v-if="!isSpinning && !showResult" class="text-center mb-4">
          </div>
        </v-card-text>

        <v-card-actions class="justify-center pb-4">
          <div v-if="!isSpinning && !showResult" class="text-center">
            <v-btn 
              color="#e46842" 
              variant="elevated"
              size="large"
              @click="startSpinning"
              class="spin-btn mr-3"
            >
              <v-icon class="mr-2">mdi-play</v-icon>
              Spin
            </v-btn>
            <v-btn 
              color="grey" 
              variant="text"
              size="large"
              @click="closeRandomPicker"
            >
              Cancel
            </v-btn>
          </div>
          <div v-else-if="showResult" class="text-center">
            <v-btn 
              v-if="!randomlySelectedWish?.claimed"
              color="#e46842" 
              variant="elevated"
              class="mr-3"
              @click="claimRandomWish"
            >
              Claim This Wish!
            </v-btn>
            <v-btn 
              color="#4CAF50" 
              variant="elevated"
              class="mr-3"
              prepend-icon="mdi-dice-6"
              @click="rollAgain"
            >
              Roll Again!
            </v-btn>
            <v-btn 
              color="grey" 
              variant="text"
              @click="closeRandomPicker"
            >
              {{ randomlySelectedWish?.claimed ? 'Close' : 'Cancel' }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import '@fontsource/poppins';
import { onMounted, ref, computed } from "vue";
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

// Random picker state
const randomPickerDialog = ref(false);
const isSpinning = ref(false);
const showResult = ref(false);
const randomlySelectedWish = ref(null);
const selectedIndex = ref(0);
const displayItems = ref([]);
const caseItems = ref(null);

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

// Random picker functions
function openRandomPicker() {
  const unclaimedWishes = wishes.value.filter(w => !w.claimed);
  if (unclaimedWishes.length < 2) {
    return; // Need at least 2 unclaimed wishes
  }
  
  // Create display items (multiply wishes to create the spinning effect)
  createDisplayItems();
  randomPickerDialog.value = true;
  showResult.value = false;
  isSpinning.value = false;
}

function createDisplayItems() {
  const unclaimedWishes = wishes.value.filter(w => !w.claimed);
  const items = [];
  
  // Repeat wishes multiple times to create the spinning carousel effect
  for (let i = 0; i < 20; i++) {
    items.push(...unclaimedWishes);
  }
  
  displayItems.value = items;
}

function startSpinning() {
  const unclaimedWishes = wishes.value.filter(w => !w.claimed);
  if (unclaimedWishes.length === 0) return;
  
  isSpinning.value = true;
  
  // Randomly select a wish
  const randomWish = unclaimedWishes[Math.floor(Math.random() * unclaimedWishes.length)];
  randomlySelectedWish.value = randomWish;
  
  // Calculate the final position for the animation
  const finalIndex = Math.floor(displayItems.value.length / 2) + Math.floor(Math.random() * 5);
  selectedIndex.value = finalIndex;
  
  // Replace the item at final position with our selected wish
  displayItems.value[finalIndex] = randomWish;
  
  // Stop spinning after animation duration
  setTimeout(() => {
    isSpinning.value = false;
    showResult.value = true;
  }, 3000);
}

function claimRandomWish() {
  selectedWish.value = randomlySelectedWish.value;
  
  // Try to load saved claimer name from session storage
  const savedName = sessionStorage.getItem(CLAIMER_NAME_KEY);
  if (savedName) {
    claimerName.value = savedName;
  }
  
  closeRandomPicker();
  claimDialog.value = true;
}

function rollAgain() {
  // Reset the result state and prepare for another spin
  showResult.value = false;
  randomlySelectedWish.value = null;
  selectedIndex.value = 0;
  
  // Recreate display items to ensure fresh randomization
  createDisplayItems();
  
  // Small delay for better UX
  setTimeout(() => {
    // Auto-start the next spin for immediate gratification
    startSpinning();
  }, 300);
}

function closeRandomPicker() {
  randomPickerDialog.value = false;
  setTimeout(() => {
    showResult.value = false;
    isSpinning.value = false;
    randomlySelectedWish.value = null;
    selectedIndex.value = 0;
    displayItems.value = [];
  }, 300);
}

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
  min-height: 100vh;
  width: 100%;
  padding-bottom: 2rem;
}

body {
  font-family: 'Poppins', sans-serif;
}

.wish-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  height: 100%;
}

.wish-card-clickable {
  cursor: pointer;
}

.wish-card-clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
}

.wish-card-claimed {
  opacity: 0.75;
  background-color: #f5f5f5;
}

.wish-card-claimed:hover {
  transform: none;
  box-shadow: none;
  cursor: default;
}

/* Random Picker Button */
.random-picker-btn {
  font-size: 1.1rem !important;
  padding: 12px 24px !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(228, 104, 66, 0.3) !important;
  transition: all 0.3s ease !important;
}

.random-picker-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(228, 104, 66, 0.4) !important;
}

/* Case Opening Styles */
.case-opening-card {
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 50%, #1e1e1e 100%);
  color: white;
  border-radius: 16px !important;
  overflow: hidden;
}

.case-title {
  background: linear-gradient(90deg, #e46842, #ff8c42);
  color: white;
  padding: 20px;
}

.case-content {
  padding: 20px;
}

.case-container {
  position: relative;
  width: 100%;
  height: 200px;
  background: linear-gradient(45deg, #2a2a2a, #3a3a3a);
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e46842;
  box-shadow: 0 0 20px rgba(228, 104, 66, 0.3);
}

.case-frame {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.case-selector {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 80%;
  background: linear-gradient(180deg, transparent, #e46842, transparent);
  box-shadow: 0 0 10px #e46842;
  z-index: 10;
  border-radius: 2px;
}

.case-items {
  display: flex;
  height: 100%;
  align-items: center;
  transition: transform 3s cubic-bezier(0.23, 1, 0.320, 1);
  gap: 10px;
  padding: 0 20px;
}

.case-items.spinning {
  animation: spin 3s cubic-bezier(0.23, 1, 0.320, 1) forwards;
}

@keyframes spin {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-2000px);
  }
}

.case-item {
  flex-shrink: 0;
  width: 140px;
  height: 160px;
  margin: 0 5px;
  transition: all 0.3s ease;
}

.item-card {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
  border-radius: 8px;
  padding: 12px;
  border: 2px solid #555;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.case-item.selected .item-card {
  transform: scale(1.05);
}

.item-name {
  font-size: 0.9rem;
  font-weight: bold;
  color: #e46842;
  margin-bottom: 8px;
  line-height: 1.2;
}

.item-description {
  font-size: 0.75rem;
  color: #ccc;
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.result-container {
  text-align: center;
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
  border-radius: 12px;
  border: 2px solid #e46842;
}

.result-glow {
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 10px rgba(228, 104, 66, 0.3);
  }
  to {
    box-shadow: 0 0 20px rgba(228, 104, 66, 0.6);
  }
}

.spin-btn {

  padding: 5px 12px !important;
  font-size: 1.2rem !important;
  border-radius: 12px !important;
  background: linear-gradient(45deg, #e46842, #ff8c42) !important;
  box-shadow: 0 4px 15px rgba(228, 104, 66, 0.4) !important;
  transition: all 0.3s ease !important;
}

.spin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(228, 104, 66, 0.6) !important;
}
</style>
