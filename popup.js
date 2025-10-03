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

function populateModelOptions(modelInput, models) {
  modelInput.innerHTML = '';
  for (const model of models) {
    const opt = document.createElement('option');
    opt.value = model.id;
    opt.textContent = model.name;
    modelInput.appendChild(opt);
  }
}

async function loadSettingsIntoUi(apiKeyInput, modelInput) {
  const models = await loadAvailableModels();
  populateModelOptions(modelInput, models);

  const stored = await chrome.storage.local.get(['model', 'apiKey']);
  const selectedModel = stored.model || models[0]?.id;
  if (selectedModel) {
    modelInput.value = selectedModel;
  }
  if (stored.apiKey) {
    apiKeyInput.value = stored.apiKey;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const modelInput = document.getElementById('model');
  const apiKeyInput = document.getElementById('apiKey');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const statusDiv = document.getElementById('status');

  saveSettingsBtn.addEventListener('click', async () => {
    const model = modelInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    try {
      await chrome.storage.local.set({
        model,
        apiKey,
      });
      showStatus(statusDiv, 'Settings saved successfully!', 'success');
    } catch (error) {
      showStatus(statusDiv, 'Failed to save settings', 'error');
    }
  });

  await loadSettingsIntoUi(apiKeyInput, modelInput);
});