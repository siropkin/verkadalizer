// ============================================================================
// VERKADALIZER CONTENT SCRIPT
// ============================================================================
// Consolidated content script for the Verkadalizer Chrome extension.
// Handles menu image detection, UI controls, and AI image processing.

// ============================================================================
// PROGRESS STEPS & UI MAPPING
// ============================================================================

const PROGRESS_STEPS = {
  STARTING: 'STARTING',
  PARSING_MENU_START: 'PARSING_MENU_START',
  FETCHING_MENU_IMAGE: 'FETCHING_MENU_IMAGE',
  PREPARING_AI_ANALYSIS: 'PREPARING_AI_ANALYSIS',
  READING_MENU_WITH_AI: 'READING_MENU_WITH_AI',
  PROCESSING_AI_RESPONSE: 'PROCESSING_AI_RESPONSE',
  EXTRACTING_DISHES: 'EXTRACTING_DISHES',
  MENU_ANALYZED: 'MENU_ANALYZED',
  BUILDING_PROMPT: 'BUILDING_PROMPT',
  PREPARING_IMAGE_GENERATION: 'PREPARING_IMAGE_GENERATION',
  GENERATING_IMAGE: 'GENERATING_IMAGE',
  FINALIZING_IMAGE: 'FINALIZING_IMAGE',
  IMAGE_GENERATED: 'IMAGE_GENERATED',
  MERGING_IMAGES: 'MERGING_IMAGES',
  COMPLETE: 'COMPLETE',
};

const FOOD_FACTS = [
  'Honey never spoils - archaeologists found 3000-year-old honey in Egyptian tombs that was still edible! 🍯',
  'Carrots were originally purple - orange carrots were developed in the Netherlands in the 17th century 🥕',
  'Apples float because they are 25% air 🍎',
  'Pistachios can spontaneously combust when stored in large quantities 🔥',
  'Chocolate was once used as currency by the Aztecs 🍫',
  'Peanuts aren\'t actually nuts - they\'re legumes! 🥜',
  'A strawberry is not a berry, but a banana is 🍓🍌',
  'Tomatoes have more genes than humans 🍅',
  'White chocolate isn\'t actually chocolate 🤍',
  'Avocados are berries, but strawberries aren\'t 🥑',
  'The most expensive pizza in the world costs $12,000 💰',
  'Ranch dressing is most popular in the United States but virtually unknown elsewhere 🇺🇸',
  'Nutmeg is a hallucinogen in large quantities ⚠️',
  'Ketchup was sold as medicine in the 1830s 💊',
  'The popsicle was invented by an 11-year-old 🧊',
];

function getRandomFoodFact() {
  return FOOD_FACTS[Math.floor(Math.random() * FOOD_FACTS.length)];
}

