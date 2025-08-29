# Verkadalizer Chrome Extension

A Chrome extension that processes food menu images from Verkada Menu pages using OpenAI's Image Edit API to create beautiful, appetizing visualizations of menu items.

## Features

- **Automatic Image Detection**: Automatically detects menu images on Verkada Menu pages (`https://sites.google.com/verkada.com/verkada-menu`) by filtering for Google User Content images with specific parameters
- **Manual Processing**: Click individual ✨🍕 buttons on each menu image to process them one by one
- **Smart Image Sizing**: Automatically selects optimal OpenAI image dimensions (1024x1024, 1536x1024, or 1024x1536) based on original image aspect ratio
- **Visual Feedback**: Shows animated spinner overlays during processing with branded styling
- **Settings Management**: Configure OpenAI API key, model, and custom prompts through the extension popup
- **Image Preservation**: Maintains original image dimensions through intelligent canvas resizing
- **Error Handling**: Comprehensive error handling with fallback mechanisms

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory
5. Configure your OpenAI API key in the extension popup

## Configuration

Click the extension icon to configure:

- **OpenAI API Key**: Your personal API key (stored locally)
- **Model**: Default is `gpt-image-1` (OpenAI's image editing model)
- **Processing Prompt**: Customize how the AI processes menu images

## Default Prompt

```
You are a specialized AI designed to analyze food menus and visualize individual menu items. Your task is to process an input image containing a food menu and then create a new, composite image.

**Input:** An image of a food menu (e.g., a photograph of a printed menu).

**Task:**
1. **Analyze the Input Image:** Read and parse the text from the provided food menu image to identify individual menu items.
2. **Visualize Menu Items:** For each identified menu item, generate a realistic, high-quality visual representation of the dish.
3. **Place Visualizations:** Integrate these generated dish visualizations into the original menu image.
4. **Plate Specifics:**
   * For dishes served in a deep bowl or on a deep plate (e.g., soup, stew, pasta), use a **deep blue** plate.
   * For dishes served on a flat plate (e.g., steak, salad, sandwich), use a **white** plate.

**Output:** A single, high-resolution composite image where each menu item from the original menu is replaced or accompanied by a generated visual representation of the food, displayed on the specified plate color.
```

## How It Works

1. **Image Detection**: Scans pages for images hosted on `googleusercontent.com` with the `=w1280` parameter (typical for Verkada Menu images)
2. **Button Injection**: Adds colorful ✨🍕 processing buttons to each detected menu image
3. **Image Processing**: 
   - Fetches the original image and converts to base64
   - Sends to OpenAI's Image Edit API with the configured prompt
   - Receives processed image with food visualizations
   - Replaces original image while maintaining dimensions
4. **Visual Enhancement**: Uses canvas manipulation to ensure processed images fit perfectly in the original layout

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: `activeTab`, `storage`
- **Host Permissions**: Verkada Menu pages, OpenAI API, Google User Content
- **Architecture**: Content script + service worker + popup interface
- **Image Processing**: Base64 encoding, FormData API, Canvas resizing
