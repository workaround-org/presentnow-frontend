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
              
              <div v-if="wishes.filter(w => !w.claimed).length > 1" class="text-center mt-6">
                <v-btn
                  color="#e46842"
                  variant="elevated"
                  size="large"
                  @click="openRandomPicker"
                  class="random-picker-btn"
                >
                  <v-icon class="mr-2">mdi-dice-6</v-icon>
                  Feeling Lucky?
                </v-btn>
              </div>
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

    <!-- Random Wish Dialog -->
    <v-dialog v-model="randomPickerDialog" max-width="800" persistent>
      <v-card class="case-opening-card">
        <v-card-title class="text-center text-h4 font-weight-bold case-title">
          <v-icon color="white" class="mr-2">mdi-package-variant</v-icon>
        </v-card-title>
        <v-card-text class="case-content">
          <!-- Spinning Animation -->
          <div class="case-container" ref="caseContainer">
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
          <div
            v-if="showResult"
            class="result-container"
            :class="{ 'result-clickable': Boolean(randomlySelectedWish?.url) }"
            @click="handleResultClick"
            :tabindex="randomlySelectedWish?.url ? 0 : undefined"
            :role="randomlySelectedWish?.url ? 'link' : undefined"
            @keydown.enter.prevent="handleResultClick"
            @keydown.space.prevent="handleResultClick"
          >
            <div>
              <h3 class="text-h4 font-weight-bold mb-4" :style="{ color: 'rgb(228, 104, 66)' }">
                {{ randomlySelectedWish?.name }}
              </h3>
              <div class="text-body-1 mb-4">
                {{ selectedWishDescription }}
              </div>
              <div v-if="randomlySelectedWish?.claimed" class="text-h6 text-red mb-4">
                ⚠️ This wish has already been claimed!
              </div>
              <div v-if="randomlySelectedWish?.url && !randomlySelectedWish?.claimed" class="result-link-hint">
                <v-icon color="#2196f3" class="mr-1">mdi-link-variant</v-icon>
                Click to open link
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div v-if="!isSpinning && !showResult" class="text-center mb-4">
          </div>
        </v-card-text>

        <v-card-actions class="justify-center pb-4">
          <div v-if="!isSpinning && !showResult && !isPreparingSpin" class="text-center">
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
import { onMounted, ref, computed, nextTick, watch } from "vue";
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

const claimDialog = ref(false);
const selectedWish = ref(null);
const claimerName = ref('');
const claiming = ref(false);
const claimError = ref('');

const randomPickerDialog = ref(false);
const isSpinning = ref(false);
const isPreparingSpin = ref(false);
const showResult = ref(false);
const randomlySelectedWish = ref(null);
const selectedIndex = ref(-1);
const displayItems = ref([]);
const caseItems = ref(null);
const caseContainer = ref(null);

const selectedWishDescription = computed(() => {
  const description = randomlySelectedWish.value?.description;
  if (typeof description === 'string' && description.trim()) {
    return description.trim();
  }
  return 'No description provided';
});

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
  if (wish.claimed) {
    return;
  }
<<<<<<< HEAD

  if (wish.url) {
    openWishLink(wish.url);
=======
  
  const link = getWishLink(wish);
  if (link) {
    openWishLink(link);
>>>>>>> 5a235de (✨ (wishes): add default url)
  }
}

function getWishLink(wish) {
  if (wish.url && wish.url.trim()) {
    return wish.url;
  }

  if (wish.name && wish.name.trim()) {
    const searchQuery = encodeURIComponent(wish.name.trim());
    return `https://www.google.com/search?q=${searchQuery}`;
  }

  return null;
}

