import { ACTIONS } from './lib/messages/actions.js';
import { STORAGE_KEYS, LEGACY_KEYS } from './lib/storage-keys.js';
import { normalizeImageStyleId } from './ai/prompts.js';

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
    chrome.runtime.sendMessage({ action: ACTIONS.GET_DIETARY_PREFERENCES }, response => {
      if (response && response.success) {
        resolve(response.preferences);
      } else {
        reject(new Error(response?.error || 'Failed to load food preferences'));
      }
    });
  });
}

async function loadImageStyles() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: ACTIONS.GET_IMAGE_STYLES }, response => {
      if (response && response.success) {
        resolve(response.styles);
      } else {
        reject(new Error(response?.error || 'Failed to load image styles'));
      }
    });
  });
}

async function loadTranslationLanguages() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: ACTIONS.GET_TRANSLATION_LANGUAGES }, response => {
      if (response && response.success) {
        resolve(response.languages);
      } else {
        reject(new Error(response?.error || 'Failed to load translation languages'));
      }
    });
  });
}

async function loadAiProviders() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: ACTIONS.GET_AI_PROVIDERS }, response => {
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

function populateImageStyles(styleInput, styles) {
  styleInput.innerHTML = '';
  for (const style of styles) {
    const opt = document.createElement('option');
    opt.value = style.id;
    opt.textContent = `${style.emoji || ''} ${style.name}`;
    styleInput.appendChild(opt);
  }
}

function populateTranslationLanguages(languageInput, languages) {
  languageInput.innerHTML = '';
  for (const lang of languages) {
    const opt = document.createElement('option');
    opt.value = lang.id;
    opt.textContent = `${lang.emoji || ''} ${lang.name}`;
    languageInput.appendChild(opt);
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

async function loadSettingsIntoUi(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, imageStyleInput, menuLanguageInput) {
  const aiProviders = await loadAiProviders();
  populateAiProviders(aiProviderInput, aiProviders);

  const preferences = await loadDietaryPreferences();
  populateDietaryPreferences(dietaryPreferenceInput, preferences);

  const imageStyles = await loadImageStyles();
  populateImageStyles(imageStyleInput, imageStyles);

  const translationLanguages = await loadTranslationLanguages();
  populateTranslationLanguages(menuLanguageInput, translationLanguages);

  // Load settings using new namespaced keys with fallback to legacy
  const allKeys = [
    STORAGE_KEYS.SETTINGS.AI_PROVIDER,
    STORAGE_KEYS.SETTINGS.DIETARY_PREFERENCE,
    STORAGE_KEYS.SETTINGS.IMAGE_STYLE,
    STORAGE_KEYS.SETTINGS.MENU_LANGUAGE,
    STORAGE_KEYS.API_KEYS.OPENAI,
    STORAGE_KEYS.API_KEYS.GEMINI,
    // Legacy keys for backward compatibility
    LEGACY_KEYS.AI_PROVIDER,
    LEGACY_KEYS.DIETARY_PREFERENCE,
    LEGACY_KEYS.IMAGE_STYLE,
    LEGACY_KEYS.MENU_LANGUAGE,
    LEGACY_KEYS.OPENAI_API_KEY,
    LEGACY_KEYS.GEMINI_API_KEY,
  ];
  const stored = await chrome.storage.local.get(allKeys);

  // Set AI provider (prefer new key, fallback to legacy)
  const selectedProvider = stored[STORAGE_KEYS.SETTINGS.AI_PROVIDER]
    || stored[LEGACY_KEYS.AI_PROVIDER]
    || 'openai';
  aiProviderInput.value = selectedProvider;

  // Set API keys (prefer new keys, fallback to legacy)
  const openaiKey = stored[STORAGE_KEYS.API_KEYS.OPENAI]
    || stored[LEGACY_KEYS.OPENAI_API_KEY];
  const geminiKey = stored[STORAGE_KEYS.API_KEYS.GEMINI]
    || stored[LEGACY_KEYS.GEMINI_API_KEY];

  if (openaiKey) {
    openaiApiKeyInput.value = openaiKey;
  }
  if (geminiKey) {
    geminiApiKeyInput.value = geminiKey;
  }

  const selectedPreference = stored[STORAGE_KEYS.SETTINGS.DIETARY_PREFERENCE]
    || stored[LEGACY_KEYS.DIETARY_PREFERENCE]
    || 'regular';
  if (selectedPreference) {
    dietaryPreferenceInput.value = selectedPreference;
  }

  const selectedImageStyle = stored[STORAGE_KEYS.SETTINGS.IMAGE_STYLE]
    || stored[LEGACY_KEYS.IMAGE_STYLE]
    || 'verkada-classic';
  if (selectedImageStyle) {
    const normalized = normalizeImageStyleId(selectedImageStyle);
    const exists = Array.from(imageStyleInput.options).some(opt => opt.value === normalized);
    if (exists) {
      imageStyleInput.value = normalized;
      // Persist cleanup if we normalized an old/aliased value
      if (normalized !== selectedImageStyle) {
        await chrome.storage.local.set({
          [STORAGE_KEYS.SETTINGS.IMAGE_STYLE]: normalized,
          [LEGACY_KEYS.IMAGE_STYLE]: normalized,
        });
      }
    } else {
      // Stored value is no longer supported; default and persist cleanup
      imageStyleInput.value = 'verkada-classic';
      await chrome.storage.local.set({
        [STORAGE_KEYS.SETTINGS.IMAGE_STYLE]: 'verkada-classic',
        [LEGACY_KEYS.IMAGE_STYLE]: 'verkada-classic',
      });
    }
  }

  const selectedMenuLanguage = stored[STORAGE_KEYS.SETTINGS.MENU_LANGUAGE]
    || stored[LEGACY_KEYS.MENU_LANGUAGE]
    || 'none';
  if (selectedMenuLanguage) {
    menuLanguageInput.value = selectedMenuLanguage;
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

async function saveSettings(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, imageStyleInput, menuLanguageInput, statusDiv) {
  const aiProvider = aiProviderInput.value.trim();
  const openaiApiKey = openaiApiKeyInput.value.trim();
  const geminiApiKey = geminiApiKeyInput.value.trim();
  const dietaryPreference = dietaryPreferenceInput.value.trim();
  const imageStyle = normalizeImageStyleId(imageStyleInput.value.trim());
  const menuLanguage = menuLanguageInput.value.trim();

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
      [STORAGE_KEYS.SETTINGS.AI_PROVIDER]: aiProvider,
      [STORAGE_KEYS.SETTINGS.DIETARY_PREFERENCE]: dietaryPreference,
      [STORAGE_KEYS.SETTINGS.IMAGE_STYLE]: imageStyle,
      [STORAGE_KEYS.SETTINGS.MENU_LANGUAGE]: menuLanguage,
      [STORAGE_KEYS.API_KEYS.OPENAI]: openaiApiKey,
      [STORAGE_KEYS.API_KEYS.GEMINI]: geminiApiKey,
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
  const imageStyleInput = document.getElementById('imageStyle');
  const menuLanguageInput = document.getElementById('menuLanguage');
  const menuLinkBtn = document.getElementById('menuLink');
  const statusDiv = document.getElementById('status');

  // Handle AI provider change
  aiProviderInput.addEventListener('change', async () => {
    toggleApiKeySection(aiProviderInput.value);
    await saveSettings(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, imageStyleInput, menuLanguageInput, statusDiv);
  });

  // Auto-save on input change
  openaiApiKeyInput.addEventListener('input', async () => {
    await saveSettings(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, imageStyleInput, menuLanguageInput, statusDiv);
  });

  geminiApiKeyInput.addEventListener('input', async () => {
    await saveSettings(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, imageStyleInput, menuLanguageInput, statusDiv);
  });

  dietaryPreferenceInput.addEventListener('change', async () => {
    await saveSettings(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, imageStyleInput, menuLanguageInput, statusDiv);
  });

  imageStyleInput.addEventListener('change', async () => {
    await saveSettings(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, imageStyleInput, menuLanguageInput, statusDiv);
  });

  menuLanguageInput.addEventListener('change', async () => {
    await saveSettings(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, imageStyleInput, menuLanguageInput, statusDiv);
  });

  menuLinkBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://sites.google.com/verkada.com/verkada-menu' });
  });

  await loadSettingsIntoUi(aiProviderInput, openaiApiKeyInput, geminiApiKeyInput, dietaryPreferenceInput, imageStyleInput, menuLanguageInput);
});
