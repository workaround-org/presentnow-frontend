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
                  <v-card-title class="text-h6 font-weight-bold d-flex align-center justify-space-between">
                    <span>{{ wish.name || 'Unnamed Wish' }}</span>
                    <v-chip v-if="wish.claimed" color="success" size="small" class="ml-2">
                      <v-icon small left>mdi-check</v-icon>
                      Claimed
                    </v-chip>
                  </v-card-title>
                  <v-card-text>
                    <div v-if="wish.description" class="text-body-1 mb-2">
                      {{ wish.description }}
                    </div>
                    <div v-if="wish.claimed && wish.claimerName" class="text-caption text-grey mt-2">
                      <v-icon small class="mr-1">mdi-account</v-icon>
                      Claimed by: {{ wish.claimerName }}
                    </div>
                  </v-card-text>
                  <v-card-actions v-if="!wish.claimed">
                    <v-btn 
                      color="#e46842" 
                      variant="text" 
                      size="small"
                      @click.stop="openClaimDialog(wish)"
                    >
                      <v-icon left small>mdi-hand-heart</v-icon>
                      I'll gift this
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
  </div>
</template>

<script setup>
import '@fontsource/poppins';
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { getPublicWishList, updatePresent } from '@/api/client.js';
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
    
    // Update the present with claim information using the existing updatePresent endpoint
    const updatedPresent = {
      ...selectedWish.value,
      claimed: true,
      claimerName: trimmedName
    };
    
    await updatePresent(selectedWish.value.id, updatedPresent);
    
    // Save claimer name to session storage for future claims
    sessionStorage.setItem(CLAIMER_NAME_KEY, trimmedName);
    
    // Update the local wish object
    const wishIndex = wishes.value.findIndex(w => w.id === selectedWish.value.id);
    if (wishIndex !== -1) {
      wishes.value[wishIndex].claimed = true;
      wishes.value[wishIndex].claimerName = trimmedName;
    }
    
    closeClaimDialog();
  } catch (e) {
    console.error('Failed to claim wish:', e);
    claimError.value = 'Failed to claim. Please try again.';
  } finally {
    claiming.value = false;
  }
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
</style>
