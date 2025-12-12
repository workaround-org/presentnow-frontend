<template>
  <v-card v-if="deadline" class="deadline-card elevation-4 mx-auto mb-6">
    <v-card-title class="card-title-centered">
      <v-icon color="#e46842" size="large" class="mr-2">mdi-calendar-clock</v-icon>
      Time Remaining
    </v-card-title>
    <v-card-text class="text-center pb-4">
      <div class="deadline-date">{{ formatDeadline(deadline) }}</div>
      <div class="time-remaining" :class="{ 'time-urgent': isUrgent }">
        {{ timeRemaining }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  deadline: {
    type: String,
    default: null
  }
});

function formatDeadline(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

const timeRemaining = computed(() => {
  if (!props.deadline) return '';
  
  const now = new Date();
  const end = new Date(props.deadline);
  const diff = end - now;
  
  if (diff <= 0) {
    return 'Expired';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
});

const isUrgent = computed(() => {
  if (!props.deadline) return false;
  const now = new Date();
  const end = new Date(props.deadline);
  const diff = end - now;
  const daysRemaining = diff / (1000 * 60 * 60 * 24);
  return daysRemaining <= 7 && daysRemaining > 0;
});
</script>

<style scoped>
.deadline-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px !important;
  animation: slideUp 0.5s ease-out;
  max-width: 600px;
}

.card-title-centered {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  padding: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.deadline-date {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1rem;
}

.time-remaining {
  font-size: 2rem;
  font-weight: 700;
  color: #e46842;
}

.time-urgent {
  color: #f44336;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@media (max-width: 600px) {
  .deadline-card {
    background: rgba(228, 104, 66, 0.95) !important;
    border-radius: 16px !important;
    padding: 1.25rem !important;
    margin: 0 0 1.5rem 0 !important;
  }

  .card-title-centered {
    padding: 0 0 0.75rem 0;
    color: white;
    font-size: 1.1rem;
  }

  .card-title-centered .v-icon {
    color: white !important;
  }

  .deadline-card .v-card-text {
    padding: 0 !important;
  }

  .deadline-date {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 0.5rem;
  }

  .time-remaining {
    font-size: 1.4rem;
    font-weight: 700;
    color: white;
  }
}

@media (max-width: 480px) {
  .deadline-card {
    border-radius: 14px !important;
    padding: 0.875rem !important;
  }

  .card-title-centered {
    font-size: 1rem;
  }

  .time-remaining {
    font-size: 1.3rem;
  }

  .deadline-date {
    font-size: 0.9rem;
  }
}
</style>
