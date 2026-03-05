import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import type { RootStackParamList } from '@/navigation/types';
import type { ManipulativeType } from '@/services/cpa/cpaTypes';
import {
  Counters,
  TenFrame,
  BaseTenBlocks,
  NumberLine,
  FractionStrips,
  BarModel,
} from '@/components/manipulatives';
import { SandboxTooltip } from '@/components/home/SandboxTooltip';

/** Render the manipulative component, with type-specific props where needed. */
function renderManipulativeComponent(
  manipulativeType: ManipulativeType,
  testID: string,
): React.ReactNode {
  // TenFrame: always show two frames in sandbox for exploration
  if (manipulativeType === 'ten_frame') {
    return <TenFrame initialFrames={2} testID={testID} />;
  }

  const Component = MANIPULATIVE_COMPONENTS[manipulativeType];
  return <Component testID={testID} />;
}

const MANIPULATIVE_COMPONENTS: Record<ManipulativeType, React.ComponentType<{ testID?: string }>> = {
  counters: Counters,
  ten_frame: TenFrame,
  base_ten_blocks: BaseTenBlocks,
  number_line: NumberLine,
  fraction_strips: FractionStrips,
  bar_model: BarModel,
};

const DISPLAY_NAMES: Record<ManipulativeType, string> = {
  counters: 'Counters',
  ten_frame: 'Ten Frame',
  base_ten_blocks: 'Blocks',
  number_line: 'Number Line',
  fraction_strips: 'Fractions',
  bar_model: 'Bar Model',
};

const TOOLTIP_MESSAGES: Record<ManipulativeType, string> = {
  counters: 'Tap anywhere to add colorful counters!',
  ten_frame: 'Fill the frame by tapping the cells!',
  base_ten_blocks: 'Drag blocks to build big numbers!',
  number_line: 'Slide the marker to explore numbers!',
  fraction_strips: 'Tap to shade parts of each strip!',
  bar_model: 'Split the bar to show parts and wholes!',
};

export default function SandboxScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Sandbox'>>();
  const { colors } = useTheme();
  const { manipulativeType } = route.params;

  const exploredManipulatives = useAppStore(
    (state) => state.exploredManipulatives,
  );
  const markExplored = useAppStore((state) => state.markExplored);

  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const wasExplored = exploredManipulatives.includes(manipulativeType);
    markExplored(manipulativeType);
    if (!wasExplored) {
      setShowTooltip(true);
    }
  }, [manipulativeType]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayName = DISPLAY_NAMES[manipulativeType];

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
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
    workspace: {
      flex: 1,
    },
  }), [colors]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{displayName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Workspace */}
      <View style={styles.workspace}>
        {showTooltip && (
          <SandboxTooltip
            message={TOOLTIP_MESSAGES[manipulativeType]}
            onDismiss={() => setShowTooltip(false)}
          />
        )}
        {renderManipulativeComponent(manipulativeType, `sandbox-${manipulativeType}`)}
      </View>
    </View>
  );
}
