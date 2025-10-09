<template>
  <div class="bg-image">
    <div class="content-wrapper" v-if="!checkingAuth">
      <v-img
          class="mx-auto mb-n6"
          :width="200"
          src="src/assets/images/presentnow-icon.png"
      ></v-img>
      <h1 :style="{ color: '#e46842' }" class="text-center">presentnow</h1>
      <v-card
          class="mx-auto pa-4 mt-10"
          max-width="400"
      >
        <v-text-field
            v-model="wishlistCode"
            class="mx-auto text-center"
            max-width="370"
            height="100"
            placeholder="Wishlist PIN"
            variant="outlined"
            @keyup.enter="enterWishlist"
        ></v-text-field>
        <v-btn
            @click="enterWishlist"
            :loading="loading"
            :disabled="loading"
            class="mt-n3 font-weight-bold"
            color="#333333"
            height="55"
            width="370"
        >Enter
        </v-btn>
        <div v-if="errorMessage" class="text-center mt-3 text-error">
          {{ errorMessage }}
        </div>
      </v-card>
      <v-btn
          @click="showWishListDialog = true"
          class="mx-auto d-block mt-10 font-weight-bold"
          color="#e46842"
          height="55"
          width="370"
      >Create your own Wishlist
      </v-btn>
      <CreateWishListDialog
          v-model="showWishListDialog"
      />
    </div>
    <div class="content-wrapper" v-else>
      <v-progress-circular
          class="mx-auto d-block"
          indeterminate
          color="#e46842"
          size="64"
      ></v-progress-circular>
      <p class="text-center mt-4">Checking authentication...</p>
    </div>
  </div>
</template>

<script setup>
import '@fontsource/poppins';
import {useRouter} from 'vue-router';
import {ref, onMounted} from "vue";
import CreateWishListDialog from "@/components/CreateWishListDialog.vue";
import authService from '@/auth/authService.js';
import { getPublicWishList } from '@/api/client.js';

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
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

body {
  font-family: 'Poppins', sans-serif;
}

.content-wrapper {
  width: 100%;
  padding: 2rem 0;
  margin-top: -5vh;
}

:deep(.v-field__input) {
  text-align: center !important;
  font-family: 'Poppins', sans-serif;
}
</style>