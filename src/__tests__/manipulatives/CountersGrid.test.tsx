import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { computeGridPositions } from '@/components/manipulatives/Counters/CountersGrid';

describe('computeGridPositions', () => {
  it('computes correct positions for a 3x4 grid', () => {
    const positions = computeGridPositions({
      rows: 3,
      cols: 4,
      cellSize: 44,
      originX: 0,
      originY: 0,
    });

    expect(positions).toHaveLength(12);

    // First row: (0,0), (44,0), (88,0), (132,0)
    expect(positions[0]).toEqual({ x: 0, y: 0 });
    expect(positions[1]).toEqual({ x: 44, y: 0 });
    expect(positions[2]).toEqual({ x: 88, y: 0 });
    expect(positions[3]).toEqual({ x: 132, y: 0 });

    // Second row starts at y = 44
    expect(positions[4]).toEqual({ x: 0, y: 44 });
    expect(positions[7]).toEqual({ x: 132, y: 44 });

    // Third row starts at y = 88
    expect(positions[8]).toEqual({ x: 0, y: 88 });
    expect(positions[11]).toEqual({ x: 132, y: 88 });
  });

  it('computes correct positions for a 1x1 grid at origin', () => {
    const positions = computeGridPositions({
      rows: 1,
      cols: 1,
      cellSize: 44,
      originX: 0,
      originY: 0,
    });

    expect(positions).toHaveLength(1);
    expect(positions[0]).toEqual({ x: 0, y: 0 });
  });

  it('computes correct positions for a 10x10 grid', () => {
    const positions = computeGridPositions({
      rows: 10,
      cols: 10,
      cellSize: 44,
      originX: 0,
      originY: 0,
    });

    expect(positions).toHaveLength(100);

    // Last position: (9*44, 9*44)
    expect(positions[99]).toEqual({ x: 396, y: 396 });
  });

  it('respects originX and originY offsets', () => {
    const positions = computeGridPositions({
      rows: 2,
      cols: 2,
      cellSize: 44,
      originX: 10,
      originY: 20,
    });

    expect(positions).toHaveLength(4);
    expect(positions[0]).toEqual({ x: 10, y: 20 });
    expect(positions[1]).toEqual({ x: 54, y: 20 });
    expect(positions[2]).toEqual({ x: 10, y: 64 });
    expect(positions[3]).toEqual({ x: 54, y: 64 });
  });
});

// Mock reanimated and gesture handler (from jest.setup.js, but ensure here)
// CountersGrid is a pure layout component -- test rendering
describe('CountersGrid component', () => {
  // We import lazily after verifying module exists
  let CountersGrid: any;

  beforeAll(() => {
    const mod = require('@/components/manipulatives/Counters/CountersGrid');
    CountersGrid = mod.CountersGrid;
  });

  it('renders the correct number of counter elements', () => {
    const counters = [
      { id: 'c-0', color: 'red' as const, x: 0, y: 0 },
      { id: 'c-1', color: 'yellow' as const, x: 44, y: 0 },
      { id: 'c-2', color: 'red' as const, x: 0, y: 44 },
    ];

    const { getAllByTestId } = render(
      <CountersGrid
        counters={counters}
        rows={2}
        cols={2}
        onFlip={jest.fn()}
      />,
    );

    // Each counter rendered with testID 'grid-counter-{id}'
    const gridCounters = getAllByTestId(/^grid-counter-/);
    expect(gridCounters).toHaveLength(3);
  });

  it('calls onFlip when a grid counter is pressed', () => {
    const onFlip = jest.fn();
    const counters = [
      { id: 'c-0', color: 'red' as const, x: 0, y: 0 },
    ];

    const { getByTestId } = render(
      <CountersGrid
        counters={counters}
        rows={1}
        cols={1}
        onFlip={onFlip}
      />,
    );

    fireEvent.press(getByTestId('grid-counter-c-0'));
    expect(onFlip).toHaveBeenCalledWith('c-0');
  });
});
