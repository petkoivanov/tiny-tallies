import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, spacing, typography, layout } from '@/theme';

export interface DialogButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AppDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: DialogButton[];
  onDismiss?: () => void;
}

/**
 * Themed in-app dialog that replaces native Alert.alert.
 *
 * Matches the app's dark/ocean/forest/sunset/space themes.
 * Renders a centered modal with title, optional message, and action buttons.
 */
export function AppDialog({
  visible,
  title,
  message,
  buttons = [{ text: 'OK' }],
  onDismiss,
}: AppDialogProps) {
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    dialog: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: colors.backgroundLight,
      borderRadius: layout.borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.surfaceLight,
      overflow: 'hidden',
    },
    body: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
    },
    title: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.lg,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    message: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    buttonRow: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.surfaceLight,
    },
    button: {
      flex: 1,
      minHeight: layout.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
    },
    buttonPressed: {
      backgroundColor: colors.surface,
    },
    buttonSeparator: {
      width: 1,
      backgroundColor: colors.surfaceLight,
    },
    buttonTextDefault: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.primaryLight,
    },
    buttonTextCancel: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.md,
      color: colors.textSecondary,
    },
    buttonTextDestructive: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.incorrect,
    },
  }), [colors]);

  const getButtonTextStyle = (style?: DialogButton['style']) => {
    switch (style) {
      case 'cancel': return styles.buttonTextCancel;
      case 'destructive': return styles.buttonTextDestructive;
      default: return styles.buttonTextDefault;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.body}>
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>

          <View style={styles.buttonRow}>
            {buttons.map((btn, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={styles.buttonSeparator} />}
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => {
                    btn.onPress?.();
                    onDismiss?.();
                  }}
                  accessibilityRole="button"
                  testID={`dialog-button-${i}`}
                >
                  <Text style={getButtonTextStyle(btn.style)}>{btn.text}</Text>
                </Pressable>
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
