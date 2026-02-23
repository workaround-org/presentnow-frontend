<template>
  <v-app-bar color="transparent" elevation="0" height="88" class="app-bar">
    <v-container class="d-flex align-center px-4">
      <div class="d-flex align-center logo-container" @click="goToHome">
        <v-img
          class="logo-img"
          :width="42"
          :src="presentNowIcon"
        ></v-img>
        <v-toolbar-title class="ml-3 text-primary font-weight-bold title-text">
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
  border-bottom: 1px solid rgba(0,0,0,0.05) !important;
}

.logo-img {
  max-width: 42px;
  max-height: 42px;
}

.logo-container {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.logo-container:hover {
  opacity: 0.8;
}

.title-text {
  color: #e46842 !important;
  font-size: 1.55rem;
  letter-spacing: -0.5px;
  user-select: none;
  cursor: pointer;
}
</style>
