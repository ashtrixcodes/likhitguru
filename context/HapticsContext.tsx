import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export const HAPTICS_STORAGE_KEY = '@app_haptics_enabled';

let globalHapticsEnabled = true;

export const isHapticsEnabledGlobal = () => globalHapticsEnabled;

export const triggerHapticLight = async () => {
  if (!globalHapticsEnabled) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (e) {}
};

export const triggerHapticMedium = async () => {
  if (!globalHapticsEnabled) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (e) {}
};

export const triggerHapticNotification = async (
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success
) => {
  if (!globalHapticsEnabled) return;
  try {
    await Haptics.notificationAsync(type);
  } catch (e) {}
};

export const triggerHapticSelection = async () => {
  if (!globalHapticsEnabled) return;
  try {
    await Haptics.selectionAsync();
  } catch (e) {}
};

interface HapticsContextType {
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  triggerImpact: (style?: Haptics.ImpactFeedbackStyle) => Promise<void>;
  triggerSelection: () => Promise<void>;
  triggerNotification: (type?: Haptics.NotificationFeedbackType) => Promise<void>;
}

const HapticsContext = createContext<HapticsContextType | undefined>(undefined);

export function HapticsProvider({ children }: { children: React.ReactNode }) {
  const [hapticsEnabled, setHapticsEnabledState] = useState<boolean>(true);

  useEffect(() => {
    AsyncStorage.getItem(HAPTICS_STORAGE_KEY)
      .then((val) => {
        if (val !== null) {
          const isEnabled = val === 'true';
          setHapticsEnabledState(isEnabled);
          globalHapticsEnabled = isEnabled;
        }
      })
      .catch(() => {});
  }, []);

  const setHapticsEnabled = async (enabled: boolean) => {
    setHapticsEnabledState(enabled);
    globalHapticsEnabled = enabled;
    try {
      await AsyncStorage.setItem(HAPTICS_STORAGE_KEY, enabled ? 'true' : 'false');
    } catch (e) {
      console.warn('Failed to save haptics preference:', e);
    }
  };

  const triggerImpact = async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.impactAsync(style);
    } catch (e) {}
  };

  const triggerSelection = async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.selectionAsync();
    } catch (e) {}
  };

  const triggerNotification = async (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.notificationAsync(type);
    } catch (e) {}
  };

  return (
    <HapticsContext.Provider
      value={{
        hapticsEnabled,
        setHapticsEnabled,
        triggerImpact,
        triggerSelection,
        triggerNotification,
      }}
    >
      {children}
    </HapticsContext.Provider>
  );
}

export function useHaptics() {
  const context = useContext(HapticsContext);
  if (!context) {
    return {
      hapticsEnabled: globalHapticsEnabled,
      setHapticsEnabled: async (enabled: boolean) => {
        globalHapticsEnabled = enabled;
        try {
          await AsyncStorage.setItem(HAPTICS_STORAGE_KEY, enabled ? 'true' : 'false');
        } catch (e) {}
      },
      triggerImpact: async (style?: Haptics.ImpactFeedbackStyle) => {
        if (!globalHapticsEnabled) return;
        try { await Haptics.impactAsync(style || Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
      },
      triggerSelection: async () => {
        if (!globalHapticsEnabled) return;
        try { await Haptics.selectionAsync(); } catch (e) {}
      },
      triggerNotification: async (type?: Haptics.NotificationFeedbackType) => {
        if (!globalHapticsEnabled) return;
        try { await Haptics.notificationAsync(type || Haptics.NotificationFeedbackType.Success); } catch (e) {}
      },
    };
  }
  return context;
}