const STEP_CONFIG = {
  [PROGRESS_STEPS.STARTING]: {
    progress: 5,
    statusText: 'Starting menu analysis...',
    detailText: () => getRandomFoodFact(),
  },
  [PROGRESS_STEPS.PARSING_MENU_START]: {
    progress: 5,
    statusText: 'Analyzing menu...',
    detailText: () => getRandomFoodFact(),
  },
  [PROGRESS_STEPS.FETCHING_MENU_IMAGE]: {
    progress: 10,
    statusText: 'Loading menu image...',
    detailText: 'Fetching high-resolution image',
  },
  [PROGRESS_STEPS.PREPARING_AI_ANALYSIS]: {
    progress: 15,
    statusText: 'Preparing AI analysis...',
    detailText: (extra) => `Analyzing for ${extra?.preferenceName || 'dietary'} preferences`,
  },
  [PROGRESS_STEPS.READING_MENU_WITH_AI]: {
    progress: 20,
    statusText: 'Reading menu with AI...',
    timeEstimate: '20-30 seconds',
    detailText: () => getRandomFoodFact(),
  },
  [PROGRESS_STEPS.PROCESSING_AI_RESPONSE]: {
    progress: 40,
    statusText: 'Processing AI response...',
    detailText: () => getRandomFoodFact(),
  },
  [PROGRESS_STEPS.EXTRACTING_DISHES]: {
    progress: 45,
    statusText: 'Extracting dishes...',
    detailText: 'Identifying the best menu items',
  },
  [PROGRESS_STEPS.MENU_ANALYZED]: {
    progress: 50,
    statusText: 'Menu analyzed!',
    detailText: (extra) => {
      if (extra?.selectedDishes) {
        const maxDisplayItems = 3;
        const dishes = extra.selectedDishes.slice(0, maxDisplayItems);
        const remaining = extra.selectedDishes.length - maxDisplayItems;
        return remaining > 0
          ? `Selected: ${dishes.join(', ')}, and ${remaining} more`
          : `Selected: ${dishes.join(', ')}`;
      }
      return 'Dishes selected successfully';
    },
  },
  [PROGRESS_STEPS.BUILDING_PROMPT]: {
    progress: 52,
    statusText: 'Building visualization prompt...',
    detailText: 'Creating detailed food photography instructions',
  },
  [PROGRESS_STEPS.PREPARING_IMAGE_GENERATION]: {
    progress: 55,
    statusText: 'Preparing for image generation...',
    detailText: () => getRandomFoodFact(),
  },
  [PROGRESS_STEPS.GENERATING_IMAGE]: {
    progress: 60,
    statusText: 'Generating food visualization...',
    timeEstimate: '60-90 seconds',
    detailText: () => getRandomFoodFact(),
  },
  [PROGRESS_STEPS.FINALIZING_IMAGE]: {
    progress: 85,
    statusText: 'Finalizing image...',
    detailText: 'Processing AI-generated visualization',
  },
  [PROGRESS_STEPS.IMAGE_GENERATED]: {
    progress: 88,
    statusText: 'Image generated!',
    detailText: 'Preparing to merge with menu text',
  },
  [PROGRESS_STEPS.MERGING_IMAGES]: {
    progress: 90,
    statusText: 'Merging images...',
    detailText: 'Creating final visualization',
  },
  [PROGRESS_STEPS.COMPLETE]: {
    progress: 100,
    statusText: 'Complete!',
    detailText: 'Your menu is ready',
  },
};

// Cache for generated detail text per step (so food facts don't change on every poll)
const stepDetailCache = {};

function stepToProgressData(step, extra = {}) {
  const config = STEP_CONFIG[step];

  if (!config) {
    console.warn(`Unknown progress step: ${step}`);
    return {
      progress: 0,
      statusText: 'Processing...',
      detailText: '',
    };
  }

  // Generate detail text only once per step (cache it)
  let detailText;
  if (typeof config.detailText === 'function') {
    // Create a cache key that includes extra data for dynamic messages
    const cacheKey = step + JSON.stringify(extra);
    if (!stepDetailCache[cacheKey]) {
      stepDetailCache[cacheKey] = config.detailText(extra);
    }
    detailText = stepDetailCache[cacheKey];
  } else {
    detailText = config.detailText;
  }

  // Combine status text with time estimate if present
  let statusText = config.statusText;
  if (config.timeEstimate) {
    statusText = `${config.statusText} (${config.timeEstimate})`;
  }

  return {
    progress: config.progress,
    statusText: statusText,
    detailText: detailText,
  };
}

// ============================================================================
// PAGE DETECTION
// ============================================================================

function isVerkadaMenuPage() {
  return window.location.href.includes('sites.google.com/verkada.com/verkada-menu');
}

function isMenuImage(img) {
  return !!(img && img.src && img.src.includes('googleusercontent.com') && img.src.includes('=w1280'));
}

