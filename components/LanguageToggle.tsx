import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const { theme } = useTheme();
  const isNepali = language === 'np';

  const handlePress = useCallback(() => {
    toggleLanguage();
  }, [toggleLanguage]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.colors.headerAccent,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      accessibilityLabel={isNepali ? 'Switch to English' : 'नेपालीमा फेर्नुहोस्'}
      accessibilityRole="button"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View style={styles.content}>
        <Ionicons name="language" size={16} color={theme.colors.headerText} />
        <Text style={[styles.text, { color: theme.colors.headerText }]}>
          {isNepali ? 'नेपाली' : 'ENG'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
