import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useLanguage } from '@/context/LanguageContext';
import { useVoice } from '@/context/VoiceContext';
import { triggerHapticLight } from '@/context/HapticsContext';

interface QuestionSpeechButtonProps {
  rawNepaliText: string;
  englishText?: string;
  options?: string[];
  size?: number;
}

// ─── Global Singleton Audio Controller ──────────────────────────────
// Ensures only ONE question card audio plays at any time app-wide!
let globalActiveSound: Audio.Sound | null = null;
let globalStopListener: (() => void) | null = null;

export async function stopGlobalSpeech() {
  try {
    if (globalStopListener) {
      globalStopListener();
      globalStopListener = null;
    }
    if (globalActiveSound) {
      await globalActiveSound.stopAsync().catch(() => {});
      await globalActiveSound.unloadAsync().catch(() => {});
      globalActiveSound = null;
    }
    Speech.stop().catch(() => {});
  } catch (e) {
    // ignore cleanup errors
  }
}

export default function QuestionSpeechButton({
  rawNepaliText,
  englishText,
  options,
  size = 18,
}: QuestionSpeechButtonProps) {
  const { isNepali } = useLanguage();
  const { voiceOption } = useVoice();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Stop speech when component unmounts or text/language/voice changes
  useEffect(() => {
    return () => {
      if (globalStopListener === handleInstanceStop) {
        stopGlobalSpeech();
      }
    };
  }, [rawNepaliText, englishText, isNepali, voiceOption]);

  const handleInstanceStop = () => {
    setIsSpeaking(false);
  };

  // Pulse animation when speaking
  useEffect(() => {
    if (isSpeaking) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
  }, [isSpeaking]);

  const speakWithNativeEngine = async (text: string, voiceType: 'female' | 'male' | 'device') => {
    try {
      const voices = await Speech.getAvailableVoicesAsync().catch(() => []);
      let targetLanguage = isNepali ? 'ne-NP' : 'en-US';
      let selectedVoiceIdentifier: string | undefined = undefined;
      let pitchValue = 1.0;

      if (voiceType === 'male') {
        pitchValue = 0.72;
        const maleVoice = voices.find(v =>
          ((v as any).gender === 'male' ||
           v.name.toLowerCase().includes('male') ||
           v.name.toLowerCase().includes('daniel') ||
           v.name.toLowerCase().includes('rishi') ||
           v.name.toLowerCase().includes('arthur') ||
           v.name.toLowerCase().includes('aaron')) &&
          (isNepali ? (v.language.toLowerCase().startsWith('ne') || v.language.toLowerCase().startsWith('hi')) : v.language.toLowerCase().startsWith('en'))
        );
        if (maleVoice) {
          selectedVoiceIdentifier = maleVoice.identifier;
          targetLanguage = maleVoice.language;
        } else if (isNepali) {
          const hindiVoice = voices.find(v => v.language && v.language.toLowerCase().startsWith('hi'));
          if (hindiVoice) targetLanguage = hindiVoice.language;
        }
      } else if (voiceType === 'female') {
        pitchValue = 1.12;
        const femaleVoice = voices.find(v =>
          ((v as any).gender === 'female' ||
           v.name.toLowerCase().includes('female') ||
           v.name.toLowerCase().includes('samantha') ||
           v.name.toLowerCase().includes('karen') ||
           v.name.toLowerCase().includes('victoria')) &&
          (isNepali ? (v.language.toLowerCase().startsWith('ne') || v.language.toLowerCase().startsWith('hi')) : v.language.toLowerCase().startsWith('en'))
        );
        if (femaleVoice) {
          selectedVoiceIdentifier = femaleVoice.identifier;
          targetLanguage = femaleVoice.language;
        } else if (isNepali) {
          const hindiVoice = voices.find(v => v.language && v.language.toLowerCase().startsWith('hi'));
          if (hindiVoice) targetLanguage = hindiVoice.language;
        }
      } else {
        pitchValue = 1.0;
        if (isNepali) {
          const nepaliVoice = voices.find(v => v.language && v.language.toLowerCase().startsWith('ne'));
          const hindiVoice = voices.find(v => v.language && v.language.toLowerCase().startsWith('hi'));
          targetLanguage = nepaliVoice ? nepaliVoice.language : (hindiVoice ? hindiVoice.language : 'hi-IN');
        }
      }

      Speech.speak(text, {
        language: targetLanguage,
        voice: selectedVoiceIdentifier,
        pitch: pitchValue,
        rate: isNepali ? 0.82 : 0.88,
        onDone: () => {
          setIsSpeaking(false);
          if (globalStopListener === handleInstanceStop) {
            globalStopListener = null;
          }
        },
        onStopped: () => {
          setIsSpeaking(false);
        },
        onError: () => {
          setIsSpeaking(false);
        },
      });
    } catch (err) {
      setIsSpeaking(false);
    }
  };

  const handleToggleSpeech = async () => {
    triggerHapticLight();

    // If THIS specific card is currently speaking, stop it
    if (isSpeaking) {
      await stopGlobalSpeech();
      return;
    }

    // Stop ANY currently playing audio across ALL cards first!
    await stopGlobalSpeech();

    const rawText = isNepali ? (rawNepaliText || englishText || '') : (englishText || rawNepaliText || '');
    if (!rawText) return;

    // Clean text for speech: strip trailing punctuation symbols
    const cleanedText = rawText.replace(/[?!।:;,]/g, ' ').trim();
    if (!cleanedText) return;

    // Register this button as active global speaker
    globalStopListener = handleInstanceStop;
    setIsSpeaking(true);

    if (voiceOption === 'device') {
      await speakWithNativeEngine(cleanedText, 'device');
      return;
    }

    // High-definition Neural Studio Voice Endpoints:
    // Female Voice: Amazon Polly Joanna Studio Neural Voice
    // Male Voice: Amazon Polly Brian Studio Neural Voice
    // Nepali Voice: Google Neural Devanagari Voice Engine
    let ttsUrl = '';
    if (isNepali) {
      ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ne&q=${encodeURIComponent(cleanedText)}`;
    } else if (voiceOption === 'female') {
      ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=Joanna&text=${encodeURIComponent(cleanedText)}`;
    } else if (voiceOption === 'male') {
      ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(cleanedText)}`;
    } else {
      ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(cleanedText)}`;
    }

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
      }).catch(() => {});

      const { sound } = await Audio.Sound.createAsync(
        { uri: ttsUrl },
        { shouldPlay: true, volume: 1.0 }
      );

      globalActiveSound = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            stopGlobalSpeech();
          }
        } else if (status.error) {
          speakWithNativeEngine(cleanedText, voiceOption);
        }
      });
    } catch (e) {
      speakWithNativeEngine(cleanedText, voiceOption);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleToggleSpeech}
      activeOpacity={0.7}
      style={styles.container}
      accessibilityLabel="Listen to question text-to-speech"
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          styles.iconContainer,
          isSpeaking && styles.iconContainerSpeaking,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Ionicons
          name={isSpeaking ? 'volume-high' : 'volume-medium-outline'}
          size={size}
          color={isSpeaking ? '#22C55E' : '#94A3B8'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSpeaking: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22C55E',
  },
});
