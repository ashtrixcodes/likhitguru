import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View, StyleSheet, TextProps, ScrollView } from 'react-native';

interface MarqueeTextProps extends TextProps {
  children: string;
}

export const MarqueeText = ({ children, style, ...props }: MarqueeTextProps) => {
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (textWidth > containerWidth && containerWidth > 0) {
      scrollAnim.setValue(0);
      const distance = textWidth - containerWidth + 20; // scroll past the end by 20px
      const duration = distance * 25; // 25ms per pixel for smooth consistent speed

      Animated.loop(
        Animated.sequence([
          Animated.delay(1000),
          Animated.timing(scrollAnim, {
            toValue: -distance,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.delay(1000),
        ])
      ).start();
    } else {
      scrollAnim.stopAnimation();
      scrollAnim.setValue(0);
    }
    return () => scrollAnim.stopAnimation();
  }, [textWidth, containerWidth, scrollAnim]);

  return (
    <View 
      style={{ overflow: 'hidden', flex: 1 }} 
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={false} style={{ flex: 1 }}>
        <Animated.Text 
          numberOfLines={1}
          onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
          style={[
            style, 
            { transform: [{ translateX: scrollAnim }] }
          ]}
          {...props}
        >
          {children}
        </Animated.Text>
      </ScrollView>
    </View>
  );
};
