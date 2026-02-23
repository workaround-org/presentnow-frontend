<template>
  <div class="view-wishlist-page">
    <div class="header-nav" @click="toHome">
      <v-img class="logo-small" :width="40" :src="presentNowIcon"></v-img>
      <h3 class="logo-text">presentnow</h3>
    </div>

    <div class="main-content">
      <div v-if="loading" class="loading-container">
        <v-progress-circular indeterminate color="#e46842" size="48" width="4"></v-progress-circular>
      </div>

      <div v-else-if="error" class="error-container">
        <v-icon size="48" color="#f44336">mdi-alert-circle-outline</v-icon>
        <h2 class="error-title">{{ error }}</h2>
        <v-btn color="#e46842" variant="text" @click="toHome" class="mt-4">
          Go Home
        </v-btn>
      </div>

      <div v-else class="wishlist-container">
        <div class="page-header text-center mb-8">
          <h1 class="wishlist-name">{{ wishListName }}</h1>
          <DeadlineCard :deadline="deadline" class="mt-4" />
        </div>
        
        <div v-if="wishes.length === 0" class="empty-state text-center">
          <v-icon size="64" color="#e0e0e0">mdi-gift-outline</v-icon>
          <p class="text-medium-emphasis mt-2">This wishlist is empty</p>
        </div>
        
        <v-row v-else>
          <v-col v-for="wish in wishes" :key="wish.id" cols="12" sm="6" md="4">
            <WishCard
              :wish="wish"
              @click="handleWishClick"
              @claim="openClaimDialog"
            />
          </v-col>
        </v-row>
        
        <div v-if="wishes.filter(w => !w.claimed).length > 1" class="text-center mt-12">
          <v-btn
            color="#e46842"
            variant="tonal"
            size="large"
            rounded="pill"
            @click="openRandomPicker"
            class="random-picker-btn"
          >
            <v-icon start>mdi-dice-6-outline</v-icon>
            Feeling Lucky?
          </v-btn>
        </div>
      </div>
    </div>

    <ClaimDialog
      v-model="claimDialog"
      :wish="selectedWish"
      @claim="handleClaimWish"
    />

    <RandomPickerDialog
      v-model="randomPickerDialog"
      :wishes="wishes"
      @claim="handleClaimRandomWish"
    />
  </div>
</template>

<script setup>
import '@fontsource/poppins';
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { getPublicWishList, publicClaimPresent } from '@/api/client';
import presentNowIcon from '@/assets/images/presentnow-icon.png';
import authService from '@/auth/authService';
import DeadlineCard from './wishlist/DeadlineCard.vue';
import WishCard from './wishlist/WishCard.vue';
import ClaimDialog from './wishlist/ClaimDialog.vue';
import RandomPickerDialog from './wishlist/RandomPickerDialog.vue';

const route = useRoute();
const router = useRouter();

const wishListName = ref('');
const deadline = ref(null);
const wishes = ref([]);
const loading = ref(true);
const error = ref(null);

const claimDialog = ref(false);
const selectedWish = ref(null);
const randomPickerDialog = ref(false);

function toHome() {
  router.push('/');
}

async function handleWishClick(wish) {
  const link = await getWishLink(wish);
  if (link) {
    openWishLink(link);
  }
}

async function getWishLink(wish) {
  if (wish.url && wish.url.trim()) {
    return wish.url;
  }

  if (wish.name && wish.name.trim()) {
    const searchEngine = await authService.getSearchEngine();
    const searchQuery = encodeURIComponent(wish.name.trim());
    return `${searchEngine}${searchQuery}`;
  }

  return null;
}

function openWishLink(url) {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function openClaimDialog(wish) {
  selectedWish.value = wish;
  claimDialog.value = true;
}

async function handleClaimWish({ wish, claimerName }) {
  try {
    const updatedPresent = await publicClaimPresent(wish.id, claimerName);
    const wishIndex = wishes.value.findIndex(w => w.id === wish.id);
    if (wishIndex !== -1) {
      wishes.value[wishIndex] = updatedPresent;
    }
  } catch (e) {
    console.error('Failed to claim wish:', e);
    throw e;
  }
}

async function handleClaimRandomWish({ wish, claimerName }) {
  await handleClaimWish({ wish, claimerName });
  randomPickerDialog.value = false;
}

function openRandomPicker() {
  const unclaimedWishes = wishes.value.filter(w => !w.claimed);
  if (unclaimedWishes.length >= 2) {
    randomPickerDialog.value = true;
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
.view-wishlist-page {
  min-height: 100vh;
  padding: 1rem;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin-bottom: 2rem;
  width: fit-content;
}

.logo-small {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.logo-text {
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.main-content {
  max-width: 1000px;
  margin: 0 auto;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 4rem 2rem;
}

.error-title {
  margin-top: 1rem;
  color: #f44336;
  font-weight: 600;
  font-size: 1.25rem;
}

.wishlist-name {
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.empty-state {
  padding: 4rem 2rem;
}

.random-picker-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
}

@media (max-width: 600px) {
  .wishlist-name {
    font-size: 2rem;
  }
}
</style>
