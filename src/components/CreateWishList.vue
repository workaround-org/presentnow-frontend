<template>
  <div class="bg-image">
    <AppHeader />
    
    <div class="main-content">
      <div class="page-header">
        <h1 class="wishlist-name">{{ displayedName }}</h1>
        <div class="success-message">
          <v-icon color="#4caf50" size="large" class="mr-2">mdi-check-circle</v-icon>
          <span>Your wishlist is now online!</span>
        </div>
      </div>
      
      <div class="cards-container">
        <!-- Share Card -->
        <v-card class="info-card elevation-4">
          <v-card-title class="card-title">
            <v-icon left color="#e46842">mdi-share-variant</v-icon>
            Share Your Wishlist
          </v-card-title>
          <v-card-text>
            <WishListCode :wishlist-id="wishlistId" class="mb-4"></WishListCode>
            <v-text-field 
              readonly 
              :value="publicLink" 
              class="link-field" 
              variant="outlined"
              density="comfortable"
              :append-inner-icon="copyIcon" 
              :color="copySuccess ? 'success' : 'primary'"
              @click:append-inner="copyToClipboard"
              hide-details
            >
              <template v-slot:prepend-inner>
                <v-icon color="#e46842">mdi-link</v-icon>
              </template>
            </v-text-field>
            <v-scale-transition>
              <div v-if="copySuccess" class="copy-feedback">
                <v-icon color="success" size="small" class="mr-1">mdi-check</v-icon>
                Link copied!
              </div>
            </v-scale-transition>
          </v-card-text>
        </v-card>

        <!-- Deadline Card -->
        <v-card class="info-card elevation-4">
          <v-card-title class="card-title">
            <v-icon left color="#e46842">mdi-calendar-clock</v-icon>
            Set Deadline
          </v-card-title>
          <v-card-text>
            <v-date-input 
              v-model="deadline"
              label="Choose a date" 
              prepend-icon=""
              prepend-inner-icon="$calendar" 
              variant="outlined"
              density="comfortable"
              color="#e46842"
              hide-details
            ></v-date-input>
          </v-card-text>
        </v-card>

        <!-- Wishes Card -->
        <v-card class="wishes-card elevation-4">
          <v-card-title class="card-title">
            <v-icon left color="#e46842">mdi-gift</v-icon>
            Your Wishes
          </v-card-title>
          <v-card-text>
            <v-btn 
              color="#e46842" 
              class="add-wish-btn mb-6" 
              size="large"
              @click="addWish"
              block
              elevation="2"
            >
              <v-icon left>mdi-plus-circle</v-icon>
              Add New Wish
            </v-btn>
            
            <v-expand-transition>
              <div v-if="loading" class="loading-state">
                <v-progress-circular indeterminate color="#e46842"></v-progress-circular>
                <p>Loading wishes...</p>
              </div>
            </v-expand-transition>
            
            <div v-if="!loading && wishes.length === 0" class="empty-state">
              <v-icon size="64" color="#ccc">mdi-gift-outline</v-icon>
              <p>No wishes yet. Add your first wish!</p>
            </div>
            
            <v-expand-transition group>
              <div v-for="present in wishes" :key="present.id" class="wish-item">
                <Wish 
                  :name="present.name" 
                  :description="present.description" 
                  :url="present.url"
                  :importance="present.importance" 
                  :id="present.id" 
                  :list-id="present.listId"
                  :claimed="present.claimed"
                  :claimer-name="present.claimerName"
                  @deleted="removeWish"
                  @unclaimed="handleUnclaim"
                />
              </div>
            </v-expand-transition>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@fontsource/poppins';
import Wish from "@/components/Wish.vue";
import {onMounted, ref} from "vue";
import WishListCode from "@/components/WishListCode.vue";
import AppHeader from "@/components/AppHeader.vue";
import {VDateInput} from 'vuetify/labs/VDateInput'
import {useRoute, useRouter} from 'vue-router'
import {getPublicWishList} from '@/api/client'

const route = useRoute()
const router = useRouter()

const wishes = ref([]);
const publicLink = ref("https://presentnow.com/wishlist/1234");
const loading = ref(false);
const deadline = ref(null);
const wishlistId = ref(null);
const copyIcon = ref('mdi-content-copy');
const copySuccess = ref(false);
let copyTimeout = null;

