<template>
  <v-card
    class="wish-card"
    :class="{
      'wish-card-clickable': wish.url,
      'wish-card-claimed': wish.claimed
    }"
    flat
    border
    @click="handleClick"
  >
    <div class="d-flex justify-space-between align-start pa-4 pb-2">
      <h3 class="wish-title text-truncate pr-2">
        {{ wish.name || 'Unnamed Wish' }}
      </h3>
      <v-icon v-if="wish.url" size="small" color="primary" class="flex-shrink-0">
        mdi-open-in-new
      </v-icon>
    </div>

    <v-card-text class="px-4 py-2 flex-grow-1">
      <p v-if="wish.description" class="wish-description text-body-2 text-medium-emphasis mb-0">
        {{ wish.description }}
      </p>
      
      <div v-if="wish.claimed" class="mt-3 d-flex align-center text-success">
        <v-icon size="small" start>mdi-check-circle</v-icon>
        <span class="text-caption font-weight-medium">
          Claimed by {{ wish.claimerName || 'Someone' }}
        </span>
      </div>
    </v-card-text>

    <v-card-actions v-if="!wish.claimed" class="px-4 pb-4 pt-2">
      <v-btn
        color="#e46842"
        variant="tonal"
        block
        class="claim-btn"
        @click.stop="$emit('claim', wish)"
        height="40"
      >
        I'll get this
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
const props = defineProps({
  wish: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click', 'claim']);

function handleClick() {
  emit('click', props.wish);
}
</script>

<style scoped>
.wish-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px !important;
  transition: all 0.2s ease;
  background: white;
}

.wish-card-clickable {
  cursor: pointer;
}

.wish-card-clickable:hover {
  border-color: #e46842;
  background-color: #fffbf9;
}

.wish-card-claimed {
  background-color: #f8f9fa;
  opacity: 0.8;
}

.wish-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  line-height: 1.4;
}

.wish-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.claim-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 8px;
}
</style>
