import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useVoice, VoiceOption } from '@/context/VoiceContext';
import { useHaptics } from '@/context/HapticsContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';

export default function VoiceToggle() {
  const { voiceOption, setVoiceOption } = useVoice();
  const { triggerImpact } = useHaptics();
  const { theme } = useTheme();
  const { isNepali } = useLanguage();
  const { isDark } = theme;

  const handleSelect = (option: VoiceOption) => {
    triggerImpact();
    setVoiceOption(option);
  };

  const s = createStyles(isDark, isNepali);

  return (
    <View style={s.container}>
      <TouchableOpacity
        style={[s.optionBtn, voiceOption === 'female' && s.activeBtn]}
        onPress={() => handleSelect('female')}
        activeOpacity={0.7}
      >
        <Text style={[s.btnText, voiceOption === 'female' && s.activeText]}>
          {isNepali ? unicodeToAakriti('महिला') : 'Female'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.optionBtn, voiceOption === 'male' && s.activeBtn]}
        onPress={() => handleSelect('male')}
        activeOpacity={0.7}
      >
        <Text style={[s.btnText, voiceOption === 'male' && s.activeText]}>
          {isNepali ? unicodeToAakriti('पुरुष') : 'Male'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.optionBtn, voiceOption === 'device' && s.activeBtn]}
        onPress={() => handleSelect('device')}
        activeOpacity={0.7}
      >
        <Text style={[s.btnText, voiceOption === 'device' && s.activeText]}>
          {isNepali ? unicodeToAakriti('सिस्टम') : 'System'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(isDark: boolean, isNepali: boolean) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 10,
      padding: 2,
    },
    optionBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    activeBtn: {
      backgroundColor: '#22C55E',
    },
    btnText: {
      fontSize: isNepali ? 14 : 11,
      fontWeight: isNepali ? 'normal' : '600',
      color: isDark ? '#94A3B8' : '#64748B',
      fontFamily: isNepali ? 'AakritiBold' : undefined,
    },
    activeText: {
      color: '#FFFFFF',
    },
  });
}
