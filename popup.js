const DEFAULT_MODEL = 'gpt-image-1';
const DEFAULT_PROMPT = `You are a specialized AI system that creates photorealistic food scenes with a plain cool gray background. Your objective is to generate appetizing food dishes served on the correct plateware in a cohesive 3D scene with a solid cool gray background that occupies the upper 2/3 of the image height.

## 1. Input
A single, high-resolution image of a food menu.

## 2. Core Tasks
- Analyze Menu Layout: Study the menu structure and sections to understand the food items.
- Extract Key Items: Identify 4-6 visually interesting and varied dishes from the menu to generate.
- Generate Photorealistic Dishes: Create high-quality, restaurant-style models of the selected food items using specified plateware.
- Create Plain Cool Gray Background: Generate a solid, uniform cool gray background that takes up exactly 2/3 of the image height from the top.

## 3. Plate Selection and Presentation Rules
Plate Types Available:
- Large Flat Fully White Plate (12-inch diameter). Use for: Flat presentations, grilled items, salads, sandwiches, steaks, fish fillets.
- Large Deep Fully Blue Plate (12-inch diameter, 2-inch depth). Use for: Pasta dishes, stews, curries, rice bowls.
- Medium Deep Fully Blue Plate (9-inch diameter, 4-inch depth). Use for: Individual portions, soups, side dishes, appetizer portions.

Selection Criteria:
- Dish Type: Consider whether the dish is liquid-based, sauce-heavy, or dry and select the most appropriate plate.
- Portion Size: Match plate size to the expected serving size.
- Visual Balance: Ensure the food-to-plate ratio creates appealing presentation.

## 4. Scene Composition and Integration
- Background Requirements: The upper 2/3 of the image MUST be a cool gray color with no patterns, textures, gradients, or visual elements of any kind.
- Foreground Elements: Place photorealistic food dishes on appropriate plates in the lower 1/3 of the image.
- Surface: Food should rest on a neutral surface (dark wooden table, slate, or stone) visible only in the lower portion of the image.
- No Background Elements: The background area must be completely empty - no lines, shapes, decorations, or any visual elements whatsoever.

## 5. Camera, Lighting, and Style
- Camera Angle: Three-quarters angle (approximately 45 degrees) for depth.
- Lighting: Single, soft, directional light source consistent across the entire scene.
- Focus and Depth: Food in sharp focus, with the background remaining uniformly cool gray throughout.

## 6. Compositional Constraints
- Dish Selection: Feature 4-6 balanced dishes positioned in the lower 1/3 of the image.
- Soup Limitation: Maximum two soup dishes.
- Background Division: Upper 2/3 = cool gray, lower 1/3 = food on surface.

## 7. CRITICAL BACKGROUND REQUIREMENTS
- SOLID COOL GRAY BACKGROUND: The upper 2/3 of the image must be pure cool gray color with no variation.
- NO VISUAL ELEMENTS: No text, shapes, lines, patterns, textures, or any other visual elements in the background area.
- EXACT PROPORTIONS: Cool gray background must occupy exactly 2/3 of the total image height from the top.
- UNIFORM COLOR: The cool gray must be consistent throughout - no gradients, shadows, or color variations in the background area.

## 8. Output Deliverable
A single, high-resolution image with photorealistic food positioned in the lower 1/3, and a solid cool gray background occupying the upper 2/3 with no additional elements.

Quality Assurance Checklist:
- Is the upper 2/3 of the image pure cool gray color with no visual elements?
- Are food dishes positioned only in the lower 1/3?
- Are correct plate types used for each dish?
- Is the cool gray background completely uniform and pure?
- Is the camera angle three-quarters view?
- Is lighting consistent throughout?
- Maximum two soups included?
- No empty plates included?
- Final image photorealistic and well-composed with proper proportions?`

// Model-agnostic schema to render settings dynamically
const MODEL_SCHEMAS = {
  'gpt-image-1': {
    fields: [
      {
        key: 'quality',
        label: 'Quality',
        type: 'select',
        options: [
          { value: 'auto', label: 'Auto' },
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
        ],
        default: 'high',
      },
      {
        key: 'size',
        label: 'Output size',
        type: 'select',
        options: [
          { value: 'auto', label: 'Auto' },
          { value: '1024x1024', label: '1024 x 1024' },
          { value: '1536x1024', label: '1536 x 1024' },
          { value: '1024x1536', label: '1024 x 1536' },
        ],
        default: '1536x1024',
      },
      {
        key: 'prompt',
        label: 'Processing Prompt',
        type: 'textarea',
        default: DEFAULT_PROMPT,
        placeholder: 'Enter custom prompt for image processing...'
      }
    ]
  }
};

function showStatus(statusDiv, message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 5000);
}

function ensureModelOptions(modelInput) {
  const models = Object.keys(MODEL_SCHEMAS);
  const existing = new Set(Array.from(modelInput.options).map(o => o.value));
  for (const m of models) {
    if (!existing.has(m)) {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      modelInput.appendChild(opt);
    }
  }
}

function getDefaultValuesForModel(model) {
  const schema = MODEL_SCHEMAS[model];
  const values = {};
  if (schema && Array.isArray(schema.fields)) {
    for (const field of schema.fields) {
      values[field.key] = field.default;
    }
  }
  return values;
}

