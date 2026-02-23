<template>
  <div class="create-wishlist-page">
    <AppHeader />
    
    <v-main>
      <v-container class="py-8">
        <div class="main-content mx-auto">
          
          <!-- Header Section -->
          <div class="mb-8 text-center text-md-left">
            <div class="d-flex align-center justify-center justify-md-space-between flex-wrap gap-4 mb-2">
              <div class="d-flex align-center">
                <h1 class="text-h4 font-weight-bold text-grey-darken-3 mr-3">{{ displayedName }}</h1>
                <v-chip color="success" variant="flat" size="small" class="font-weight-bold">
                  Online
                </v-chip>
              </div>
              <v-btn
                color="#e46842"
                variant="flat"
                size="large"
                prepend-icon="mdi-plus"
                class="text-none font-weight-bold rounded-lg elevation-2"
                @click="addWish"
              >
                Add Wish
              </v-btn>
            </div>
          </div>

          <!-- Settings Card -->
          <v-card class="mb-8 rounded-xl border-opacity-50" elevation="0" border style="background-color: rgba(255,255,255,0.9)">
            <v-card-text class="pa-6">
              <v-row align="center">
                <!-- Share Link -->
                <v-col cols="12" md="8">
                  <div class="text-caption font-weight-bold text-uppercase mb-2 text-medium-emphasis">
                    <v-icon size="small" class="mr-1">mdi-share-variant</v-icon>
                    Share Link
                  </div>
                  <v-text-field 
                    readonly 
                    :value="publicLink" 
                    variant="outlined" 
                    density="comfortable" 
                    hide-details
                    bg-color="grey-lighten-5"
                    class="rounded-lg"
                    color="#e46842"
                  >
                    <template v-slot:append-inner>
                      <v-btn
                        variant="text"
                        density="compact"
                        color="#e46842"
                        class="font-weight-bold px-2"
                        @click="copyToClipboard"
                      >
                        {{ copySuccess ? 'Copied!' : 'Copy' }}
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-col>

                <!-- Deadline -->
                <v-col cols="12" md="4">
                   <div class="text-caption font-weight-bold text-uppercase mb-2 text-medium-emphasis">
                     <v-icon size="small" class="mr-1">mdi-calendar-clock</v-icon>
                     Deadline
                   </div>
                   <v-text-field
                      v-model="formattedDeadline"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                      bg-color="grey-lighten-5"
                      color="#e46842"
                      @change="updateDeadline"
                   ></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Wishes List -->
           <div v-if="loading" class="text-center py-12">
              <v-progress-circular indeterminate color="#e46842" size="48"></v-progress-circular>
           </div>

           <div v-else-if="wishes.length === 0" class="text-center py-16 rounded-xl border border-dashed" style="background-color: rgba(255,255,255,0.6)">
              <v-avatar color="orange-lighten-5" size="80" class="mb-4">
                <v-icon size="40" color="#e46842">mdi-gift-open-outline</v-icon>
              </v-avatar>
              <div class="text-h6 text-grey-darken-2 font-weight-bold">Your list is empty</div>
              <div class="text-body-1 text-medium-emphasis mb-6">Add your first wish to get started!</div>
              <v-btn 
                variant="outlined" 
                color="#e46842" 
                @click="addWish"
                class="text-none font-weight-bold rounded-lg"
              >
                Add First Wish
              </v-btn>
           </div>

           <div v-else class="wishes-list">
              <v-expand-transition group>
                <div v-for="present in wishes" :key="present.id" class="mb-4">
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
           </div>

        </div>
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import '@fontsource/poppins';
import Wish from "@/components/Wish.vue";
import {onMounted, ref, computed} from "vue";
import AppHeader from "@/components/AppHeader.vue";
import {useRoute, useRouter} from 'vue-router'
import {getPublicWishList} from '@/api/client'

const route = useRoute()
const router = useRouter()

const wishes = ref([]);
const publicLink = ref("https://presentnow.com/wishlist/1234");
const loading = ref(false);
const deadline = ref(null);
const wishlistId = ref(null);
const copySuccess = ref(false);
let copyTimeout = null;

const props = defineProps({
  wishListName: String
})

const displayedName = ref(props.wishListName)

const formattedDeadline = computed({
  get() {
    if (!deadline.value) return '';
    return new Date(deadline.value).toISOString().split('T')[0];
  },
  set(val) {
    deadline.value = val ? new Date(val) : null;
  }
});

async function updateDeadline() {
  // TODO: Implement API call to update deadline if needed
}

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
  const wishIndex = wishes.value.findIndex(w => w.id === presentId)
  if (wishIndex !== -1) {
    wishes.value[wishIndex].claimed = false
    wishes.value[wishIndex].claimerName = null
  }
}

function copyToClipboard() {
  navigator.clipboard.writeText(publicLink.value).then(() => {
    if (copyTimeout) clearTimeout(copyTimeout);
    copySuccess.value = true;
    copyTimeout = setTimeout(() => {
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
.create-wishlist-page {
  min-height: 100vh;
}

.main-content {
  max-width: 900px;
}

.gap-4 {
  gap: 1rem;
}
</style>