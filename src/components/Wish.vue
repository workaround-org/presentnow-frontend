<template>
  <v-card class="wish-card mb-3" flat border>
    <div class="wish-content pa-4">
      <div class="wish-fields flex-grow-1">
        <v-text-field 
          class="wish-input mb-2" 
          variant="plain" 
          placeholder="Wish name" 
          density="compact"
          v-model="wish.name" 
          @blur="autoSave" 
          maxlength="255" 
          hide-details
          single-line
          :autofocus="!wish.name"
        >
          <template v-slot:prepend-inner>
            <v-icon size="small" color="grey-lighten-1" class="mr-2">mdi-gift-outline</v-icon>
          </template>
        </v-text-field>
        
        <v-text-field 
          class="wish-input" 
          variant="plain" 
          placeholder="Description (optional)" 
          density="compact"
          v-model="wish.description" 
          @blur="autoSave" 
          maxlength="255" 
          hide-details
          single-line
        >
          <template v-slot:prepend-inner>
            <v-icon size="small" color="grey-lighten-1" class="mr-2">mdi-text</v-icon>
          </template>
        </v-text-field>
      </div>
      
      <div class="wish-actions d-flex align-center ml-2">
        <v-btn 
          icon
          variant="text"
          density="comfortable"
          size="small"
          color="primary"
          @click="dialog = true"
          :class="{'text-primary': wish.url, 'text-grey': !wish.url}"
        >
          <v-icon>mdi-link-variant</v-icon>
        </v-btn>
        
        <v-btn 
          icon
          variant="text"
          density="comfortable"
          size="small"
          color="error"
          @click="deleteWish" 
          :loading="isDeleting" 
          :disabled="isDeleting"
        >
          <v-icon>mdi-delete-outline</v-icon>
        </v-btn>
      </div>
    </div>
    
    <div v-if="wish.url" class="px-4 pb-2">
      <a :href="wish.url" target="_blank" rel="noopener noreferrer" class="text-caption text-primary text-decoration-none d-flex align-center">
        <v-icon size="x-small" class="mr-1">mdi-open-in-new</v-icon>
        {{ wish.url }}
      </a>
    </div>

    <div v-if="claimed" class="px-4 pb-2">
      <v-chip color="success" size="x-small" variant="tonal">
        Claimed by {{ claimerName || 'Someone' }}
        <v-icon end size="small" @click="unclaimWish" class="ml-1">mdi-close-circle</v-icon>
      </v-chip>
    </div>
    
    <v-dialog v-model="dialog" max-width="400">
      <v-card class="rounded-lg">
        <v-card-title class="text-subtitle-1 px-4 pt-4">
          Add Link
        </v-card-title>
        <v-card-text class="px-4 py-2">
          <v-text-field
              v-model="wish.url"
              variant="outlined"
              placeholder="https://example.com/product"
              maxlength="255"
              :error-messages="urlError"
              @input="urlError = ''"
              color="primary"
              density="compact"
              hide-details="auto"
              autofocus
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn 
            color="grey-darken-1" 
            variant="text"
            @click="dialog = false"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
            variant="flat"
            @click="saveLink" 
            :loading="isSaving" 
            :disabled="isSaving"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import {ref, watch} from 'vue'
import {useRoute} from 'vue-router'
import {deletePresent, savePresent, updatePresent, unclaimPresent} from '@/api/client'
import authService from '@/auth/authService'

// Accept props from parent so loaded wishes show their data
const props = defineProps({
  id: [String, Number],
  listId: [String, Number],
  name: String,
  description: String,
  url: String,
  importance: Number,
  claimed: Boolean,
  claimerName: String,
})

const emit = defineEmits(['deleted', 'unclaimed'])

const route = useRoute()

// Local editable copy (can't mutate props directly)
const wish = ref({
  name: props.name || '',
  description: props.description || '',
  url: props.url || '',
  importance: props.importance || 0,
})

// Track if present has been saved (has an id)
// Note: When adding a new wish, parent generates a temporary ID using Date.now()
// We need to distinguish between temporary IDs and real backend IDs
const savedPresentId = ref(null)
const isRealBackendId = ref(false)

// Check if the prop id is from backend (would be a smaller number or a proper backend ID format)
// Temporary IDs from Date.now() are very large timestamps (13+ digits)
if (props.id && !isTemporaryId(props.id)) {
  savedPresentId.value = props.id
  isRealBackendId.value = true
}

