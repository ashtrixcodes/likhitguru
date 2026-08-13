import React from 'react';
import { Switch } from 'react-native';
import { useHaptics } from '@/context/HapticsContext';

export default function HapticsToggle() {
  const { hapticsEnabled, setHapticsEnabled, triggerImpact } = useHaptics();

  const handleValueChange = async (val: boolean) => {
    await setHapticsEnabled(val);
    if (val) {
      triggerImpact();
    }
  };

  return (
    <Switch
      value={hapticsEnabled}
      onValueChange={handleValueChange}
      trackColor={{ false: '#64748B', true: '#22C55E' }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="#64748B"
    />
  );
}
