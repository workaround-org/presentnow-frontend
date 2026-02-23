<template>
  <div class="wishlist-code-container">
    <div class="code-label">Wishlist Code</div>
    <v-card
        class="code-card"
        flat
        border
    >
      <div class="code-display">
        <span class="code-segment">{{ shortCode }}</span>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  wishlistId: String
})

// Create a shorter, more readable version of the ID
const shortCode = computed(() => {
  if (!props.wishlistId) return '1234'
  
  const id = props.wishlistId
  
  // If it's a UUID, show first 8 and last 4 characters
  if (id.length > 20) {
    return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`
  }
  
  // If it's short enough, show it all
  return id
})
</script>

<style scoped>
.wishlist-code-container {
  text-align: center;
}

.code-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #666;
  margin-bottom: 8px;
}

.code-card {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.code-segment {
  font-family: 'Courier New', monospace;
  font-size: 1.25rem;
  font-weight: bold;
  color: #2c3e50;
  letter-spacing: 1px;
}
</style>