<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="auto">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <div class="text-center mt-4">
          {{ message }}
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/auth/authService.js'

const router = useRouter()
const message = ref('Processing authentication...')

onMounted(async () => {
  try {
    await authService.handleCallback()
    message.value = 'Authentication successful! Redirecting...'
    
    // Redirect to home or intended page
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } catch (error) {
    console.error('Authentication error:', error)
    message.value = 'Authentication failed. Redirecting...'
    
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }
})
</script>