function queryMenuImages() {
  const images = Array.from(document.querySelectorAll('img'));
  return images.filter(isMenuImage);
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

const FOOD_EMOJIS = ['🍕', '🍔', '🌮', '🌯', '🥗', '🍣', '🍜', '🍝', '🍗', '🥪', '🥙', '🍤', '🥟', '🍩', '🍪', '🍿', '🧁', '🍦', '🍱', '🥞'];

function getRandomFoodEmoji() {
  const index = Math.floor(Math.random() * FOOD_EMOJIS.length);
  return FOOD_EMOJIS[index];
}

function ensureControllerAttached(img) {
  if (!img || !img.parentElement) {
    return null;
  }

  if (img.dataset.vkControllerAttached === 'true') {
    return img.parentElement.querySelector('.vk-controller');
  }

  const container = document.createElement('div');
  container.className = 'vk-controller';
  container.style.cssText = `
    position: absolute;
    z-index: 3;
    display: flex;
    gap: 8px;
    align-items: center;
    background: transparent;
    border: none;
    padding: 0;
    top: 8px;
    right: 8px;
  `;

  img.parentElement.style.position = 'relative';
  img.parentElement.appendChild(container);

  img.dataset.vkControllerAttached = 'true';
  return container;
}

function createButton({ className, text, variant = 'primary' }) {
  const btn = document.createElement('button');
  btn.className = className;
  btn.textContent = text;
  const base = `
    border: none;
    padding: 0 8px;
    cursor: pointer;
    font-family: Arial, sans-serif;
    font-size: 16px;
    border-radius: 4px;
    white-space: nowrap;
    height: 36px;
  `;
  const primary = `background: rgb(130, 81, 170); color: white; border: 1px solid rgb(130, 81, 170);`;
  const secondary = `background: white; color: rgb(130, 81, 170); border: 1px solid rgb(130, 81, 170);`;
  btn.style.cssText = base + (variant === 'primary' ? primary : secondary);
  return btn;
}

function renderController(img) {
  const container = ensureControllerAttached(img);
  if (!container) {
    return;
  }

  // Lazily create buttons once; then just toggle/retarget handlers and visibility
  let generateBtn = container.querySelector('.vk-btn-generate');
  if (!generateBtn) {
    // Pick and store a stable emoji per image on first render
    if (!img.dataset.vkEmoji) {
      img.dataset.vkEmoji = getRandomFoodEmoji();
    }
    generateBtn = createButton({ className: 'vk-btn-generate', text: '✨' + img.dataset.vkEmoji, variant: 'primary' });
    container.appendChild(generateBtn);
    generateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startImageProcessing(img);
    });
  }

  let stopBtn = container.querySelector('.vk-btn-stop');
  if (!stopBtn) {
    stopBtn = createButton({ className: 'vk-btn-stop', text: '🟥', variant: 'primary' });
    container.appendChild(stopBtn);
    stopBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      cancelImageProcessing(img);
    });
  }

  let showOriginalBtn = container.querySelector('.vk-btn-show-original');
  if (!showOriginalBtn) {
    showOriginalBtn = createButton({ className: 'vk-btn-show-original', text: 'Show original', variant: 'secondary' });
    container.insertBefore(showOriginalBtn, container.firstChild);
    showOriginalBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (img.dataset.vkOriginalSrc) {
        img.src = img.dataset.vkOriginalSrc;
        img.dataset.vkView = 'original';
        renderController(img);
      }
    });
  }

  let showGeneratedBtn = container.querySelector('.vk-btn-show-generated');
  if (!showGeneratedBtn) {
    showGeneratedBtn = createButton({ className: 'vk-btn-show-generated', text: 'Show generated', variant: 'secondary' });
    // place to the right of showOriginal but left of generate/stop
    if (showOriginalBtn && showOriginalBtn.nextSibling) {
      container.insertBefore(showGeneratedBtn, showOriginalBtn.nextSibling);
    } else {
      container.appendChild(showGeneratedBtn);
    }
    showGeneratedBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (img.dataset.vkGeneratedSrc) {
        img.src = img.dataset.vkGeneratedSrc;
        img.dataset.vkView = 'generated';
        renderController(img);
      }
    });
  }

  const hasGenerated = !!img.dataset.vkGeneratedSrc;
  const isProcessing = img.dataset.vkIsProcessing === 'true';
  const currentView = img.dataset.vkView || (hasGenerated && img.src === img.dataset.vkGeneratedSrc ? 'generated' : 'original');

  // Toggle visibility based on state
  generateBtn.style.display = isProcessing ? 'none' : 'inline-block';
  stopBtn.style.display = isProcessing ? 'inline-block' : 'none';
  showOriginalBtn.style.display = (!isProcessing && hasGenerated && currentView !== 'original') ? 'inline-block' : 'none';
  showGeneratedBtn.style.display = (!isProcessing && hasGenerated && currentView !== 'generated') ? 'inline-block' : 'none';
  showOriginalBtn.disabled = false;
  showGeneratedBtn.disabled = false;

  // Ensure rightmost action is generate/stop
  if (!isProcessing) {
    container.appendChild(generateBtn);
  } else {
    container.appendChild(stopBtn);
  }
}

