import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View, Pressable } from 'react-native';
import { triggerHapticNotification } from '@/context/HapticsContext';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';

interface CustomGlassAlertProps {
  visible: boolean;
  title: string;
  message: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  buttonColor?: string;
  buttonText?: string;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
}

export default function CustomGlassAlert({
  visible,
  title,
  message,
  iconName = 'lock-closed',
  iconColor = '#F59E0B',
  buttonColor = '#22C55E',
  buttonText,
  cancelText,
  confirmText,
  onConfirm,
  onCancel,
  onClose,
}: CustomGlassAlertProps) {
  const { theme } = useTheme();
  const { isNepali } = useLanguage();
  const { isDark } = theme;

  // 60FPS Animated values
  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const lockShakeAnim = useRef(new Animated.Value(0)).current;
  const pulseGlowAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      triggerHapticNotification(Haptics.NotificationFeedbackType.Warning);
      scaleAnim.setValue(0.4);
      opacityAnim.setValue(0);
      lockShakeAnim.setValue(0);
      pulseGlowAnim.setValue(1);

      // Entrance animation: Spring pop + Fade in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 140,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      // Tactile Lock Shake (snapping closed effect)
      Animated.sequence([
        Animated.delay(120),
        Animated.timing(lockShakeAnim, { toValue: -0.15, duration: 55, useNativeDriver: true }),
        Animated.timing(lockShakeAnim, { toValue: 0.15, duration: 55, useNativeDriver: true }),
        Animated.timing(lockShakeAnim, { toValue: -0.08, duration: 45, useNativeDriver: true }),
        Animated.timing(lockShakeAnim, { toValue: 0, duration: 45, useNativeDriver: true }),
      ]).start();

      // Continuous subtle ambient pulse loop
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseGlowAnim, {
            toValue: 1.15,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseGlowAnim, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      return () => pulseLoop.stop();
    }
  }, [visible]);

  if (!visible) return null;

  const fontStyle = isNepali ? { fontFamily: 'Aakriti', fontWeight: 'normal' as const } : {};
  const fontBoldStyle = isNepali ? { fontFamily: 'AakritiBold', fontWeight: 'normal' as const } : {};

  const defaultBtnText = isNepali ? 'ठीक छ' : 'Understood';
  const finalBtnText = buttonText || defaultBtnText;

  const shakeRotation = lockShakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-45deg', '45deg'],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: opacityAnim }]} pointerEvents="auto">
      <Pressable style={styles.backdrop} onPress={onCancel || onClose} />
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
            backgroundColor: isDark ? 'rgba(24, 28, 38, 0.96)' : 'rgba(255, 255, 255, 0.98)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
      >
        <View style={styles.iconWrapper}>
          {/* Pulsing Outer Glow Ring */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                transform: [{ scale: pulseGlowAnim }],
                borderColor: `${iconColor}33`,
                backgroundColor: isDark ? `${iconColor}15` : `${iconColor}10`,
              },
            ]}
          />

          {/* Lock Icon Circle with Shake / Pop */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ rotate: shakeRotation }],
                backgroundColor: isDark ? `${iconColor}22` : `${iconColor}15`,
                borderColor: `${iconColor}55`,
              },
            ]}
          >
            <Ionicons name={iconName} size={28} color={iconColor} />
          </Animated.View>
        </View>

        <Text style={[styles.title, fontBoldStyle, { color: isDark ? '#FFFFFF' : '#1E293B' }]}>
          {isNepali ? unicodeToAakriti(title) : title}
        </Text>

        <Text style={[styles.message, fontStyle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          {isNepali ? unicodeToAakriti(message) : message}
        </Text>

        {onConfirm ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.dualButton,
                styles.cancelButton,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                },
              ]}
              onPress={onCancel || onClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, fontBoldStyle, { color: isDark ? '#E2E8F0' : '#475569' }]}>
                {isNepali ? unicodeToAakriti(cancelText || 'रद्द गर्नुहोस्') : (cancelText || 'Cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dualButton, { backgroundColor: buttonColor }]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text style={[styles.buttonText, fontBoldStyle, { color: '#FFFFFF' }]}>
                {isNepali ? unicodeToAakriti(confirmText || finalBtnText) : (confirmText || finalBtnText)}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: buttonColor }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={[styles.buttonText, fontBoldStyle, { color: '#FFFFFF' }]}>
              {isNepali ? unicodeToAakriti(finalBtnText) : finalBtnText}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    elevation: 99999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  card: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
    zIndex: 100000,
  },
  iconWrapper: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  glowRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
    borderWidth: 1,
  },
  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  dualButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
