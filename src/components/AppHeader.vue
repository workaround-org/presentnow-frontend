<template>
  <v-app-bar color="#e46842" elevation="4" class="app-bar">
    <v-container class="d-flex align-center px-4">
      <div class="d-flex align-center logo-container" @click="goToHome">
        <v-img
          class="logo-img"
          :width="40"
          :src="presentNowIcon"
        ></v-img>
        <v-toolbar-title class="ml-3 text-white font-weight-bold title-text">
          presentnow
        </v-toolbar-title>
      </div>
      <v-spacer></v-spacer>
      <AuthMenu />
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AuthMenu from '@/components/AuthMenu.vue'
import presentNowIcon from '@/assets/images/presentnow-icon.png'

const router = useRouter()

function goToHome() {
  router.push('/')
}
</script>

<style scoped>
.app-bar {
  backdrop-filter: blur(10px);
}

.logo-img {
  border-radius: 8px;
  background-color: white;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 40px;
  max-height: 40px;
}

.logo-container {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.logo-container:hover {
  opacity: 0.9;
}

.title-text {
  user-select: none;
  cursor: pointer;
}
</style>
