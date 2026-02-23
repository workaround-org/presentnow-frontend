<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="400" persistent>
    <v-card class="dialog-card">
      <v-card-title class="dialog-header pt-4 px-4">
        <span class="dialog-title-text">New Wishlist</span>
      </v-card-title>
      
      <v-card-text class="dialog-content px-4 pt-2 pb-0">
        <v-text-field
            v-model="wishlistName"
            placeholder="Name (e.g. Birthday 2024)"
            variant="outlined"
            density="comfortable"
            color="#e46842"
            maxlength="100"
            autofocus
            hide-details="auto"
            @keyup.enter="createWishlist"
        ></v-text-field>
      </v-card-text>
      
      <v-card-actions class="dialog-actions px-4 pb-4 pt-4">
        <v-spacer></v-spacer>
        <v-btn
            color="grey-darken-1"
            variant="text"
            @click="$emit('update:modelValue', false)"
            :disabled="isSaving"
        >
          Cancel
        </v-btn>
        <v-btn
            @click="createWishlist"
            class="create-btn"
            color="#e46842"
            variant="flat"
            :loading="isSaving"
            :disabled="isSaving || !wishlistName.trim()"
        >
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {useRouter} from "vue-router";
import {ref, watch} from "vue";
import {saveWishList} from '@/api/client'

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'wishlist-created']);

const router = useRouter();
const wishlistName = ref('');
const isSaving = ref(false);

// Reset form when dialog closes
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    wishlistName.value = '';
  }
});

async function createWishlist() {
  if (isSaving.value) return;
  isSaving.value = true;
  try {
    const name = wishlistName.value && wishlistName.value.trim().length > 0 ? wishlistName.value.trim() : 'New Wishlist';
    const payload = {
      name,
      description: '',
      active: true,
      presentIdeas: []
    };
    const saved = await saveWishList(payload);
    emit('wishlist-created', saved);
    // Navigate after successful creation; prefer id if returned
    if (saved && saved.id) {
      router.push(`/create/${saved.id}`);
    } else {
      router.push(`/create/${name}`);
    }
    emit('update:modelValue', false);
  } catch (e) {
    console.error('Failed to create wishlist', e);
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.dialog-card {
  border-radius: 12px !important;
}

.dialog-title-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.create-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  border-radius: 8px !important;
}
</style>