import React, { useEffect, useMemo } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Blocks, ChevronUp, ChevronDown } from 'lucide-react-native';

import { useTheme, spacing, typography, layout } from '@/theme';

/** Panel height: ~50% of screen for generous manipulative workspace. */
const PANEL_HEIGHT = Dimensions.get('window').height * 0.5;

/** Spring config for panel slide animation (~300ms perceptual spring). */
const PANEL_SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
  overshootClamping: true,
} as const;

const TOGGLE_ICON_SIZE = 20;
const CHEVRON_SIZE = 16;

interface ManipulativePanelProps {
  expanded: boolean;
  onToggle: () => void;
  manipulativeLabel?: string;
  children: React.ReactNode;
  testID?: string;
}

/**
 * Animated bottom drawer panel for manipulative workspace.
 *
 * Slides up/down with a spring animation. Toggle button with label sits above
 * the panel body. No pan gesture -- tap-only toggle to avoid gesture conflicts
 * with manipulatives inside the panel.
 */
export function ManipulativePanel({
  expanded,
  onToggle,
  manipulativeLabel,
  children,
  testID,
}: ManipulativePanelProps) {
  const { colors } = useTheme();
  const translateY = useSharedValue(PANEL_HEIGHT);

  useEffect(() => {
    translateY.value = withSpring(
      expanded ? 0 : PANEL_HEIGHT,
      PANEL_SPRING_CONFIG,
    );
  }, [expanded, translateY]);

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const label = manipulativeLabel ?? 'blocks';
  const toggleLabel = expanded ? `Hide ${label}` : `Show ${label}`;
  const ChevronIcon = expanded ? ChevronDown : ChevronUp;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      overflow: 'hidden',
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      minHeight: layout.minTouchTarget,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
      borderTopLeftRadius: layout.borderRadius.lg,
      borderTopRightRadius: layout.borderRadius.lg,
    },
    toggleLabel: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.md,
      color: colors.textSecondary,
    },
    panelBody: {
      height: PANEL_HEIGHT,
      backgroundColor: colors.backgroundLight,
      borderTopWidth: 1,
      borderTopColor: colors.surfaceLight,
    },
  }), [colors]);

  return (
    <View style={styles.container} testID={testID}>
      {/* Toggle Button */}
      <Pressable
        onPress={onToggle}
        style={styles.toggleButton}
        accessibilityRole="button"
        accessibilityLabel={toggleLabel}
        testID="manipulative-toggle"
      >
        <Blocks size={TOGGLE_ICON_SIZE} color={colors.textSecondary} />
        <Text style={styles.toggleLabel}>{toggleLabel}</Text>
        <ChevronIcon size={CHEVRON_SIZE} color={colors.textSecondary} />
      </Pressable>

      {/* Panel Body */}
      <Animated.View style={[styles.panelBody, panelAnimatedStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}
