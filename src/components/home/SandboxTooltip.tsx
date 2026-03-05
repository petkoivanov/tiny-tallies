import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useTheme, spacing, typography, layout } from '@/theme';

interface SandboxTooltipProps {
  message: string;
  onDismiss: () => void;
}

export function SandboxTooltip({ message, onDismiss }: SandboxTooltipProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      top: spacing.lg,
      alignSelf: 'center',
      backgroundColor: 'rgba(15, 52, 96, 0.9)',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: layout.borderRadius.lg,
      zIndex: 10,
    },
    text: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.md,
      color: colors.textPrimary,
      textAlign: 'center',
    },
  }), [colors]);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss, opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}
