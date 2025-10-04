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
                  :class="{ 'wish-card-clickable': wish.url }"
                  elevation="3"
                  @click="openWishLink(wish.url)"
                >
                  <v-card-title class="text-h6 font-weight-bold">
                    {{ wish.name || 'Unnamed Wish' }}
                  </v-card-title>
                  <v-card-text>
                    <div v-if="wish.description" class="text-body-1 mb-2">
                      {{ wish.description }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@fontsource/poppins';
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { getPublicWishList } from '@/api/client.js';
import presentNowIcon from '@/assets/images/presentnow-icon.png';

const route = useRoute();
const router = useRouter();

const wishListName = ref('');
const deadline = ref(null);
const wishes = ref([]);
const loading = ref(true);
const error = ref(null);

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

function openWishLink(url) {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
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
</style>