function attachController(img) {
  if (!img) {
    return;
  }

  renderController(img);
  if (img.dataset.vkControllerObserverAttached === 'true') {
    return;
  }

  // Re-render controller whenever relevant attributes change
  if (window.MutationObserver) {
    const observer = new MutationObserver((mutations) => {
      // Guard: ignore attribute changes that belong to the controller itself
      const target = mutations[0]?.target;
      if (target && target.classList && target.classList.contains('vk-controller')) return;
      renderController(img);
    });
    observer.observe(img, { attributes: true, attributeFilter: ['src', 'data-vk-is-processing', 'data-vk-generated-src', 'data-vk-view'] });
  }
  img.dataset.vkControllerObserverAttached = 'true';
}

// ============================================================================
// SPINNER OVERLAY
// ============================================================================

function createSpinnerOverlay(img) {
  const spinner = document.createElement('div');
  spinner.className = 'menu-image-spinner-overlay';
  spinner.style.position = 'absolute';
  spinner.style.top = img.offsetTop + 'px';
  spinner.style.left = img.offsetLeft + 'px';
  spinner.style.width = img.offsetWidth + 'px';
  spinner.style.height = img.offsetHeight + 'px';
  spinner.style.display = 'flex';
  spinner.style.flexDirection = 'column';
  spinner.style.alignItems = 'center';
  spinner.style.justifyContent = 'center';
  spinner.style.background = 'rgba(30, 30, 30, 0.85)';
  spinner.style.zIndex = '2';
  spinner.style.pointerEvents = 'none';
  spinner.style.padding = '20px';
  spinner.style.boxSizing = 'border-box';

  spinner.innerHTML = `
    <div style="
      font-family: Arial, sans-serif;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 12px;
      animation: verkada-color-change 2s ease-in-out infinite;
    ">Verkadalizing...</div>
    <div class="vk-progress-container" style="
      width: 100%;
      max-width: 400px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      height: 8px;
      margin-bottom: 12px;
      overflow: hidden;
    ">
      <div class="vk-progress-bar" style="
        height: 100%;
        background: linear-gradient(90deg, rgb(130, 81, 170), rgb(255, 107, 107), rgb(255, 193, 7));
        width: 0%;
        transition: width 0.3s ease;
        border-radius: 10px;
      "></div>
    </div>
    <div class="vk-status-text" style="
      font-family: Arial, sans-serif;
      font-size: 14px;
      color: white;
      text-align: center;
      margin-bottom: 8px;
      min-height: 20px;
    ">Initializing...</div>
    <div class="vk-detail-text" style="
      font-family: Arial, sans-serif;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.85);
      text-align: center;
      min-height: 18px;
      max-width: 450px;
      line-height: 1.4;
      padding: 4px 8px;
    "></div>
  `;

  img.parentElement.style.position = 'relative';
  img.parentElement.appendChild(spinner);

  // Keep overlay aligned to image on resize
  const reposition = () => {
    spinner.style.top = img.offsetTop + 'px';
    spinner.style.left = img.offsetLeft + 'px';
    spinner.style.width = img.offsetWidth + 'px';
    spinner.style.height = img.offsetHeight + 'px';
  };
  reposition();
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(reposition);
    ro.observe(img);
  }

  if (!document.getElementById('menu-image-spinner-keyframes')) {
    const style = document.createElement('style');
    style.id = 'menu-image-spinner-keyframes';
    style.textContent = `
      @keyframes verkada-color-change {
        0% { color: rgb(130, 81, 170); }
        20% { color: rgb(255, 107, 107); }
        40% { color: rgb(255, 193, 7); }
        60% { color: rgb(40, 167, 69); }
        80% { color: rgb(23, 162, 184); }
        100% { color: rgb(130, 81, 170); }
      }
    `;
    document.head.appendChild(style);
  }

  return spinner;
}

