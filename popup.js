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

async function loadPlateStyles() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'getPlateStyles' }, response => {
      if (response && response.success) {
        resolve(response.styles);
      } else {
        reject(new Error(response?.error || 'Failed to load plate styles'));
      }
    });
  });
}

async function loadAiProviders() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'getAiProviders' }, response => {
      if (response && response.success) {
        resolve(response.providers);
      } else {
        reject(new Error(response?.error || 'Failed to load AI providers'));
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

function populatePlateStyles(styleInput, styles) {
  styleInput.innerHTML = '';
  for (const style of styles) {
    const opt = document.createElement('option');
    opt.value = style.id;
    opt.textContent = `${style.emoji || ''} ${style.name}`;
    styleInput.appendChild(opt);
  }
}

function populateAiProviders(providerInput, providers) {
  providerInput.innerHTML = '';
  for (const provider of providers) {
    const opt = document.createElement('option');
    opt.value = provider.id;
    opt.textContent = provider.name;
    providerInput.appendChild(opt);
  }
}

async function loadSettingsIntoUi(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, visualStyleInput, plateStyleInput) {
  const aiProviders = await loadAiProviders();
  populateAiProviders(aiProviderInput, aiProviders);

  const preferences = await loadDietaryPreferences();
  populateDietaryPreferences(dietaryPreferenceInput, preferences);

  const styles = await loadVisualStyles();
  populateVisualStyles(visualStyleInput, styles);

  const plateStyles = await loadPlateStyles();
  populatePlateStyles(plateStyleInput, plateStyles);

  const stored = await chrome.storage.local.get(['aiProvider', 'openaiApiKey', 'geminiApiKey', 'dietaryPreference', 'visualStyle', 'plateStyle']);

  // Set AI provider
  const selectedProvider = stored.aiProvider || 'openai';
  aiProviderInput.value = selectedProvider;

  // Set API keys
  if (stored.openaiApiKey) {
    openaiApiKeyInput.value = stored.openaiApiKey;
  }
  if (stored.geminiApiKey) {
    geminiApiKeyInput.value = stored.geminiApiKey;
  }

  const selectedPreference = stored.dietaryPreference || 'regular';
  if (selectedPreference) {
    dietaryPreferenceInput.value = selectedPreference;
  }
  const selectedStyle = stored.visualStyle || 'modern';
  if (selectedStyle) {
    visualStyleInput.value = selectedStyle;
  }
  const selectedPlateStyle = stored.plateStyle || 'verkada';
  if (selectedPlateStyle) {
    plateStyleInput.value = selectedPlateStyle;
  }

  // Show/hide appropriate API key section
  toggleApiKeySection(selectedProvider);
}

function toggleApiKeySection(provider) {
  const openaiSection = document.getElementById('openaiKeySection');
  const geminiSection = document.getElementById('geminiKeySection');

  if (provider === 'gemini') {
    openaiSection.style.display = 'none';
    geminiSection.style.display = 'block';
  } else {
    openaiSection.style.display = 'block';
    geminiSection.style.display = 'none';
  }
}

async function saveSettings(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, visualStyleInput, plateStyleInput, statusDiv) {
  const aiProvider = aiProviderInput.value.trim();
  const openaiApiKey = openaiApiKeyInput.value.trim();
  const geminiApiKey = geminiApiKeyInput.value.trim();
  const dietaryPreference = dietaryPreferenceInput.value.trim();
  const visualStyle = visualStyleInput.value.trim();
  const plateStyle = plateStyleInput.value.trim();

  // Validate that the selected provider has an API key
  if (aiProvider === 'openai' && !openaiApiKey) {
    showStatus(statusDiv, 'Please enter an OpenAI API key', 'error');
    return;
  }
  if (aiProvider === 'gemini' && !geminiApiKey) {
    showStatus(statusDiv, 'Please enter a Gemini API key', 'error');
    return;
  }

  try {
    await chrome.storage.local.set({
      aiProvider,
      openaiApiKey,
      geminiApiKey,
      dietaryPreference,
      visualStyle,
      plateStyle,
    });
    showStatus(statusDiv, 'Settings saved successfully!', 'success');
  } catch (error) {
    showStatus(statusDiv, 'Failed to save settings', 'error');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const aiProviderInput = document.getElementById('aiProvider');
  const openaiApiKeyInput = document.getElementById('openaiApiKey');
  const geminiApiKeyInput = document.getElementById('geminiApiKey');
  const dietaryPreferenceInput = document.getElementById('dietaryPreference');
  const visualStyleInput = document.getElementById('visualStyle');
  const plateStyleInput = document.getElementById('plateStyle');
  const menuLinkBtn = document.getElementById('menuLink');
  const statusDiv = document.getElementById('status');

  // Handle AI provider change
  aiProviderInput.addEventListener('change', async () => {
    toggleApiKeySection(aiProviderInput.value);
    await saveSettings(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, visualStyleInput, plateStyleInput, statusDiv);
  });

  // Auto-save on input change
  openaiApiKeyInput.addEventListener('input', async () => {
    await saveSettings(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, visualStyleInput, plateStyleInput, statusDiv);
  });

  geminiApiKeyInput.addEventListener('input', async () => {
    await saveSettings(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, visualStyleInput, plateStyleInput, statusDiv);
  });

  dietaryPreferenceInput.addEventListener('change', async () => {
    await saveSettings(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, visualStyleInput, plateStyleInput, statusDiv);
  });

  visualStyleInput.addEventListener('change', async () => {
    await saveSettings(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, visualStyleInput, plateStyleInput, statusDiv);
  });

  plateStyleInput.addEventListener('change', async () => {
    await saveSettings(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, visualStyleInput, plateStyleInput, statusDiv);
  });

  menuLinkBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://sites.google.com/verkada.com/verkada-menu' });
  });

  await loadSettingsIntoUi(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, visualStyleInput, plateStyleInput);
});