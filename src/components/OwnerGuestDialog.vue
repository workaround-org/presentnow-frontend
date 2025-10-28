<template>
  <v-dialog
    v-model="dialogVisible"
    max-width="500"
    persistent
  >
    <v-card class="owner-guest-dialog">
      <v-card-title class="text-center text-h5 font-weight-bold pa-6">
        <v-icon color="#e46842" size="large" class="mb-2">mdi-account-question</v-icon>
        <div>Are you the owner of this page?</div>
      </v-card-title>
      
      <v-card-text class="text-center pb-2">
        <p class="text-body-1 mb-4">
          Choose how you want to view this wishlist
        </p>
      </v-card-text>
      
      <v-card-actions class="flex-column pa-6 pt-2">
        <v-btn
          color="#333333"
          variant="elevated"
          size="large"
          block
          class="mb-3 owner-btn"
          :loading="loggingIn"
          @click="handleOwnerLogin"
        >
          <v-icon left>mdi-login</v-icon>
          Yes, log in
        </v-btn>
        
        <v-btn
          color="#e46842"
          variant="elevated"
          size="large"
          block
          class="guest-btn"
          :disabled="loggingIn"
          @click="handleGuestContinue"
        >
          <v-icon left>mdi-account-group</v-icon>
          Continue as guest
        </v-btn>
      </v-card-actions>
      
      <v-card-text class="text-center text-caption text-grey pb-4 pt-0">
        Guests can view and claim presents anonymously
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import authService from '@/auth/authService'

const props = defineProps({
  modelValue: Boolean,
  wishlistId: String
})

const emit = defineEmits(['update:modelValue', 'guest-mode', 'owner-mode'])

const dialogVisible = ref(props.modelValue)
const loggingIn = ref(false)

// Session storage key to remember guest choice
const GUEST_MODE_KEY = 'presentnow_guest_mode'

onMounted(() => {
  // Check if user already made a choice in this session
  const isGuestMode = sessionStorage.getItem(GUEST_MODE_KEY)
  if (isGuestMode === 'true') {
    // User already chose guest mode this session, don't show dialog
    dialogVisible.value = false
    emit('update:modelValue', false)
    emit('guest-mode')
  }
})

async function handleOwnerLogin() {
  loggingIn.value = true
  try {
    // Store the current wishlist ID to return after login
    if (props.wishlistId) {
      sessionStorage.setItem('presentnow_return_wishlist', props.wishlistId)
    }
    
    // Initiate OAuth login
    await authService.initialize()
    await authService.login()
    
    emit('owner-mode')
  } catch (error) {
    console.error('Login failed:', error)
    loggingIn.value = false
  }
}

function handleGuestContinue() {
  // Remember guest choice for this session
  sessionStorage.setItem(GUEST_MODE_KEY, 'true')
  
  dialogVisible.value = false
  emit('update:modelValue', false)
  emit('guest-mode')
}
</script>

<style scoped>
.owner-guest-dialog {
  border-radius: 16px;
}

.owner-btn, .guest-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
  font-size: 1rem;
}

.owner-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(51, 51, 51, 0.4);
}

.guest-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(228, 104, 66, 0.4);
}
</style>
