<template>
  <v-container class="d-flex">
    <v-text-field
        class="mx-auto mr-2"
        variant="outlined"
        placeholder="Name"
        width="30"
    ></v-text-field>
    <v-text-field
        class="mx-auto mr-2"
        variant="outlined"
        placeholder="Description"
        width="200"
    ></v-text-field>
    <v-btn color="blue" rounded="0" icon="mdi-link" class="mx-auto d-block mr-2 mt-1 wish-buttons"></v-btn>
    <v-btn color="red" rounded="0" icon="mdi-delete" class="mx-auto d-block mt-1 wish-buttons"></v-btn>
  </v-container>
</template>

<script setup>
defineProps({
  name: String,
  description: String,
  link: String,
  importance: Number,
})
</script>

<style scoped>
.wish-buttons {
  border-radius: 4px !important;
}
</style>