function updateSpinnerProgress(img, step, extra = {}) {
  const spinner = img.parentElement.querySelector('.menu-image-spinner-overlay');
  if (!spinner) return;

  // Convert step to UI-ready progress data
  const progressData = stepToProgressData(step, extra);

  const progressBar = spinner.querySelector('.vk-progress-bar');
  const statusElement = spinner.querySelector('.vk-status-text');
  const detailElement = spinner.querySelector('.vk-detail-text');

  if (progressBar) {
    progressBar.style.width = `${Math.min(100, Math.max(0, progressData.progress))}%`;
  }
  if (statusElement) {
    statusElement.textContent = progressData.statusText;
  }
  if (detailElement) {
    detailElement.textContent = progressData.detailText;
  }
}

function removeSpinnerOverlay(img) {
  const spinner = img.parentElement.querySelector('.menu-image-spinner-overlay');
  if (spinner) {
    spinner.remove();
  }

  img.style.transform = '';
  img.style.opacity = '1';
}

// ============================================================================
// STORAGE & REQUEST MANAGEMENT
// ============================================================================

const ACTIONS = {
  GENERATE_REQUEST_ID: 'generateRequestId',
  SAVE_GENERATED_IMAGE: 'saveGeneratedImage',
  LOAD_SAVED_IMAGE: 'loadSavedImage',
  CLEANUP_OLD_IMAGES: 'cleanupOldImages',
  PROCESS_IMAGE: 'processImage',
  CANCEL_REQUEST: 'cancelRequest',
  GET_PROGRESS: 'getProgress',
};

async function generateRequestId(img) {
  const imageUrl = img.dataset.vkOriginalSrc || img.src;
  const response = await chrome.runtime.sendMessage({
    action: ACTIONS.GENERATE_REQUEST_ID,
    imageUrl
  });

  if (response.success) {
    return response.requestId;
  } else {
    throw new Error(response.error);
  }
}

async function saveGeneratedImage(requestId, generatedSrc) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: ACTIONS.SAVE_GENERATED_IMAGE,
      requestId,
      generatedSrc
    });
    if (!response.success) {
      throw new Error(response.error);
    }
  } catch (error) {
    console.warn('Failed to save generated image:', error);
  }
}

async function cleanupOldSavedImages() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: ACTIONS.CLEANUP_OLD_IMAGES
    });
    if (!response.success) {
      throw new Error(response.error);
    }
  } catch (error) {
    console.warn('Failed to cleanup old saved images:', error);
  }
}

async function loadSavedImage(requestId) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: ACTIONS.LOAD_SAVED_IMAGE,
      requestId
    });
    if (response.success) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.warn('Failed to load saved image:', error);
    return null;
  }
}

async function restoreSavedImage(img) {
  const requestId = await generateRequestId(img);
  const savedImage = await loadSavedImage(requestId);

  if (savedImage && savedImage.generatedSrc) {
    img.dataset.vkGeneratedSrc = savedImage.generatedSrc;
    img.dataset.vkOriginalSrc = img.dataset.vkOriginalSrc || img.src;

    // Show generated image by default when restored
    img.src = savedImage.generatedSrc;
    img.dataset.vkView = 'generated';

    renderController(img);
  }
}

// ============================================================================
// IMAGE PROCESSING
// ============================================================================

