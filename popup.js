const DEFAULT_MODEL = 'gpt-image-1';

const DEFAULT_PROMPT = `You are a specialized AI designed to analyze food menus and visualize individual menu items. Your task is to process an input image containing a food menu and then create a new, composite image.

**Input:** An image of a food menu (e.g., a photograph of a printed menu).

**Task:**
1.  **Analyze the Input Image:** Read and parse the text from the provided food menu image to identify individual menu items.
2.  **Visualize Menu Items:** For each identified menu item, generate a realistic, high-quality visual representation of the dish.
3.  **Place Visualizations:** Integrate these generated dish visualizations into the original menu image.
4.  **Plate Specifics:**
    * For dishes served in a deep bowl or on a deep plate (e.g., soup, stew, pasta), use a **deep blue** plate.
    * For dishes served on a flat plate (e.g., steak, salad, sandwich), use a **white** plate.

**Output:** A single, high-resolution composite image where each menu item from the original menu is replaced or accompanied by a generated visual representation of the food, displayed on the specified plate color.`

document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const modelInput = document.getElementById('model');
  const promptTextarea = document.getElementById('prompt');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const statusDiv = document.getElementById('status');

  async function loadSettings() {
    const result = await chrome.storage.local.get(['apiKey', 'model', 'prompt']);
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
    if (result.model) {
      modelInput.value = result.model;
    } else {
      modelInput.value = DEFAULT_MODEL;
    }
    if (result.prompt) {
      promptTextarea.value = result.prompt;
    } else {
      promptTextarea.value = DEFAULT_PROMPT;
    }
  }

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }

  saveSettingsBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const model = modelInput.value.trim();
    const prompt = promptTextarea.value.trim();
    
    try {
      await chrome.storage.local.set({
        apiKey: apiKey,
        model: model || DEFAULT_MODEL,
        prompt: prompt || DEFAULT_PROMPT,
      });
      
      showStatus('Settings saved successfully!', 'success');
    } catch (error) {
      showStatus('Failed to save settings', 'error');
    }
  });

  

  await loadSettings();
});