const props = defineProps({
  wishListName: String
})

const displayedName = ref(props.wishListName)

function addWish() {
  wishes.value.push({
    id: Date.now(),
    name: '',
    description: '',
    url: '',
    importance: 0,
    listId: route.params.wishListName
  });
}

function removeWish(wishId) {
  wishes.value = wishes.value.filter(w => w.id !== wishId)
}

function handleUnclaim(presentId) {
  // Update the wish to reflect it's unclaimed
  const wishIndex = wishes.value.findIndex(w => w.id === presentId)
  if (wishIndex !== -1) {
    wishes.value[wishIndex].claimed = false
    wishes.value[wishIndex].claimerName = null
  }
}

function copyToClipboard() {
  navigator.clipboard.writeText(publicLink.value).then(() => {
    console.log("Copied to clipboard: ", publicLink.value);
    
    // Clear any existing timeout
    if (copyTimeout) {
      clearTimeout(copyTimeout);
    }
    
    // Change icon to checkmark and set success state
    copyIcon.value = 'mdi-check';
    copySuccess.value = true;
    
    // Reset icon and success state back after 2 seconds
    copyTimeout = setTimeout(() => {
      copyIcon.value = 'mdi-content-copy';
      copySuccess.value = false;
    }, 2000);
  }).catch(err => {
    console.error("Failed to copy: ", err);
  });
}

onMounted(async () => {
  loading.value = true
  try {
    const listIdParam = route.params.wishListName
    if (listIdParam) {
      const list = await getPublicWishList(listIdParam)
      if (list) {
        displayedName.value = list.name || displayedName.value
        wishlistId.value = list.id ?? listIdParam
        if (Array.isArray(list.presentIdeas)) {
          // Ensure each present has listId for Wish component consumption
          wishes.value = list.presentIdeas.map(p => ({...p, listId: p.listId ?? list.id}))
        }
        publicLink.value = `${window.location.origin}/wishlist/${list.id ?? listIdParam}`
        if (list.expires) {
          deadline.value = new Date(list.expires)
        }
      }
    }
  } catch (e) {
    console.error('Failed to load wish list', e)
  } finally {
    loading.value = false
  }
})
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

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 80px;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeIn 0.6s ease-in;
}

.wishlist-name {
  color: #e46842;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.success-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #4caf50;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card,
.wishes-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px !important;
  animation: slideUp 0.5s ease-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-card:hover,
.wishes-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  padding: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.link-field {
  margin-top: 1rem;
}

.link-field :deep(.v-field__input) {
  text-align: center;
  font-size: 0.95rem;
  color: #666;
}

.link-field :deep(.v-field__append-inner) {
  transition: all 0.3s ease;
  cursor: pointer;
}

.link-field :deep(.v-field__append-inner:hover) {
  transform: scale(1.2);
}

.copy-feedback {
  text-align: center;
  margin-top: 0.5rem;
  color: #4caf50;
  font-weight: 600;
  font-size: 0.9rem;
}

.add-wish-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.add-wish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(228, 104, 66, 0.3) !important;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading-state p {
  margin-top: 1rem;
  font-size: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #999;
}

.empty-state p {
  margin-top: 1rem;
  font-size: 1.1rem;
}

.wish-item {
  margin-bottom: 1rem;
  animation: slideIn 0.3s ease-out;
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

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 960px) {
  .wishlist-name {
    font-size: 2rem;
  }
  
  .success-message {
    font-size: 1rem;
  }
}

@media (max-width: 600px) {
  .bg-image {
    padding: 1rem 0.5rem;
  }
  
  .wishlist-name {
    font-size: 1.8rem;
    padding: 0 0.5rem;
  }
  
  .card-title {
    font-size: 1.2rem;
    padding: 1rem;
  }
  
  .info-card,
  .wishes-card {
    border-radius: 12px !important;
    margin: 0 0 1rem 0;
  }
  
  .add-wish-btn {
    font-size: 0.9rem;
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
  }
  
  .success-message {
    font-size: 0.9rem;
  }
  
  .page-header {
    margin-bottom: 1.5rem;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
  
  .link-field :deep(.v-field__input) {
    font-size: 0.85rem;
  }
}
</style>