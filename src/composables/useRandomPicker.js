import { ref, computed, nextTick } from 'vue';

export function useRandomPicker(wishes) {
  const randomPickerDialog = ref(false);
  const isSpinning = ref(false);
  const isPreparingSpin = ref(false);
  const showResult = ref(false);
  const randomlySelectedWish = ref(null);
  const selectedIndex = ref(-1);
  const displayItems = ref([]);
  const caseItems = ref(null);
  const caseContainer = ref(null);

  const selectedWishDescription = computed(() => {
    const description = randomlySelectedWish.value?.description;
    if (typeof description === 'string' && description.trim()) {
      return description.trim();
    }
    return 'No description provided';
  });

  function createDisplayItems() {
    const unclaimedWishes = wishes.value.filter(w => !w.claimed);
    const items = [];

    for (let i = 0; i < 20; i++) {
      items.push(...unclaimedWishes);
    }
    
    displayItems.value = items;
  }

  function openRandomPicker() {
    const unclaimedWishes = wishes.value.filter(w => !w.claimed);
    if (unclaimedWishes.length < 2) {
      return;
    }

    createDisplayItems();
    randomPickerDialog.value = true;
    showResult.value = false;
    isSpinning.value = false;
    isPreparingSpin.value = false;
    randomlySelectedWish.value = null;
    selectedIndex.value = -1;

    setTimeout(() => {
      if (caseItems.value) {
        caseItems.value.style.transform = 'translateX(0)';
      }
    }, 100);
  }

  async function startSpinning() {
    if (isSpinning.value) {
      return;
    }

    const unclaimedWishes = wishes.value.filter(w => !w.claimed);
    if (unclaimedWishes.length === 0) {
      return;
    }

    if (!displayItems.value.length) {
      createDisplayItems();
    }

    await nextTick();

    const itemsEl = caseItems.value;
    const containerEl = caseContainer.value;

    if (!itemsEl || !containerEl || !itemsEl.children.length) {
      console.warn('Random picker not ready: missing DOM elements');
      return;
    }

    isPreparingSpin.value = false;
    isSpinning.value = true;
    showResult.value = false;
    randomlySelectedWish.value = null;
    selectedIndex.value = -1;

    itemsEl.style.transition = 'none';
    itemsEl.style.transform = 'translateX(0)';
    void itemsEl.offsetWidth;
    itemsEl.style.transition = '';

    const totalItems = itemsEl.children.length;
    const uniqueCount = unclaimedWishes.length;

    const loopsBeforeSelection = 4;
    const loopsAfterSelection = 4;
    const minIndex = Math.min(totalItems - 1, uniqueCount * loopsBeforeSelection);
    const maxIndex = Math.max(minIndex, totalItems - (uniqueCount * loopsAfterSelection) - 1);
    const randomIndex = minIndex + Math.floor(Math.random() * Math.max(1, maxIndex - minIndex + 1));

    const targetElement = itemsEl.children[randomIndex];
    if (!targetElement) {
      console.warn('Unable to locate target element for random picker');
      isSpinning.value = false;
      return;
    }

    const selectorPosition = containerEl.clientWidth / 2;
    const itemCenter = targetElement.offsetLeft + targetElement.clientWidth / 2;
    const finalTranslate = itemCenter - selectorPosition;

    requestAnimationFrame(() => {
      itemsEl.style.transform = `translateX(-${finalTranslate}px)`;
    });

    const spinDuration = getTransitionDurationMs(itemsEl) + 100;

    setTimeout(() => {
      selectedIndex.value = randomIndex;
      randomlySelectedWish.value = displayItems.value[randomIndex] || null;
      isSpinning.value = false;
      showResult.value = true;
    }, spinDuration);
  }

  function parseTimeToMs(value) {
    if (!value) {
      return 0;
    }

    const trimmed = value.trim();
    if (trimmed.endsWith('ms')) {
      return parseFloat(trimmed.replace('ms', '')) || 0;
    }

    if (trimmed.endsWith('s')) {
      return (parseFloat(trimmed.replace('s', '')) || 0) * 1000;
    }

    const numeric = parseFloat(trimmed);
    return Number.isFinite(numeric) ? numeric * 1000 : 0;
  }

  function getTransitionDurationMs(element) {
    if (typeof window === 'undefined' || !element) {
      return 3000;
    }

    const style = window.getComputedStyle(element);
    const durations = style.transitionDuration.split(',').map(parseTimeToMs);
    const delays = style.transitionDelay.split(',').map(parseTimeToMs);

    const maxDuration = durations.length ? Math.max(...durations) : 3000;
    const maxDelay = delays.length ? Math.max(...delays) : 0;

    return maxDuration + maxDelay;
  }

  function rollAgain() {
    showResult.value = false;
    randomlySelectedWish.value = null;
    selectedIndex.value = -1;
    isPreparingSpin.value = true;

    if (caseItems.value) {
      caseItems.value.style.transform = 'translateX(0)';
    }

    createDisplayItems();

    setTimeout(() => {
      startSpinning();
    }, 300);
  }

  function closeRandomPicker() {
    randomPickerDialog.value = false;
    setTimeout(() => {
      showResult.value = false;
      isSpinning.value = false;
      randomlySelectedWish.value = null;
      selectedIndex.value = -1;
      displayItems.value = [];
      isPreparingSpin.value = false;

      if (caseItems.value) {
        caseItems.value.style.transform = 'translateX(0)';
      }
    }, 300);
  }

  return {
    randomPickerDialog,
    isSpinning,
    isPreparingSpin,
    showResult,
    randomlySelectedWish,
    selectedIndex,
    displayItems,
    caseItems,
    caseContainer,
    selectedWishDescription,
    openRandomPicker,
    startSpinning,
    rollAgain,
    closeRandomPicker
  };
}