async function startImageProcessing(img) {
  if (!img) return;

  // Set initial state
  img.dataset.vkIsProcessing = 'true';
  img.dataset.vkRequestId = await generateRequestId(img);
  img.dataset.vkOriginalSrc = img.dataset.vkOriginalSrc || img.src;
  createSpinnerOverlay(img);
  renderController(img);

  // Start progress polling
  const progressInterval = setInterval(async () => {
    if (img.dataset.vkIsProcessing !== 'true') {
      clearInterval(progressInterval);
      return;
    }

    try {
      const progressResponse = await chrome.runtime.sendMessage({
        action: ACTIONS.GET_PROGRESS,
        requestId: img.dataset.vkRequestId,
      });

      if (progressResponse && progressResponse.success) {
        // Progress response now contains { step, extra }
        updateSpinnerProgress(
          img,
          progressResponse.step,
          progressResponse.extra || {}
        );
      }
    } catch (error) {
      console.warn('Failed to get progress:', error);
    }
  }, 500); // Poll every 500ms for smooth updates

  try {
    const aiResponse = await chrome.runtime.sendMessage({
      action: ACTIONS.PROCESS_IMAGE,
      imageUrl: img.dataset.vkOriginalSrc,
      requestId: img.dataset.vkRequestId,
    });

    if (aiResponse && aiResponse.success) {
      // Image is already merged (post-processing happens in the provider)
      const imageData = `data:image/png;base64,${aiResponse.b64}`;

      updateSpinnerProgress(img, PROGRESS_STEPS.COMPLETE);
      img.dataset.vkGeneratedSrc = imageData;
      img.src = imageData;
      img.dataset.vkView = 'generated';
      await saveGeneratedImage(img.dataset.vkRequestId, imageData);
    } else {
      if (!aiResponse?.canceled) {
        throw new Error(aiResponse?.error || 'Unknown error');
      }
    }
  } catch (error) {
    console.error('Error processing image:', error);
    // For errors, just show raw error message (not a step)
    const spinner = img.parentElement.querySelector('.menu-image-spinner-overlay');
    if (spinner) {
      const progressBar = spinner.querySelector('.vk-progress-bar');
      const statusElement = spinner.querySelector('.vk-status-text');
      const detailElement = spinner.querySelector('.vk-detail-text');
      if (progressBar) progressBar.style.width = '0%';
      if (statusElement) statusElement.textContent = 'Error occurred';
      if (detailElement) detailElement.textContent = error.message || 'Unknown error';
    }
  } finally {
    clearInterval(progressInterval);
    img.dataset.vkIsProcessing = 'false';
    delete img.dataset.vkRequestId;
    setTimeout(() => removeSpinnerOverlay(img), 800); // Show completion for a moment
    renderController(img);
  }
}

async function cancelImageProcessing(img) {
  if (!img) return;
  const requestId = img.dataset.vkRequestId;
  try {
    if (requestId) {
      await chrome.runtime.sendMessage({ action: ACTIONS.CANCEL_REQUEST, requestId });
    }
  } catch (_) {}
  img.dataset.vkIsProcessing = 'false';
  delete img.dataset.vkRequestId;
  removeSpinnerOverlay(img);
  renderController(img);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

async function init() {
  if (!isVerkadaMenuPage()) {
    return;
  }

  // Clean up old saved images (older than 7 days)
  await cleanupOldSavedImages();

  // Restore saved images first
  const restoreSavedImages = async () => {
    const menuImages = queryMenuImages();
    await Promise.all(menuImages.map((img) => restoreSavedImage(img)));
  };

  // Attach controller to existing images
  const attachControllers = () => {
    const menuImages = queryMenuImages();
    menuImages.forEach((img) => attachController(img));
  };

  await restoreSavedImages();
  attachControllers();

  const refreshButtons = () => {
    // Throttle refresh slightly for DOM bursts
    if (refreshButtons._raf) cancelAnimationFrame(refreshButtons._raf);
    refreshButtons._raf = requestAnimationFrame(async () => {
      await restoreSavedImages();
      attachControllers();
    });
  };

  // Observe DOM changes to attach buttons to newly added images
  const observer = new MutationObserver((mutations) => {
    // Ignore mutations caused by our own controller/spinner DOM
    let shouldRefresh = false;
    for (const mutation of mutations) {
      if (mutation.type !== 'childList') continue;
      const changedNodes = [
        ...Array.from(mutation.addedNodes || []),
        ...Array.from(mutation.removedNodes || []),
      ];
      const affectsExternalNodes = changedNodes.some((node) => {
        if (!(node && node.nodeType === 1)) return false;
        const el = /** @type {Element} */ (node);
        const isController = el.classList && (el.classList.contains('vk-controller') || el.classList.contains('menu-image-spinner-overlay'));
        const insideController = typeof el.closest === 'function' && (el.closest('.vk-controller') || el.closest('.menu-image-spinner-overlay'));
        return !(isController || insideController);
      });
      if (affectsExternalNodes) {
        shouldRefresh = true;
        break;
      }
    }
    if (shouldRefresh) refreshButtons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
