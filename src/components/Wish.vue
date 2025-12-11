<template>
  <v-card class="wish-card elevation-2 mb-3">
    <div v-if="claimed" class="claimed-banner">
      <v-chip color="success" size="small" class="claimed-chip">
        <v-icon size="small" start>mdi-check-circle</v-icon>
        Claimed
      </v-chip>
    </div>
    
    <div class="wish-content">
      <div class="wish-fields">
        <v-text-field 
          class="wish-input" 
          variant="outlined" 
          placeholder="Wish name *" 
          density="comfortable"
          v-model="wish.name" 
          @blur="autoSave" 
          maxlength="255" 
          counter
          hide-details="auto"
          color="#e46842"
        >
          <template v-slot:prepend-inner>
            <v-icon color="#e46842" size="small">mdi-gift</v-icon>
          </template>
        </v-text-field>
        
        <v-text-field 
          class="wish-input" 
          variant="outlined" 
          placeholder="Description (optional)" 
          density="comfortable"
          v-model="wish.description" 
          @blur="autoSave" 
          maxlength="255" 
          counter
          hide-details="auto"
          color="#e46842"
        >
          <template v-slot:prepend-inner>
            <v-icon color="#999" size="small">mdi-text</v-icon>
          </template>
        </v-text-field>
      </div>
      
      <div class="wish-actions">
        <v-tooltip text="Add link" location="top">
          <template v-slot:activator="{ props }">
            <v-btn 
              v-bind="props"
              color="#2196f3" 
              icon
              size="default"
              class="action-btn"
              @click="dialog = true"
              elevation="2"
            >
              <v-icon>mdi-link-variant</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        
        <v-tooltip v-if="claimed" text="Unclaim present" location="top">
          <template v-slot:activator="{ props }">
            <v-btn 
              v-bind="props"
              color="#ff9800" 
              icon
              size="default"
              class="action-btn"
              @click="unclaimWish" 
              :loading="isUnclaiming" 
              :disabled="isUnclaiming"
              elevation="2"
            >
              <v-icon>mdi-hand-back-left</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        
        <v-tooltip text="Delete wish" location="top">
          <template v-slot:activator="{ props }">
            <v-btn 
              v-bind="props"
              color="#f44336" 
              icon
              size="default"
              class="action-btn"
              @click="deleteWish" 
              :loading="isDeleting" 
              :disabled="isDeleting"
              elevation="2"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </div>
    
    <v-expand-transition>
      <div v-if="wish.url" class="link-preview">
        <v-icon size="small" color="#2196f3" class="mr-2">mdi-link</v-icon>
        <a :href="wish.url" target="_blank" rel="noopener noreferrer" class="link-text">
          {{ wish.url }}
        </a>
      </div>
    </v-expand-transition>
    
    <v-dialog v-model="dialog" max-width="600">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <v-icon left color="#2196f3">mdi-link-variant</v-icon>
          Add Link to Wish
        </v-card-title>
        <v-card-text class="py-4">
          <v-text-field
              v-model="wish.url"
              variant="outlined"
              placeholder="https://example.com/product"
              maxlength="255"
              counter
              :error-messages="urlError"
              @input="urlError = ''"
              color="#2196f3"
              density="comfortable"
          >
            <template v-slot:prepend-inner>
              <v-icon color="#2196f3">mdi-web</v-icon>
            </template>
          </v-text-field>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn 
            color="grey" 
            variant="text"
            @click="dialog = false"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="#2196f3" 
            variant="elevated"
            @click="saveLink" 
            :loading="isSaving" 
            :disabled="isSaving"
            class="save-btn"
          >
            <v-icon left>mdi-check</v-icon>
            Save Link
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
  transition: all 0.3s ease;
  border-left: 4px solid #e46842;
  background: white;
  overflow: hidden;
}

.wish-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.claimed-banner {
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-bottom: 1px solid #a5d6a7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.claimed-chip {
  font-weight: 600;
}

.wish-content {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  align-items: flex-start;
}

.wish-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0; /* Important for flex text overflow */
}

.wish-input {
  font-size: 0.95rem;
  width: 100%;
}

.wish-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  transition: all 0.3s ease;
  border-radius: 8px !important;
}

.action-btn:hover {
  transform: scale(1.1);
}

.link-preview {
  padding: 0.75rem 1rem;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
}

.link-text {
  color: #2196f3;
  text-decoration: none;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-text:hover {
  text-decoration: underline;
}

.dialog-card {
  border-radius: 16px !important;
}

.dialog-title {
  font-size: 1.3rem;
  font-weight: 600;
  padding: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  color: #333;
}

.save-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .wish-content {
    flex-direction: column;
    gap: 1rem;
    padding: 0.75rem;
  }
  
  .wish-fields {
    width: 100%;
  }
  
  .wish-actions {
    flex-direction: row;
    width: 100%;
    justify-content: flex-end;
  }
  
  .link-preview {
    padding: 0.5rem 0.75rem;
  }
  
  .dialog-title {
    font-size: 1.1rem;
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .wish-content {
    padding: 0.5rem;
  }
  
  .wish-input {
    font-size: 0.9rem;
  }
  
  .action-btn {
    width: 40px;
    height: 40px;
  }
}
</style>