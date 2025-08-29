# Verkadalizer Chrome Extension

A Chrome extension that automatically processes food menu images from Verkada Menu pages using OpenAI's "Create image edit" API and "gpt-image-1" model to create beautiful, appetizing visualizations.

## Features

- **Automatic Image Detection**: Automatically finds and processes menu images on Verkada Menu pages (https://sites.google.com/verkada.com/verkada-menu) - basically it should be 7 images on the page but we need to take from 2 to the 6 (first is a logo and last i don't know)
- **Image Generation**: Creates new, appetizing food visualizations using "Create image edit" API and "gpt-image-1"
- **Manual Processing**: Processes images when user clicks special button
- **Error Handling**: Includes retry logic and graceful error handling (0 retrues by default)
- **User Notifications**: Shows status notifications for processing events
- **Configurable Prompts**: Customizable prompts for image analysis and generation

## Default prompt

```
You are a specialized AI designed to analyze food menus and visualize individual menu items. Your task is to process an input image containing a food menu and then create a new, composite image.

**Input:** An image of a food menu (e.g., a photograph of a printed menu).

**Task:**
1.  **Analyze the Input Image:** Read and parse the text from the provided food menu image to identify individual menu items.
2.  **Visualize Menu Items:** For each identified menu item, generate a realistic, high-quality visual representation of the dish.
3.  **Place Visualizations:** Integrate these generated dish visualizations into the original menu image.
4.  **Plate Specifics:**
    * For dishes served in a deep bowl or on a deep plate (e.g., soup, stew, pasta), use a **deep blue** plate.
    * For dishes served on a flat plate (e.g., steak, salad, sandwich), use a **white** plate.

**Output:** A single, high-resolution composite image where each menu item from the original menu is replaced or accompanied by a generated visual representation of the food, displayed on the specified plate color.
```

## How It Works

1. **Image Detection**: The extension scans the page for images hosted on Google's servers (typical for Verkada Menu images)

2. **Image Generation**:

3. **Image Replacement**: The original image is replaced with the AI-generated version
