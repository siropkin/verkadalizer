function showStatus(statusDiv, message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 5000);
}

async function loadAvailableModels() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'getAvailableModels' }, response => {
      if (response && response.success) {
        resolve(response.models);
      } else {
        reject(new Error(response?.error || 'Failed to load models'));
      }
    });
  });
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

function populateModelOptions(modelInput, models) {
  modelInput.innerHTML = '';
  for (const model of models) {
    const opt = document.createElement('option');
    opt.value = model.id;
    opt.textContent = model.name;
    modelInput.appendChild(opt);
  }
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

async function loadSettingsIntoUi(apiKeyInput, modelInput, foodPreferenceInput) {
  const models = await loadAvailableModels();
  populateModelOptions(modelInput, models);

  const preferences = await loadFoodPreferences();
  populateFoodPreferences(foodPreferenceInput, preferences);

  const stored = await chrome.storage.local.get(['model', 'apiKey', 'foodPreference']);
  const selectedModel = stored.model || models[0]?.id;
  if (selectedModel) {
    modelInput.value = selectedModel;
  }
  if (stored.apiKey) {
    apiKeyInput.value = stored.apiKey;
  }
  const selectedPreference = stored.foodPreference || 'regular';
  if (selectedPreference) {
    foodPreferenceInput.value = selectedPreference;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const modelInput = document.getElementById('model');
  const apiKeyInput = document.getElementById('apiKey');
  const foodPreferenceInput = document.getElementById('foodPreference');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const statusDiv = document.getElementById('status');

  saveSettingsBtn.addEventListener('click', async () => {
    const model = modelInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const foodPreference = foodPreferenceInput.value.trim();
    try {
      await chrome.storage.local.set({
        model,
        apiKey,
        foodPreference,
      });
      showStatus(statusDiv, 'Settings saved successfully!', 'success');
    } catch (error) {
      showStatus(statusDiv, 'Failed to save settings', 'error');
    }
  });

  await loadSettingsIntoUi(apiKeyInput, modelInput, foodPreferenceInput);
});