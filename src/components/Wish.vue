<template>
  <div>
    <v-container class="d-flex">
      <v-text-field class="mx-auto mr-2" variant="outlined" placeholder="Name" width="30"
                    v-model="wish.name"></v-text-field>
      <v-text-field class="mx-auto mr-2" variant="outlined" placeholder="Description" width="200"
                    v-model="wish.description"></v-text-field>
      <v-btn color="blue" rounded="0" icon="mdi-link" class="mx-auto d-block mr-2 mt-1 wish-buttons"
             @click="dialog = true"></v-btn>
      <v-btn color="red" rounded="0" icon="mdi-delete" class="mx-auto d-block mt-1 wish-buttons"></v-btn>
    </v-container>
    <v-dialog v-model="dialog" style="max-width: 55rem;">
      <v-card>
        <v-card-text>
          <v-text-field v-model="wish.url" label="Link" placeholder="Enter link here"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue" @click="saveLink" :loading="isSaving" :disabled="isSaving">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue'
import {useRoute} from 'vue-router'
import {savePresent} from '@/api/client.js'

// Accept props from parent so loaded wishes show their data
const props = defineProps({
  id: [String, Number],
  listId: [String, Number],
  name: String,
  description: String,
  url: String,
  importance: Number,
})

const route = useRoute()

// Local editable copy (can't mutate props directly)
const wish = ref({
  name: props.name || '',
  description: props.description || '',
  url: props.url || '',
  importance: props.importance || 0,
})

// If parent updates props (e.g. after reload), sync
watch(() => [props.name, props.description, props.url, props.importance], () => {
  wish.value = {
    name: props.name || '',
    description: props.description || '',
    url: props.url || '',
    importance: props.importance || 0,
  }
})

const dialog = ref(false)
const isSaving = ref(false)

async function saveLink() {
  await save()
  dialog.value = false
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
    const created = await savePresent(payload)
    console.log('Present saved:', created)
  } catch (e) {
    console.error('Failed to save present', e)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.wish-buttons {
  border-radius: 4px !important;
}
</style>