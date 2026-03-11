/**
 * StateSelector — reusable US state chip grid for profile setup and parental controls.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StateCode } from '@/store/slices/childProfileSlice';

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
] as const;

interface StateSelectorProps {
  value: StateCode;
  onChange: (code: StateCode) => void;
  activeColor: string;
  inactiveColor: string;
  activeBorderColor: string;
  inactiveBorderColor: string;
  activeTextColor: string;
  inactiveTextColor: string;
}

export function StateSelector({
  value,
  onChange,
  activeColor,
  inactiveColor,
  activeBorderColor,
  inactiveBorderColor,
  activeTextColor,
  inactiveTextColor,
}: StateSelectorProps) {
  return (
    <View style={styles.grid}>
      {US_STATES.map((st) => (
        <Pressable
          key={st}
          style={[
            styles.chip,
            {
              backgroundColor: value === st ? activeColor : inactiveColor,
              borderColor: value === st ? activeBorderColor : inactiveBorderColor,
            },
          ]}
          onPress={() => onChange(value === st ? null : st)}
          accessibilityRole="button"
          accessibilityLabel={st}
          testID={`state-${st}`}
        >
          <Text
            style={[
              styles.chipText,
              { color: value === st ? activeTextColor : inactiveTextColor },
            ]}
          >
            {st}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
