<template>
  <div class="bg-image">
    <AppHeader />

    <v-main>
      <v-container class="py-8">
        <div class="content-wrapper">
          <div class="header-section mb-8 text-center">
            <h1 class="page-title">My Wishlists</h1>
            <p class="page-subtitle">Manage your wishlists and share them with others</p>
          </div>

        <div v-if="loading" class="text-center py-12">
          <v-progress-circular
            indeterminate
            color="#e46842"
            size="64"
            width="6"
          ></v-progress-circular>
          <p class="loading-text mt-4">Loading your wishlists...</p>
        </div>

        <div v-else-if="error" class="text-center py-12">
          <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
          <h3 class="text-h5 mb-2">Error Loading Wishlists</h3>
          <p class="text-body-1 text-medium-emphasis mb-4">{{ error }}</p>
          <v-btn
            @click="loadWishlists"
            color="#e46842"
            size="large"
          >
            <v-icon left>mdi-refresh</v-icon>
            Retry
          </v-btn>
        </div>

        <div v-else>
          <div class="mb-6 text-center">
            <v-btn
              @click="showCreateDialog = true"
              color="#e46842"
              size="large"
              elevation="2"
              class="create-btn"
            >
              <v-icon left>mdi-plus</v-icon>
              Create New Wishlist
            </v-btn>
          </div>

          <div v-if="wishlists.length === 0" class="empty-state text-center py-12">
            <v-icon size="100" color="#e46842" class="mb-4 empty-icon">mdi-gift-outline</v-icon>
            <h3 class="text-h5 mb-2">No Wishlists Yet</h3>
            <p class="text-body-1 text-medium-emphasis mb-4">
              Create your first wishlist to get started!
            </p>
          </div>

          <v-row v-else>
            <v-col
              v-for="wishlist in wishlists"
              :key="wishlist.id"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card
                class="wishlist-card elevation-4"
                :class="{ 'inactive-card': !wishlist.active }"
                @click="viewWishlist(wishlist.id)"
                hover
              >
                <v-card-title class="card-title">
                  <v-icon left color="#e46842">mdi-gift</v-icon>
                  {{ wishlist.name }}
                </v-card-title>
                
                <v-card-text>
                  <p class="wishlist-description" v-if="wishlist.description">
                    {{ wishlist.description }}
                  </p>
                  <p class="wishlist-description text-medium-emphasis" v-else>
                    No description
                  </p>
                  
                  <div class="mt-3">
                    <v-chip
                      size="small"
                      :color="wishlist.active ? 'success' : 'grey'"
                      variant="flat"
                      class="mr-2"
                    >
                      <v-icon left size="small">
                        {{ wishlist.active ? 'mdi-check-circle' : 'mdi-pause-circle' }}
                      </v-icon>
                      {{ wishlist.active ? 'Active' : 'Inactive' }}
                    </v-chip>
                    
                    <v-chip
                      size="small"
                      color="primary"
                      variant="flat"
                    >
                      <v-icon left size="small">mdi-counter</v-icon>
                      {{ getItemCount(wishlist) }} items
                    </v-chip>
                  </div>
                </v-card-text>

                <v-card-actions>
                  <v-btn
                    variant="text"
                    color="#e46842"
                    size="small"
                    @click.stop="viewWishlist(wishlist.id)"
                  >
                    <v-icon left>mdi-eye</v-icon>
                    Edit
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    color="error"
                    size="small"
                    @click.stop="confirmDelete(wishlist)"
                  ></v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-container>
    </v-main>

    <CreateWishListDialog
      v-model="showCreateDialog"
      @wishlist-created="loadWishlists"
    />

    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          Delete Wishlist
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ wishlistToDelete?.name }}"? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="deleteWishlistConfirmed"
            :loading="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getWishLists, deleteWishList } from '@/api/client'
import CreateWishListDialog from '@/components/CreateWishListDialog.vue'
import AppHeader from '@/components/AppHeader.vue'
import authService from '@/auth/authService'

const router = useRouter()
const wishlists = ref([])
const loading = ref(false)
const error = ref('')
const showCreateDialog = ref(false)
const deleteDialog = ref(false)
const wishlistToDelete = ref(null)
const deleting = ref(false)

async function loadWishlists() {
  loading.value = true
  error.value = ''
  
  try {
    const data = await getWishLists()
    console.log('Wishlists data:', data)
    if (data && data.length > 0) {
      console.log('First wishlist structure:', data[0])
    }
    wishlists.value = data || []
  } catch (err) {
    console.error('Failed to load wishlists:', err)
    error.value = err.message || 'Failed to load wishlists'
  } finally {
    loading.value = false
  }
}

function viewWishlist(id) {
  router.push(`/create/${id}`)
}

function getItemCount(wishlist) {
  // Check for the count property from ActiveWishList
  if (typeof wishlist.presentIdeasCount === 'number') {
    return wishlist.presentIdeasCount
  }
  // Fallback to array length if full wishlist object
  if (wishlist.presentIdeas && Array.isArray(wishlist.presentIdeas)) {
    return wishlist.presentIdeas.length
  }
  return 0
}

function confirmDelete(wishlist) {
  wishlistToDelete.value = wishlist
  deleteDialog.value = true
}

async function deleteWishlistConfirmed() {
  if (!wishlistToDelete.value) return
  
  deleting.value = true
  try {
    await deleteWishList(wishlistToDelete.value.id)
    deleteDialog.value = false
    wishlistToDelete.value = null
    await loadWishlists()
  } catch (err) {
    console.error('Failed to delete wishlist:', err)
    error.value = err.message || 'Failed to delete wishlist'
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  const isAuthenticated = await authService.isAuthenticated()
  if (!isAuthenticated) {
    router.push('/')
    return
  }
  
  await loadWishlists()
})
</script>

<style scoped>
.bg-image {
  background-image: url('../assets/images/background.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  width: 100%;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  animation: fadeIn 0.5s ease-in;
}

.page-title {
  color: #333;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #666;
  font-size: 1.1rem;
  font-weight: 400;
}

.loading-text {
  color: #555;
  font-size: 1.1rem;
  font-weight: 500;
}

.create-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(228, 104, 66, 0.3) !important;
}

.empty-state {
  animation: fadeIn 0.5s ease-in;
}

.empty-icon {
  animation: pulse 2s infinite;
}

.wishlist-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px !important;
  transition: all 0.3s ease;
  cursor: pointer;
  animation: slideUp 0.5s ease-out;
}

.wishlist-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2) !important;
}

.inactive-card {
  opacity: 0.7;
}

.card-title {
  font-weight: 600;
  font-size: 1.2rem;
  color: #333;
}

.wishlist-description {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .page-title {
    font-size: 2rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
}
</style>
