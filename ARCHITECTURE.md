# Verkadalizer Architecture

## Progress Tracking System

### Architecture Overview

The progress tracking system is designed with clean separation between **business logic** (AI processing steps) and **presentation logic** (UI rendering). This architecture makes it easy to migrate to a backend API in the future.

```
┌─────────────────────────────────────────────────────────┐
│  AI Service Layer (ai/providers/)                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                           │
│  ┌─────────────────────────────────────────┐            │
│  │ progress-steps.js                        │            │
│  │ ─────────────────────────────────────── │            │
│  │ • Defines PROGRESS_STEPS constants      │            │
│  │ • Business logic / API contract         │            │
│  │ • Would come from backend in future     │            │
│  └─────────────────────────────────────────┘            │
│              ↓ emits                                     │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │ gemini-provider.js   │  │ openai-provider.js   │    │
│  │ ──────────────────── │  │ ──────────────────── │    │
│  │ • Emits step IDs     │  │ • Emits step IDs     │    │
│  │ • No UI logic        │  │ • No UI logic        │    │
│  └──────────────────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                        ↓
                (step + extra data)
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Background Service (background.js)                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Orchestrates AI processing                           │
│  • Stores progress: { step, extra, timestamp }          │
│  • Converts step -> UI via stepToProgressData()          │
│  • Forwards progressData to clients                      │
└─────────────────────────────────────────────────────────┘
                        ↓
                  (progressData)
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Client Layer (content.js)                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                           │
│  ┌─────────────────────────────────────────┐            │
│  │ content.js (Single consolidated file)   │            │
│  │ ─────────────────────────────────────── │            │
│  │ • Step-specific detail text             │            │
│  │ • Page detection & image queries         │            │
│  │ • UI components (buttons, spinner)       │            │
│  │ • Storage & request management           │            │
│  │ • Image processing orchestration         │            │
│  │ • Initialization & DOM observation       │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
│  Note: Single file due to Chrome content script         │
│  module limitations. Well-organized with sections.      │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Example

```javascript
// 1. AI Provider emits semantic step
updateProgress(PROGRESS_STEPS.MENU_ANALYZED, {
  selectedDishes: ['Pizza', 'Burger', 'Salad']
});

// 2. Background stores raw step data
{
  step: 'MENU_ANALYZED',
  extra: { selectedDishes: [...] },
  timestamp: 1234567890
}

// 3. Client retrieves UI-ready progress data
const progressData = response.progressData;
// Returns:
{
  progress: 50,
  statusText: 'Menu analyzed!',
  detailText: 'Selected: Pizza, Burger, Salad'
}

// 4. Client renders to DOM
<div class="vk-progress-bar" style="width: 50%"></div>
<div class="vk-status-text">Menu analyzed!</div>
<div class="vk-detail-text">Selected: Pizza, Burger, Salad</div>
```

### File Responsibilities

| File                              | Responsibility                                      | Type           | Lines |
| --------------------------------- | --------------------------------------------------- | -------------- | ----- |
| `ai/providers/progress-steps.js`  | Define step constants (API contract)                | Business Logic | 38    |
| `ai/providers/gemini-provider.js` | Emit steps during Gemini processing                 | Business Logic | 341   |
| `ai/providers/openai-provider.js` | Emit steps during OpenAI processing                 | Business Logic | 249   |
| `ai/providers/provider-utils.js`  | Shared JSON + error parsing helpers                 | Business Logic | -     |
| `ai/providers/ai-providers.js`    | Provider registry + routing (`PROVIDERS`)           | Orchestration  | -     |
| `background.js`                   | Store steps and serve UI-ready progressData         | Orchestration  | 398   |
| `lib/messages/actions.js`         | Canonical message action names (popup + background) | Contract       | -     |
| `lib/messages/protocol.js`        | JSDoc message/provider contracts                    | Contract       | -     |
| `content.js`                      | All client-side functionality (single file)         | Presentation   | 588   |

### Message Actions Contract

Message actions are centralized for the ESM contexts:

- `lib/messages/actions.js` is the canonical source of `ACTIONS.*` for:
  - `background.js` (service worker, ESM)
  - `popup.js` (extension page, ESM)
- `content.js` mirrors the same string values locally (it stays a classic content script for reliability).

**Content Script Approach:** Single consolidated file with clear section organization:

- Content scripts have poor ES6 module support in Chrome
- Single file (~588 lines) is simpler than fighting module limitations
- Well-organized with section comments for easy navigation
- UI mapping lives in the background service worker (single source of truth)

### Future Backend Migration

When moving to a backend API, the architecture naturally supports this:

**Backend API:**

```javascript
// Backend would define and return steps
export const PROGRESS_STEPS = { ... };

