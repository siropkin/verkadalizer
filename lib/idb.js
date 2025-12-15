// ============================================================================
// IDB - Minimal IndexedDB wrapper for the extension
// ============================================================================

const DB_NAME = 'verkadalizer';
const DB_VERSION = 1;

/** @type {IDBDatabase|null} */
let dbInstance = null;

/**
 * Open (or return cached) IndexedDB connection
 * @returns {Promise<IDBDatabase>}
 */
export function openDB() {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message || 'Unknown error'}`));
    };

    request.onsuccess = () => {
      dbInstance = request.result;

      // Handle connection closing unexpectedly
      dbInstance.onclose = () => {
        dbInstance = null;
      };

      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Create object stores on first run or version upgrade
      if (!db.objectStoreNames.contains('generatedImages')) {
        const store = db.createObjectStore('generatedImages', { keyPath: 'requestId' });
        // Index for TTL cleanup (find oldest entries)
        store.createIndex('createdAt', 'createdAt', { unique: false });
        // Index for LRU eviction (find least recently accessed)
        store.createIndex('lastAccessedAt', 'lastAccessedAt', { unique: false });
      }
    };
  });
}

/**
 * Get a value from an object store by key
 * @param {string} storeName - Name of the object store
 * @param {string} key - Key to retrieve
 * @returns {Promise<any|null>}
 */
export async function idbGet(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(new Error(`IDB get failed: ${request.error?.message || 'Unknown'}`));
  });
}

/**
 * Put (insert or update) a value in an object store
 * @param {string} storeName - Name of the object store
 * @param {object} value - Value to store (must include keyPath field)
 * @returns {Promise<void>}
 */
export async function idbPut(storeName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(value);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`IDB put failed: ${request.error?.message || 'Unknown'}`));
  });
}

/**
 * Delete a value from an object store by key
 * @param {string} storeName - Name of the object store
 * @param {string} key - Key to delete
 * @returns {Promise<void>}
 */
export async function idbDelete(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`IDB delete failed: ${request.error?.message || 'Unknown'}`));
  });
}

/**
 * Get all values from an object store
 * @param {string} storeName - Name of the object store
 * @returns {Promise<any[]>}
 */
export async function idbGetAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error(`IDB getAll failed: ${request.error?.message || 'Unknown'}`));
  });
}

/**
 * Count entries in an object store
 * @param {string} storeName - Name of the object store
 * @returns {Promise<number>}
 */
export async function idbCount(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`IDB count failed: ${request.error?.message || 'Unknown'}`));
  });
}

/**
 * Clear all entries from an object store
 * @param {string} storeName - Name of the object store
 * @returns {Promise<void>}
 */
export async function idbClear(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`IDB clear failed: ${request.error?.message || 'Unknown'}`));
  });
}

