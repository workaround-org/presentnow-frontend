<template>
  <v-card
    class="wish-card"
    :class="{
      'wish-card-clickable': wish.url && !wish.claimed,
      'wish-card-claimed': wish.claimed
    }"
    elevation="3"
    @click="handleClick"
  >
    <div class="wish-card-header">
      <v-chip v-if="wish.claimed" color="success" size="small" class="claimed-chip">
        <v-icon size="small" start>mdi-check</v-icon>
        Claimed
      </v-chip>
      <v-icon v-else-if="wish.url" size="small" color="#2196f3" class="link-icon">
        mdi-link-variant
      </v-icon>
    </div>

    <v-card-title class="wish-title">
      {{ wish.name || 'Unnamed Wish' }}
    </v-card-title>

    <v-card-text class="wish-description">
      <div v-if="wish.description" class="description-text">
        {{ wish.description }}
      </div>
      <div v-if="wish.claimed && wish.claimerName" class="claimer-info">
        <v-icon size="small" class="mr-1">mdi-account</v-icon>
        Claimed by {{ wish.claimerName }}
      </div>
    </v-card-text>

    <v-card-actions v-if="!wish.claimed" class="wish-actions">
      <v-btn
        color="#e46842"
        variant="elevated"
        block
        class="claim-btn"
        @click.stop="$emit('claim', wish)"
      >
        <v-icon start>mdi-hand-heart</v-icon>
        I'll get this!
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
  if (!props.wish.claimed) {
    emit('click', props.wish);
  }
}
</script>

<style scoped>
.wish-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px !important;
  transition: all 0.3s ease;
  background: white;
  border-left: 4px solid transparent;
  position: relative;
  overflow: hidden;
}

.wish-card:not(.wish-card-claimed) {
  border-left-color: #e46842;
}

.wish-card-clickable {
  cursor: pointer;
}

.wish-card-clickable:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.wish-card-clickable:active {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12) !important;
}

.wish-card-claimed {
  opacity: 0.7;
  background: #f5f5f5;
  border-left-color: #4caf50;
}

.wish-card-header {
  padding: 0.75rem 1rem 0;
  display: flex;
  justify-content: flex-end;
  min-height: 36px;
}

.claimed-chip {
  font-weight: 600;
}

.link-icon {
  opacity: 0.7;
}

.wish-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  padding: 0.5rem 1rem;
  word-break: break-word;
}

.wish-description {
  padding: 0 1rem 1rem;
  flex-grow: 1;
}

.description-text {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.claimer-info {
  color: #4caf50;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  margin-top: 0.75rem;
}

.wish-actions {
  padding: 0 1rem 1rem;
}

.claim-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  border-radius: 8px !important;
  transition: all 0.3s ease;
  min-height: 44px;
}

.claim-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(228, 104, 66, 0.3) !important;
}

.claim-btn:active {
  transform: translateY(0);
  box-shadow: 0 3px 8px rgba(228, 104, 66, 0.25) !important;
}

@media (max-width: 600px) {
  .wish-card {
    margin-bottom: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
    border-radius: 16px !important;
  }

  .wish-card-header {
    padding: 1rem 1rem 0.5rem 1rem !important;
  }

  .wish-card .v-card-title.wish-title {
    display: block !important;
    font-size: 1.1rem !important;
    padding: 0 1rem 0.75rem 1rem !important;
    line-height: 1.4 !important;
  }

  .wish-card .v-card-text.wish-description {
    display: block !important;
    padding: 0 1rem 0.75rem 1rem !important;
  }

  .description-text {
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .wish-card .wish-actions {
    padding: 0 1rem 1rem 1rem !important;
  }

  .claim-btn {
    font-size: 1rem;
    padding: 14px 16px;
    min-height: 52px;
    border-radius: 12px !important;
  }
}

@media (max-width: 480px) {
  .wish-card {
    border-radius: 14px !important;
  }

  .wish-title {
    font-size: 1.05rem;
  }

  .description-text {
    font-size: 0.9rem;
  }

  .claim-btn {
    min-height: 50px;
    font-size: 0.95rem;
  }
}

@media (hover: none) and (pointer: coarse) {
  .wish-card-clickable:active {
    transform: scale(0.98);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  }

  .claim-btn:active {
    transform: scale(0.97);
  }
}
</style>
