# Privacy Policy for Verkadalizer

**Last Updated: October 8, 2025**

## Overview

Verkadalizer is a Chrome extension that processes food menu images using OpenAI's API. This privacy policy explains how the extension handles your data.

## Data Collection and Usage

### OpenAI API Key
- **What we collect**: Your OpenAI API key that you provide through the extension popup
- **How we store it**: Stored locally in your browser using Chrome's storage API
- **How we use it**: Used exclusively to authenticate requests to OpenAI's API for image processing
- **Data sharing**: Your API key is sent directly from your browser to OpenAI's servers. We do not collect, transmit, or store your API key on any external servers

### Images
- **What we process**: Food menu images from Verkada Menu pages that you choose to process
- **How we use them**: Images are sent directly from your browser to OpenAI's API for processing
- **Data sharing**: Images are transmitted to OpenAI's servers for AI processing according to OpenAI's terms of service and privacy policy

### Settings and Preferences
- **What we store**: Your extension settings including model selection, custom prompts, output size preferences, and food preferences
- **How we store it**: Stored locally in your browser using Chrome's storage API
- **Data sharing**: This data never leaves your browser

## Third-Party Services

This extension uses OpenAI's API service. When you use the extension:
- Images and your API key are sent directly to OpenAI
- OpenAI's privacy policy and terms of service apply to this data transmission
- Review OpenAI's privacy policy at: https://openai.com/privacy

## Permissions

The extension requires the following permissions:
- **activeTab**: To detect and process images on the current tab
- **storage**: To save your API key and preferences locally
- **host_permissions**:
  - Verkada Menu pages: To inject functionality on these specific pages
  - OpenAI API: To send image processing requests
  - Google User Content: To access menu images hosted on Google's servers

## Data Security

- All settings and API keys are stored locally in your browser
- No data is transmitted to servers controlled by the extension developer
- All communications with OpenAI use HTTPS encryption

## Data Retention

- Your settings and API key remain in local browser storage until you uninstall the extension or manually clear them
- No data is retained by the extension developer

## Your Rights

You can:
- Delete your stored API key and settings at any time through the extension popup
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