function isTemporaryId(id) {
  // Date.now() generates IDs like 1703001234567 (13 digits)
  // Backend IDs are typically sequential integers starting from 1
  const numId = typeof id === 'string' ? parseInt(id) : id
  return numId > 1000000000000 // If > 1 trillion, it's likely a timestamp
}

// If parent updates props (e.g. after reload), sync
watch(() => [props.name, props.description, props.url, props.importance], () => {
  wish.value = {
    name: props.name || '',
    description: props.description || '',
    url: props.url || '',
    importance: props.importance || 0,
  }
})

// Watch for id prop changes
watch(() => props.id, (newId) => {
  if (newId && !isTemporaryId(newId)) {
    savedPresentId.value = newId
    isRealBackendId.value = true
  }
})

const dialog = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const isUnclaiming = ref(false)
const urlError = ref('')

async function saveLink() {
  // Validate URL length before saving
  if (wish.value.url && wish.value.url.length > 255) {
    urlError.value = 'URL is too long (max 255 characters)'
    return
  }
  await save()
  dialog.value = false
}

async function autoSave() {
  // Only auto-save if the wish has a name (user has entered something meaningful)
  if (!wish.value.name.trim()) {
    return
  }
  // Truncate fields that are too long before saving
  if (wish.value.name.length > 255) {
    wish.value.name = wish.value.name.substring(0, 255)
  }
  if (wish.value.description.length > 255) {
    wish.value.description = wish.value.description.substring(0, 255)
  }
  if (wish.value.url.length > 255) {
    wish.value.url = wish.value.url.substring(0, 255)
  }
  await save()
}

async function save() {
  if (isSaving.value) return
  isSaving.value = true
  try {
    const listIdParam = props.listId ?? route.params.wishListName
    const listId = typeof listIdParam === 'string' ? (Number(listIdParam) || listIdParam) : listIdParam

    // Ensure all fields are within database limits (255 chars)
    const truncate = (str, maxLength = 255) => str && str.length > maxLength ? str.substring(0, maxLength) : str

    const payload = {
      listId,
      name: truncate(wish.value.name, 255) || 'Untitled Present',
      url: truncate(wish.value.url, 255) || '',
      description: truncate(wish.value.description, 255) || '',
      importance: wish.value.importance || 0,
    }

    // Only update if we have a REAL backend ID (not a temporary ID)
    if (savedPresentId.value && isRealBackendId.value) {
      const updated = await updatePresent(savedPresentId.value, payload)
      console.log('Present updated:', updated)
    } else {
      const created = await savePresent(payload)
      savedPresentId.value = created.id
      isRealBackendId.value = true
      console.log('Present created:', created)
    }
  } catch (e) {
    console.error('Failed to save present', e)
  } finally {
    isSaving.value = false
  }
}

async function deleteWish() {
  if (isDeleting.value) return

  // If the wish hasn't been saved to backend yet, just emit delete event
  if (!savedPresentId.value || !isRealBackendId.value) {
    emit('deleted', props.id)
    return
  }

  isDeleting.value = true
  try {
    await deletePresent(savedPresentId.value)
    console.log('Present deleted:', savedPresentId.value)
    // Emit event to parent to remove this wish from the list
    emit('deleted', props.id || savedPresentId.value)
  } catch (e) {
    console.error('Failed to delete present', e)
  } finally {
    isDeleting.value = false
  }
}

async function unclaimWish() {
  if (isUnclaiming.value) return
  
  // Check if user is authenticated
  const isAuthenticated = await authService.isAuthenticated()
  
  if (!isAuthenticated) {
    // Trigger OIDC login
    try {
      await authService.login()
      // After login redirect, the page will reload and user can try again
      return
    } catch (e) {
      console.error('Login failed:', e)
      return
    }
  }
  
  // If the wish hasn't been saved to backend yet, do nothing
  if (!savedPresentId.value || !isRealBackendId.value) {
    return
  }
  
  isUnclaiming.value = true
  try {
    const updated = await unclaimPresent(savedPresentId.value)
    console.log('Present unclaimed:', savedPresentId.value)
    // Emit event to parent to update the wish
    emit('unclaimed', props.id || savedPresentId.value)
  } catch (e) {
    console.error('Failed to unclaim present', e)
  } finally {
    isUnclaiming.value = false
  }
}
</script>

<style scoped>
.wish-card {
  border-radius: 12px !important;
  transition: all 0.2s ease;
  background: rgba(255,255,255,0.9);
}

.wish-card:hover {
  border-color: #e46842;
}

.wish-input :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}
</style>