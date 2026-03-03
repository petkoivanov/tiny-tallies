import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Blocks, Image, Hash } from 'lucide-react-native';

import { colors } from '@/theme';
import type { CpaStage } from '@/services/cpa/cpaTypes';

const ICON_SIZE = 18;

const STAGE_ICONS = {
  concrete: Blocks,
  pictorial: Image,
  abstract: Hash,
} as const;

interface CpaModeIconProps {
  stage: CpaStage;
}

/**
 * Small CPA stage indicator icon for the session header.
 * Displays the correct icon for concrete (Blocks), pictorial (Image), or abstract (Hash).
 */
export function CpaModeIcon({ stage }: CpaModeIconProps) {
  const IconComponent = STAGE_ICONS[stage];

  return (
    <View style={styles.container} testID="cpa-mode-icon">
      <IconComponent size={ICON_SIZE} color={colors.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
