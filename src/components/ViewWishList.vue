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
      </div>
    </div>
  </div>
</template>

<script setup>
import '@fontsource/poppins';
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { getPublicWishList } from '@/api/client.js';
import presentNowIcon from '@/assets/images/presentnow-icon.png';

const route = useRoute();
const router = useRouter();

const wishListName = ref('');
const loading = ref(true);
const error = ref(null);

function toHome() {
  router.push('/');
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
}

body {
  font-family: 'Poppins', sans-serif;
}
</style>
