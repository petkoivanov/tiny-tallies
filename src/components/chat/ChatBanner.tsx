import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme, spacing, typography, layout, springConfigs } from '@/theme';

interface ChatBannerProps {
  message: string;
  onTap: () => void;
  visible: boolean;
}

/**
 * Floating banner showing the latest tutor message when chat is minimized
 * during TEACH mode. Tapping re-expands the full ChatPanel.
 *
 * Positioned absolute at the top of the screen with z-index above
 * ManipulativePanel. Animates in/out with spring opacity and translateY.
 */
export function ChatBanner({ message, onTap, visible }: ChatBannerProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-60);

  useEffect(() => {
    opacity.value = withSpring(visible ? 1 : 0, springConfigs.heavy);
    translateY.value = withSpring(visible ? 0 : -60, springConfigs.heavy);
  }, [visible, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 15,
    },
    pressable: {
      backgroundColor: '#4338ca',
      borderBottomLeftRadius: layout.borderRadius.lg,
      borderBottomRightRadius: layout.borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: layout.minTouchTarget,
      justifyContent: 'center',
    },
    text: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.md,
      color: colors.textPrimary,
    },
  }), [colors]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]} testID="chat-banner">
      <Pressable
        onPress={onTap}
        style={styles.pressable}
        accessibilityRole="button"
        accessibilityLabel="Expand chat"
      >
        <Text style={styles.text} numberOfLines={2} ellipsizeMode="tail">
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
