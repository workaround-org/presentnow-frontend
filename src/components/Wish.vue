<template>
  <div>
    <v-container class="d-flex">
      <v-text-field class="mx-auto mr-2" variant="outlined" placeholder="Name" width="30"
                    v-model="wish.name" @blur="autoSave"></v-text-field>
      <v-text-field class="mx-auto mr-2" variant="outlined" placeholder="Description" width="200"
                    v-model="wish.description" @blur="autoSave"></v-text-field>
      <v-btn color="blue" rounded="0" icon="mdi-link" class="mx-auto d-block mr-2 mt-1 wish-buttons"
             @click="dialog = true"></v-btn>
      <v-btn color="red" rounded="0" icon="mdi-delete" class="mx-auto d-block mt-1 wish-buttons"
             @click="deleteWish" :loading="isDeleting" :disabled="isDeleting"></v-btn>
    </v-container>
    <v-dialog v-model="dialog" style="max-width: 55rem;">
      <v-card>
        <v-card-text>
          <v-text-field
              v-model="wish.url"
              variant="outlined"
              placeholder="Link"></v-text-field>
        </v-card-text>
        <v-spacer></v-spacer>
        <v-btn color="#e46842"
               class="mx-auto mb-5 mt-n4 font-weight-bold" height="50" width="250"
               @click="saveLink" :loading="isSaving" :disabled="isSaving">Save
        </v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue'
import {useRoute} from 'vue-router'
import {savePresent, updatePresent, deletePresent} from '@/api/client.js'

// Accept props from parent so loaded wishes show their data
const props = defineProps({
  id: [String, Number],
  listId: [String, Number],
  name: String,
  description: String,
  url: String,
  importance: Number,
})

const emit = defineEmits(['deleted'])

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

async function saveLink() {
  await save()
  dialog.value = false
}

async function autoSave() {
  // Only auto-save if the wish has a name (user has entered something meaningful)
  if (!wish.value.name.trim()) {
    return
  }
  await save()
}

async function save() {
  if (isSaving.value) return
  isSaving.value = true
  try {
    const listIdParam = props.listId ?? route.params.wishListName
    const listId = typeof listIdParam === 'string' ? (Number(listIdParam) || listIdParam) : listIdParam
    const payload = {
      listId,
      name: wish.value.name || 'Untitled Present',
      url: wish.value.url || '',
      description: wish.value.description || '',
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
</script>

<style scoped>
.wish-buttons {
  border-radius: 4px !important;
}
</style>