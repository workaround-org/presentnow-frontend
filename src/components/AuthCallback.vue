<template>
  <v-container class="auth-callback-container fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card class="auth-card elevation-12" rounded="xl">
          <v-card-text class="pa-8 pa-md-12">
            <transition name="fade-scale" mode="out-in">
              <div :key="statusState" class="text-center">
                <!-- Logo -->
                <v-img
                  class="mx-auto mb-6 logo-img"
                  :width="100"
                  src="src/assets/images/presentnow-icon.png"
                ></v-img>

                <!-- Loading State -->
                <div v-if="statusState === 'loading'" class="status-section">
                  <v-progress-circular
                    indeterminate
                    color="#e46842"
                    size="80"
                    width="6"
                    class="mb-6"
                  ></v-progress-circular>
                  <h2 class="text-h5 font-weight-bold mb-3">{{ message }}</h2>
                  <p class="text-body-1 text-medium-emphasis">{{ subtitle }}</p>
                </div>

                <!-- Success State -->
                <div v-else-if="statusState === 'success'" class="status-section">
                  <v-avatar size="100" color="success" class="mb-6 success-avatar">
                    <v-icon size="60" color="white">mdi-check-circle</v-icon>
                  </v-avatar>
                  <h2 class="text-h5 font-weight-bold mb-3 text-success">{{ message }}</h2>
                  <p class="text-body-1 text-medium-emphasis">{{ subtitle }}</p>
                </div>

                <!-- Error State -->
                <div v-else-if="statusState === 'error'" class="status-section">
                  <v-avatar size="100" color="error" class="mb-6 error-avatar">
                    <v-icon size="60" color="white">mdi-alert-circle</v-icon>
                  </v-avatar>
                  <h2 class="text-h5 font-weight-bold mb-3 text-error">{{ message }}</h2>
                  <p class="text-body-1 text-medium-emphasis">{{ subtitle }}</p>
                </div>
              </div>
            </transition>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/auth/authService'

const router = useRouter()
const message = ref('Processing authentication...')
const subtitle = ref('Please wait while we verify your credentials')
const statusState = ref('loading') // 'loading', 'success', 'error'

onMounted(async () => {
  try {
    await authService.handleCallback()
    statusState.value = 'success'
    message.value = 'Authentication successful!'
    subtitle.value = 'Redirecting you to the home page...'
    
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (error) {
    console.error('Authentication error:', error)
    statusState.value = 'error'
    message.value = 'Authentication failed'
    subtitle.value = 'Redirecting you back...'
    
    setTimeout(() => {
      router.push('/')
    }, 2500)
  }
})
</script>

<style scoped>
.auth-callback-container {
  background-image: url('../assets/images/background.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.auth-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.98) !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
}

.logo-img {
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.status-section {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.success-avatar,
.error-avatar {
  animation: iconPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes iconPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
</style>
