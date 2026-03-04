import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography, layout } from '@/theme';

export type ResponseType = 'understand' | 'more' | 'confused' | 'gotit';

interface ResponseButtonsProps {
  onResponse: (type: ResponseType) => void;
  disabled: boolean;
  mode?: 'standard' | 'gotit';
}

const BUTTONS: { label: string; type: ResponseType; tint?: string }[] = [
  { label: 'I understand!', type: 'understand', tint: 'rgba(22, 101, 52, 0.4)' },
  { label: 'Tell me more', type: 'more' },
  { label: "I'm confused", type: 'confused' },
];

export function ResponseButtons({ onResponse, disabled, mode = 'standard' }: ResponseButtonsProps) {
  if (mode === 'gotit') {
    return (
      <View style={styles.container} testID="response-buttons">
        <Pressable
          onPress={() => onResponse('gotit')}
          disabled={disabled}
          style={[
            styles.gotitButton,
            disabled && styles.buttonDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Got it!"
        >
          <Text style={styles.gotitButtonText}>Got it!</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="response-buttons">
      {BUTTONS.map((btn) => (
        <Pressable
          key={btn.type}
          onPress={() => onResponse(btn.type)}
          disabled={disabled}
          style={[
            styles.button,
            btn.tint ? { backgroundColor: btn.tint } : undefined,
            disabled && styles.buttonDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={btn.label}
        >
          <Text style={styles.buttonText}>{btn.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  button: {
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.md,
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  gotitButton: {
    backgroundColor: 'rgba(22, 101, 52, 0.4)',
    borderRadius: layout.borderRadius.md,
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotitButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
  },
});
