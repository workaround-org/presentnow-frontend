<template>
  <div class="start-page">
    <div class="content-wrapper" v-if="!checkingAuth">
      <div class="hero-section">
        <v-img
            class="mx-auto logo-img"
            :width="120"
            :src="presentNowIcon"
        ></v-img>
        <h1 class="app-title">presentnow</h1>
      </div>
      
      <div class="actions-container mx-auto">
        <div v-if="isAuthenticated" class="mb-4">
          <v-btn
              @click="goToMyWishlists"
              class="action-btn secondary-btn"
              variant="text"
              size="large"
              block
              height="56"
          >
            <v-icon start>mdi-format-list-bulleted</v-icon>
            My Wishlists
          </v-btn>
        </div>
        
        <div class="input-group mb-4">
          <v-text-field
              v-model="wishlistCode"
              class="wishlist-input"
              placeholder="Enter PIN code"
              variant="solo"
              bg-color="white"
              flat
              density="default"
              height="56"
              single-line
              hide-details
              @keyup.enter="enterWishlist"
          >
            <template v-slot:append-inner>
              <v-btn
                @click="enterWishlist"
                :loading="loading"
                :disabled="!wishlistCode.trim()"
                icon="mdi-arrow-right"
                variant="text"
                color="#e46842"
                density="comfortable"
              ></v-btn>
            </template>
          </v-text-field>
          <div v-if="errorMessage" class="error-text mt-2 text-center text-error">
            {{ errorMessage }}
          </div>
        </div>
        
        <div>
          <v-btn
              @click="showWishListDialog = true"
              class="action-btn"
              color="#e46842"
              variant="flat"
              size="large"
              block
              height="56"
          >
            <v-icon start>mdi-plus</v-icon>
            Create New
          </v-btn>
        </div>
      </div>
      
      <CreateWishListDialog
          v-model="showWishListDialog"
      />
    </div>
    <div class="content-wrapper" v-else>
      <div class="loading-container">
        <v-progress-circular
            indeterminate
            color="#e46842"
            size="48"
            width="4"
        ></v-progress-circular>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@fontsource/poppins';
import {useRouter} from 'vue-router';
import {ref, onMounted, computed} from "vue";
import CreateWishListDialog from "@/components/CreateWishListDialog.vue";
import authService from '@/auth/authService';
import { getPublicWishList } from '@/api/client';
import { useDisplay } from 'vuetify';
import presentNowIcon from '@/assets/images/presentnow-icon.png';

const { mobile } = useDisplay();
const isMobile = computed(() => mobile.value);

const router = useRouter();
const showWishListDialog = ref(false);
const checkingAuth = ref(true);
const isAuthenticated = ref(false);
const wishlistCode = ref('');
const loading = ref(false);
const errorMessage = ref('');

function routeToCreateWishList() {
  router.push('/create');
}

function goToMyWishlists() {
  router.push('/wishlists');
}

async function enterWishlist() {
  errorMessage.value = '';
  
  if (!wishlistCode.value.trim()) {
    errorMessage.value = 'Please enter a wishlist code';
    return;
  }
  
  loading.value = true;
  
  try {
    const code = wishlistCode.value.trim();
    // Try to fetch the wishlist to verify it exists
    const wishlist = await getPublicWishList(code);
    
    if (wishlist) {
      // Navigate to the wishlist
      router.push(`/wishlist/${code}`);
    } else {
      errorMessage.value = 'No Wishlist found';
    }
  } catch (error) {
    console.error('Failed to load wishlist:', error);
    errorMessage.value = 'No Wishlist found';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  checkingAuth.value = true;
  try {
    const authenticated = await authService.isAuthenticated();
    isAuthenticated.value = authenticated;
    if (!authenticated) {
      console.log('User not authenticated, starting login process...');
      await authService.login();
    }
  } catch (error) {
    console.error('Authentication check failed:', error);
  } finally {
    checkingAuth.value = false;
  }
});
</script>

<style scoped>
.start-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.content-wrapper {
  width: 100%;
  max-width: 400px;
  animation: fadeIn 0.5s ease-in;
}

.hero-section {
  text-align: center;
  margin-bottom: 3rem;
}

.logo-img {
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}

.app-title {
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -1px;
}

.actions-container {
  width: 100%;
}

.wishlist-input :deep(.v-field) {
  border-radius: 12px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important;
}

.wishlist-input :deep(.v-field__input) {
  text-align: center;
  font-size: 1.1rem;
  letter-spacing: 1px;
}

.action-btn {
  border-radius: 12px !important;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(228, 104, 66, 0.2) !important;
}

.secondary-btn {
  color: #666 !important;
  box-shadow: none !important;
}

.secondary-btn:hover {
  background-color: rgba(0,0,0,0.05);
  color: #333 !important;
}

.error-text {
  color: #ff5252;
  font-size: 0.9rem;
}

.loading-container {
  text-align: center;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>