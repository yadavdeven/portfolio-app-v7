import {
  initializeSslPinning,
  disableSslPinning,
  isSslPinningAvailable,
} from 'react-native-ssl-public-key-pinning';
import { createMMKV } from 'react-native-mmkv';

// Custom domain in front of API Gateway. We use this (not the default
// *.execute-api.*.amazonaws.com URL) because AWS regional domains are on the
// Public Suffix List and TrustKit refuses to pin them ("invalid domain").
const API_HOST = 'api.deven-portfolio.xyz';

// Public-key (SPKI SHA-256) pins for API_HOST. Pinning passes if ANY cert in
// the presented chain matches ANY pin; iOS requires at least two.
//  - leaf (api.deven-portfolio.xyz): tightest, our exact cert key
//  - Amazon RSA 2048 M01 (intermediate): backup so ACM leaf rotation can't brick us
const PIN_CONFIG = {
  [API_HOST]: {
    includeSubdomains: false,
    publicKeyHashes: [
      'gUshJfFZtqGmhLTxllVsa1R6In8knbGFn8RTXKcls/I=', // primary (leaf)
      'DxH4tt40L+eduF6szpY6TONlxhZhBd+pJ9wbHlQ2fuw=', // backup (intermediate)
    ],
  },
};

export const enablePinning = async () => {
  if (!isSslPinningAvailable()) return false;
  await initializeSslPinning(PIN_CONFIG);
  return true;
};

export const disablePinning = () => disableSslPinning();

// ── Persisted toggle (DEMO) ───────────────────────────────────────
// Pinning is configured natively at startup, so a live in-app flip can be
// defeated by pooled HTTP/2 connections. We persist the desired state in MMKV
// (synchronous reads — no startup race) and apply it on launch; a relaunch
// after toggling makes the change deterministic.
const prefs = createMMKV({ id: 'ssl-pinning' });
const PIN_PREF_KEY = 'enabled';

// Defaults to OFF so the demo can show the vulnerable state first.
export const isPinningPreferenceOn = (): boolean =>
  prefs.getBoolean(PIN_PREF_KEY) ?? false;

export const setPinningPreference = (on: boolean) => {
  prefs.set(PIN_PREF_KEY, on);
};

// Apply the persisted preference to the native layer. Call once at app startup
// (before any request) so the native HTTP client is built with the right config.
export const applyPinningFromPreference = async () => {
  if (isPinningPreferenceOn()) {
    await enablePinning();
  } else {
    await disablePinning();
  }
};
