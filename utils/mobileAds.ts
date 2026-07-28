import React from 'react';

let MobileAdsModule: any = null;
let isMobileAdsAvailable = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  MobileAdsModule = require('react-native-google-mobile-ads');
  // Check if native TurboModule is actually present
  if (MobileAdsModule && (MobileAdsModule.default || MobileAdsModule.BannerAd)) {
    isMobileAdsAvailable = true;
  }
} catch {
  // react-native-google-mobile-ads is not supported in this environment (e.g. Expo Go)
  isMobileAdsAvailable = false;
}

export const isAdsAvailable = isMobileAdsAvailable;

export const TestIds = {
  BANNER: isMobileAdsAvailable && MobileAdsModule?.TestIds ? MobileAdsModule.TestIds.BANNER : 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: isMobileAdsAvailable && MobileAdsModule?.TestIds ? MobileAdsModule.TestIds.INTERSTITIAL : 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: isMobileAdsAvailable && MobileAdsModule?.TestIds ? MobileAdsModule.TestIds.REWARDED : 'ca-app-pub-3940256099942544/5224354917',
};

export const BannerAdSize = {
  ANCHORED_ADAPTIVE_BANNER: isMobileAdsAvailable && MobileAdsModule?.BannerAdSize ? MobileAdsModule.BannerAdSize.ANCHORED_ADAPTIVE_BANNER : 'ANCHORED_ADAPTIVE_BANNER',
};

export const AdEventType = {
  LOADED: isMobileAdsAvailable && MobileAdsModule?.AdEventType ? MobileAdsModule.AdEventType.LOADED : 'LOADED',
  ERROR: isMobileAdsAvailable && MobileAdsModule?.AdEventType ? MobileAdsModule.AdEventType.ERROR : 'ERROR',
  CLOSED: isMobileAdsAvailable && MobileAdsModule?.AdEventType ? MobileAdsModule.AdEventType.CLOSED : 'CLOSED',
};

export function initializeMobileAds() {
  if (isMobileAdsAvailable && MobileAdsModule?.default) {
    try {
      return MobileAdsModule.default().initialize();
    } catch (e) {
      console.warn('MobileAds initialize error:', e);
    }
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

export const BannerAd: React.FC<any> = (props) => {
  if (isMobileAdsAvailable && MobileAdsModule?.BannerAd) {
    try {
      const Component = MobileAdsModule.BannerAd;
      return React.createElement(Component, props);
    } catch {
      return null;
    }
  }
  return null;
};

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
