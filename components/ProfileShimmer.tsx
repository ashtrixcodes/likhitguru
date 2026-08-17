import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';

interface ShimmerProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
  isDark?: boolean;
}

export function ShimmerBox({ width = 100, height = 16, borderRadius = 8, style, isDark = true }: ShimmerProps) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.75,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.25,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  const baseColor = isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.12)';

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

export function AvatarShimmer({ size = 48, isDark = true, style }: { size?: number; isDark?: boolean; style?: ViewStyle }) {
  return (
    <ShimmerBox
      width={size}
      height={size}
      borderRadius={size / 2}
      isDark={isDark}
      style={style}
    />
  );
}

export function ProfileHeaderSkeleton({ isDark = true }: { isDark?: boolean }) {
  return (
    <View style={styles.headerSkeletonRow}>
      <AvatarShimmer size={48} isDark={isDark} />
      <View style={styles.headerTextSkeletonCol}>
        <ShimmerBox width={100} height={12} borderRadius={6} isDark={isDark} style={{ marginBottom: 6 }} />
        <ShimmerBox width={140} height={18} borderRadius={8} isDark={isDark} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSkeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTextSkeletonCol: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
});
