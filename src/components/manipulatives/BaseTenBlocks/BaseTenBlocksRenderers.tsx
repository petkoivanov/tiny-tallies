/**
 * Visual renderers for base-ten block types.
 *
 * - CubeBlock: 36x36 ones cube
 * - RodBlock: 36x108 tens rod with internal grid lines (10 subdivisions)
 * - FlatBlock: 108x108 hundreds flat with 10x10 grid
 *
 * All blocks use the same blue color family. Size differentiates place value.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import {
  BLOCK_COLOR,
  BLOCK_BORDER,
  BLOCK_LIGHT,
} from './BaseTenBlocksTypes';
import { CUBE_SIZE, ROD_WIDTH, ROD_HEIGHT, FLAT_SIZE } from './BaseTenBlocksLayout';

// ---------------------------------------------------------------------------
// CubeBlock -- ones unit (36x36dp)
// ---------------------------------------------------------------------------

export function CubeBlock() {
  return <View style={styles.cube} />;
}

// ---------------------------------------------------------------------------
// RodBlock -- tens unit (36x108dp) with internal grid lines
// ---------------------------------------------------------------------------

export function RodBlock() {
  // Show 9 internal horizontal lines to hint at 10 cube subdivisions
  const gridLines: React.ReactElement[] = [];
  const segmentHeight = ROD_HEIGHT / 10;
  for (let i = 1; i < 10; i++) {
    gridLines.push(
      <View
        key={i}
        style={[
          styles.rodGridLine,
          { top: segmentHeight * i },
        ]}
      />,
    );
  }

  return (
    <View style={styles.rod}>
      {gridLines}
    </View>
  );
}

// ---------------------------------------------------------------------------
// FlatBlock -- hundreds unit (108x108dp) with 10x10 grid
// ---------------------------------------------------------------------------

export function FlatBlock() {
  const gridLines: React.ReactElement[] = [];
  const segmentSize = FLAT_SIZE / 10;

  // 9 horizontal lines
  for (let i = 1; i < 10; i++) {
    gridLines.push(
      <View
        key={`h-${i}`}
        style={[
          styles.flatHLine,
          { top: segmentSize * i },
        ]}
      />,
    );
  }

  // 9 vertical lines
  for (let i = 1; i < 10; i++) {
    gridLines.push(
      <View
        key={`v-${i}`}
        style={[
          styles.flatVLine,
          { left: segmentSize * i },
        ]}
      />,
    );
  }

  return (
    <View style={styles.flat}>
      {gridLines}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  cube: {
    width: CUBE_SIZE,
    height: CUBE_SIZE,
    backgroundColor: BLOCK_COLOR,
    borderWidth: 1.5,
    borderColor: BLOCK_BORDER,
    borderRadius: 4,
  },
  rod: {
    width: ROD_WIDTH,
    height: ROD_HEIGHT,
    backgroundColor: BLOCK_COLOR,
    borderWidth: 1.5,
    borderColor: BLOCK_BORDER,
    borderRadius: 4,
    overflow: 'hidden',
  },
  rodGridLine: {
    position: 'absolute',
    left: 2,
    right: 2,
    height: 1,
    backgroundColor: BLOCK_LIGHT,
  },
  flat: {
    width: FLAT_SIZE,
    height: FLAT_SIZE,
    backgroundColor: BLOCK_COLOR,
    borderWidth: 1.5,
    borderColor: BLOCK_BORDER,
    borderRadius: 6,
    overflow: 'hidden',
  },
  flatHLine: {
    position: 'absolute',
    left: 2,
    right: 2,
    height: 1,
    backgroundColor: BLOCK_LIGHT,
  },
  flatVLine: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    width: 1,
    backgroundColor: BLOCK_LIGHT,
  },
});
