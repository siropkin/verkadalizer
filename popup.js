function showStatus(statusDiv, message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 5000);
}

async function loadFoodPreferences() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'getFoodPreferences' }, response => {
      if (response && response.success) {
        resolve(response.preferences);
      } else {
        reject(new Error(response?.error || 'Failed to load food preferences'));
      }
    });
  });
}

function populateFoodPreferences(preferenceInput, preferences) {
  preferenceInput.innerHTML = '';
  for (const pref of preferences) {
    const opt = document.createElement('option');
    opt.value = pref.id;
    opt.textContent = pref.name;
    preferenceInput.appendChild(opt);
  }
}

async function loadSettingsIntoUi(apiKeyInput, foodPreferenceInput) {
  const preferences = await loadFoodPreferences();
  populateFoodPreferences(foodPreferenceInput, preferences);

  const stored = await chrome.storage.local.get(['apiKey', 'foodPreference']);
  if (stored.apiKey) {
    apiKeyInput.value = stored.apiKey;
  }
  const selectedPreference = stored.foodPreference || 'regular';
  if (selectedPreference) {
    foodPreferenceInput.value = selectedPreference;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const foodPreferenceInput = document.getElementById('foodPreference');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const menuLinkBtn = document.getElementById('menuLink');
  const statusDiv = document.getElementById('status');

  saveSettingsBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const foodPreference = foodPreferenceInput.value.trim();

    if (!apiKey) {
      showStatus(statusDiv, 'Please enter an API key', 'error');
      return;
    }

    try {
      await chrome.storage.local.set({
        apiKey,
        foodPreference,
      });
      showStatus(statusDiv, 'Settings saved successfully!', 'success');
    } catch (error) {
      showStatus(statusDiv, 'Failed to save settings', 'error');
    }
  });

  menuLinkBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://sites.google.com/verkada.com/verkada-menu' });
  });

  await loadSettingsIntoUi(apiKeyInput, foodPreferenceInput);
});