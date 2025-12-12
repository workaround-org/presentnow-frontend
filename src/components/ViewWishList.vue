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
        
        <DeadlineCard :deadline="deadline" />

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
                <WishCard
                  :wish="wish"
                  @click="handleWishClick"
                  @claim="openClaimDialog"
                />
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
.bg-image {
  background-image: url('@/assets/images/background.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  width: 100%;
  padding: 2rem 1rem;
}

@media (max-width: 600px) {
  .bg-image {
    background-attachment: scroll;
    padding: 1rem 1rem 2rem 1rem;
  }
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

.wishes-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px !important;
  animation: slideUp 0.5s ease-out;
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

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}

.empty-state p {
  margin-top: 1rem;
  font-size: 1.2rem;
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

@media (max-width: 960px) {
  .wishlist-name {
    font-size: 2rem;
  }
}

@media (max-width: 600px) {
  .main-content {
    max-width: 100%;
  }

  .wishlist-name {
    font-size: 1.8rem;
    line-height: 1.3;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .wishes-card {
    background: transparent !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .wishes-card .v-card-title {
    display: none !important;
  }

  .wishes-card .v-card-text {
    padding: 0 !important;
  }

  .wishes-card .pa-6 {
    padding: 0 !important;
  }

  .wishes-card .v-row {
    margin: 0 !important;
  }

  .wishes-card .v-col {
    padding: 0 0 1.25rem 0 !important;
  }

  .random-picker-btn {
    width: 100%;
    max-width: 100%;
    font-size: 1.05rem !important;
    padding: 16px 24px !important;
    min-height: 56px;
    border-radius: 16px !important;
    box-shadow: 0 6px 20px rgba(228, 104, 66, 0.35) !important;
  }

  .empty-state {
    padding: 4rem 1.5rem;
  }

  .empty-state p {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .header-nav {
    margin-bottom: 1rem;
    padding: 0;
  }

  .logo-small {
    width: 55px !important;
  }

  .logo-text {
    font-size: 1.2rem;
  }

  .wishlist-name {
    font-size: 1.6rem;
    padding: 0;
    line-height: 1.3;
  }

  .page-header {
    margin-bottom: 1.25rem;
  }

  .card-title-centered {
    font-size: 1.2rem;
  }

  .random-picker-btn {
    font-size: 1rem !important;
    padding: 14px 20px !important;
    min-height: 54px;
  }
}

@media (hover: none) and (pointer: coarse) {
  .header-nav:active {
    transform: scale(0.97);
  }

  .random-picker-btn:active {
    transform: scale(0.97);
  }
}
</style>
