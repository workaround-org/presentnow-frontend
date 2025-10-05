<template>
  <div class="bg-image">
    <div class="position-absolute mt-n10" @click="toHome" style="cursor: pointer;">
      <v-img class="mb-n1 ml-5" :width="100" :src="presentNowIcon"></v-img>
      <h3 :style="{ color: '#e46842' }" class="ml-4">presentnow</h3>
    </div>
    <div :style="{ color: '#e46842' }" class="text-center mb-3 mt-10 text-h3 font-weight-bold"> {{ displayedName }}
    </div>
    <div class="text-center mb-10 text-h6 font-weight-bold">Congrats! Your wishlist is now online 🎉</div>
    <div class="d-flex flex-column justify-center">
      <v-card class="mx-auto mb-10" width="1000">
        <WishListCode :wishlist-id="wishlistId"></WishListCode>
        <v-text-field 
          readonly 
          :value="publicLink" 
          class="mx-auto text-center link-field" 
          max-width="600" 
          variant="outlined"
          :append-inner-icon="copyIcon" 
          :color="copySuccess ? 'success' : 'primary'"
          @click:append-inner="copyToClipboard">
        </v-text-field>
      </v-card>
      <v-card class="mx-auto mb-10" width="1000">
        <v-card-title class="text-center text-h4 mb-2 font-weight-bold">Set deadline</v-card-title>
        <v-date-input class="mx-auto text-center" max-width="600" label="Select a date" prepend-icon=""
                      prepend-inner-icon="$calendar" variant="solo" v-model="deadline"></v-date-input>
        <!--Update is not implemented yet-->
      </v-card>
      <v-card class="mx-auto" width="1000">
        <v-card-title class="text-center text-h4 mb-2 font-weight-bold">Wishes</v-card-title>
        <v-btn color="#e46842" class="mx-auto d-block mb-10 font-weight-bold" height="50" width="250"
               @click="addWish">Add wish
        </v-btn>
        <div v-if="loading" class="text-center mb-6">Loading wishes...</div>
        <div v-else>
          <div v-for="present in wishes" :key="present.id">
            <Wish :name="present.name" :description="present.description" :url="present.url"
                  :importance="present.importance" :id="present.id" :list-id="present.listId"
                  @deleted="removeWish"/>
          </div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import '@fontsource/poppins';
import Wish from "@/components/Wish.vue";
import {onMounted, ref} from "vue";
import WishListCode from "@/components/WishListCode.vue";
import {VDateInput} from 'vuetify/labs/VDateInput'
import {useRoute, useRouter} from 'vue-router'
import {getPublicWishList} from '@/api/client.js'
import presentNowIcon from '@/assets/images/presentnow-icon.png'

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

function toHome() {
  router.push('/')
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
  min-height: 100vh;
  width: 100%;
}

body {
  font-family: 'Poppins', sans-serif;
}

.link-field :deep(.v-field__append-inner) {
  transition: all 0.3s ease;
}

.link-field :deep(.v-field__append-inner:hover) {
  transform: scale(1.1);
}
</style>