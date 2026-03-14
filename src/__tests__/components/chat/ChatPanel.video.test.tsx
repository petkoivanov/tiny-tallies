import React from 'react';
import { Linking } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';

// Mock Linking.openURL
jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

// Mock videoMap so tests control which domains have videos
jest.mock('@/services/video/videoMap', () => ({
  videoMap: {
    addition: 'abc123',
    // all other domains intentionally absent — tests use 'addition' or 'fractions'
  },
}));

// Mock lucide-react-native icons used by VideoVoteButtons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    ThumbsUp: (props: any) => <View testID="thumbs-up-icon" {...props} />,
    ThumbsDown: (props: any) => <View testID="thumbs-down-icon" {...props} />,
    X: (props: any) => <View testID="x-icon" {...props} />,
  };
});

// Mock lottie-react-native (used by ChatPanel header)
jest.mock('lottie-react-native', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="lottie-view" {...props} />,
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      Text: require('react-native').Text,
      createAnimatedComponent: (c: any) => c,
      call: jest.fn(),
    },
    useSharedValue: (init: any) => ({ value: init }),
    useAnimatedStyle: (fn: () => any) => fn(),
    withTiming: (v: any) => v,
    withSpring: (v: any) => v,
    withDelay: (_d: number, v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1],
    withRepeat: (v: any) => v,
    runOnJS: (fn: any) => fn,
    Easing: {
      in: (e: any) => e,
      inOut: (e: any) => e,
      quad: (v: any) => v,
      linear: (v: any) => v,
    },
    useReducedMotion: jest.fn(() => false),
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  Gesture: {
    Pan: () => ({
      onEnd: () => ({
        onEnd: () => ({}),
      }),
    }),
  },
}));

// Import after mocks
import { ChatPanel } from '@/components/chat/ChatPanel';

const BASE_PROPS = {
  isOpen: true,
  onClose: jest.fn(),
  messages: [],
  isLoading: false,
  isOnline: true,
  onResponse: jest.fn(),
};

describe('ChatPanel video section — button visibility (VIDEO-02)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Linking.openURL as jest.Mock).mockResolvedValue(true);
  });

  it('does NOT show watch button when ladderExhausted=false', () => {
    const { queryByTestId } = render(
      <ChatPanel
        {...BASE_PROPS}
        ladderExhausted={false}
        youtubeConsentGranted={true}
        currentDomain="addition"
      />,
    );
    expect(queryByTestId('chat-watch-video-button')).toBeNull();
  });

  it('does NOT show watch button when youtubeConsentGranted=false', () => {
    const { queryByTestId } = render(
      <ChatPanel
        {...BASE_PROPS}
        ladderExhausted={true}
        youtubeConsentGranted={false}
        currentDomain="addition"
      />,
    );
    expect(queryByTestId('chat-watch-video-button')).toBeNull();
  });

  it('does NOT show watch button when isOnline=false', () => {
    const { queryByTestId } = render(
      <ChatPanel
        {...BASE_PROPS}
        isOnline={false}
        ladderExhausted={true}
        youtubeConsentGranted={true}
        currentDomain="addition"
      />,
    );
    expect(queryByTestId('chat-watch-video-button')).toBeNull();
  });

  it('does NOT show watch button when domain has no videoMap entry', () => {
    const { queryByTestId } = render(
      <ChatPanel
        {...BASE_PROPS}
        ladderExhausted={true}
        youtubeConsentGranted={true}
        currentDomain="fractions"
      />,
    );
    expect(queryByTestId('chat-watch-video-button')).toBeNull();
  });

  it('shows watch button when all four conditions are met', () => {
    const { getByTestId } = render(
      <ChatPanel
        {...BASE_PROPS}
        ladderExhausted={true}
        youtubeConsentGranted={true}
        currentDomain="addition"
      />,
    );
    expect(getByTestId('chat-watch-video-button')).toBeTruthy();
  });

  it('opens YouTube via Linking and shows done button after pressing watch', async () => {
    const { getByTestId } = render(
      <ChatPanel
        {...BASE_PROPS}
        ladderExhausted={true}
        youtubeConsentGranted={true}
        currentDomain="addition"
      />,
    );
    await act(async () => {
      fireEvent.press(getByTestId('chat-watch-video-button'));
    });
    expect(Linking.openURL).toHaveBeenCalledWith('https://www.youtube.com/watch?v=abc123');
    expect(getByTestId('youtube-done-button')).toBeTruthy();
  });

  it('shows VideoVoteButtons after pressing Done watching', async () => {
    const { getByTestId, queryByTestId } = render(
      <ChatPanel
        {...BASE_PROPS}
        ladderExhausted={true}
        youtubeConsentGranted={true}
        currentDomain="addition"
        onVideoVote={jest.fn()}
      />,
    );
    await act(async () => {
      fireEvent.press(getByTestId('chat-watch-video-button'));
    });
    fireEvent.press(getByTestId('youtube-done-button'));
    expect(getByTestId('video-vote-helpful')).toBeTruthy();
    expect(queryByTestId('youtube-done-button')).toBeNull();
  });

  it('fires onVideoVote with domain and vote when vote button pressed', async () => {
    const onVideoVote = jest.fn();
    const { getByTestId } = render(
      <ChatPanel
        {...BASE_PROPS}
        ladderExhausted={true}
        youtubeConsentGranted={true}
        currentDomain="addition"
        onVideoVote={onVideoVote}
      />,
    );
    await act(async () => {
      fireEvent.press(getByTestId('chat-watch-video-button'));
    });
    fireEvent.press(getByTestId('youtube-done-button'));
    fireEvent.press(getByTestId('video-vote-helpful'));
    expect(onVideoVote).toHaveBeenCalledWith('addition', 'helpful');
  });
});
