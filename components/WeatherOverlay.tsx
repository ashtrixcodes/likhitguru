import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

// ─── Weather Types ───────────────────────────────────────────────────
type WeatherTime = 'morning' | 'afternoon' | 'evening' | 'night';

// ─── Memoized Clouds Component to prevent re-render animation resets ───
const DriftingClouds = memo(function DriftingClouds({ weather }: { weather: WeatherTime }) {
  // Animate drifting 7 clouds
  const driftAnim1 = useRef(new Animated.Value(0)).current;
  const driftAnim2 = useRef(new Animated.Value(0)).current;
  const driftAnim3 = useRef(new Animated.Value(0)).current;
  const driftAnim4 = useRef(new Animated.Value(0)).current;
  const driftAnim5 = useRef(new Animated.Value(0)).current;
  const driftAnim6 = useRef(new Animated.Value(0)).current;
  const driftAnim7 = useRef(new Animated.Value(0)).current;

  // Cloud drift setup
  useEffect(() => {
    const screenWidth = Dimensions.get('window').width;
    const startX = -150;
    const endX = screenWidth + 150;
    const totalDistance = endX - startX;

    const startCloudAnim = (
      anim: Animated.Value,
      initialX: number,
      baseDuration: number
    ) => {
      const firstDistance = endX - initialX;
      const firstDuration = baseDuration * (firstDistance / totalDistance);

      anim.setValue(initialX);

      const firstAnim = Animated.timing(anim, {
        toValue: endX,
        duration: firstDuration,
        useNativeDriver: true,
      });

      let loopAnim: { start: () => void; stop: () => void } | null = null;

      firstAnim.start(({ finished }) => {
        if (finished) {
          anim.setValue(startX);
          loopAnim = Animated.loop(
            Animated.timing(anim, {
              toValue: endX,
              duration: baseDuration,
              useNativeDriver: true,
            })
          );
          loopAnim.start();
        }
      });

      return {
        stop: () => {
          firstAnim.stop();
          if (loopAnim) {
            loopAnim.stop();
          }
        },
      };
    };

    // Staggered cloud setups: (anim, initialX, baseDuration)
    // Distribute starting positions uniformly across the screen and stagger durations
    // for a natural parallax effect (foreground moves faster, background slower)
    const activeAnim1 = startCloudAnim(driftAnim1, screenWidth * 0.10, 45000); // Foreground (Fast)
    const activeAnim2 = startCloudAnim(driftAnim2, screenWidth * 0.75, 65000); // Midground (Medium)
    const activeAnim3 = startCloudAnim(driftAnim3, screenWidth * 0.40, 110000); // Background (Very slow)
    const activeAnim4 = startCloudAnim(driftAnim4, -100, 55000);              // Foreground Lower (Medium-fast, starts left of screen)
    const activeAnim5 = startCloudAnim(driftAnim5, screenWidth * 0.25, 85000); // Midground-Foreground (Slow)
    const activeAnim6 = startCloudAnim(driftAnim6, screenWidth * 0.90, 120000); // Background (Very slow)
    const activeAnim7 = startCloudAnim(driftAnim7, screenWidth * 0.55, 75000); // Midground (Medium-slow)

    return () => {
      activeAnim1.stop();
      activeAnim2.stop();
      activeAnim3.stop();
      activeAnim4.stop();
      activeAnim5.stop();
      activeAnim6.stop();
      activeAnim7.stop();
    };
  }, [
    driftAnim1,
    driftAnim2,
    driftAnim3,
    driftAnim4,
    driftAnim5,
    driftAnim6,
    driftAnim7,
  ]);

  const getOpacity = (defaultOpacity: number, eveningOpacity: number, nightOpacity: number) => {
    if (weather === 'night') return nightOpacity;
    if (weather === 'evening') return eveningOpacity;
    return defaultOpacity;
  };

  return (
    <>
      {/* Cloud 3 (Smallest / Background) */}
      <Animated.Image
        source={require('@/assets/images/cloud.png')}
        style={[
          styles.cloudImage,
          {
            transform: [{ translateX: driftAnim3 }],
            opacity: getOpacity(0.22, 0.12, 0.06),
            top: 33,
            width: 70,
            height: 35,
          }
        ]}
        resizeMode="contain"
      />
      {/* Cloud 6 (Small-Medium / Background) */}
      <Animated.Image
        source={require('@/assets/images/cloud.png')}
        style={[
          styles.cloudImage,
          {
            transform: [{ translateX: driftAnim6 }],
            opacity: getOpacity(0.18, 0.1, 0.05),
            top: 37,
            width: 85,
            height: 42,
          }
        ]}
        resizeMode="contain"
      />
      {/* Cloud 1 (Largest / Foreground) */}
      <Animated.Image
        source={require('@/assets/images/cloud.png')}
        style={[
          styles.cloudImage,
          {
            transform: [{ translateX: driftAnim1 }],
            opacity: getOpacity(0.36, 0.22, 0.1),
            top: 47,
            width: 125,
            height: 60,
          }
        ]}
        resizeMode="contain"
      />
      {/* Cloud 5 (Large / Midground-Foreground) */}
      <Animated.Image
        source={require('@/assets/images/cloud.png')}
        style={[
          styles.cloudImage,
          {
            transform: [{ translateX: driftAnim5 }],
            opacity: getOpacity(0.32, 0.2, 0.09),
            top: 57,
            width: 135,
            height: 68,
          }
        ]}
        resizeMode="contain"
      />
      {/* Cloud 2 (Medium / Midground) */}
      <Animated.Image
        source={require('@/assets/images/cloud.png')}
        style={[
          styles.cloudImage,
          {
            transform: [{ translateX: driftAnim2 }],
            opacity: getOpacity(0.26, 0.16, 0.07),
            top: 70,
            width: 95,
            height: 48,
          }
        ]}
        resizeMode="contain"
      />
      {/* Cloud 7 (Medium-Large / Midground) */}
      <Animated.Image
        source={require('@/assets/images/cloud.png')}
        style={[
          styles.cloudImage,
          {
            transform: [{ translateX: driftAnim7 }],
            opacity: getOpacity(0.24, 0.15, 0.07),
            top: 77,
            width: 105,
            height: 52,
          }
        ]}
        resizeMode="contain"
      />
      {/* Cloud 4 (Medium-Large / Foreground Lower) */}
      <Animated.Image
        source={require('@/assets/images/cloud.png')}
        style={[
          styles.cloudImage,
          {
            transform: [{ translateX: driftAnim4 }],
            opacity: getOpacity(0.25, 0.14, 0.07),
            top: 90,
            width: 110,
            height: 55,
          }
        ]}
        resizeMode="contain"
      />
    </>
  );
});

