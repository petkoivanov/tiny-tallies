/**
 * Skill Map screen displaying the interactive skill tree visualization.
 *
 * Reads BKT skill states from Zustand, computes outer fringe IDs, and
 * renders the SkillMapGraph component after layout dimensions are known.
 * Uses InteractionManager to defer graph rendering until after the
 * navigation transition completes (prevents entrance animation conflicts).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { InteractionManager, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

import { useAppStore } from '@/store/appStore';
import { getOuterFringe } from '@/services/adaptive/prerequisiteGating';
import { colors, spacing, typography, layout } from '@/theme';
import { SkillMapGraph } from '@/components/skillMap/SkillMapGraph';
import { SkillDetailOverlay } from '@/components/skillMap/SkillDetailOverlay';

export default function SkillMapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const skillStates = useAppStore((state) => state.skillStates);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Defer rendering until navigation transition completes
  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => handle.cancel();
  }, []);

  const outerFringeIds = useMemo(
    () => getOuterFringe(skillStates),
    [skillStates],
  );

  const hasDimensions = containerSize.width > 0 && containerSize.height > 0;
  const canRender = hasDimensions && ready;

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
        testID="skill-map-container"
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setContainerSize({ width, height });
        }}
      >
        {!canRender ? (
          <Text style={styles.loadingText}>Loading skill map...</Text>
        ) : (
          <SkillMapGraph
            width={containerSize.width}
            height={containerSize.height}
            skillStates={skillStates}
            outerFringeIds={outerFringeIds}
            onNodePress={setSelectedSkillId}
          />
        )}
      </View>

      {/* Detail overlay (renders above everything via React Native Modal) */}
      <SkillDetailOverlay
        skillId={selectedSkillId}
        skillStates={skillStates}
        onClose={() => setSelectedSkillId(null)}
      />
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
});
