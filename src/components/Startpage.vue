<template>
  <div class="bg-image">
    <div class="content-wrapper" v-if="!checkingAuth">
      <div class="hero-section">
        <v-img
            class="mx-auto logo-img"
            :width="isMobile ? 150 : 200"
            src="src/assets/images/presentnow-icon.png"
        ></v-img>
        <h1 class="app-title">presentnow</h1>
        <p class="app-subtitle">Your wishlist, beautifully shared</p>
      </div>
      
      <v-card
          class="main-card mx-auto pa-6 elevation-8"
          max-width="450"
      >
        <div class="card-section">
          <h2 class="section-title">Enter Wishlist</h2>
          <v-text-field
              v-model="wishlistCode"
              class="wishlist-input"
              placeholder="Enter PIN code"
              variant="outlined"
              density="comfortable"
              color="#e46842"
              @keyup.enter="enterWishlist"
              :error-messages="errorMessage"
              hide-details="auto"
          >
            <template v-slot:prepend-inner>
              <v-icon color="#e46842">mdi-key-variant</v-icon>
            </template>
          </v-text-field>
          <v-btn
              @click="enterWishlist"
              :loading="loading"
              :disabled="loading || !wishlistCode.trim()"
              class="action-btn enter-btn mt-4"
              color="#333333"
              size="large"
              block
              elevation="2"
          >
            <v-icon left>mdi-login</v-icon>
            Enter Wishlist
          </v-btn>
        </div>
        
        <v-divider class="my-6"></v-divider>
        
        <div class="card-section">
          <h2 class="section-title">Create New</h2>
          <v-btn
              @click="showWishListDialog = true"
              class="action-btn create-btn"
              color="#e46842"
              size="large"
              block
              elevation="2"
          >
            <v-icon left>mdi-gift</v-icon>
            Create Your Wishlist
          </v-btn>
        </div>
      </v-card>
      
      <CreateWishListDialog
          v-model="showWishListDialog"
      />
    </div>
    <div class="content-wrapper" v-else>
      <div class="loading-container">
        <v-progress-circular
            indeterminate
            color="#e46842"
            size="64"
            width="6"
        ></v-progress-circular>
        <p class="loading-text">Checking authentication...</p>
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

const { mobile } = useDisplay();
const isMobile = computed(() => mobile.value);

const router = useRouter();
const showWishListDialog = ref(false);
const checkingAuth = ref(true);
const wishlistCode = ref('');
const loading = ref(false);
const errorMessage = ref('');

function routeToCreateWishList() {
  router.push('/create');
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
    const isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated) {
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
.bg-image {
  background-image: url('../assets/images/background.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.content-wrapper {
  width: 100%;
  max-width: 600px;
  animation: fadeIn 0.5s ease-in;
}

.hero-section {
  text-align: center;
  margin-bottom: 3rem;
}

.logo-img {
  animation: scaleIn 0.6s ease-out;
  margin-bottom: 1rem;
}

.app-title {
  color: #e46842;
  font-size: 3rem;
  font-weight: 700;
  margin: 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.5s ease-out;
}

.app-subtitle {
  color: #555;
  font-size: 1.1rem;
  font-weight: 400;
  margin: 0;
  opacity: 0.9;
}

.main-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px !important;
  animation: slideUp 0.5s ease-out;
}

.card-section {
  margin: 0.5rem 0;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
}

.wishlist-input :deep(.v-field__input) {
  text-align: center !important;
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 2px;
}

.action-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
}

.enter-btn:disabled {
  opacity: 0.6;
}

.create-btn {
  background: linear-gradient(135deg, #e46842 0%, #d94d27 100%) !important;
}

.loading-container {
  text-align: center;
  padding: 3rem;
}

.loading-text {
  color: #555;
  font-size: 1.1rem;
  margin-top: 1.5rem;
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 600px) {
  .app-title {
    font-size: 2.5rem;
  }
  
  .app-subtitle {
    font-size: 1rem;
  }
  
  .bg-image {
    padding: 1rem 0.5rem;
  }
  
  .main-card {
    padding: 1.5rem !important;
  }
}
</style>