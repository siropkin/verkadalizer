# Privacy Policy for Verkadalizer

**Last Updated: November 23, 2025**

## Overview

Verkadalizer is a Chrome extension that processes food menu images using either OpenAI's API or Google Gemini's API. This privacy policy explains how the extension handles your data.

## Data Collection and Usage

### API Keys
- **What we collect**: Your API key(s) for your chosen AI provider (OpenAI or Google Gemini) that you provide through the extension popup
- **How we store it**: Stored locally in your browser using Chrome's storage API
- **How we use it**: Used exclusively to authenticate requests to your selected AI provider's API for image processing
- **Data sharing**: Your API key is sent directly from your browser to the respective AI provider's servers (OpenAI or Google). We do not collect, transmit, or store your API keys on any external servers

### Images
- **What we process**: Food menu images from Verkada Menu pages that you choose to process
- **How we use them**: Images are sent directly from your browser to your selected AI provider's API for processing
- **Data sharing**: Images are transmitted to your chosen AI provider's servers (OpenAI or Google) for AI processing according to their respective terms of service and privacy policies

### Settings and Preferences
- **What we store**: Your extension settings including AI provider selection, dietary preferences, visual styles, plate styles, and other customization options
- **How we store it**: Stored locally in your browser using Chrome's storage API
- **Data sharing**: This data never leaves your browser

## Third-Party Services

This extension uses AI services from OpenAI and/or Google Gemini. When you use the extension:
- Images and your API key are sent directly to your selected AI provider (OpenAI or Google)
- The respective provider's privacy policy and terms of service apply to this data transmission
- Review privacy policies:
  - OpenAI: https://openai.com/privacy
  - Google AI/Gemini: https://policies.google.com/privacy

## Permissions

The extension requires the following permissions:
- **storage**: To save your API keys and preferences locally
- **host_permissions**:
  - Verkada Menu pages: To inject functionality on these specific pages
  - OpenAI API: To send image processing requests (when using OpenAI provider)
  - Google Gemini API: To send image processing requests (when using Gemini provider)
  - Google User Content: To access menu images hosted on Google's servers

## Data Security

- All settings and API keys are stored locally in your browser
- No data is transmitted to servers controlled by the extension developer
- All communications with AI providers (OpenAI and Google Gemini) use HTTPS encryption

## Data Retention

- Your settings and API keys remain in local browser storage until you uninstall the extension or manually clear them
- No data is retained by the extension developer

## Your Rights

You can:
- Delete your stored API keys and settings at any time through the extension popup
- Switch between AI providers at any time
- Uninstall the extension to remove all locally stored data
- Review the open-source code at: https://github.com/siropkin/verkadalizer

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be reflected in the "Last Updated" date above.

## Contact

For questions or concerns about this privacy policy, please open an issue at:
https://github.com/siropkin/verkadalizer/issues

## Developer Information

- **Developer**: Ivan Seredkin
- **GitHub**: https://github.com/siropkin/verkadalizer
