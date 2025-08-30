const FOOD_EMOJIS = ['🍕', '🍔', '🌮', '🌯', '🥗', '🍣', '🍜', '🍝', '🍗', '🥪', '🥙', '🍤', '🥟', '🍩', '🍪', '🍿', '🧁', '🍦', '🍱', '🥞'];

function getRandomFoodEmoji() {
  const index = Math.floor(Math.random() * FOOD_EMOJIS.length);
  return FOOD_EMOJIS[index];
}

function findMenuImages() {
  const images = Array.from(document.querySelectorAll('img'));
  const menuImages = images.filter(img => {
    return img.src && img.src.includes('googleusercontent.com') && img.src.includes('=w1280');
  });
  
  return menuImages;
}

function createImageProcessButton(img) {
  if (!img || img.dataset.vkProcessButtonAttached === 'true') return;

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
  img.parentElement.appendChild(button);

  const onClick = async (e) => {
    e.stopPropagation();
    await processImage(img);
  };
  button.addEventListener('click', onClick);

  // Keep button positioned if image resizes
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      button.style.top = (img.offsetTop + 8) + 'px';
      button.style.right = (img.offsetLeft + 8) + 'px';
    });
    resizeObserver.observe(img);
  }

  if (window.MutationObserver) {
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.dataset.vkIsProcessing === 'true') {
          button.style.display = 'none';
        } else {
          button.style.display = 'block';
        }
      });
    });

    mutationObserver.observe(img, {
      attributes: true,
    });
  }

  img.dataset.vkProcessButtonAttached = 'true';
}

function createShowOriginalButton(img) {
  if (!img || img.dataset.vkShowOriginalButtonAttached === 'true') return;

  const button = document.createElement('button');
  button.className = 'verkada-image-show-original-button';
  button.textContent = 'Show original';
  button.style.cssText = `
    position: absolute;
    z-index: 1;
    background: white;
    color: rgb(130, 81, 170);
    border: 1px solid rgb(130, 81, 170);
    padding: 8px;
    cursor: pointer;
    font-family: Arial, sans-serif;
    font-size: 16px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    border-radius: 4px;
    display: none;
  `;

  img.parentElement.style.position = 'relative';
  img.parentElement.appendChild(button);

  const onClick = async (e) => {
    e.stopPropagation();
    if (img.src === img.dataset.vkGeneratedSrc) {
      img.src = img.dataset.vkOriginalSrc;
    } else {
      img.src = img.dataset.vkGeneratedSrc;
    }
  };
  button.addEventListener('click', onClick);

  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      button.style.top = (img.offsetTop + 8) + 'px';
      button.style.right = (img.offsetLeft + 64) + 'px';
    });
    resizeObserver.observe(img);
  }

  // let's show button only if image is verkadalized based on mutation observer
  if (window.MutationObserver) {
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.dataset.vkIsProcessing === 'true') {
          button.style.display = 'none';
          return;
        }
        
        if (mutation.target.dataset.vkGeneratedSrc) {
          button.style.display = 'block';
        } else {
          button.style.display = 'none';
        }

        button.textContent = img.src === img.dataset.vkGeneratedSrc ? 'Show original' : 'Hide original';
      });
    });

    mutationObserver.observe(img, {
      attributes: true,
    });
  }

  img.dataset.vkShowOriginalButtonAttached = 'true';
}


function addButtonsToMenuImages() {
  const menuImages = findMenuImages();
  menuImages.forEach(img => {
    createImageProcessButton(img);
    createShowOriginalButton(img);
  });
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

function removeSpinner(img) {
  const spinner = img.parentElement.querySelector('.menu-image-spinner-overlay');
  if (spinner) {
    spinner.remove();
  }
  
  img.style.transform = '';
  img.style.opacity = '1';
}

async function processImage(img) {
  if (!img) return;

  img.dataset.vkIsProcessing = 'true';
  createSpinner(img);

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'processImage',
      imageUrl: img.dataset.vkOriginalSrc || img.src,
    });

    if (response && response.success) {
      img.dataset.vkOriginalSrc = img.dataset.vkOriginalSrc || img.src;
      img.dataset.vkGeneratedSrc = `data:image/png;base64,${response.b64}`;
      img.src = `data:image/png;base64,${response.b64}`;
    } else {
      throw new Error(response?.error);
    }
  } catch (error) {
    console.error('Error processing image:', error);
  } finally {
    img.dataset.vkIsProcessing = 'false';
    removeSpinner(img);
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}