<template>
  <v-dialog v-model="isOpen" max-width="800" persistent>
    <v-card class="case-opening-card">
      <v-card-title class="text-center text-h4 font-weight-bold case-title">
        <v-icon color="white" class="mr-2">mdi-package-variant</v-icon>
      </v-card-title>
      <v-card-text class="case-content">
        <!-- Spinning Animation -->
        <div class="case-container" ref="caseContainer">
          <div class="case-frame">
            <div class="case-selector"></div>
            <div class="case-items" ref="caseItems">
              <div
                v-for="(item, index) in displayItems"
                :key="`item-${index}`"
                class="case-item"
                :class="{ 'selected': selectedIndex === index }"
              >
                <div class="item-card">
                  <div class="item-name">{{ item.name || 'Unnamed Wish' }}</div>
                  <div class="item-description">{{ item.description || 'No description' }}</div>
                  <v-chip v-if="item.claimed" color="error" size="small" class="mt-2">
                    Claimed
                  </v-chip>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Result Display -->
        <div
          v-if="showResult"
          class="result-container"
          :class="{ 'result-clickable': Boolean(selectedWish?.url) }"
          @click="handleResultClick"
        >
          <div>
            <h3 class="text-h4 font-weight-bold mb-4" :style="{ color: 'rgb(228, 104, 66)' }">
              {{ selectedWish?.name }}
            </h3>
            <div class="text-body-1 mb-4">
              {{ wishDescription }}
            </div>
            <div v-if="selectedWish?.claimed" class="text-h6 text-red mb-4">
              ⚠️ This wish has already been claimed!
            </div>
            <div v-if="selectedWish?.url && !selectedWish?.claimed" class="result-link-hint">
              <v-icon color="#2196f3" class="mr-1">mdi-link-variant</v-icon>
              Click to open link
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="justify-center pb-4">
        <div v-if="!isSpinning && !showResult" class="text-center">
          <v-btn 
            color="#e46842" 
            variant="elevated"
            size="large"
            @click="startSpin"
            class="spin-btn mr-3"
          >
            <v-icon class="mr-2">mdi-play</v-icon>
            Spin
          </v-btn>
          <v-btn 
            color="grey" 
            variant="text"
            size="large"
            @click="close"
          >
            Cancel
          </v-btn>
        </div>
        <div v-else-if="showResult" class="text-center">
          <v-btn 
            v-if="!selectedWish?.claimed"
            color="#e46842" 
            variant="elevated"
            class="mr-3"
            @click="claimWish"
          >
            Claim This Wish!
          </v-btn>
          <v-btn 
            color="#4CAF50" 
            variant="elevated"
            class="mr-3"
            prepend-icon="mdi-dice-6"
            @click="rollAgain"
          >
            Roll Again!
          </v-btn>
          <v-btn 
            color="grey" 
            variant="text"
            @click="close"
          >
            {{ selectedWish?.claimed ? 'Close' : 'Cancel' }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue';
import authService from '@/auth/authService';

const props = defineProps({
  modelValue: Boolean,
  wishes: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'claim']);

const isOpen = ref(props.modelValue);
const isSpinning = ref(false);
const showResult = ref(false);
const selectedWish = ref(null);
const selectedIndex = ref(-1);
const displayItems = ref([]);
const caseItems = ref(null);
const caseContainer = ref(null);

const wishDescription = computed(() => {
  const description = selectedWish.value?.description;
  if (typeof description === 'string' && description.trim()) {
    return description.trim();
  }
  return 'No description provided';
});

watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal;
  if (newVal) {
    reset();
    createDisplayItems();
  }
});

watch(isOpen, (newVal) => {
  emit('update:modelValue', newVal);
  if (!newVal) {
    setTimeout(reset, 300);
  }
});

function createDisplayItems() {
  const unclaimedWishes = props.wishes.filter(w => !w.claimed);
  const items = [];
  for (let i = 0; i < 20; i++) {
    items.push(...unclaimedWishes);
  }
  displayItems.value = items;
}

async function startSpin() {
  if (isSpinning.value) return;

  const unclaimedWishes = props.wishes.filter(w => !w.claimed);
  if (unclaimedWishes.length === 0) return;

  await nextTick();

  const itemsEl = caseItems.value;
  const containerEl = caseContainer.value;

  if (!itemsEl || !containerEl || !itemsEl.children.length) return;

  isSpinning.value = true;
  showResult.value = false;
  selectedWish.value = null;
  selectedIndex.value = -1;

  itemsEl.style.transition = 'none';
  itemsEl.style.transform = 'translateX(0)';
  void itemsEl.offsetWidth;
  itemsEl.style.transition = 'transform 3s cubic-bezier(0.23, 1, 0.320, 1)';

  const totalItems = itemsEl.children.length;
  const uniqueCount = unclaimedWishes.length;
  const minIndex = Math.min(totalItems - 1, uniqueCount * 4);
  const maxIndex = Math.max(minIndex, totalItems - (uniqueCount * 4) - 1);
  const randomIndex = minIndex + Math.floor(Math.random() * Math.max(1, maxIndex - minIndex + 1));

  const targetElement = itemsEl.children[randomIndex];
  if (!targetElement) {
    isSpinning.value = false;
    return;
  }

  const selectorPosition = containerEl.clientWidth / 2;
  const itemCenter = targetElement.offsetLeft + targetElement.clientWidth / 2;
  const finalTranslate = itemCenter - selectorPosition;

  requestAnimationFrame(() => {
    itemsEl.style.transform = `translateX(-${finalTranslate}px)`;
  });

  setTimeout(() => {
    selectedIndex.value = randomIndex;
    selectedWish.value = displayItems.value[randomIndex] || null;
    isSpinning.value = false;
    showResult.value = true;
  }, 3100);
}

