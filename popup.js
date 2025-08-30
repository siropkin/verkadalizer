const DEFAULT_MODEL = 'gpt-image-1';
const DEFAULT_QUALITY = 'high';
const DEFAULT_SIZE = '1536x1024';
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

document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const modelInput = document.getElementById('model');
  const qualitySelect = document.getElementById('quality');
  const sizeSelect = document.getElementById('size');
  const promptTextarea = document.getElementById('prompt');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const resetSettingsBtn = document.getElementById('resetSettings');
  const statusDiv = document.getElementById('status');

  async function loadSettings() {
    const result = await chrome.storage.local.get(['apiKey', 'model', 'quality', 'size', 'prompt']);
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
    if (result.model) {
      modelInput.value = result.model;
    } else {
      modelInput.value = DEFAULT_MODEL;
    }
    if (result.quality) {
      qualitySelect.value = result.quality;
    } else {
      qualitySelect.value = DEFAULT_QUALITY;
    }
    if (result.size) {
      sizeSelect.value = result.size;
    } else {
      sizeSelect.value = DEFAULT_SIZE;
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
    }, 5000);
  }

  saveSettingsBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const model = modelInput.value.trim();
    const quality = qualitySelect.value;
    const size = sizeSelect.value;
    const prompt = promptTextarea.value.trim();
    
    try {
      await chrome.storage.local.set({
        apiKey: apiKey,
        model: model || DEFAULT_MODEL,
        quality: quality || DEFAULT_QUALITY,
        size: size || DEFAULT_SIZE,
        prompt: prompt || DEFAULT_PROMPT,
      });
      
      showStatus('Settings saved successfully!', 'success');
    } catch (error) {
      showStatus('Failed to save settings', 'error');
    }
  });

  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', async () => {
      try {
        const current = await chrome.storage.local.get(['apiKey']);
        const preservedApiKey = current.apiKey || '';

        await chrome.storage.local.set({
          apiKey: preservedApiKey,
          model: DEFAULT_MODEL,
          quality: DEFAULT_QUALITY,
          size: DEFAULT_SIZE,
          prompt: DEFAULT_PROMPT,
        });

        // Reflect defaults in UI while keeping API key intact
        if (typeof preservedApiKey === 'string') {
          apiKeyInput.value = preservedApiKey;
        }
        modelInput.value = DEFAULT_MODEL;
        qualitySelect.value = DEFAULT_QUALITY;
        sizeSelect.value = DEFAULT_SIZE;
        promptTextarea.value = DEFAULT_PROMPT;

        showStatus('Settings reset to defaults (API key preserved)', 'success');
      } catch (error) {
        showStatus('Failed to reset settings', 'error');
      }
    });
  }

  await loadSettings();
});