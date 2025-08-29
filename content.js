let isBulkProcessing = false;

const FOOD_EMOJIS = ['🍕', '🍔', '🌮', '🌯', '🥗', '🍣', '🍜', '🍝', '🍗', '🥪', '🥙', '🍤', '🥟', '🍩', '🍪', '🍿', '🧁', '🍦', '🍱', '🥞'];

function getRandomFoodEmoji() {
  const index = Math.floor(Math.random() * FOOD_EMOJIS.length);
  return FOOD_EMOJIS[index];
}

function positionButtonRelativeToImage(img, btn) {
  btn.style.top = (img.offsetTop + 8) + 'px';
  btn.style.right = (img.offsetLeft + 8) + 'px';
}

function createImageProcessButton(img) {
  if (!img || img.dataset.vkButtonAttached === 'true') return;

  const button = document.createElement('button');
  button.className = 'verkada-image-process-button';
  button.textContent = '✨' + getRandomFoodEmoji();
  button.style.cssText = `
    position: absolute;
    z-index: 1;
    background:rgb(130, 81, 170);
    color: white;
    border: none;
    padding: 8px;
    cursor: pointer;
    font-family: Arial, sans-serif;
    font-size: 16px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    border-radius: 4px;
  `;

  img.parentElement.style.position = 'relative';
  positionButtonRelativeToImage(img, button);
  img.parentElement.appendChild(button);

  const onClick = async (e) => {
    e.stopPropagation();
    await processSingleImage(img, button);
  };
  button.addEventListener('click', onClick);

  // Keep button positioned if image resizes
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => positionButtonRelativeToImage(img, button));
    resizeObserver.observe(img);
  }

  img.dataset.vkButtonAttached = 'true';
}

function createSpinner(img) {
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
  spinner.style.background = 'rgba(30, 30, 30, 0.35)';
  spinner.style.zIndex = '2';
  spinner.style.pointerEvents = 'none';

  spinner.innerHTML = `
    <div style="
      width: 48px;
      height: 48px;
      border: 5px solid #fff;
      border-top: 5px solid rgb(130, 81, 170);
      border-radius: 50%;
      animation: menu-spin 1s linear infinite;
      box-shadow: 0 0 8px rgb(130, 81, 170);
    "></div>
  `;

  img.parentElement.style.position = 'relative';
  img.parentElement.appendChild(spinner);

  img.style.transition = 'opacity 0.5s';
  img.style.opacity = '0.6';

  if (!document.getElementById('menu-image-spinner-keyframes')) {
    const style = document.createElement('style');
    style.id = 'menu-image-spinner-keyframes';
    style.textContent = `
      @keyframes menu-spin {
        0% { transform: rotate(0deg);}
        100% { transform: rotate(360deg);}
      }
    `;
    document.head.appendChild(style);
  }

  return spinner;
}

function removeSpinner(img) {
  const spinner = img.parentElement.querySelector('.menu-image-spinner-overlay');
  if (spinner) {
    spinner.remove();
  }
  
  img.style.transform = '';
  img.style.opacity = '1';
}

function findMenuImages() {
  const images = Array.from(document.querySelectorAll('img'));
  const menuImages = images.filter(img => {
    return img.src && img.src.includes('googleusercontent.com') && img.src.includes('=w1280');
  });
  
  return menuImages;
}

function addButtonsToMenuImages() {
  const menuImages = findMenuImages();
  menuImages.forEach(img => createImageProcessButton(img));
}

// Removed bulk processImages feature

async function processSingleImage(img, relatedButton) {
  if (!img) return;

  const btn = relatedButton || img.parentElement.querySelector('.verkada-image-process-button');
  const originalText = btn ? btn.textContent : null;
  const originalCursor = btn ? btn.style.cursor : null;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Verkadalizing...';
    btn.style.cursor = 'default';
  }

  createSpinner(img);

  try {
    const originalWidth = img.naturalWidth || img.width || img.clientWidth;
    const originalHeight = img.naturalHeight || img.height || img.clientHeight;

    const response = await chrome.runtime.sendMessage({
      action: 'processImage',
      imageUrl: img.src,
      originalWidth,
      originalHeight
    });

    if (response && response.success) {
      img.src = `data:image/png;base64,${response.b64}`;
    } else {
      console.error('Failed to process image:', response?.error);
    }
  } catch (error) {
    console.error('Error processing image:', error);
  } finally {
    removeSpinner(img);
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText;
      btn.style.cursor = originalCursor;
    }
  }
}

function init() {
  if (window.location.href.includes('sites.google.com/verkada.com/verkada-menu')) {
    // Add buttons to current images
    addButtonsToMenuImages();

    const refreshButtons = () => {
      // Throttle refresh slightly for DOM bursts
      if (refreshButtons._raf) cancelAnimationFrame(refreshButtons._raf);
      refreshButtons._raf = requestAnimationFrame(addButtonsToMenuImages);
    };

    // Observe DOM changes to attach buttons to newly added images
    const observer = new MutationObserver((_mutations) => {
      refreshButtons();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Removed listener for bulk processImages action

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}