// ============================================================================
// MESSAGE PROTOCOL - Shared (documented) data-flow contracts
// ============================================================================
// This module is intentionally lightweight: it primarily documents the runtime
// messaging protocol between `content.js` <-> `background.js` and the shapes
// flowing through the AI provider layer.

/**
 * @typedef {Object} ProgressState
 * @property {string} step - Progress step identifier (see `ai/providers/progress-steps.js`)
 * @property {Object} extra - Optional extra payload for UI (provider/background-defined)
 * @property {number} timestamp - Epoch millis when progress was last updated
 */

/**
 * @typedef {Object} ProcessImageRequest
 * @property {string} action - ACTIONS.PROCESS_IMAGE
 * @property {string} imageUrl
 * @property {string} requestId
 */

/**
 * @typedef {Object} CancelRequest
 * @property {string} action - ACTIONS.CANCEL_REQUEST
 * @property {string} requestId
 */

/**
 * @typedef {Object} GetProgressRequest
 * @property {string} action - ACTIONS.GET_PROGRESS
 * @property {string} requestId
 */

/**
 * @typedef {Object} GetProgressResponse
 * @property {boolean} success
 * @property {string} [step]
 * @property {Object} [extra]
 * @property {number} [timestamp]
 * @property {string} [error]
 */

/**
 * @typedef {Object} ProcessImageResult
 * @property {boolean} success
 * @property {string} [b64] - Base64 (png) image, without data-url prefix
 * @property {boolean} [canceled]
 * @property {string} [error]
 */

/**
 * @typedef {'openai'|'gemini'} ProviderType
 */

/**
 * @typedef {Object} ProviderMeta
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} AiProvider
 * @property {ProviderMeta} meta
 * @property {(params: {imageUrl: string, dietaryPreference: string, apiKey: string, updateProgress: (step: string, extra?: Object) => void}) => Promise<any>} parseMenu
 * @property {(params: {prompt: string, imageBlob: Blob, apiKey: string, signal: AbortSignal}) => Promise<string>} generateImage
 * @property {(params: {prompt: string, imageBlob: Blob, apiKey: string, signal: AbortSignal}) => Promise<string>} translateMenuImage
 */

export {};
