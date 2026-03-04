import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ResponseButtons } from '../ResponseButtons';

describe('ResponseButtons', () => {
  const mockOnResponse = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders 3 response buttons', () => {
    const { getByText } = render(
      <ResponseButtons onResponse={mockOnResponse} disabled={false} />,
    );

    expect(getByText('I understand!')).toBeTruthy();
    expect(getByText('Tell me more')).toBeTruthy();
    expect(getByText("I'm confused")).toBeTruthy();
  });

  it('has testID response-buttons on container', () => {
    const { getByTestId } = render(
      <ResponseButtons onResponse={mockOnResponse} disabled={false} />,
    );

    expect(getByTestId('response-buttons')).toBeTruthy();
  });

  it('calls onResponse with "understand" when first button pressed', () => {
    const { getByText } = render(
      <ResponseButtons onResponse={mockOnResponse} disabled={false} />,
    );

    fireEvent.press(getByText('I understand!'));
    expect(mockOnResponse).toHaveBeenCalledWith('understand');
  });

  it('calls onResponse with "more" when second button pressed', () => {
    const { getByText } = render(
      <ResponseButtons onResponse={mockOnResponse} disabled={false} />,
    );

    fireEvent.press(getByText('Tell me more'));
    expect(mockOnResponse).toHaveBeenCalledWith('more');
  });

  it('calls onResponse with "confused" when third button pressed', () => {
    const { getByText } = render(
      <ResponseButtons onResponse={mockOnResponse} disabled={false} />,
    );

    fireEvent.press(getByText("I'm confused"));
    expect(mockOnResponse).toHaveBeenCalledWith('confused');
  });

  it('disables all buttons when disabled prop is true', () => {
    const { getByText } = render(
      <ResponseButtons onResponse={mockOnResponse} disabled={true} />,
    );

    fireEvent.press(getByText('I understand!'));
    fireEvent.press(getByText('Tell me more'));
    fireEvent.press(getByText("I'm confused"));

    expect(mockOnResponse).not.toHaveBeenCalled();
  });

  // ---- gotit mode tests ----

  it('renders single "Got it!" button in gotit mode', () => {
    const { getByText, queryByText } = render(
      <ResponseButtons onResponse={mockOnResponse} disabled={false} mode="gotit" />,
    );

    expect(getByText('Got it!')).toBeTruthy();
    expect(queryByText('I understand!')).toBeNull();
    expect(queryByText('Tell me more')).toBeNull();
    expect(queryByText("I'm confused")).toBeNull();
  });

  it('calls onResponse with "gotit" when Got it! button pressed', () => {
    const { getByText } = render(
      <ResponseButtons onResponse={mockOnResponse} disabled={false} mode="gotit" />,
    );

    fireEvent.press(getByText('Got it!'));
    expect(mockOnResponse).toHaveBeenCalledWith('gotit');
  });

  it('disables Got it! button when disabled in gotit mode', () => {
    const { getByText } = render(
      <ResponseButtons onResponse={mockOnResponse} disabled={true} mode="gotit" />,
    );

    fireEvent.press(getByText('Got it!'));
    expect(mockOnResponse).not.toHaveBeenCalled();
  });

  it('renders standard 3 buttons when mode is "standard" explicitly', () => {
    const { getByText } = render(
      <ResponseButtons onResponse={mockOnResponse} disabled={false} mode="standard" />,
    );

    expect(getByText('I understand!')).toBeTruthy();
    expect(getByText('Tell me more')).toBeTruthy();
    expect(getByText("I'm confused")).toBeTruthy();
  });
});
