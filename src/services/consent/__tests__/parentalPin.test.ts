import {
  hasParentalPin,
  setParentalPin,
  verifyParentalPin,
} from '../parentalPin';

// --- Mocks ---

const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
  getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
  setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
}));

// --- Tests ---

beforeEach(() => {
  jest.clearAllMocks();
});

describe('hasParentalPin', () => {
  it('returns false when no PIN is stored', async () => {
    mockGetItemAsync.mockResolvedValue(null);
    const result = await hasParentalPin();
    expect(result).toBe(false);
    expect(mockGetItemAsync).toHaveBeenCalledWith('parental-pin');
  });

  it('returns true when PIN exists in secure store', async () => {
    mockGetItemAsync.mockResolvedValue('1234');
    const result = await hasParentalPin();
    expect(result).toBe(true);
    expect(mockGetItemAsync).toHaveBeenCalledWith('parental-pin');
  });
});

describe('setParentalPin', () => {
  it('stores PIN via SecureStore.setItemAsync', async () => {
    mockSetItemAsync.mockResolvedValue(undefined);
    await setParentalPin('5678');
    expect(mockSetItemAsync).toHaveBeenCalledWith('parental-pin', '5678');
  });
});

describe('verifyParentalPin', () => {
  it('returns true for matching PIN', async () => {
    mockGetItemAsync.mockResolvedValue('1234');
    const result = await verifyParentalPin('1234');
    expect(result).toBe(true);
  });

  it('returns false for non-matching PIN', async () => {
    mockGetItemAsync.mockResolvedValue('1234');
    const result = await verifyParentalPin('9999');
    expect(result).toBe(false);
  });
});
