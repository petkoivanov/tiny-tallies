import React from 'react';
import { render } from '@testing-library/react-native';
import { ChatBubble } from '../ChatBubble';
import type { TutorMessage } from '@/services/tutor/types';

const tutorMsg: TutorMessage = {
  id: 't1',
  role: 'tutor',
  text: 'Think about what 3 + 4 means.',
  timestamp: Date.now(),
};

const childMsg: TutorMessage = {
  id: 'c1',
  role: 'child',
  text: 'Is it 7?',
  timestamp: Date.now(),
};

describe('ChatBubble', () => {
  it('renders tutor message text', () => {
    const { getByText } = render(<ChatBubble message={tutorMsg} />);
    expect(getByText('Think about what 3 + 4 means.')).toBeTruthy();
  });

  it('renders child message text', () => {
    const { getByText } = render(<ChatBubble message={childMsg} />);
    expect(getByText('Is it 7?')).toBeTruthy();
  });

  it('applies tutor styling with left alignment', () => {
    const { getByTestId } = render(<ChatBubble message={tutorMsg} />);
    const bubble = getByTestId('chat-bubble-t1');
    const flatStyle = Object.assign({}, ...([].concat(bubble.props.style)));
    expect(flatStyle.alignSelf).toBe('flex-start');
    expect(flatStyle.backgroundColor).toBe('#4338ca');
  });

  it('applies child styling with right alignment', () => {
    const { getByTestId } = render(<ChatBubble message={childMsg} />);
    const bubble = getByTestId('chat-bubble-c1');
    const flatStyle = Object.assign({}, ...([].concat(bubble.props.style)));
    expect(flatStyle.alignSelf).toBe('flex-end');
    expect(flatStyle.backgroundColor).toBe('#166534');
  });
});