async function handleResultClick() {
  const wish = selectedWish.value;
  if (!wish?.url) return;
  
  const searchEngine = await authService.getSearchEngine();
  const url = wish.url.trim() || `${searchEngine}${encodeURIComponent(wish.name)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function claimWish() {
  if (selectedWish.value) {
    emit('claim', { wish: selectedWish.value, claimerName: '' });
  }
}

function rollAgain() {
  showResult.value = false;
  selectedWish.value = null;
  selectedIndex.value = -1;
  
  if (caseItems.value) {
    caseItems.value.style.transform = 'translateX(0)';
  }
  
  createDisplayItems();
  setTimeout(startSpin, 300);
}

function close() {
  isOpen.value = false;
}

function reset() {
  showResult.value = false;
  isSpinning.value = false;
  selectedWish.value = null;
  selectedIndex.value = -1;
  displayItems.value = [];
  
  if (caseItems.value) {
    caseItems.value.style.transform = 'translateX(0)';
  }
}
</script>

<style scoped>
.case-opening-card {
  background: white;
  color: #2d2d2d;
  border-radius: 16px !important;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.case-title {
  background: rgb(228, 104, 66);
  color: white;
  padding: 20px;
  border-bottom: 1px solid rgba(228, 104, 66, 0.2);
}

.case-content {
  padding: 20px;
  background: white;
  overflow-y: auto;
  flex: 1;
}

.case-container {
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(228, 104, 66, 0.25);
}

.case-frame {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.case-selector {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 80%;
  background: linear-gradient(180deg, transparent, rgba(228, 104, 66, 0.85), transparent);
  z-index: 10;
  border-radius: 2px;
}

.case-items {
  display: flex;
  height: 100%;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  background: #ffffff;
}

.case-item {
  flex-shrink: 0;
  width: 140px;
  height: 160px;
  margin: 0 5px;
  transition: all 0.3s ease;
}

.item-card {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(228, 104, 66, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  transition: all 0.3s ease;
}

.case-item.selected .item-card {
  transform: scale(1.05);
  border: 2px solid rgb(228, 104, 66) !important;
}

.item-name {
  font-size: 0.9rem;
  font-weight: bold;
  color: rgb(228, 104, 66);
  margin-bottom: 8px;
  line-height: 1.2;
}

.item-description {
  font-size: 0.75rem;
  color: #555;
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.result-container {
  text-align: center;
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(228, 104, 66, 0.3);
  transition: all 0.3s ease;
}

.result-clickable {
  cursor: pointer;
}

.result-clickable:hover {
  transform: translateY(-4px);
  background: #fafafa;
  border-color: rgba(228, 104, 66, 0.6);
  box-shadow: 0 8px 16px rgba(228, 104, 66, 0.2);
}

.result-link-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2196f3;
  font-size: 0.9rem;
  margin-top: 8px;
  font-weight: 500;
}

.spin-btn {
  padding: 5px 12px !important;
  font-size: 1.2rem !important;
  border-radius: 12px !important;
  background: rgb(228, 104, 66) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(228, 104, 66, 0.4) !important;
  transition: all 0.3s ease !important;
}

.spin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(228, 104, 66, 0.6) !important;
}

@media (max-width: 600px) {
  .case-opening-card {
    margin: 0.5rem;
    max-width: calc(100vw - 1rem) !important;
    border-radius: 12px !important;
  }

  .case-title {
    padding: 1rem;
    font-size: 1.5rem !important;
  }

  .case-content {
    padding: 1rem;
  }

  .case-container {
    border-radius: 8px;
  }

  .case-item {
    width: 120px;
    height: 140px;
  }

  .item-card {
    padding: 10px;
  }

  .item-name {
    font-size: 0.85rem;
  }

  .item-description {
    font-size: 0.7rem;
  }

  .result-container {
    padding: 1rem;
    margin-top: 1rem;
  }

  .result-container h3 {
    font-size: 1.5rem !important;
    line-height: 1.3;
  }

  .result-container .text-body-1 {
    font-size: 0.95rem !important;
    line-height: 1.5;
  }

  .result-link-hint {
    font-size: 0.85rem;
  }

  .case-opening-card .v-card-actions {
    padding: 1rem;
    flex-wrap: wrap;
  }

  .case-opening-card .v-card-actions .v-btn {
    flex: 1 1 100%;
    margin: 0.25rem 0;
    min-height: 48px;
    font-size: 1rem !important;
  }

  .spin-btn {
    font-size: 1.1rem !important;
    padding: 14px 20px !important;
  }
}

@media (max-width: 480px) {
  .case-item {
    width: 100px;
    height: 130px;
  }

  .item-name {
    font-size: 0.8rem;
  }

  .item-description {
    font-size: 0.65rem;
  }
}

@media (hover: none) and (pointer: coarse) {
  .spin-btn:active {
    transform: scale(0.97);
  }

  .result-clickable:active {
    transform: translateY(-2px) scale(0.98);
  }
}
</style>
