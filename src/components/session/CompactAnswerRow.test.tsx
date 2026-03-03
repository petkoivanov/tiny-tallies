import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { CompactAnswerRow } from './CompactAnswerRow';

describe('CompactAnswerRow', () => {
  const defaultOptions = [
    { value: 5 },
    { value: 7 },
    { value: 8 },
    { value: 12 },
  ];

  const defaultProps = {
    options: defaultOptions,
    onAnswer: jest.fn(),
    feedbackActive: false,
    selectedAnswer: null as number | null,
    correctAnswer: null as number | null,
    showCorrectAnswer: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders 4 answer buttons', () => {
    const { getAllByRole } = render(<CompactAnswerRow {...defaultProps} />);
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });

  it('displays option values as button text', () => {
    const { getByText } = render(<CompactAnswerRow {...defaultProps} />);
    expect(getByText('5')).toBeTruthy();
    expect(getByText('7')).toBeTruthy();
    expect(getByText('8')).toBeTruthy();
    expect(getByText('12')).toBeTruthy();
  });

  it('calls onAnswer with the selected value when a button is pressed', () => {
    const onAnswer = jest.fn();
    const { getByText } = render(
      <CompactAnswerRow {...defaultProps} onAnswer={onAnswer} />,
    );
    fireEvent.press(getByText('7'));
    expect(onAnswer).toHaveBeenCalledWith(7);
  });

  it('disables all buttons when feedbackActive is true', () => {
    const onAnswer = jest.fn();
    const { getByText } = render(
      <CompactAnswerRow
        {...defaultProps}
        onAnswer={onAnswer}
        feedbackActive={true}
      />,
    );
    fireEvent.press(getByText('5'));
    expect(onAnswer).not.toHaveBeenCalled();
  });

  it('applies correct feedback style to selected correct answer', () => {
    const { getByTestId } = render(
      <CompactAnswerRow
        {...defaultProps}
        feedbackActive={true}
        selectedAnswer={7}
        correctAnswer={7}
        showCorrectAnswer={false}
      />,
    );
    const button = getByTestId('compact-answer-1');
    const style = button.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.flat(Infinity).filter(Boolean))
      : style;
    expect(flatStyle.borderColor).toBeDefined();
  });

  it('applies incorrect feedback style to selected wrong answer', () => {
    const { getByTestId } = render(
      <CompactAnswerRow
        {...defaultProps}
        feedbackActive={true}
        selectedAnswer={5}
        correctAnswer={7}
        showCorrectAnswer={false}
      />,
    );
    const button = getByTestId('compact-answer-0');
    const style = button.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.flat(Infinity).filter(Boolean))
      : style;
    expect(flatStyle.borderColor).toBeDefined();
  });

  it('reveals correct answer after wrong selection when showCorrectAnswer is true', () => {
    const { getByTestId } = render(
      <CompactAnswerRow
        {...defaultProps}
        feedbackActive={true}
        selectedAnswer={5}
        correctAnswer={7}
        showCorrectAnswer={true}
      />,
    );
    // Button at index 1 has value 7 (the correct answer)
    const correctButton = getByTestId('compact-answer-1');
    const style = correctButton.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.flat(Infinity).filter(Boolean))
      : style;
    expect(flatStyle.borderColor).toBeDefined();
  });

  it('buttons have minimum 48dp touch targets', () => {
    const { getByTestId } = render(<CompactAnswerRow {...defaultProps} />);
    const button = getByTestId('compact-answer-0');
    const style = button.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.flat(Infinity).filter(Boolean))
      : style;
    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(48);
  });
});
