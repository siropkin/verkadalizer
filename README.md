# Verkadalizer Chrome Extension

<img src="images/verkadalizer.png" alt="Verkadalizer Chrome Extension"/>

A Chrome extension that transforms food menu images on Verkada Menu pages into beautiful, appetizing visualizations using a sophisticated two-stage AI pipeline powered by OpenAI (GPT-4o + GPT-Image-1) or Google Gemini (Gemini 3 Pro + Gemini 3 Pro Image).

## Features

### Core Functionality

- **Smart Image Detection**: Automatically detects menu images on Verkada Menu pages (`https://sites.google.com/verkada.com/verkada-menu`) and adds interactive control buttons
- **Two-Stage AI Processing Pipeline** (Choose between OpenAI or Google Gemini):
  - **Stage 1**: AI analyzes the menu text and intelligently selects dishes based on your dietary preferences
    - **OpenAI**: GPT-4o vision model
    - **Google Gemini**: Gemini 3 Pro
  - **Stage 2**: AI generates a photorealistic visualization of the selected dishes
    - **OpenAI**: GPT-Image-1 for high-quality image generation
    - **Google Gemini**: Gemini 3 Pro Image for professional 2K/4K image generation with superior text rendering
- **Smart Image Controls**: Interactive buttons for each menu image:
  - ✨🍕 **Generate** - Process the menu image with AI
  - **Show Original** - Toggle back to the original menu
  - **Show Generated** - Toggle to the AI-generated visualization
  - **Stop** - Cancel ongoing processing

### Dietary Preferences

Choose from 8 dietary preference options that guide AI dish selection:

- 🍽️ **Regular (Default)** - All menu items available with no restrictions
- 🥗 **Vegetarian** - Plant-based with eggs & dairy (no meat, poultry, or fish)
- 🌱 **Vegan** - Strictly plant-based (no animal products including dairy and eggs)
- 🌾 **Gluten Free** - No wheat, barley, rye, or gluten-containing ingredients
- 🥛 **Dairy Free** - No milk, cheese, butter, cream, or dairy products
- 💪 **Healthy** - Nutrient-dense, balanced meals with lean proteins and vegetables
- 🥩 **High Protein** - Protein-forward dishes with substantial meat, fish, eggs, or legumes
- 🥑 **Keto** - High-fat, low-carb with no bread, pasta, rice, or sugar

### Image Styles

Choose from 4 unified image styles that combine plate design with visual aesthetics:

**Verkada Styles:**

- 🍽️ **Verkada Classic (Default)** - Blue and white Verkada plates with moody, realistic film photography
- ⚡ **Verkada Cyberpunk** - Blue and white Verkada plates with futuristic neon lighting
- 🌺 **Verkada Grandmillennial** - Blue and white Verkada plates with bold maximalist styling

**Universal Styles:**

- 📷 **Verkada Rustic (Filmic)** - Blue and white Verkada plates with deep, moody, realistic film photography

### Menu Translation

Translate menu text into multiple languages while preserving the original layout and typography:

- 🏳️ **No Translation (Default)** - Keep original menu text overlaid on AI-generated background
- 🇺🇸 **English (US)** - Translate menu to US English
- 🇫🇷 **French** - Translate menu to French
- 🇪🇸 **Spanish** - Translate menu to Spanish
- 🇯🇵 **Japanese** - Translate menu to Japanese
- 🇰🇷 **Korean** - Translate menu to Korean
- 🇵🇹 **Portuguese** - Translate menu to Portuguese
- 🇷🇺 **Russian** - Translate menu to Russian
- 🇨🇳 **Chinese** - Translate menu to Simplified Chinese
- 🇩🇪 **German** - Translate menu to German
- 🇳🇱 **Dutch** - Translate menu to Dutch
- 🇩🇰 **Danish** - Translate menu to Danish

**Translation Features:**

- Preserves original menu layout and spatial structure
- Maintains text hierarchy (headers, descriptions, prices)
- Keeps alignment and spacing consistent with original
- High-quality typography with clear, legible text
- Full semantic translation (not transliteration)

### User Experience

- **Real-Time Progress Tracking**: Animated progress bar with percentage and status updates
- **Visual Feedback**: Branded overlay with smooth animations and clear status messages
- **Error Handling**: Comprehensive error recovery with user-friendly messages
- **Image Preservation**: Maintains original dimensions and layout seamlessly

## Installation

1. Clone or download repository: `https://github.com/siropkin/verkadalizer`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked" and select the extension directory
5. Click the extension icon and configure your AI provider and API key

## Configuration

Click the extension icon to access settings:

- **AI Provider**: Choose between OpenAI or Google Gemini
  - **OpenAI**: Uses GPT-4o for menu analysis and GPT-Image-1 for image generation
  - **Google Gemini**: Uses Gemini 3 Pro for menu analysis and Gemini 3 Pro Image for generation
