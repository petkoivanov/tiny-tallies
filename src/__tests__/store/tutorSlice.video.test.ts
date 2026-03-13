import { useAppStore } from '@/store/appStore';
import type { MathDomain } from '@/services/mathEngine/types';

describe('tutorSlice video votes', () => {
  beforeEach(() => {
    useAppStore.setState({ videoVotes: {} });
  });

  it('initializes videoVotes as empty object', () => {
    const store = useAppStore.getState();
    expect(store.videoVotes).toEqual({});
  });

  it('setVideoVote stores a helpful vote by domain', () => {
    const { setVideoVote } = useAppStore.getState();
    setVideoVote('addition' as MathDomain, 'helpful');
    expect(useAppStore.getState().videoVotes['addition']).toBe('helpful');
  });

  it('setVideoVote overwrites a previous vote', () => {
    const { setVideoVote } = useAppStore.getState();
    setVideoVote('fractions' as MathDomain, 'helpful');
    setVideoVote('fractions' as MathDomain, 'not_helpful');
    expect(useAppStore.getState().videoVotes['fractions']).toBe('not_helpful');
  });
});