app.get('/api/status/:requestId', (req, res) => {
  res.json({
    step: 'MENU_ANALYZED',
    extra: { selectedDishes: [...] },
    timestamp: Date.now()
  });
});
```

**Frontend (minimal changes):**

```javascript
// Background converts steps to UI-ready progressData
import { stepToProgressData } from "./lib/progress-steps.js"; // UI mapping (server-side)

const response = await fetch("/api/status/123");
const { step, extra } = await response.json();
const progressData = stepToProgressData(step, extra);
// Return `progressData` directly to the client to render...
```

### Key Benefits

✅ **Separation of Concerns**: Business logic (steps) separate from presentation (UI)
✅ **API-Ready**: Steps are defined by the service layer, not the client
✅ **Type-Safe**: Constants prevent typos and enable autocomplete
✅ **Maintainable**: Change UI text without touching AI providers
✅ **Testable**: Each layer can be tested independently
✅ **Future-Proof**: Easy migration to backend API

---

## Image Processing Pipeline

### Three-Stage Processing Architecture with Optional Translation

The extension uses a sophisticated three-stage AI processing pipeline with optional menu translation:

```
┌─────────────────────────────────────────────────────────┐
│  Stage 1: Menu Analysis                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • AI analyzes menu image (GPT-4o or Gemini 3 Pro)      │
│  • Extracts dish names, categories, descriptions        │
│  • Applies dietary preference filters                   │
│  • Returns structured JSON with selected items          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Stage 2: Image Generation                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Builds dynamic prompt from parsed menu data          │
│  • Includes unified image style (plates + aesthetics)   │
│  • AI generates photorealistic visualization            │
│  • (gpt-image-2 or Gemini 3 Pro Image)                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Stage 3: Post-Processing                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Shared post-processing pipeline                      │
│  • (lib/image-processing.js)                            │
│  • Upscales original image 2x                           │
│  • Removes white background from original               │
│  • Enhances text contrast                               │
│  • Merges original + AI images                          │
│  • Downscales to original dimensions                    │
└─────────────────────────────────────────────────────────┘
```

### Unified Image Style System

Image styles combine plate design and visual aesthetics into cohesive presets:

**Data Structure:**

```javascript
IMAGE_STYLES = {
  'verkada-classic': {
    // Plate configuration
    plates: { soup: '...', salad: '...', main: '...', ... },
    materialDescription: 'Classic ceramic plates...',

    // Visual style modifiers
    lighting: 'Soft, diffused natural light...',
    background: 'Soft gradient background...',
    surface: 'Light marble with subtle veining...',
    colorPalette: 'Vibrant and natural...',
    atmosphere: 'Modern, clean, contemporary...',
    camera: 'Sharp focus with beautiful bokeh...'
  }
}
```

**Available Styles (examples):**

- Verkada Classic (Tabletop Editorial)
- Verkada Cyberpunk (Neon Gel Studio)
- Verkada Grandmillennial (Maximalist Patterns)
- Verkada Air (Floating Collage)
- Verkada Orbit (Floating Ring)
- Verkada Pedestals (Museum Plinths)
- Verkada Scan (Orthographic Catalog)
- Verkada Spotlight (Theatrical Stage Light)

**Benefits:**

- ✅ Simplified UX (1 dropdown instead of 2)
- ✅ Curated combinations ensure cohesive results
- ✅ Smart caching includes style in request ID
- ✅ Automatic migration for existing users

---

## Menu Translation System

### Translation Architecture

The menu translation system allows users to translate menu text into 12 languages while preserving the original layout and typography.

```
┌─────────────────────────────────────────────────────────┐
│  Translation Configuration (ai/prompts.js)               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • TRANSLATION_LANGUAGES constants                      │
│  • 12 supported languages + "No Translation" default   │
│  • Language metadata (id, name, emoji, code)            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Translation Prompt Builder                              │
│  (ai/prompts/menu-translation.js)                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • buildMenuTranslationPrompt(translationLanguage, parsedMenuData?) │
│  • Generates AI prompt for layout-preserving translation│
│  • Optionally embeds a reference glossary from parse     │
│  • Enforces typography and spacing preservation         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  AI Translation Processing                               │
│  (ai/providers/ai-providers.js)                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • translateMenuImageWithAI()                           │
│  • Routes to provider-specific translation              │
│  • Returns translated menu image with preserved layout  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Integration with Image Generation                       │
│  (background.js)                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Translation mode vs No translation mode              │
│  • Dynamic prompt generation based on mode              │
│  • Post-processing and compositing                      │
└─────────────────────────────────────────────────────────┘
```

### Supported Languages

The extension supports 12 languages:

- 🇺🇸 English (US)
- 🇫🇷 French
- 🇪🇸 Spanish
- 🇯🇵 Japanese
- 🇰🇷 Korean
- 🇵🇹 Portuguese
- 🇷🇺 Russian
- 🇨🇳 Chinese (Simplified)
- 🇩🇪 German
- 🇳🇱 Dutch
- 🇩🇰 Danish
- 🏳️ No Translation (default)

### Translation Modes

**Mode 1: No Translation (Default)**

- Original menu text preserved
- AI generates clean food photography background
- Original text overlaid in post-processing
- Text-free background suitable for compositing

**Mode 2: Translation Enabled**

- AI translates all menu text to selected language
- Preserves original spatial structure and hierarchy
- Maintains layout positioning (top-left, center, etc.)
- Keeps alignment and spacing consistent
- High-quality typography with clear text rendering

### Layout Preservation Features

**Spatial Structure:**

- Semantic layout matching - replicates exact positioning
- Position mapping - maintains relative placement
- Hierarchy preservation - headers, descriptions, prices
- Alignment consistency - center/left/right matching

**Typography:**

- Descriptive font characteristics (not font names)
- Style matching (modern/elegant/casual)
- Text color and contrast preservation
- Proper kerning and spacing

**Text Quality:**

- Crystal-clear, legible text rendering
- Sharp, professionally typeset characters
- Correct special characters and diacritics
- Multi-line handling with consistent line height

### Implementation Files

| File                              | Responsibility               | Key Exports                                                        |
| --------------------------------- | ---------------------------- | ------------------------------------------------------------------ |
| `ai/prompts.js`                   | Translation language configs | `TRANSLATION_LANGUAGES`                                            |
| `ai/prompts/menu-translation.js`  | Translation prompt builder   | `buildMenuTranslationPrompt(translationLanguage, parsedMenuData?)` |
| `ai/providers/openai-provider.js` | OpenAI translation handler   | `translateMenuImageWithOpenAI()`                                   |
| `ai/providers/gemini-provider.js` | Gemini translation handler   | `translateMenuImageWithGemini()`                                   |
| `ai/providers/ai-providers.js`    | Provider routing             | `translateMenuImageWithAI()`                                       |
| `background.js`                   | Translation orchestration    | Request handling                                                   |

### Benefits

✅ **Multilingual Support**: 12 languages for global accessibility
✅ **Layout Preservation**: Original menu structure maintained
✅ **High Quality**: Professional typography and text rendering
✅ **Flexible**: Works with all AI providers (OpenAI, Gemini)
✅ **User Choice**: Optional - defaults to no translation

---

## Content Script Structure

The content script is a single consolidated file that handles all client-side functionality.

### Why Single File?

Chrome extensions have complex limitations around ES6 modules in content scripts:

- `"type": "module"` is not fully supported
- Dynamic imports require `web_accessible_resources` which exposes internal code
- Module loading adds complexity and potential security issues

**Simple is better!** A single well-organized file (~588 lines) is easier to maintain than fighting Chrome's module limitations.

### Content Script Organization

**content.js** - Single consolidated content script with clear sections:

```javascript
// ============================================================================
// PROGRESS STEPS & UI MAPPING
// ============================================================================
// - UI progress mapping happens in background and is delivered as `progressData`
// - UI text, progress %, and step-specific detail text
// - stepToProgressData() with caching

