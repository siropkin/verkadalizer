function showStatus(statusDiv, message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 5000);
}

async function loadDietaryPreferences() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'getDietaryPreferences' }, response => {
      if (response && response.success) {
        resolve(response.preferences);
      } else {
        reject(new Error(response?.error || 'Failed to load food preferences'));
      }
    });
  });
}

async function loadVisualStyles() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'getVisualStyles' }, response => {
      if (response && response.success) {
        resolve(response.styles);
      } else {
        reject(new Error(response?.error || 'Failed to load visual styles'));
      }
    });
  });
}

function populateDietaryPreferences(preferenceInput, preferences) {
  preferenceInput.innerHTML = '';
  for (const pref of preferences) {
    const opt = document.createElement('option');
    opt.value = pref.id;
    opt.textContent = `${pref.emoji || ''} ${pref.name}`;
    preferenceInput.appendChild(opt);
  }
}

function populateVisualStyles(styleInput, styles) {
  styleInput.innerHTML = '';
  for (const style of styles) {
    const opt = document.createElement('option');
    opt.value = style.id;
    opt.textContent = `${style.emoji || ''} ${style.name}`;
    styleInput.appendChild(opt);
  }
}

async function loadSettingsIntoUi(apiKeyInput, dietaryPreferenceInput, visualStyleInput) {
  const preferences = await loadDietaryPreferences();
  populateDietaryPreferences(dietaryPreferenceInput, preferences);

  const styles = await loadVisualStyles();
  populateVisualStyles(visualStyleInput, styles);

  const stored = await chrome.storage.local.get(['apiKey', 'dietaryPreference', 'visualStyle']);
  if (stored.apiKey) {
    apiKeyInput.value = stored.apiKey;
  }
  const selectedPreference = stored.dietaryPreference || 'regular';
  if (selectedPreference) {
    dietaryPreferenceInput.value = selectedPreference;
  }
  const selectedStyle = stored.visualStyle || 'modern';
  if (selectedStyle) {
    visualStyleInput.value = selectedStyle;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const dietaryPreferenceInput = document.getElementById('dietaryPreference');
  const visualStyleInput = document.getElementById('visualStyle');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const menuLinkBtn = document.getElementById('menuLink');
  const statusDiv = document.getElementById('status');

  saveSettingsBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const dietaryPreference = dietaryPreferenceInput.value.trim();
    const visualStyle = visualStyleInput.value.trim();

    if (!apiKey) {
      showStatus(statusDiv, 'Please enter an API key', 'error');
      return;
    }

    try {
      await chrome.storage.local.set({
        apiKey,
        dietaryPreference,
        visualStyle,
      });
      showStatus(statusDiv, 'Settings saved successfully!', 'success');
    } catch (error) {
      showStatus(statusDiv, 'Failed to save settings', 'error');
    }
  });

  menuLinkBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://sites.google.com/verkada.com/verkada-menu' });
  });

  await loadSettingsIntoUi(apiKeyInput, dietaryPreferenceInput, visualStyleInput);
});