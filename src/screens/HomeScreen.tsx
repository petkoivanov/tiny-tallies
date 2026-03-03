import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, layout } from '@/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Tiny Tallies</Text>
        <Text style={styles.subtitle}>Math made fun!</Text>
        <Pressable
          onPress={() =>
            navigation.navigate('Session', {
              sessionId: String(Date.now()),
            })
          }
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Start Practice"
        >
          <Text style={styles.buttonText}>Start Practice</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.display,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: layout.borderRadius.lg,
    minHeight: layout.minTouchTarget,
    minWidth: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.primaryDark,
  },
  buttonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
  },
});