function renderModelSettings(modelSettingsContainer, model, values) {
  modelSettingsContainer.innerHTML = '';
  const schema = MODEL_SCHEMAS[model];
  if (!schema) return;
  for (const field of schema.fields) {
    const section = document.createElement('div');
    section.className = 'section';

    const label = document.createElement('label');
    label.setAttribute('for', `field-${field.key}`);
    label.textContent = field.label + ':';
    section.appendChild(label);

    let inputEl;
    if (field.type === 'select') {
      inputEl = document.createElement('select');
      inputEl.id = `field-${field.key}`;
      for (const opt of field.options || []) {
        const optionEl = document.createElement('option');
        optionEl.value = opt.value;
        optionEl.textContent = opt.label || opt.value;
        inputEl.appendChild(optionEl);
      }
      inputEl.value = values[field.key] ?? field.default ?? '';
    } else if (field.type === 'textarea') {
      inputEl = document.createElement('textarea');
      inputEl.id = `field-${field.key}`;
      inputEl.placeholder = field.placeholder || '';
      inputEl.value = values[field.key] ?? field.default ?? '';
    } else {
      inputEl = document.createElement('input');
      inputEl.type = 'text';
      inputEl.id = `field-${field.key}`;
      inputEl.placeholder = field.placeholder || '';
      inputEl.value = values[field.key] ?? field.default ?? '';
    }

    section.appendChild(inputEl);
    modelSettingsContainer.appendChild(section);
  }
}

function readUiValuesForModel(model) {
  const schema = MODEL_SCHEMAS[model];
  const values = {};
  if (!schema) return values;
  for (const field of schema.fields) {
    const el = document.getElementById(`field-${field.key}`);
    if (!el) continue;
    if (field.type === 'textarea' || field.type === 'text') {
      values[field.key] = String(el.value || '').trim();
    } else {
      values[field.key] = el.value;
    }
  }
  return values;
}

async function loadSettingsIntoUi(apiKeyInput, modelInput, modelSettingsContainer) {
  const stored = await chrome.storage.local.get(['default_model', 'model', 'perModel', 'apiKey', 'quality', 'size', 'prompt']);
  ensureModelOptions(modelInput);
  const model = stored.default_model || stored.model || DEFAULT_MODEL;
  modelInput.value = model;
  if (stored.apiKey) {
    apiKeyInput.value = stored.apiKey;
  }
  const perModel = stored.perModel || {};
  const modelValues = {
    ...getDefaultValuesForModel(model),
    ...perModel[model],
  };
  if (!perModel[model]) {
    if (stored.quality !== undefined) modelValues.quality = stored.quality;
    if (stored.size !== undefined) modelValues.size = stored.size;
    if (stored.prompt !== undefined) modelValues.prompt = stored.prompt;
  }
  renderModelSettings(modelSettingsContainer, model, modelValues);
}

document.addEventListener('DOMContentLoaded', async () => {
  const modelInput = document.getElementById('model');
  const apiKeyInput = document.getElementById('apiKey');
  const modelSettingsContainer = document.getElementById('modelSettingsContainer');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const resetSettingsBtn = document.getElementById('resetSettings');
  const statusDiv = document.getElementById('status');

  modelInput.addEventListener('change', async () => {
    const stored = await chrome.storage.local.get(['perModel', 'default_model', 'model']);
    const model = modelInput.value || stored.default_model || stored.model || DEFAULT_MODEL;
    const values = {
      ...getDefaultValuesForModel(model),
      ...(stored.perModel ? stored.perModel[model] : {}),
    };
    renderModelSettings(modelSettingsContainer, model, values);
  });

  saveSettingsBtn.addEventListener('click', async () => {
    const model = modelInput.value.trim() || DEFAULT_MODEL;
    const apiKey = apiKeyInput.value.trim();
    const modelValues = readUiValuesForModel(model);
    try {
      const existing = await chrome.storage.local.get(['perModel']);
      const perModel = existing.perModel || {};
      perModel[model] = { ...(perModel[model] || {}), ...modelValues };
      // Maintain flat keys for backward compatibility
      const flatCompat = {
        quality: modelValues.quality ?? MODEL_SCHEMAS[model]?.fields.find(f => f.key === 'quality')?.default,
        size: modelValues.size ?? MODEL_SCHEMAS[model]?.fields.find(f => f.key === 'size')?.default,
        prompt: modelValues.prompt ?? MODEL_SCHEMAS[model]?.fields.find(f => f.key === 'prompt')?.default,
      };
      await chrome.storage.local.set({
        default_model: model,
        perModel,
        apiKey,
        ...flatCompat,
      });
      showStatus(statusDiv, 'Settings saved successfully!', 'success');
    } catch (error) {
      showStatus(statusDiv, 'Failed to save settings', 'error');
    }
  });

  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', async () => {
      try {
        const current = await chrome.storage.local.get(['perModel', 'apiKey']);
        const preservedApiKey = current.apiKey || '';
        const model = modelInput.value || DEFAULT_MODEL;
        const defaults = getDefaultValuesForModel(model);
        const perModel = current.perModel || {};
        perModel[model] = { ...defaults };
        await chrome.storage.local.set({
          default_model: model,
          perModel,
          apiKey: preservedApiKey,
          quality: defaults.quality,
          size: defaults.size,
          prompt: defaults.prompt,
        });
        if (typeof preservedApiKey === 'string') {
          apiKeyInput.value = preservedApiKey;
        }
        renderModelSettings(modelSettingsContainer, model, defaults);
        showStatus(statusDiv, 'Settings reset to defaults (API key preserved)', 'success');
      } catch (error) {
        showStatus(statusDiv, 'Failed to reset settings', 'error');
      }
    });
  }

  await loadSettingsIntoUi(apiKeyInput, modelInput, modelSettingsContainer);
});