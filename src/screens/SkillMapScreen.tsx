import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { colors, spacing, typography, layout } from '@/theme';

export default function SkillMapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [_selectedSkillId, _setSelectedSkillId] = useState<string | null>(null);

  const hasDimensions = containerSize.width > 0 && containerSize.height > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="back-button"
        >
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Skill Map</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Graph Container */}
      <View
        style={styles.graphContainer}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setContainerSize({ width, height });
        }}
      >
        {!hasDimensions ? (
          <Text style={styles.loadingText}>Loading skill map...</Text>
        ) : (
          <>
            {/* Column Headers */}
            <View style={styles.columnHeaders}>
              <Text style={[styles.columnLabel, styles.columnLabelLeft]}>
                Addition
              </Text>
              <Text style={[styles.columnLabel, styles.columnLabelRight]}>
                Subtraction
              </Text>
            </View>

            {/* Grade Indicators */}
            <View style={styles.gradeIndicators}>
              <Text style={styles.gradeLabel}>Grade 1</Text>
              <Text style={styles.gradeLabel}>Grade 2</Text>
              <Text style={styles.gradeLabel}>Grade 3</Text>
            </View>

            {/* Skill Map Container (Plan 02 replaces with SkillMapGraph) */}
            <View
              testID="skill-map-container"
              style={styles.skillMapPlaceholder}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    height: 56,
  },
  backButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: layout.minTouchTarget,
  },
  graphContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  columnHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  columnLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  columnLabelLeft: {
    width: '30%',
    textAlign: 'center',
  },
  columnLabelRight: {
    width: '30%',
    textAlign: 'center',
  },
  gradeIndicators: {
    position: 'absolute',
    left: spacing.xs,
    top: spacing.xl,
    bottom: spacing.xl,
    justifyContent: 'space-around',
    zIndex: 1,
  },
  gradeLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    transform: [{ rotate: '-90deg' }],
    width: 60,
  },
  skillMapPlaceholder: {
    flex: 1,
  },
});