function openWishLink(url) {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function handleResultClick() {
  const url = randomlySelectedWish.value?.url;
  if (url) {
    openWishLink(url);
  }
}

function openClaimDialog(wish) {
  selectedWish.value = wish;

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

    const updatedPresent = await publicClaimPresent(selectedWish.value.id, trimmedName);

    sessionStorage.setItem(CLAIMER_NAME_KEY, trimmedName);

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

// Random picker functions
function openRandomPicker() {
  const unclaimedWishes = wishes.value.filter(w => !w.claimed);
  if (unclaimedWishes.length < 2) {
    return;
  }

  createDisplayItems();
  randomPickerDialog.value = true;
  showResult.value = false;
  isSpinning.value = false;
  isPreparingSpin.value = false;
  randomlySelectedWish.value = null;
  selectedIndex.value = -1;


  // Ensure case items start at initial position
  setTimeout(() => {
    if (caseItems.value) {
      caseItems.value.style.transform = 'translateX(0)';
    }
  }, 100);
}

function createDisplayItems() {
  const unclaimedWishes = wishes.value.filter(w => !w.claimed);
  const items = [];

  for (let i = 0; i < 20; i++) {
    items.push(...unclaimedWishes);
  }
  
  displayItems.value = items;
}

async function startSpinning() {
  if (isSpinning.value) {
    return;
  }

  const unclaimedWishes = wishes.value.filter(w => !w.claimed);
  if (unclaimedWishes.length === 0) {
    return;
  }

  if (!displayItems.value.length) {
    createDisplayItems();
  }

  await nextTick();

  const itemsEl = caseItems.value;
  const containerEl = caseContainer.value;

  if (!itemsEl || !containerEl || !itemsEl.children.length) {
    console.warn('Random picker not ready: missing DOM elements');
    return;
  }

  isPreparingSpin.value = false;
  isSpinning.value = true;
  showResult.value = false;
  randomlySelectedWish.value = null;
  selectedIndex.value = -1;

  itemsEl.style.transition = 'none';
  itemsEl.style.transform = 'translateX(0)';
  void itemsEl.offsetWidth; // Force reflow
  itemsEl.style.transition = '';

  const totalItems = itemsEl.children.length;
  const uniqueCount = unclaimedWishes.length;

  const loopsBeforeSelection = 4;
  const loopsAfterSelection = 4;
  const minIndex = Math.min(totalItems - 1, uniqueCount * loopsBeforeSelection);
  const maxIndex = Math.max(minIndex, totalItems - (uniqueCount * loopsAfterSelection) - 1);
  const randomIndex = minIndex + Math.floor(Math.random() * Math.max(1, maxIndex - minIndex + 1));

  const targetElement = itemsEl.children[randomIndex];
  if (!targetElement) {
    console.warn('Unable to locate target element for random picker');
    isSpinning.value = false;
    return;
  }

  const selectorPosition = containerEl.clientWidth / 2;
  const itemCenter = targetElement.offsetLeft + targetElement.clientWidth / 2;
  const finalTranslate = itemCenter - selectorPosition;

  requestAnimationFrame(() => {
    itemsEl.style.transform = `translateX(-${finalTranslate}px)`;
  });

  const spinDuration = getTransitionDurationMs(itemsEl) + 100;

  setTimeout(() => {
    selectedIndex.value = randomIndex;
    randomlySelectedWish.value = displayItems.value[randomIndex] || null;
    isSpinning.value = false;
    showResult.value = true;
  }, spinDuration);
}

function parseTimeToMs(value) {
  if (!value) {
    return 0;
  }

  const trimmed = value.trim();
  if (trimmed.endsWith('ms')) {
    return parseFloat(trimmed.replace('ms', '')) || 0;
  }

  if (trimmed.endsWith('s')) {
    return (parseFloat(trimmed.replace('s', '')) || 0) * 1000;
  }

  const numeric = parseFloat(trimmed);
  return Number.isFinite(numeric) ? numeric * 1000 : 0;
}

function getTransitionDurationMs(element) {
  if (typeof window === 'undefined' || !element) {
    return 3000;
  }

  const style = window.getComputedStyle(element);
  const durations = style.transitionDuration.split(',').map(parseTimeToMs);
  const delays = style.transitionDelay.split(',').map(parseTimeToMs);

  const maxDuration = durations.length ? Math.max(...durations) : 3000;
  const maxDelay = delays.length ? Math.max(...delays) : 0;

  return maxDuration + maxDelay;
}

function claimRandomWish() {
  selectedWish.value = randomlySelectedWish.value;

  const savedName = sessionStorage.getItem(CLAIMER_NAME_KEY);
  if (savedName) {
    claimerName.value = savedName;
  }
  
  closeRandomPicker();
  claimDialog.value = true;
}

function rollAgain() {
  showResult.value = false;
  randomlySelectedWish.value = null;
  selectedIndex.value = -1;
  isPreparingSpin.value = true;

  if (caseItems.value) {
    caseItems.value.style.transform = 'translateX(0)';
  }

  createDisplayItems();

  setTimeout(() => {
    startSpinning();
  }, 300);
}

function closeRandomPicker() {
  randomPickerDialog.value = false;
  setTimeout(() => {
    showResult.value = false;
    isSpinning.value = false;
    randomlySelectedWish.value = null;
  selectedIndex.value = -1;
    displayItems.value = [];
  isPreparingSpin.value = false;

    if (caseItems.value) {
      caseItems.value.style.transform = 'translateX(0)';
    }
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

.case-opening-card {
  background: white;
  color: #2d2d2d;
  border-radius: 16px !important;
  overflow: hidden;
}

.case-title {
  background: rgb(228, 104, 66);
  color: white;
  padding: 20px;
  border-bottom: 1px solid rgba(228, 104, 66, 0.2);
}

.case-content {
  padding: 20px;
  background: white;
}

.case-container {
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(228, 104, 66, 0.25);
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
  background: linear-gradient(180deg, transparent, rgba(228, 104, 66, 0.85), transparent);
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
  background: #ffffff;
}

@keyframes spin {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: var(--final-transform, translateX(-2000px));
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
  background: white;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(228, 104, 66, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  transition: all 0.3s ease;
}

.case-item.selected .item-card {
  transform: scale(1.05);
  border: 2px solid rgb(228, 104, 66) !important;
}

.item-name {
  font-size: 0.9rem;
  font-weight: bold;
  color: rgb(228, 104, 66);
  margin-bottom: 8px;
  line-height: 1.2;
}

.item-description {
  font-size: 0.75rem;
  color: #555;
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
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(228, 104, 66, 0.3);
  transition: all 0.3s ease;
}

.result-clickable {
  cursor: pointer;
}

.result-clickable:hover {
  transform: translateY(-4px);
  background: #fafafa;
  border-color: rgba(228, 104, 66, 0.6);
  box-shadow: 0 8px 16px rgba(228, 104, 66, 0.2);
}

.result-clickable:active {
  transform: translateY(-2px);
}

.result-link-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2196f3;
  font-size: 0.9rem;
  margin-top: 8px;
  font-weight: 500;
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
  background: rgb(228, 104, 66) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(228, 104, 66, 0.4) !important;
  transition: all 0.3s ease !important;
}

.spin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(228, 104, 66, 0.6) !important;
}
</style>

