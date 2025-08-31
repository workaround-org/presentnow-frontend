<template>
  <div class="bg-image">
    <div class="position-absolute mt-n10">
      <v-img class="mb-n1 ml-5" :width="100" src="src/assets/images/presentnow-icon.png"></v-img>
      <h3 :style="{ color: '#e46842' }" class="ml-4">presentnow</h3>
    </div>
    <div :style="{ color: '#e46842' }" class="text-center mb-3 mt-10 text-h3 font-weight-bold"> {{ displayedName }}
    </div>
    <div class="text-center mb-10 text-h6 font-weight-bold">Congrats! Your wishlist is now online 🎉 </div>
    <div class="d-flex flex-column justify-center">
      <v-card class="mx-auto mb-10" width="1000">
        <WishListCode></WishListCode>
        <v-text-field readonly :value="publicLink" class="mx-auto text-center" max-width="600" variant="outlined"
          append-inner-icon="mdi-content-copy" @click:append-inner="copyToClipboard"></v-text-field>
      </v-card>
      <v-card class="mx-auto mb-10" width="1000">
        <v-card-title class="text-center text-h4 mb-2 font-weight-bold">Set deadline</v-card-title>
        <v-date-input class="mx-auto text-center" max-width="600" label="Select a date" prepend-icon=""
          prepend-inner-icon="$calendar" variant="solo"></v-date-input>
      </v-card>
      <v-card class="mx-auto" width="1000">
        <v-card-title class="text-center text-h4 mb-2 font-weight-bold">Wishes</v-card-title>
        <v-btn color="#e46842" class="mx-auto d-block mb-10 font-weight-bold" height="50" width="250"
          @click="addWish">Add wish</v-btn>
        <div v-if="loading" class="text-center mb-6">Loading wishes...</div>
        <div v-else>
          <div v-for="present in wishes" :key="present.id">
            <Wish :name="present.name" :description="present.description" :url="present.url"
              :importance="present.importance" :id="present.id" :list-id="present.listId" />
          </div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import '@fontsource/poppins';
import Wish from "@/components/Wish.vue";
import { ref, onMounted } from "vue";
import WishListCode from "@/components/WishListCode.vue";
import { VDateInput } from 'vuetify/labs/VDateInput'
import { useRoute } from 'vue-router'
import { getWishList } from '@/api/client.js'

const route = useRoute()

const wishes = ref([]);
const publicLink = ref("https://presentnow.com/wishlist/1234");
const loading = ref(false);

const props = defineProps({
  wishListName: String
})

const displayedName = ref(props.wishListName)

function addWish() {
  wishes.value.push({ id: Date.now(), name: '', description: '', url: '', importance: 0, listId: route.params.wishListName });
}

function copyToClipboard() {
  navigator.clipboard.writeText(publicLink.value).then(() => {
    console.log("Copied to clipboard: ", publicLink.value);
  }).catch(err => {
    console.error("Failed to copy: ", err);
  });
}

onMounted(async () => {
  loading.value = true
  try {
    const listIdParam = route.params.wishListName
    if (listIdParam) {
      const list = await getWishList(listIdParam)
      if (list) {
        displayedName.value = list.name || displayedName.value
        if (Array.isArray(list.presentIdeas)) {
          // Ensure each present has listId for Wish component consumption
          wishes.value = list.presentIdeas.map(p => ({ ...p, listId: p.listId ?? list.id }))
        }
        publicLink.value = `${window.location.origin}/wishlist/${list.id ?? listIdParam}`
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
  background-image: url('src/assets/images/background.png');
  background-size: cover;
  min-height: 100vh;
  width: 100%;
}

body {
  font-family: 'Poppins', sans-serif;
}
</style>