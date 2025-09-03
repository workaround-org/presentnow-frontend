<template>
  <div class="bg-image">
    <div class="content-wrapper">
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
        <v-number-input
            control-variant="hidden"
            class="mx-auto text-center"
            max-width="370"
            height="100"
            placeholder="Wishlist PIN"
            variant="outlined"
        ></v-number-input>
        <v-btn
            class="mt-n3 font-weight-bold"
            color="#333333"
            height="55"
            width="370"
        >Enter
        </v-btn>
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
  </div>
</template>

<script setup>
import '@fontsource/poppins';
import {useRouter} from 'vue-router';
import {ref} from "vue";
import CreateWishListDialog from "@/components/CreateWishListDialog.vue";

const router = useRouter();
const showWishListDialog = ref(false);

function routeToCreateWishList() {
  router.push('/create');
}
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