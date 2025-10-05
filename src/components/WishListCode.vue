<template>
  <div class="wishlist-code-container">
    <div class="code-label">Wishlist Code</div>
    <v-card
        class="code-card"
        elevation="8"
    >
      <div class="code-display">
        <span class="code-segment">{{ shortCode }}</span>
      </div>
    </v-card>
    <v-btn 
      class="copy-code-btn mt-3"
      :color="codeCopied ? 'success' : '#333333'"
      variant="elevated"
      :prepend-icon="codeCopied ? 'mdi-check' : 'mdi-content-copy'"
      @click="copyCode"
    >
      {{ codeCopied ? 'Copied!' : 'Copy Code' }}
    </v-btn>
    <div class="code-hint">Share this code to let others find your wishlist</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  wishlistId: String
})

const codeCopied = ref(false)
let copyTimeout = null

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

function copyCode() {
  const textToCopy = props.wishlistId || '1234'
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    console.log("Copied code to clipboard: ", textToCopy);
    
    // Clear any existing timeout
    if (copyTimeout) {
      clearTimeout(copyTimeout);
    }
    
    // Set copied state
    codeCopied.value = true;
    
    // Reset after 2 seconds
    copyTimeout = setTimeout(() => {
      codeCopied.value = false;
    }, 2000);
  }).catch(err => {
    console.error("Failed to copy code: ", err);
  });
}
</script>

<style scoped>
.wishlist-code-container {
  text-align: center;
  padding: 20px 0;
}

.code-label {
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #666;
  margin-bottom: 12px;
}

.code-card {
  margin: 0 auto;
  width: fit-content;
  min-width: 240px;
  padding: 20px 30px;
  background: linear-gradient(135deg, #ff7e5f 0%, #e46842 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(228, 104, 66, 0.3);
}

.code-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.code-segment {
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.copy-code-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.copy-code-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(51, 51, 51, 0.4);
}

.code-hint {
  font-family: 'Poppins', sans-serif;
  font-size: 0.75rem;
  color: #999;
  margin-top: 8px;
  font-style: italic;
}
</style>