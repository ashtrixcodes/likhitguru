import React from 'react';
import { Platform } from 'react-native';

let MobileAdsModule: any = null;
let isMobileAdsAvailable = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  MobileAdsModule = require('react-native-google-mobile-ads');
  if (MobileAdsModule && (MobileAdsModule.default || MobileAdsModule.BannerAd)) {
    isMobileAdsAvailable = true;
    console.log('[AdMob] ✅ Native module loaded. Platform:', Platform.OS);
  } else {
    console.warn('[AdMob] Module imported but missing expected exports. Keys:', MobileAdsModule ? Object.keys(MobileAdsModule) : 'null');
  }
} catch (e) {
  console.warn('[AdMob] ❌ Native module not available:', e);
  isMobileAdsAvailable = false;
}

export const isAdsAvailable = isMobileAdsAvailable;

// ─── Your Production AdMob Ad Unit IDs ──────────────────────────────
export const AD_UNITS = {
  BANNER: 'ca-app-pub-9520863212221697/6130790460',
  REWARDED: 'ca-app-pub-9520863212221697/6426303936',
};

// ─── Test IDs - Use the library's built-in Platform-specific test IDs ─
// The library internally uses Platform.select() to return correct IDs per OS
export const TestIds = isMobileAdsAvailable && MobileAdsModule?.TestIds
  ? MobileAdsModule.TestIds
  : {
      BANNER: Platform.select({
        android: 'ca-app-pub-3940256099942544/6300978111',
        ios: 'ca-app-pub-3940256099942544/2934735716',
        default: 'ca-app-pub-3940256099942544/6300978111',
      }),
      ADAPTIVE_BANNER: Platform.select({
        android: 'ca-app-pub-3940256099942544/9214589741',
        ios: 'ca-app-pub-3940256099942544/2435281174',
        default: 'ca-app-pub-3940256099942544/9214589741',
      }),
      INTERSTITIAL: Platform.select({
        android: 'ca-app-pub-3940256099942544/1033173712',
        ios: 'ca-app-pub-3940256099942544/4411468910',
        default: 'ca-app-pub-3940256099942544/1033173712',
      }),
      REWARDED: Platform.select({
        android: 'ca-app-pub-3940256099942544/5224354917',
        ios: 'ca-app-pub-3940256099942544/1712485313',
        default: 'ca-app-pub-3940256099942544/5224354917',
      }),
    };

export const BannerAdSize = isMobileAdsAvailable && MobileAdsModule?.BannerAdSize
  ? MobileAdsModule.BannerAdSize
  : {
      BANNER: 'BANNER',
      LARGE_BANNER: 'LARGE_BANNER',
      MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE',
      FULL_BANNER: 'FULL_BANNER',
      LEADERBOARD: 'LEADERBOARD',
      ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
      INLINE_ADAPTIVE_BANNER: 'INLINE_ADAPTIVE_BANNER',
    };

export const AdEventType = isMobileAdsAvailable && MobileAdsModule?.AdEventType
  ? MobileAdsModule.AdEventType
  : {
      LOADED: 'loaded',
      ERROR: 'error',
      CLOSED: 'closed',
    };

export function initializeMobileAds() {
  if (isMobileAdsAvailable && MobileAdsModule?.default) {
    try {
      console.log('[AdMob] Calling initialize()...');
      return MobileAdsModule.default()
        .initialize()
        .then((statuses: any) => {
          console.log('[AdMob] ✅ initialize() resolved:', JSON.stringify(statuses));
          return statuses;
        });
    } catch (e) {
      console.warn('[AdMob] initialize() threw:', e);
    }
  } else {
    console.warn('[AdMob] Skipping init. available:', isMobileAdsAvailable, 'hasDefault:', !!MobileAdsModule?.default);
  }
  return Promise.resolve([]);
}

export function useRewardedAd(unitId: string, options?: any) {
  if (isMobileAdsAvailable && MobileAdsModule?.useRewardedAd) {
    try {
      return MobileAdsModule.useRewardedAd(unitId, options);
    } catch {
      // Fallback if native module call fails
    }
  }
  return {
    isLoaded: false,
    isClosed: false,
    show: () => {},
    reward: null,
    load: () => {},
  };
}

export function useInterstitialAd(unitId: string, options?: any) {
  if (isMobileAdsAvailable && MobileAdsModule?.useInterstitialAd) {
    try {
      return MobileAdsModule.useInterstitialAd(unitId, options);
    } catch {
      // Fallback
    }
  }
  return {
    isLoaded: false,
    isClosed: false,
    show: () => {},
    load: () => {},
  };
}

// Direct pass-through of the native BannerAd component
// No wrapping in React.createElement — pass the actual component reference
export const BannerAd: React.FC<any> =
  isMobileAdsAvailable && MobileAdsModule?.BannerAd
    ? MobileAdsModule.BannerAd
    : (_props: any) => null;

export const InterstitialAd = {
  createForAdRequest: (unitId: string, options?: any) => {
    if (isMobileAdsAvailable && MobileAdsModule?.InterstitialAd) {
      try {
        return MobileAdsModule.InterstitialAd.createForAdRequest(unitId, options);
      } catch {
        // Fallback
      }
    }
    return {
      load: () => {},
      addAdEventListener: () => () => {},
      show: () => {},
    };
  },
};
