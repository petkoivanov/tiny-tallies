import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '@/theme';
import { useAppStore } from '@/store/appStore';
import type { ManipulativeType } from '@/services/cpa/cpaTypes';
import { ExploreCard } from './ExploreCard';

interface ExploreItem {
  type: ManipulativeType;
  emoji: string;
  name: string;
  bgColor: string;
}

const EXPLORE_ITEMS: ExploreItem[] = [
  { type: 'counters', emoji: '\u{1F534}', name: 'Counters', bgColor: '#2a1a1a' },
  { type: 'ten_frame', emoji: '\u{1F51F}', name: 'Ten Frame', bgColor: '#1a2a3a' },
  { type: 'base_ten_blocks', emoji: '\u{1F9F1}', name: 'Blocks', bgColor: '#1a2a2a' },
  { type: 'number_line', emoji: '\u{1F4CF}', name: 'Number Line', bgColor: '#2a2a1a' },
  { type: 'fraction_strips', emoji: '\u{1F355}', name: 'Fractions', bgColor: '#2a1a2a' },
  { type: 'bar_model', emoji: '\u{1F4CA}', name: 'Bar Model', bgColor: '#1a2a2a' },
];

export function ExploreGrid() {
  const navigation = useNavigation();
  const exploredManipulatives = useAppStore(
    (state) => state.exploredManipulatives,
  );

  return (
    <View>
      <Text style={styles.header}>Explore</Text>
      <View style={styles.grid}>
        {EXPLORE_ITEMS.map((item) => (
          <ExploreCard
            key={item.type}
            type={item.type}
            emoji={item.emoji}
            name={item.name}
            bgColor={item.bgColor}
            isNew={!exploredManipulatives.includes(item.type)}
            onPress={() =>
              navigation.navigate('Sandbox', {
                manipulativeType: item.type,
              })
            }
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
});