- **API Key**: Your personal API key for the selected provider (stored securely in local browser storage)
  - **OpenAI API Key**: Required when using OpenAI provider
  - **Gemini API Key**: Required when using Google Gemini provider
- **Dietary Preference**: Select your dietary preference from 8 options (affects dish selection in Stage 1)
- **Image Style**: Choose from 4 unified styles that combine plate design and photography aesthetics
- **Translation Language**: Translate menu text into 12 languages while preserving original layout (default: No Translation)

## How It Works

### 1. Image Detection & Setup

- Scans pages for images hosted on `googleusercontent.com` with the `=w1280` parameter
- Injects interactive control buttons next to each detected menu image
- Assigns a unique food emoji to each image for personality

### 2. Stage 1: Intelligent Menu Analysis

When you click the generate button:

- Extracts text from the menu image using OCR
- Sends to your selected AI provider (GPT-4o or Gemini 3 Pro) with your dietary preference
- AI analyzes and selects 6-8 appropriate dishes based on:
  - Dietary constraints (e.g., vegan, gluten-free)
  - Visual appeal and variety
  - Menu theme and cuisine type
- Gemini 3 Pro uses advanced multimodal understanding for superior text recognition
- Returns structured JSON with selected dishes and visual descriptions

### 3. Stage 2: Photorealistic Image Generation

Using the parsed menu data and selected image style:

- Builds a detailed image generation prompt with:
  - Unified image style combining plate design and visual aesthetics (e.g., Verkada Classic, Verkada Rustic, etc.)
  - Style-specific plate types matched to dish categories (ceramic, stoneware, wooden boards, porcelain)
  - Style-specific lighting, background, surface, color palette, atmosphere, and camera settings
  - Composition layout (top 1/3 clear for text, bottom 2/3 for food)
  - Photorealism requirements (textures, lighting, organic presentation)
  - **Optional Translation**: If translation is enabled, AI translates menu text while preserving original layout/typography
- Sends to your selected AI provider for image creation:
  - **OpenAI**: GPT-Image-1 for high-quality photorealistic images
  - **Google Gemini**: Gemini 3 Pro Image for professional 2K resolution with native text rendering and "thinking mode" for optimal composition
- Receives professional-quality food photography visualization in your chosen unified style
- **Translation Processing** (if enabled):
  - AI translates all menu text to selected language (12 languages supported)
  - Preserves spatial structure, hierarchy, alignment, and spacing of original menu
  - Maintains high-quality typography with clear, legible text rendering

### 4. Display & Interaction

- Replaces original image with generated visualization
- Enables toggle buttons to switch between original and generated versions
- Preserves exact dimensions for seamless layout integration

## Technical Details

### Architecture

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: `storage` (for API keys and preferences)
- **Host Permissions**: Verkada Menu pages, OpenAI API, Google Gemini API, Google User Content
- **Components**:
  - `content.js` - UI injection, image detection, progress tracking
  - `background.js` - AI orchestration, two-stage processing pipeline, request management, translation handling
  - `popup.js/html` - Settings interface with AI provider and translation language selection
  - `ai/providers/` - Modular AI provider implementations (OpenAI, Gemini)
  - `ai/prompts/` - Menu parsing and translation prompt generators

### AI Integration

#### OpenAI Provider

- **GPT-4o**: Vision-based menu text analysis and intelligent dish selection
- **GPT-Image-1**: High-quality photorealistic image generation with advanced control

#### Google Gemini Provider

- **Gemini 3 Pro**: Advanced vision model with superior multimodal understanding (71.8% MMMU benchmark)
  - Enhanced OCR and text recognition for menu parsing
  - Complex image reasoning with knowledge cutoff January 2025
- **Gemini 3 Pro Image** (Nano Banana Pro): State-of-the-art image generation model
  - Native 2K/4K resolution support (currently configured for 2K, 16:9 aspect ratio)
  - Advanced text rendering for legible menu item labels
  - "Thinking mode" for optimal composition planning
  - Supports up to 14 reference images for consistent styling

#### Features

- **Modular Architecture**: Easy to add new AI providers
- **Provider Selection**: Choose provider dynamically in settings
- **Prompt Engineering**: Sophisticated multi-stage prompting with dietary modifiers
- **Output Size**: Default 1536×1024 (optimized for menu layouts)

### Processing Pipeline

1. Request initialization with unique ID
2. Progress tracking system (0-100%) with status updates
3. Stage 1: Menu parsing (~30-50% progress)
4. Stage 2: Image generation (~50-95% progress)
5. Image merging and display (~95-100% progress)
6. Cleanup and UI state management

### Advanced Features

- **Concurrent Request Management**: Handles multiple simultaneous image processing requests
- **AbortController Integration**: Cancellable requests with proper cleanup
- **Progress State Machine**: Real-time updates via message passing
- **Canvas Manipulation**: Intelligent image resizing and rendering