/**
 * WeatherOverlay Component
 *
 * Renders a full-bleed sky background overlay in the header.
 * Automatically adapts:
 * - If Dark Mode is active: Stars and moon (night theme).
 * - If Light Mode is active: Dynamically changes based on local hour
 *   (Sunrise for Morning, Sky Blue for Afternoon, Sunset for Evening, Moon/Stars for Night).
 */
export default function WeatherOverlay() {
  const { theme } = useTheme();

  // Twinkling stars opacity
  const twinkleAnim1 = useRef(new Animated.Value(0.3)).current;
  const twinkleAnim2 = useRef(new Animated.Value(0.5)).current;
  const twinkleAnim3 = useRef(new Animated.Value(0.2)).current;

  // Star twinkling setup
  useEffect(() => {
    const twinkle = (anim: Animated.Value, duration: number, min: number, max: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: max,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: min,
            duration: duration,
            useNativeDriver: true,
          })
        ])
      ).start();
    };

    twinkle(twinkleAnim1, 1800, 0.2, 0.95);
    twinkle(twinkleAnim2, 2400, 0.35, 1.0);
    twinkle(twinkleAnim3, 1400, 0.1, 0.8);
  }, [twinkleAnim1, twinkleAnim2, twinkleAnim3]);

  // Determine current weather theme
  const getWeatherTime = (): WeatherTime => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
  };

  const weather = getWeatherTime();

  // Gradients for each time of day (adapt to dark mode if active)
  const getGradientColors = (): [string, string, ...string[]] => {
    if (theme.isDark) {
      switch (weather) {
        case 'morning':
          // Darker, deeper sunrise peach/gold
          return ['#8A3522', '#A36037'];
        case 'afternoon':
          // Darker sky blue
          return ['#0D3C8A', '#1C5AA3'];
        case 'evening':
          // Darker sunset violet/dusky peach
          return ['#220C47', '#733744', '#9E5D38'];
        case 'night':
        default:
          // Deeper starry midnight
          return ['#040810', '#0D1726'];
      }
    }

    switch (weather) {
      case 'morning':
        // Soft peach to warm gold sunrise
        return ['#FF7E5F', '#FEB47B'];
      case 'afternoon':
        // Rich sky blue
        return ['#1E88E5', '#64B5F6'];
      case 'evening':
        // Sunset gradient (deep violet to dusky peach)
        return ['#3A1C71', '#D76D77', '#FFAF7B'];
      case 'night':
      default:
        // Starry midnight blue
        return ['#091020', '#152238'];
    }
  };

  return (
    <View style={styles.overlayContainer}>
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ─── Morning Sun (Glowing Core & Halo Layers) ─── */}
      {weather === 'morning' && (
        <View style={[styles.sunContainer, { right: -20, top: -15 }]}>
          <View style={[styles.halo, { width: 110, height: 110, borderRadius: 55, backgroundColor: '#FFE082', opacity: 0.15 }]} />
          <View style={[styles.halo, { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFE082', opacity: 0.3 }]} />
          <LinearGradient
            colors={['#FFFFFF', '#FFE082', '#FFB300']}
            style={[styles.sunCore, { width: 65, height: 65, borderRadius: 32.5 }]}
          />
        </View>
      )}

      {/* ─── Afternoon Sun (Bright Glow & Halo Layers) ─── */}
      {weather === 'afternoon' && (
        <View style={[styles.sunContainer, { right: -15, top: -10 }]}>
          <View style={[styles.halo, { width: 105, height: 105, borderRadius: 52.5, backgroundColor: '#FFF59D', opacity: 0.15 }]} />
          <View style={[styles.halo, { width: 85, height: 85, borderRadius: 42.5, backgroundColor: '#FFF59D', opacity: 0.3 }]} />
          <LinearGradient
            colors={['#FFFFFF', '#FFF9C4', '#FDD835']}
            style={[styles.sunCore, { width: 60, height: 60, borderRadius: 30 }]}
          />
        </View>
      )}

      {/* ─── Evening Sun (Sunset Setting Core & Halo Layers) ─── */}
      {weather === 'evening' && (
        <View style={[styles.sunContainer, { right: -10, top: 5 }]}>
          <View style={[styles.halo, { width: 95, height: 95, borderRadius: 47.5, backgroundColor: '#FF7043', opacity: 0.15 }]} />
          <View style={[styles.halo, { width: 75, height: 75, borderRadius: 37.5, backgroundColor: '#FF7043', opacity: 0.3 }]} />
          <LinearGradient
            colors={['#FFE082', '#FF7043', '#D84315']}
            style={[styles.sunCore, { width: 50, height: 50, borderRadius: 25 }]}
          />
        </View>
      )}

      {/* ─── Clouds (Daytime themes) ─── */}
      <DriftingClouds weather={weather} />

      {/* ─── Moon and Twinkling Stars (Night / Dark Mode) ─── */}
      {weather === 'night' && (
        <>
          {/* Twinkling Stars */}
          <Animated.View style={[styles.star, { top: 18, left: 35, opacity: twinkleAnim1 }]} />
          <Animated.View style={[styles.star, { top: 40, left: 90, opacity: twinkleAnim2 }]} />
          <Animated.View style={[styles.star, { top: 12, left: 160, opacity: twinkleAnim3 }]} />
          <Animated.View style={[styles.star, { top: 32, left: 240, opacity: twinkleAnim1 }]} />
          <Animated.View style={[styles.star, { top: 50, left: 290, opacity: twinkleAnim2 }]} />
          <Animated.View style={[styles.star, { top: 10, left: 320, opacity: twinkleAnim3 }]} />

          {/* Glowing Crescent Moon */}
          <View style={styles.moon} />
        </>
      )}
    </View>
  );
}

// ─── Weather Elements Styles ──────────────────────────────────────────
const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  // Sun Styles
  sunContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  halo: {
    position: 'absolute',
  },
  sunCore: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 5,
  },
  // Star Styles
  star: {
    position: 'absolute',
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 2,
  },
  // Crescent Moon Style (Pure Border CSS Trick)
  moon: {
    position: 'absolute',
    right: 15,
    top: 40,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderLeftWidth: 7,
    borderBottomWidth: 7,
    borderColor: '#FFFDE7',
    backgroundColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
    shadowColor: '#FFFDE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 3,
  },
  cloudImage: {
    position: 'absolute',
  },
});
