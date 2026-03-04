---
name: tiny-tallies-testing
description: Generates Jest test files for Tiny Tallies following project-specific mock patterns, store mocking conventions, and test structure. Use when creating new tests, adding test coverage, or writing tests for screens, components, hooks, or services.
---

# Tiny Tallies Testing Patterns

When writing tests for this project, follow these patterns exactly. Getting mock setup wrong causes silent failures.

## File Placement

| Test type | Location | Naming |
|-----------|----------|--------|
| Component | `src/__tests__/components/` (or domain subfolder like `home/`) | `ComponentName.test.tsx` |
| Screen | `src/__tests__/screens/` | `ScreenName.test.tsx` |
| Hook | `src/__tests__/hooks/` | `useHookName.test.ts` |
| Service / Engine | `src/__tests__/` + domain folder (e.g., `mathEngine/`, `adaptive/`, `session/`) | `serviceName.test.ts` |
| Store | `src/__tests__/store/` | `sliceName.test.ts` |
| Manipulatives | `src/__tests__/manipulatives/` | `feature.test.ts` |
| Gamification | `src/__tests__/gamification/` | `feature.test.ts` |

## Critical Rule: Mock Order

Mocks MUST be declared BEFORE imports of the code under test. Jest hoists `jest.mock()` calls, but the mock factory functions capture variables at declaration time. Follow this order in every test file:

```
1. Import React and test utilities (render, fireEvent, etc.)
2. Mock variable declarations (let/const for controlling mock behavior)
3. jest.mock() calls (in dependency order — see below)
4. Import statements for code under test (using @/ path aliases)
5. Test data constants and helper functions
6. describe blocks
```

## Path Aliases

This project uses `@/` path aliases that map to `src/`. Always use them in test imports:

```typescript
import HomeScreen from '@/screens/HomeScreen';
jest.mock('@/store/appStore', () => ({ ... }));
jest.mock('@/services/someService', () => ({ ... }));
```

## Mock Dependency Order

When a test needs multiple mocks, declare them in this order to avoid initialization issues:

1. `@react-navigation/native` (navigation hooks)
2. `react-native-reanimated` (uses require internally)
3. `react-native-gesture-handler`
4. `react-native-safe-area-context`
5. `lucide-react-native` (icon library — mock as View components)
6. `expo-linear-gradient`, `expo-haptics`, `expo-speech`
7. `@react-native-async-storage/async-storage`
8. Other Expo modules
9. Project components (`@/components/*`)
10. Project services (`@/services/*`)
11. Project store (`@/store/appStore`)

Not every test needs all of these. Only mock what the code under test actually imports.

## Store Mocking Pattern

There are TWO store mocking approaches. Choose based on test type:

### Approach A: Selector mock with mutable state (for screens and components)

```typescript
// Mock store state — declare BEFORE jest.mock
let mockStoreState: Record<string, unknown> = {};
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
}));

// Import after mocks
import ScreenName from '@/screens/ScreenName';

// Helper to set state with defaults
function setMockState(overrides: Record<string, unknown> = {}) {
  mockStoreState = {
    // Add state properties the component reads via selectors
    ...overrides,
  };
}

describe('ScreenName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockState();
  });
});
```

### Approach B: Direct store access (for store tests and integration tests)

```typescript
import { useAppStore } from '@/store/appStore';

describe('Store Test', () => {
  beforeEach(() => {
    useAppStore.getState().resetAll();
  });

  it('should update state', () => {
    useAppStore.getState().someAction(value);
    expect(useAppStore.getState().someProperty).toBe(value);
  });
});
```

## Screen Test Template

Screen tests need the most mocking. Reference: @src/__tests__/screens/HomeScreen.test.tsx

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock lucide icons as simple View components
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    IconName: (props: any) => <View testID="icon-name" {...props} />,
    // Add only icons the screen actually imports
  };
});

// Mock child components if needed
jest.mock('@/components/domain', () => {
  const { View } = require('react-native');
  return {
    ChildComponent: () => <View testID="child-component" />,
  };
});

// Mock store state
let mockStoreState: Record<string, unknown> = {};
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
}));

// Import after mocks
import ScreenName from '@/screens/ScreenName';

function setMockState(overrides: Record<string, unknown> = {}) {
  mockStoreState = {
    // Default state properties the screen reads
    ...overrides,
  };
}

describe('ScreenName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockState();
  });

  it('should render correctly', () => {
    const { getByText } = render(<ScreenName />);
    expect(getByText('Expected Text')).toBeTruthy();
  });

  it('should navigate on button press', () => {
    const { getByText } = render(<ScreenName />);
    fireEvent.press(getByText('Button Text'));
    expect(mockNavigate).toHaveBeenCalledWith('TargetScreen');
  });
});
```

## Component Test Template

Simple components need minimal mocking.

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ComponentName from '@/components/ui/ComponentName';

describe('ComponentName', () => {
  it('should render with props', () => {
    const { getByText } = render(
      <ComponentName title="Test" onPress={() => {}} />
    );
    expect(getByText('Test')).toBeTruthy();
  });

  it('should handle press events', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <ComponentName title="Press" onPress={onPressMock} />
    );
    fireEvent.press(getByText('Press'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
```

## Hook Test Template

```typescript
import { renderHook, act, waitFor } from '@testing-library/react-native';

// Mock dependencies with controllable jest.fn() variables
const mockServiceFn = jest.fn();
jest.mock('@/services/someService', () => ({
  serviceFunction: (...args: unknown[]) => mockServiceFn(...args),
}));

// Import after mocks
import { useHookName } from '@/hooks/useHookName';

describe('useHookName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockServiceFn.mockResolvedValue(undefined);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useHookName({ param: 'value' }));
    expect(result.current.someState).toBe(defaultValue);
  });

  it('should update state on action', async () => {
    const { result } = renderHook(() => useHookName({ param: 'value' }));
    await act(async () => {
      result.current.someAction();
    });
    expect(result.current.someState).toBe(updatedValue);
  });
});
```

## Service / Engine Test Template

```typescript
// Mock external dependencies with controllable variables at top
const mockExternalFn = jest.fn();
jest.mock('some-external-module', () => ({
  externalFn: (...args: unknown[]) => mockExternalFn(...args),
}));

// Import after mocks
import { functionUnderTest } from '@/services/someService';

describe('ServiceName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExternalFn.mockReset();
  });

  describe('functionUnderTest', () => {
    it('should handle success case', async () => {
      mockExternalFn.mockResolvedValue(expectedResult);
      const result = await functionUnderTest(input);
      expect(result).toEqual(expectedOutput);
    });

    it('should handle error case', async () => {
      mockExternalFn.mockRejectedValue(new Error('fail'));
      // test error handling
    });
  });
});
```

## Lucide Icon Mocking

This project uses `lucide-react-native` exclusively. Always mock icons as View components with testIDs:

```typescript
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    Star: (props: any) => <View testID="star-icon" {...props} />,
    Check: (props: any) => <View testID="check-icon" {...props} />,
    // Only mock icons that the component under test imports
  };
});
```

## Common Patterns

**Testing async operations:**
```typescript
await act(async () => {
  result.current.asyncAction();
});
await waitFor(() => {
  expect(result.current.loading).toBe(false);
});
```

**Testing with fake timers (for debounce, intervals):**
```typescript
beforeEach(() => { jest.useFakeTimers(); });
afterEach(() => { jest.useRealTimers(); });
```

**Overriding store state per-test:**
```typescript
setMockState({ specificProp: newValue });
```

**Using queryByText for absence checks:**
```typescript
expect(queryByText('Should Not Exist')).toBeNull();
```
