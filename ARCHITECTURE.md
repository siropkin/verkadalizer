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
│  • Forwards step data to clients                        │
│  • No UI rendering logic                                │
└─────────────────────────────────────────────────────────┘
                        ↓
                (step + extra data)
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Client Layer (content/)                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                           │
│  ┌─────────────────────────────────────────┐            │
│  │ content/main.js (Entry point)            │            │
│  │ ─────────────────────────────────────── │            │
│  │ • Initialization & DOM observation       │            │
│  │ • Coordinates all modules                │            │
│  └─────────────────────────────────────────┘            │
│              ↓ uses                                      │
│  ┌─────────────────────────────────────────┐            │
│  │ Modular Content Scripts (ES6)            │            │
│  │ ─────────────────────────────────────── │            │
│  │ • progress-ui.js (imports from lib!)     │            │
│  │ • ui-components.js (buttons, controls)   │            │
│  │ • spinner.js (progress overlay)          │            │
│  │ • storage.js (image persistence)         │            │
│  │ • image-processor.js (orchestration)     │            │
│  │ • page-detector.js (menu detection)      │            │
│  └─────────────────────────────────────────┘            │
│              ↓ imports                                   │
│  ┌─────────────────────────────────────────┐            │
│  │ lib/progress-steps.js                    │            │
│  │ ─────────────────────────────────────── │            │
│  │ • Re-exports PROGRESS_STEPS              │            │
│  │ • STEP_CONFIG (shared UI mapping)        │            │
│  │ • stepToProgressData() with caching      │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
│  Note: Manifest V3 supports "type": "module"            │
│  for content scripts, enabling ES6 imports!             │
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

// 3. Client retrieves and converts to UI
const progressData = stepToProgressData('MENU_ANALYZED', extra);
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

| File | Responsibility | Type | Lines |
|------|---------------|------|-------|
| `ai/providers/progress-steps.js` | Define step constants (API contract) | Business Logic | 37 |
| `ai/providers/gemini-provider.js` | Emit steps during Gemini processing | Business Logic | 338 |
| `ai/providers/openai-provider.js` | Emit steps during OpenAI processing | Business Logic | 257 |
| `background.js` | Store and forward step data | Orchestration | 325 |
| `lib/progress-steps.js` | Map steps to UI text/progress/facts | Presentation | 177 |
| **`content/main.js`** | **Entry point, initialization** | **Presentation** | **113** |
| **`content/page-detector.js`** | **Page/image detection** | **Presentation** | **31** |
| **`content/ui-components.js`** | **Button and controller UI** | **Presentation** | **192** |
| **`content/spinner.js`** | **Progress overlay** | **Presentation** | **151** |
| **`content/progress-ui.js`** | **Progress step imports** | **Presentation** | **8** |
| **`content/storage.js`** | **Image persistence** | **Presentation** | **96** |
| **`content/image-processor.js`** | **Processing orchestration** | **Presentation** | **124** |

**Modular Content Scripts:** Manifest V3 supports ES6 modules for content scripts via `"type": "module"`:
- Content scripts can now use `import` statements
- Split 742-line content.js into 7 focused modules (~715 lines total)
- Each module has a single responsibility
- `content/progress-ui.js` imports from `lib/progress-steps.js` (no more duplication!)

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
// Client still converts steps to UI
import { PROGRESS_STEPS } from './api-client.js'; // From API
import { stepToProgressData } from './lib/progress-steps.js'; // Local UI logic

const response = await fetch('/api/status/123');
const { step, extra } = await response.json();
const uiData = stepToProgressData(step, extra);
// Render...
```

### Key Benefits

✅ **Separation of Concerns**: Business logic (steps) separate from presentation (UI)
✅ **API-Ready**: Steps are defined by the service layer, not the client
✅ **Type-Safe**: Constants prevent typos and enable autocomplete
✅ **Maintainable**: Change UI text without touching AI providers
✅ **Testable**: Each layer can be tested independently
✅ **Future-Proof**: Easy migration to backend API

---

## Content Script Structure

The content script is a single consolidated file that handles all client-side functionality.

### Why Single File?

Chrome extensions have complex limitations around ES6 modules in content scripts:
- `"type": "module"` is not fully supported
- Dynamic imports require `web_accessible_resources` which exposes internal code
- Module loading adds complexity and potential security issues

**Simple is better!** A single well-organized file (~768 lines) is easier to maintain than fighting Chrome's module limitations.

### Content Script Organization

**content.js** - Single consolidated content script with clear sections:

```javascript
// ============================================================================
// PROGRESS STEPS & UI MAPPING
// ============================================================================
// - PROGRESS_STEPS constants (inlined from ai/providers)
// - STEP_CONFIG with UI text, progress %, and food facts 🍯
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
