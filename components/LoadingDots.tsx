import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface LoadingDotsProps {
  dotColor?: string;
  activeDotColor?: string;
  size?: number;
}

export default function LoadingDots({ 
  dotColor = '#b3d4fc', 
  activeDotColor = '#6793fb',
  size = 20 
}: LoadingDotsProps) {
  const anim1 = useRef(new Animated.Value(0.8)).current;
  const anim2 = useRef(new Animated.Value(0.8)).current;
  const anim3 = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const createDotAnimation = (animRef: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animRef, {
            toValue: 1.2,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(animRef, {
            toValue: 0.8,
            duration: 750,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Create animations with staggered delays
    const anim1_loop = createDotAnimation(anim1, 300);
    const anim2_loop = createDotAnimation(anim2, 100);
    const anim3_loop = createDotAnimation(anim3, 0);

    // Start animations with initial delay
    setTimeout(() => anim3_loop.start(), 0);    // dot 1: no delay
    setTimeout(() => anim2_loop.start(), 100);  // dot 2: 100ms delay
    setTimeout(() => anim1_loop.start(), 300);  // dot 3: 300ms delay

    return () => {
      anim1_loop.stop();
      anim2_loop.stop();
      anim3_loop.stop();
    };
  }, []);

  const Dot = ({ animRef, isLast }: { animRef: Animated.Value; isLast?: boolean }) => {
    const animatedStyle = {
      transform: [{ scale: animRef }],
    };

    return (
      <Animated.View 
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: dotColor,
            marginRight: isLast ? 0 : 10,
          },
          animatedStyle,
        ]} 
      />
    );
  };

  return (
    <View style={styles.container}>
      <Dot animRef={anim1} />
      <Dot animRef={anim2} />
      <Dot animRef={anim3} isLast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  dot: {
    borderRadius: 10,
  },
});
