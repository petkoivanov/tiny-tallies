import React from 'react';
import { render } from '@testing-library/react-native';

import { PictorialDiagram } from './PictorialDiagram';
import type { Problem } from '@/services/mathEngine/types';

// Mock react-native-svg with basic component stubs
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');

  const createMockSvgComponent = (name: string) =>
    React.forwardRef(({ children, testID, ...props }: any, ref: any) =>
      React.createElement(View, { ...props, testID: testID || name, ref }, children),
    );

  return {
    __esModule: true,
    default: createMockSvgComponent('Svg'),
    Svg: createMockSvgComponent('Svg'),
    Rect: createMockSvgComponent('Rect'),
    Circle: createMockSvgComponent('Circle'),
    Line: createMockSvgComponent('Line'),
    Text: createMockSvgComponent('SvgText'),
    G: createMockSvgComponent('G'),
    Path: createMockSvgComponent('Path'),
  };
});

const makeProblem = (
  operation: 'addition' | 'subtraction',
  operands: [number, number],
): Problem => ({
  id: 'test-1',
  templateId: 'tpl-1',
  operation,
  operands,
  correctAnswer: operation === 'addition' ? operands[0] + operands[1] : operands[0] - operands[1],
  questionText: `${operands[0]} ${operation === 'addition' ? '+' : '-'} ${operands[1]}`,
  skillId: 'add-single',
  standards: ['1.OA.1'],
  grade: 1 as const,
  baseElo: 400,
  metadata: {
    digitCount: 1,
    requiresCarry: false,
    requiresBorrow: false,
  },
});

describe('PictorialDiagram', () => {
  const additionProblem = makeProblem('addition', [3, 4]);
  const subtractionProblem = makeProblem('subtraction', [8, 3]);

  it('renders CountersDiagram when type is counters', () => {
    const { getByTestId } = render(
      <PictorialDiagram type="counters" problem={additionProblem} />,
    );
    expect(getByTestId('pictorial-diagram-counters')).toBeTruthy();
  });

  it('renders TenFrameDiagram when type is ten_frame', () => {
    const { getByTestId } = render(
      <PictorialDiagram type="ten_frame" problem={additionProblem} />,
    );
    expect(getByTestId('pictorial-diagram-ten_frame')).toBeTruthy();
  });

  it('renders BaseTenBlocksDiagram when type is base_ten_blocks', () => {
    const { getByTestId } = render(
      <PictorialDiagram type="base_ten_blocks" problem={additionProblem} />,
    );
    expect(getByTestId('pictorial-diagram-base_ten_blocks')).toBeTruthy();
  });

  it('renders NumberLineDiagram when type is number_line', () => {
    const { getByTestId } = render(
      <PictorialDiagram type="number_line" problem={additionProblem} />,
    );
    expect(getByTestId('pictorial-diagram-number_line')).toBeTruthy();
  });

  it('renders BarModelDiagram when type is bar_model', () => {
    const { getByTestId } = render(
      <PictorialDiagram type="bar_model" problem={additionProblem} />,
    );
    expect(getByTestId('pictorial-diagram-bar_model')).toBeTruthy();
  });

  it('renders FractionStripsDiagram when type is fraction_strips', () => {
    const { getByTestId } = render(
      <PictorialDiagram type="fraction_strips" problem={additionProblem} />,
    );
    expect(getByTestId('pictorial-diagram-fraction_strips')).toBeTruthy();
  });

  it('renders null for unknown type', () => {
    const { toJSON } = render(
      <PictorialDiagram type={'unknown' as any} problem={additionProblem} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('wraps diagram in a container with maxHeight 120', () => {
    const { getByTestId } = render(
      <PictorialDiagram
        type="counters"
        problem={additionProblem}
        testID="pictorial-container"
      />,
    );
    const container = getByTestId('pictorial-container');
    expect(container.props.style).toEqual(
      expect.objectContaining({ maxHeight: 120 }),
    );
  });

  it('renders subtraction diagram correctly', () => {
    const { getByTestId } = render(
      <PictorialDiagram type="counters" problem={subtractionProblem} />,
    );
    expect(getByTestId('pictorial-diagram-counters')).toBeTruthy();
  });
});
