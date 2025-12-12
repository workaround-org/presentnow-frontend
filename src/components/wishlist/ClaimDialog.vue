<template>
  <v-dialog v-model="isOpen" max-width="500" persistent>
    <v-card class="claim-dialog-card">
      <v-card-title class="claim-dialog-header">
        <v-icon left color="white" size="large">mdi-hand-heart</v-icon>
        <span>Claim This Wish</span>
      </v-card-title>
      <v-card-text class="claim-dialog-content">
        <div class="claim-wish-name">
          <v-icon color="#e46842" class="mr-2">mdi-gift</v-icon>
          {{ wish?.name }}
        </div>
        <p class="claim-instruction">Enter your name to let others know you'll get this gift:</p>
        <v-text-field
          v-model="claimerName"
          variant="outlined"
          placeholder="Your name"
          maxlength="100"
          :error-messages="error"
          @input="error = ''"
          color="#e46842"
          density="comfortable"
          autofocus
        >
          <template v-slot:prepend-inner>
            <v-icon color="#e46842">mdi-account</v-icon>
          </template>
        </v-text-field>
      </v-card-text>
      <v-card-actions class="claim-dialog-actions">
        <v-btn 
          color="grey" 
          variant="text"
          @click="handleCancel"
          :disabled="claiming"
        >
          Cancel
        </v-btn>
        <v-btn 
          color="#e46842" 
          variant="elevated"
          :loading="claiming"
          :disabled="claiming || !claimerName.trim()"
          @click="handleClaim"
          class="claim-submit-btn"
        >
          <v-icon start>mdi-check-circle</v-icon>
          Claim Gift
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  wish: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'claim']);

const CLAIMER_NAME_KEY = 'presentnow_claimer_name';

const isOpen = ref(props.modelValue);
const claimerName = ref('');
const claiming = ref(false);
const error = ref('');

watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal;
  if (newVal) {
    const savedName = sessionStorage.getItem(CLAIMER_NAME_KEY);
    if (savedName) {
      claimerName.value = savedName;
    }
  }
});

watch(isOpen, (newVal) => {
  emit('update:modelValue', newVal);
});

function handleCancel() {
  isOpen.value = false;
  error.value = '';
}

async function handleClaim() {
  if (!claimerName.value.trim()) {
    error.value = 'Please enter your name';
    return;
  }
  
  if (!props.wish) {
    error.value = 'No wish selected';
    return;
  }
  
  claiming.value = true;
  try {
    const trimmedName = claimerName.value.trim();
    await emit('claim', { wish: props.wish, claimerName: trimmedName });
    sessionStorage.setItem(CLAIMER_NAME_KEY, trimmedName);
    isOpen.value = false;
  } catch (e) {
    console.error('Failed to claim wish:', e);
    error.value = 'Failed to claim. Please try again.';
  } finally {
    claiming.value = false;
  }
}
</script>

<style scoped>
.claim-dialog-card {
  border-radius: 16px !important;
  overflow: hidden;
}

.claim-dialog-header {
  background: linear-gradient(135deg, #e46842 0%, #d94d27 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.4rem;
  font-weight: 700;
}

.claim-dialog-content {
  padding: 2rem 1.5rem 1.5rem;
}

.claim-wish-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.claim-instruction {
  color: #666;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.claim-dialog-actions {
  padding: 1rem 1.5rem 1.5rem;
  justify-content: space-between;
}

.claim-submit-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
}

@media (max-width: 600px) {
  .claim-dialog-card {
    margin: 0.75rem;
    max-width: calc(100vw - 1.5rem) !important;
  }

  .claim-dialog-header {
    padding: 1.25rem 1rem;
    font-size: 1.25rem;
  }

  .claim-dialog-content {
    padding: 1.5rem 1rem 1rem;
  }

  .claim-wish-name {
    font-size: 1rem;
    padding: 0.875rem;
    margin-bottom: 1.25rem;
  }

  .claim-instruction {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .claim-dialog-actions {
    padding: 0.75rem 1rem 1rem;
    flex-direction: column;
    gap: 0.75rem;
  }

  .claim-dialog-actions .v-btn {
    width: 100%;
    min-height: 48px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .claim-dialog-header {
    font-size: 1.15rem;
  }
}
</style>
