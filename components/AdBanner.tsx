import React, { useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BannerAd, BannerAdSize } from '@/utils/mobileAds';

// Official AdMob test Banner ID is used in development mode (__DEV__)
// Swap 'YOUR_IOS_BANNER_AD_UNIT_ID' and 'YOUR_ANDROID_BANNER_AD_UNIT_ID' when deploying to production.
const BANNER_AD_UNIT_ID = 'ca-app-pub-9520863212221697/6130790460';

export default function AdBanner() {
  const [hasError, setHasError] = useState(false);

  // If the ad fails to load, collapse the container to avoid blank space
  if (hasError) {
    return null;
  }

  return (
    <View style={styles.adContainer}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true, // Follow privacy best practices
        }}
        onAdFailedToLoad={(error: any) => {
          console.warn('Google Mobile Ads: Banner failed to load', error);
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
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
});
