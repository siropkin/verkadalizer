const FOOD_EMOJIS = ['🍕', '🍔', '🌮', '🌯', '🥗', '🍣', '🍜', '🍝', '🍗', '🥪', '🥙', '🍤', '🥟', '🍩', '🍪', '🍿', '🧁', '🍦', '🍱', '🥞'];

function getRandomFoodEmoji() {
  const index = Math.floor(Math.random() * FOOD_EMOJIS.length);
  return FOOD_EMOJIS[index];
}

const ACTIONS = {
  PROCESS_IMAGE: 'processImage',
  CANCEL_REQUEST: 'cancelRequest',
};

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
  // Ensure left-to-right ordering: [showOriginal] [showGenerated] [generate OR stop]
  // We will create or move elements to preserve this order.
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

function createSpinnerOverlay(img) {
  const spinner = document.createElement('div');
  spinner.className = 'menu-image-spinner-overlay';
  spinner.style.position = 'absolute';
  spinner.style.top = img.offsetTop + 'px';
  spinner.style.left = img.offsetLeft + 'px';
  spinner.style.width = img.offsetWidth + 'px';
  spinner.style.height = img.offsetHeight + 'px';
  spinner.style.display = 'flex';
  spinner.style.alignItems = 'center';
  spinner.style.justifyContent = 'center';
  spinner.style.background = 'rgba(30, 30, 30, 0.75)';
  spinner.style.zIndex = '2';
  spinner.style.pointerEvents = 'none';

  spinner.innerHTML = `
    <div style="
      font-family: Arial, sans-serif;
      font-size: 16px;
      animation: verkada-color-change 2s ease-in-out infinite;
    ">Verkadalizing...</div>
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

function removeSpinnerOverlay(img) {
  const spinner = img.parentElement.querySelector('.menu-image-spinner-overlay');
  if (spinner) {
    spinner.remove();
  }
  
  img.style.transform = '';
  img.style.opacity = '1';
}

async function generateRequestId(img) {
  const imageUrl = img.dataset.vkOriginalSrc || img.src;
  const response = await chrome.runtime.sendMessage({
    action: 'generateRequestId',
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
      action: 'saveGeneratedImage',
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
      action: 'cleanupOldImages'
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
      action: 'loadSavedImage',
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

async function startImageProcessing(img) {
  if (!img) return;

  // Set initial state
  img.dataset.vkIsProcessing = 'true';
  img.dataset.vkRequestId = await generateRequestId(img);
  img.dataset.vkOriginalSrc = img.dataset.vkOriginalSrc || img.src;
  createSpinnerOverlay(img);
  renderController(img);

  try {
    const response = await chrome.runtime.sendMessage({
      action: ACTIONS.PROCESS_IMAGE,
      imageUrl: img.dataset.vkOriginalSrc,
      requestId: img.dataset.vkRequestId,
    });

    if (response && response.success) {
      const generated = `data:image/png;base64,${response.b64}`;
      img.dataset.vkGeneratedSrc = generated;
      img.src = generated;
      img.dataset.vkView = 'generated';

      await saveGeneratedImage(img.dataset.vkRequestId, generated);
    } else {
      if (!response?.canceled) {
        throw new Error(response?.error || 'Unknown error');
      }
    }
  } catch (error) {
    console.error('Error processing image:', error);
  } finally {
    img.dataset.vkIsProcessing = 'false';
    delete img.dataset.vkRequestId;
    removeSpinnerOverlay(img);
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