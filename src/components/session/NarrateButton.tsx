/**
 * Narrate button — reads problem text aloud using device TTS.
 *
 * Tap to start narration, tap again to stop.
 * Speech rate adjusts by child age (slower for younger kids).
 * Stops automatically when problem advances or component unmounts.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';

import { layout, spacing } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { narrate, stop as stopNarration } from '@/services/narration';

interface NarrateButtonProps {
  text: string;
  /** Reset key — stops narration when this changes (e.g. currentIndex) */
  resetKey: number;
  primaryColor: string;
  primaryLightColor: string;
  testID?: string;
}

export function NarrateButton({
  text,
  resetKey,
  primaryColor,
  primaryLightColor,
  testID = 'narrate-button',
}: NarrateButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const childAge = useAppStore((s) => s.childAge);

  const handlePress = useCallback(async () => {
    if (isSpeaking) {
      await stopNarration();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      await narrate(text, childAge);
      setIsSpeaking(false);
    }
  }, [isSpeaking, text, childAge]);

  // Stop narration when problem changes
  useEffect(() => {
    stopNarration();
    setIsSpeaking(false);
  }, [resetKey]);

  // Stop on unmount
  useEffect(() => {
    return () => { stopNarration(); };
  }, []);

  return (
    <Pressable
      onPress={handlePress}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={isSpeaking ? 'Stop reading' : 'Read aloud'}
      testID={testID}
    >
      {isSpeaking ? (
        <VolumeX size={22} color={primaryColor} />
      ) : (
        <Volume2 size={22} color={primaryLightColor} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
});