// ============================================================================
// PAGE DETECTION
// ============================================================================
// - isVerkadaMenuPage() - Check if on menu page
// - isMenuImage() - Check if image is a menu image
// - queryMenuImages() - Get all menu images

// ============================================================================
// UI COMPONENTS
// ============================================================================
// - createButton() - Create styled buttons
// - renderController() - Render controller with state
// - attachController() - Attach with mutation observer

// ============================================================================
// SPINNER OVERLAY
// ============================================================================
// - createSpinnerOverlay() - Animated loading overlay
// - updateSpinnerProgress() - Update progress bar
// - removeSpinnerOverlay() - Remove overlay

// ============================================================================
// STORAGE & REQUEST MANAGEMENT
// ============================================================================
// - generateRequestId() - Generate unique image ID
// - saveGeneratedImage() - Persist generated image
// - loadSavedImage() - Load cached image
// - restoreSavedImage() - Restore on page load
// - cleanupOldSavedImages() - Remove old cache

// ============================================================================
// IMAGE PROCESSING
// ============================================================================
// - startImageProcessing() - AI generation pipeline
// - cancelImageProcessing() - Cancel in-progress request
// - Progress polling and spinner updates

// ============================================================================
// INITIALIZATION
// ============================================================================
// - init() - Main entry point
// - DOM observation for new images
// - Restore saved images on load
```

### Benefits

✅ **Simple** - No module loading complexity
✅ **Reliable** - Works in all Chrome versions
✅ **Secure** - No exposed internal resources
✅ **Maintainable** - Clear section organization
✅ **Self-Contained** - Everything in one place
