<template>
  <div class="bg-image">
    <v-img
        class="mb-n1 ml-5"
        :width="100"
        src="src/assets/images/presentnow-icon.png"
    ></v-img>
    <h3 :style="{ color: '#e46842' }" class="ml-4">presentnow</h3>
    <div class="d-flex flex-column justify-center">
      <v-card
        class="mx-auto"
        width="1000"
      >
        <v-card-title
          class="font-weight-bold text-center mt-10 mb-5 text-h4"
        >
          Create your Wishlist</v-card-title>
        <v-text-field
          class="mx-auto"
          variant="outlined"
          placeholder="My Wishlist..."
          width="600"
        >
        </v-text-field>
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

const wishes = ref([]);

function addWish() {
  wishes.value.push(Date.now());
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