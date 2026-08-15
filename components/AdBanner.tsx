import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, AD_UNITS, isAdsAvailable } from '@/utils/mobileAds';

// Real Production AdMob Banner Ad Unit
const adUnitId = AD_UNITS.BANNER;

export default function AdBanner() {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('[AdBanner] Mount. isAdsAvailable:', isAdsAvailable, 'Platform:', Platform.OS, 'unitId:', adUnitId, '__DEV__:', __DEV__);
  }, []);

  if (!isAdsAvailable) {
    return null;
  }

  if (hasError) {
    return null;
  }

  return (
    <View style={styles.adContainer}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('[AdBanner] ✅ Ad loaded successfully on', Platform.OS);
        }}
        onAdFailedToLoad={(error: any) => {
          console.warn('[AdBanner] ❌ Ad FAILED on', Platform.OS, '| unitId:', adUnitId, '| error:', JSON.stringify(error));
          setHasError(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  adContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
