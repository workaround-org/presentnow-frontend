<template>
  <v-dialog max-width="500">
    <v-card>
      <v-card-title>
        <h3 class="text-center mt-3">Give your wishlist a name</h3>
      </v-card-title>
      <v-card-text class="mb-n7">
        <v-text-field
            v-model="wishlistName"
            control-variant="hidden"
            class="mx-auto text-center"
            max-width="370"
            height="100"
            placeholder="Wishlist name"
            variant="outlined"
        ></v-text-field>
      </v-card-text>
      <div class="d-flex justify-center">
        <v-btn
            @click="routeToCreateWishList"
            class="font-weight-bold ma-3 mb-8"
            color="#333333"
            height="55"
            width="370"
        >Create</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {useRouter} from "vue-router";
import {ref} from "vue";

const router = useRouter();
const wishlistName = ref('');

function routeToCreateWishList() {
  router.push(`/create/${wishlistName.value}`);
}
</script>

<style scoped>

</style>


