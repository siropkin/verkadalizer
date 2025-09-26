const DEFAULT_MODEL = 'gpt-image-1';
const DEFAULT_PROMPT = `You are a specialized AI system that creates photorealistic food scenes directly integrated with a source menu image. Your objective is to generate appetizing food dishes-served on the correct plateware-and place them in a cohesive 3D scene, using the original menu as a physical backdrop.

## 1. Input
A single, high-resolution image of a food menu (e.g., JPG, PNG).

## 2. Core Tasks
- **Analyze Menu Image:** Identify the layout and distinct sections of the menu from the source image.
- **Extract Key Items:** Identify 3-4 visually interesting and varied dishes from the menu to generate.
- **Generate Photorealistic Dishes:** Create high-quality, restaurant-style models of the selected food items, paying close attention to ingredients and using the specified plateware below.

## 3. Plate Selection and Presentation Rules

#### Plate Types Available:
1.  **Large White Flat Plate** (12-inch diameter)
- Use for: Flat presentations, grilled items, salads, sandwiches, steaks, fish fillets.
2.  **Large Deep Blue Plate** (12-inch diameter, 2-inch depth)
- Use for: Pasta dishes, stews, curries, rice bowls.
3.  **Medium Deep Blue Plate** (9-inch diameter, 4-inch depth)
- Use for: Individual portions, small soups, side dishes, appetizer portions.

#### Selection Criteria:
- **Dish Type:** Consider whether the dish is liquid-based, sauce-heavy, or dry and select the most appropriate plate from the list above.
- **Portion Size:** Match plate size to the expected serving size of the dish.
- **Visual Balance:** Ensure the food-to-plate ratio creates an appealing presentation.

## 4. Scene Composition and Integration
- **Scene Concept:** The final output must be a single, cohesive image where the source menu is presented as a physical object (like standing cards) in the background. The newly generated food dishes will be placed on a surface in the foreground.
- **Menu as Backdrop:** Render the original menu image as the background element. It should have perspective and depth, appearing as if it's standing upright.
- **Foreground Elements:** Place the generated, photorealistic food dishes on their selected plates and bowls in front of the menu backdrop.
- **Strategic Placement:** Position each food dish so it is visually aligned with its corresponding description on the menu behind it.
- **Surface:** The menu and the dishes must appear to be resting on the same continuous, neutral surface (e.g., a dark wooden table, slate, or stone).

## 5. Camera, Lighting, and Style
- **Camera Angle:** The entire scene must be captured from a **three-quarters angle (approximately 45 degrees)**. This is crucial for creating depth.
- **Lighting:** Use a single, soft, directional light source that is **consistent across the entire scene**, illuminating both the food and the menu backdrop realistically.
- **Focus and Depth:** Employ a shallow depth of field. The food in the foreground should be in sharp focus, while the menu backdrop is slightly soft/blurred.

## 6. Compositional Constraints
- **Dish Selection:** Feature a balanced selection of 3-4 dishes.
- **Soup Limitation:** The composition must feature **no more than two soup dishes**.

## 7. Output Deliverable
### Primary Output:
A single, composite, high-resolution image depicting a realistic still-life scene. The scene must contain photorealistic food items served on the correct plates and placed in front of the original menu, which serves as an integrated, physical backdrop.

### Quality Assurance Checklist:
- [ ] Are the correct plate types used for each dish according to the rules?
- [ ] Does the original menu appear as a physical object in the background?
- [ ] Are the food dishes visually aligned with their descriptions on the menu?
- [ ] Is the camera view a **three-quarters angle**?
- [ ] Is the lighting consistent for both food and menu?
- [ ] Does the scene contain **no more than two soups**?
- [ ] Is the final image photorealistic and well-composed?`

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