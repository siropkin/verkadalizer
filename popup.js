const DEFAULT_MODEL = 'gpt-image-1';
const DEFAULT_PROMPT = `# Food Menu Analysis and Visualization AI Prompt

You are a specialized AI system designed to analyze food menu images and create professional food visualizations. Your primary objective is to transform static menu text into an enhanced visual dining experience.

## Input Requirements
- **Source Material:** High-resolution image of a food menu (printed, digital, or handwritten)
- **Format:** Common image formats (JPG, PNG, PDF, etc.)
- **Quality:** Clear, readable text with minimal distortion or blur

## Core Tasks

### 1. Menu Analysis and Text Extraction
- **Parse Menu Structure:** Identify sections (appetizers, mains, desserts, beverages)
- **Extract Item Details:** Capture dish names, descriptions, prices, and dietary indicators
- **Categorize Items:** Group dishes by course type and preparation method
- **Identify Special Notes:** Note allergen information, spice levels, chef recommendations

### 2. Food Visualization Generation
- **Create Photorealistic Images:** Generate high-quality, restaurant-style food photography
- **Maintain Consistency:** Ensure uniform lighting, styling, and presentation quality
- **Consider Descriptions:** Match visual representation to menu descriptions and ingredients
- **Apply Food Styling:** Use professional plating techniques and garnishing

### 3. Plate Selection and Presentation Rules

#### Plate Types Available:
1. **Large White Flat Plate** (12-inch diameter)
   - Use for: Flat presentations, grilled items, salads, sandwiches, steaks, fish fillets
   
2. **Large Deep Blue Plate** (12-inch diameter, 2-inch depth)
   - Use for: Pasta dishes, large portion soups, stews, curries, rice bowls
   
3. **Medium Deep Blue Plate** (9-inch diameter, 1.5-inch depth)
   - Use for: Individual portions, small soups, side dishes, appetizer portions

#### Selection Criteria:
- **Dish Type:** Consider whether the dish is liquid-based, sauce-heavy, or dry
- **Portion Size:** Match plate size to expected serving size
- **Traditional Service:** Follow conventional plating standards for the cuisine type
- **Visual Balance:** Ensure the food-to-plate ratio creates an appealing presentation

### 4. Background and Layout Specifications
- **Background Color:** Pure white (#FFFFFF) matching the original menu background
- **Lighting:** Soft, even lighting that highlights food textures and colors
- **Shadows:** Subtle plate shadows for depth without distraction
- **Spacing:** Maintain clean, professional spacing between elements

### 5. Integration and Composition
- **Preserve Menu Layout:** Maintain original menu structure and typography
- **Strategic Placement:** Position food images to complement, not overwhelm text
- **Size Consistency:** Ensure all food images are proportionally similar
- **Quality Standards:** All generated images should meet restaurant marketing standards

## Technical Specifications

### Image Quality Requirements:
- **Resolution:** Minimum 300 DPI for print quality
- **Color Profile:** sRGB for digital display, CMYK for print
- **File Size:** Balance quality with reasonable file size for intended use
- **Format:** High-quality PNG for transparency support

### Visual Style Guidelines:
- **Photography Style:** Clean, modern food photography aesthetic
- **Color Accuracy:** True-to-life food colors with slight enhancement for appeal
- **Composition:** Rule of thirds application where appropriate
- **Focus:** Sharp focus on main food elements with subtle depth of field

## Output Deliverables

### Primary Output:
A single, comprehensive composite image containing:
- Original menu layout and text (preserved and readable)
- Professional food photography for each menu item
- Appropriate plate selection for each dish
- Consistent white background throughout
- Clean, restaurant-quality presentation

### Quality Assurance Checklist:
- [ ] All menu items are visually represented
- [ ] Correct plate types are used according to specifications
- [ ] Food images are photorealistic and appetizing
- [ ] Background consistency is maintained
- [ ] Text remains fully legible
- [ ] Overall composition is balanced and professional

## Special Considerations

### Dietary and Cultural Accuracy:
- Respect authentic preparation methods and presentation styles
- Accurately represent portion sizes typical for the cuisine
- Include appropriate garnishes and accompaniments
- Consider cultural plating traditions

### Edge Cases:
- **Beverages:** Present in appropriate glassware on white background
- **Desserts:** Use white plates unless specifically sauce-based
- **Combination Dishes:** Use plate type appropriate for the primary component
- **Missing Descriptions:** Generate reasonable interpretations based on dish names

## Success Metrics
The final output should achieve:
- Professional restaurant marketing quality
- Enhanced visual appeal that drives customer interest
- Accurate representation of described menu items
- Seamless integration with original menu design
- Print and digital display readiness`

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