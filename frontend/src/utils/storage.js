// Storage utility for NovaPost using LocalStorage with fallback

import { DEFAULT_COLLECTIONS, DEFAULT_ENVIRONMENTS, INITIAL_REQUEST } from './defaultData';

const KEYS = {
  COLLECTIONS: 'novapost_collections',
  ENVIRONMENTS: 'novapost_environments',
  ACTIVE_ENV: 'novapost_active_env',
  HISTORY: 'novapost_history',
  TABS: 'novapost_tabs',
  ACTIVE_TAB_ID: 'novapost_active_tab_id',
  SETTINGS: 'novapost_settings',
};

export function loadCollections() {
  try {
    const data = localStorage.getItem(KEYS.COLLECTIONS);
    return data ? JSON.parse(data) : DEFAULT_COLLECTIONS;
  } catch (e) {
    console.error('Failed to load collections', e);
    return DEFAULT_COLLECTIONS;
  }
}

export function saveCollections(collections) {
  try {
    localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify(collections));
  } catch (e) {
    console.error('Failed to save collections', e);
  }
}

export function loadEnvironments() {
  try {
    const data = localStorage.getItem(KEYS.ENVIRONMENTS);
    return data ? JSON.parse(data) : DEFAULT_ENVIRONMENTS;
  } catch (e) {
    console.error('Failed to load environments', e);
    return DEFAULT_ENVIRONMENTS;
  }
}

export function saveEnvironments(environments) {
  try {
    localStorage.setItem(KEYS.ENVIRONMENTS, JSON.stringify(environments));
  } catch (e) {
    console.error('Failed to save environments', e);
  }
}

export function loadActiveEnvId() {
  try {
    return localStorage.getItem(KEYS.ACTIVE_ENV) || 'env-dev';
  } catch (e) {
    return 'env-dev';
  }
}

export function saveActiveEnvId(id) {
  try {
    localStorage.setItem(KEYS.ACTIVE_ENV, id);
  } catch (e) {
    console.error('Failed to save active environment id', e);
  }
}

export function loadHistory() {
  try {
    const data = localStorage.getItem(KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load history', e);
    return [];
  }
}

export function saveHistory(history) {
  try {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history.slice(0, 100))); // keep latest 100
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function loadTabs() {
  try {
    const data = localStorage.getItem(KEYS.TABS);
    return data ? JSON.parse(data) : [{ ...INITIAL_REQUEST }];
  } catch (e) {
    return [{ ...INITIAL_REQUEST }];
  }
}

export function saveTabs(tabs) {
  try {
    localStorage.setItem(KEYS.TABS, JSON.stringify(tabs));
  } catch (e) {
    console.error('Failed to save tabs', e);
  }
}

export function loadActiveTabId() {
  try {
    return localStorage.getItem(KEYS.ACTIVE_TAB_ID) || 'tab-initial';
  } catch (e) {
    return 'tab-initial';
  }
}

export function saveActiveTabId(id) {
  try {
    localStorage.setItem(KEYS.ACTIVE_TAB_ID, id);
  } catch (e) {
    console.error('Failed to save active tab id', e);
  }
}

export function loadSettings() {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data
      ? JSON.parse(data)
      : {
          theme: 'dark',
          useProxy: false, // Default: direct browser fetch with auto-proxy fallback
          proxyUrl: '/api/proxy',
          timeoutMs: 15000,
        };
  } catch (e) {
    return {
      theme: 'dark',
      useProxy: false,
      proxyUrl: '/api/proxy',
      timeoutMs: 15000,
    };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
