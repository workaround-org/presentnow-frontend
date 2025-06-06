<template>
  <div class="bg-image">
    <div class="position-absolute mt-n10">
      <v-img
          class="mb-n1 ml-5"
          :width="100"
          src="src/assets/images/presentnow-icon.png"
      ></v-img>
      <h3 :style="{ color: '#e46842' }" class="ml-4">presentnow</h3>
    </div>
    <div :style="{ color: '#e46842' }" class="text-center mb-3 mt-10 text-h3 font-weight-bold"> {{ wishListName }} </div>
    <div class="text-center mb-10 text-h6 font-weight-bold">Congrats! Your wishlist is now online 🎉 </div>
    <div class="d-flex flex-column justify-center">
      <v-card
          class="mx-auto mb-10"
          width="1000"
      >
        <WishListCode></WishListCode>
        <v-text-field
          readonly
          value="https://presentnow.com/wishlist/1234"
          class="mx-auto text-center"
          max-width="600"
          variant="outlined"
          append-inner-icon="mdi-content-copy"
          @click:append-inner="copyToClipboard"
        ></v-text-field>
      </v-card>
      <v-card
        class="mx-auto mb-10"
        width="1000"
      >
        <v-card-title class="text-center text-h4 mb-2 font-weight-bold">Set deadline</v-card-title>
        <v-date-input
            class="mx-auto text-center"
            max-width="600"
            label="Select a date"
            prepend-icon=""
            prepend-inner-icon="$calendar"
            variant="solo"
        ></v-date-input>
      </v-card>
      <v-card
          class="mx-auto"
          width="1000"
      >
        <v-card-title class="text-center text-h4 mb-2 font-weight-bold">Wishes</v-card-title>
        <v-btn
            color="#e46842"
            class="mx-auto d-block mb-10 font-weight-bold"
            height="50"
            width="250"
            @click="addWish">Add wish</v-btn>
        <div
          v-for="wish in wishes" :key="wish.id"
        >
          <Wish></Wish>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import '@fontsource/poppins';
import Wish from "@/components/Wish.vue";
import {ref} from "vue";
import WishListCode from "@/components/WishListCode.vue";
import { VDateInput } from 'vuetify/labs/VDateInput'

const wishes = ref([]);
const wishListLink = ref("https://presentnow.com/wishlist/1234");

defineProps({
  wishListName: String
})

function addWish() {
  wishes.value.push(Date.now());
}

function copyToClipboard() {
  navigator.clipboard.writeText(wishListLink).then(() => {
    console.log("Copied to clipboard: ", wishListLink);
  }).catch(err => {
    console.error("Failed to copy: ", err);
  });
}
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