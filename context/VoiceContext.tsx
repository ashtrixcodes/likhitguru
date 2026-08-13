import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type VoiceOption = 'female' | 'male' | 'device';

interface VoiceContextType {
  voiceOption: VoiceOption;
  setVoiceOption: (option: VoiceOption) => void;
}

const STORAGE_KEY = '@app_tts_voice_option';

const VoiceContext = createContext<VoiceContextType>({
  voiceOption: 'female',
  setVoiceOption: () => {},
});

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [voiceOption, setVoiceOptionState] = useState<VoiceOption>('female');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'female' || val === 'male' || val === 'device') {
        setVoiceOptionState(val as VoiceOption);
      }
    }).catch(() => {});
  }, []);

  const setVoiceOption = (option: VoiceOption) => {
    setVoiceOptionState(option);
    AsyncStorage.setItem(STORAGE_KEY, option).catch(() => {});
  };

  return (
    <VoiceContext.Provider value={{ voiceOption, setVoiceOption }}>
      {children}
    </VoiceContext.Provider>
  );
}

export const useVoice = () => useContext(VoiceContext);
