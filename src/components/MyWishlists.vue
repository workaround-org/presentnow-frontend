<template>
  <div class="my-wishlists-page">
    <AppHeader />

    <v-main>
      <v-container class="py-8">
        <div class="content-wrapper">
          <div class="header-section mb-8 d-flex flex-column align-center">
            <h1 class="page-title mb-3">My Wishlists</h1>
            <v-btn
              @click="showCreateDialog = true"
              color="#e46842"
              variant="flat"
              class="create-btn"
              prepend-icon="mdi-plus"
            >
              New Wishlist
            </v-btn>
          </div>

        <div v-if="loading" class="text-center py-12">
          <v-progress-circular
            indeterminate
            color="#e46842"
            size="48"
            width="4"
          ></v-progress-circular>
        </div>

        <div v-else-if="error" class="text-center py-12">
          <v-icon size="48" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
          <p class="text-body-1 text-medium-emphasis mb-4">{{ error }}</p>
          <v-btn
            @click="loadWishlists"
            color="#e46842"
            variant="text"
          >
            Retry
          </v-btn>
        </div>

        <div v-else>
          <div v-if="wishlists.length === 0" class="empty-state text-center py-12">
            <v-icon size="64" color="#e0e0e0" class="mb-4">mdi-gift-outline</v-icon>
            <p class="text-body-1 text-medium-emphasis">
              No wishlists yet
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
                class="wishlist-card"
                :class="{ 'inactive-card': !wishlist.active }"
                @click="viewWishlist(wishlist.id)"
                flat
                border
              >
                <div class="card-content pa-6">
                  <div class="d-flex justify-space-between align-start mb-2">
                    <h3 class="card-title text-truncate pr-2">
                      {{ wishlist.name }}
                    </h3>
                    <div class="card-actions">
                      <v-btn
                        icon="mdi-delete-outline"
                        variant="text"
                        density="compact"
                        color="error"
                        @click.stop="confirmDelete(wishlist)"
                      ></v-btn>
                    </div>
                  </div>
                  
                  <div class="d-flex align-center mt-4">
                    <v-chip
                      size="x-small"
                      :color="wishlist.active ? 'success' : 'grey'"
                      variant="tonal"
                      class="mr-2"
                    >
                      {{ wishlist.active ? 'Active' : 'Inactive' }}
                    </v-chip>
                    
                    <span class="text-caption text-medium-emphasis">
                      {{ getItemCount(wishlist) }} items
                    </span>
                  </div>
                </div>
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

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pt-4 px-4">
          Delete Wishlist?
        </v-card-title>
        <v-card-text class="px-4 pb-2">
          "{{ wishlistToDelete?.name }}" will be permanently deleted.
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
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
.my-wishlists-page {
  min-height: 100vh;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  color: #2c3e50;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}

.create-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 8px;
}

.wishlist-card {
  border-radius: 12px !important;
  transition: all 0.2s ease;
  cursor: pointer;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

.wishlist-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12) !important;
  border-color: #e46842;
}

.inactive-card {
  opacity: 0.8;
  background-color: #fcfcfc;
}

.card-actions {
  display: flex;
  gap: 2px;
}

.card-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0;
}

@media (max-width: 600px) {
  .page-title {
    font-size: 1.5rem;
  }
}
</style>
