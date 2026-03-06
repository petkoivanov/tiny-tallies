import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock navigation
const mockGoBack = jest.fn();
const mockReset = jest.fn();
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    reset: mockReset,
    navigate: mockNavigate,
  }),
}));

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    Edit2: (props: any) => <View testID="edit-icon" {...props} />,
    Trash2: (props: any) => <View testID="trash-icon" {...props} />,
    UserPlus: (props: any) => <View testID="user-plus-icon" {...props} />,
    X: (props: any) => <View testID="x-icon" {...props} />,
    AlertTriangle: (props: any) => (
      <View testID="alert-triangle-icon" {...props} />
    ),
  };
});

// Mock PinGate to render children immediately
jest.mock('@/components/profile/PinGate', () => {
  return {
    PinGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock ProfileCreationWizard
const mockOnComplete = jest.fn();
jest.mock('@/components/profile/ProfileCreationWizard', () => {
  const { View, Text, Pressable } = require('react-native');
  return {
    ProfileCreationWizard: ({
      onComplete,
      onCancel,
      initialValues,
    }: {
      onComplete: (p: any) => void;
      onCancel?: () => void;
      initialValues?: any;
    }) => (
      <View testID="wizard">
        <Text testID="wizard-initial-values">
          {JSON.stringify(initialValues)}
        </Text>
        <Pressable
          testID="wizard-complete"
          onPress={() =>
            onComplete({
              childName: 'UpdatedName',
              childAge: 8,
              childGrade: 3,
              avatarId: 'cat',
            })
          }
        />
        <Pressable testID="wizard-cancel" onPress={onCancel} />
      </View>
    ),
  };
});

// Mock AvatarCircle
jest.mock('@/components/avatars', () => {
  const { View, Text } = require('react-native');
  return {
    AvatarCircle: ({ emoji }: { emoji: string }) => (
      <View testID="avatar-circle">
        <Text>{emoji}</Text>
      </View>
    ),
  };
});

// Mock avatar resolution
jest.mock('@/store/constants/avatars', () => ({
  resolveAvatar: (id: string) => ({ emoji: id === 'cat' ? '🐱' : '🧒' }),
  DEFAULT_AVATAR_ID: 'default',
  SPECIAL_AVATARS: [],
  FRAMES: [],
}));

// Mock store
let mockStoreState: Record<string, unknown> = {};
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
}));

import ProfileManagementScreen from '@/screens/ProfileManagementScreen';

// Helpers
const mockUpdateChild = jest.fn();
const mockRemoveChild = jest.fn();

function setMockState(overrides: Record<string, unknown> = {}) {
  mockStoreState = {
    children: {
      'child-1': {
        childName: 'Alice',
        childAge: 7,
        childGrade: 2,
        avatarId: 'cat',
        frameId: null,
      },
      'child-2': {
        childName: 'Bob',
        childAge: 9,
        childGrade: 4,
        avatarId: null,
        frameId: null,
      },
    },
    activeChildId: 'child-1',
    childName: 'Alice',
    childAge: 7,
    childGrade: 2,
    avatarId: 'cat',
    updateChild: mockUpdateChild,
    removeChild: mockRemoveChild,
    ...overrides,
  };
}

describe('ProfileManagementScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockState();
  });

  it('renders all children with names and details', () => {
    const { getByText } = render(<ProfileManagementScreen />);
    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Age 7, Grade 2')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
    expect(getByText('Age 9, Grade 4')).toBeTruthy();
  });

  it('shows profile count', () => {
    const { getByText } = render(<ProfileManagementScreen />);
    expect(getByText('2 of 5 profiles')).toBeTruthy();
  });

  it('edit button shows wizard with initialValues', () => {
    const { getAllByTestId, getByTestId } = render(
      <ProfileManagementScreen />
    );
    const editButtons = getAllByTestId('edit-button');
    fireEvent.press(editButtons[0]);

    const wizardValues = getByTestId('wizard-initial-values');
    const parsed = JSON.parse(wizardValues.props.children);
    expect(parsed.childName).toBe('Alice');
    expect(parsed.childAge).toBe(7);
    expect(parsed.childGrade).toBe(2);
  });

  it('edit complete calls updateChild with correct args', () => {
    const { getAllByTestId, getByTestId } = render(
      <ProfileManagementScreen />
    );
    const editButtons = getAllByTestId('edit-button');
    fireEvent.press(editButtons[0]);

    fireEvent.press(getByTestId('wizard-complete'));
    expect(mockUpdateChild).toHaveBeenCalledWith('child-1', {
      childName: 'UpdatedName',
      childAge: 8,
      childGrade: 3,
      avatarId: 'cat',
    });
  });

  it('delete button shows confirmation modal', () => {
    const { getAllByTestId, getByText } = render(
      <ProfileManagementScreen />
    );
    const deleteButtons = getAllByTestId('delete-button');
    fireEvent.press(deleteButtons[0]);

    expect(getByText("Delete Alice's profile?")).toBeTruthy();
    expect(
      getByText(
        'This will permanently delete all learning progress, achievements, and settings.'
      )
    ).toBeTruthy();
  });

  it('delete confirm disabled until name typed correctly', () => {
    const { getAllByTestId, getByTestId } = render(
      <ProfileManagementScreen />
    );
    const deleteButtons = getAllByTestId('delete-button');
    fireEvent.press(deleteButtons[0]);

    const confirmButton = getByTestId('delete-confirm-button');
    // Initially disabled
    expect(confirmButton.props.accessibilityState?.disabled).toBe(true);

    // Type wrong name
    const input = getByTestId('delete-confirm-input');
    fireEvent.changeText(input, 'wrong');
    expect(getByTestId('delete-confirm-button').props.accessibilityState?.disabled).toBe(true);

    // Type correct name (case-insensitive)
    fireEvent.changeText(input, 'alice');
    expect(getByTestId('delete-confirm-button').props.accessibilityState?.disabled).toBe(false);
  });

  it('delete confirm calls removeChild', () => {
    const { getAllByTestId, getByTestId } = render(
      <ProfileManagementScreen />
    );
    const deleteButtons = getAllByTestId('delete-button');
    fireEvent.press(deleteButtons[0]);

    const input = getByTestId('delete-confirm-input');
    fireEvent.changeText(input, 'Alice');
    fireEvent.press(getByTestId('delete-confirm-button'));

    expect(mockRemoveChild).toHaveBeenCalledWith('child-1');
  });

  it('delete last child triggers navigation.reset to ProfileSetup', () => {
    setMockState({
      children: {
        'child-1': {
          childName: 'Alice',
          childAge: 7,
          childGrade: 2,
          avatarId: null,
          frameId: null,
        },
      },
      activeChildId: 'child-1',
      childName: 'Alice',
      childAge: 7,
      childGrade: 2,
    });

    const { getAllByTestId, getByTestId } = render(
      <ProfileManagementScreen />
    );
    const deleteButtons = getAllByTestId('delete-button');
    fireEvent.press(deleteButtons[0]);

    fireEvent.changeText(getByTestId('delete-confirm-input'), 'Alice');
    fireEvent.press(getByTestId('delete-confirm-button'));

    expect(mockRemoveChild).toHaveBeenCalledWith('child-1');
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'ProfileSetup' }],
    });
  });

  it('Add Child button hidden at 5 profiles', () => {
    const fiveChildren: Record<string, unknown> = {};
    for (let i = 1; i <= 5; i++) {
      fiveChildren[`child-${i}`] = {
        childName: `Child${i}`,
        childAge: 7,
        childGrade: 2,
        avatarId: null,
        frameId: null,
      };
    }
    setMockState({ children: fiveChildren });

    const { queryByTestId } = render(<ProfileManagementScreen />);
    expect(queryByTestId('add-child-button')).toBeNull();
  });

  it('Add Child button navigates to ProfileSetup', () => {
    const { getByTestId } = render(<ProfileManagementScreen />);
    fireEvent.press(getByTestId('add-child-button'));
    expect(mockNavigate).toHaveBeenCalledWith('ProfileSetup');
  });

  it('active child reads name from flat state', () => {
    // Set different name in flat state vs map to verify flat state is used
    setMockState({
      children: {
        'child-1': {
          childName: 'StaleAlice',
          childAge: 6,
          childGrade: 1,
          avatarId: null,
          frameId: null,
        },
      },
      activeChildId: 'child-1',
      childName: 'FreshAlice',
      childAge: 7,
      childGrade: 2,
      avatarId: 'cat',
    });

    const { getByText, queryByText } = render(<ProfileManagementScreen />);
    expect(getByText('FreshAlice')).toBeTruthy();
    expect(queryByText('StaleAlice')).toBeNull();
    // Also verify age/grade from flat state
    expect(getByText('Age 7, Grade 2')).toBeTruthy();
  });

  it('close button calls navigation.goBack', () => {
    const { getByTestId } = render(<ProfileManagementScreen />);
    fireEvent.press(getByTestId('close-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('displays grade K for grade 0', () => {
    setMockState({
      children: {
        'child-1': {
          childName: 'Kindergartner',
          childAge: 6,
          childGrade: 0,
          avatarId: null,
          frameId: null,
        },
      },
      activeChildId: 'child-1',
      childName: 'Kindergartner',
      childAge: 6,
      childGrade: 0,
    });

    const { getByText } = render(<ProfileManagementScreen />);
    expect(getByText('Age 6, Grade K')).toBeTruthy();
  });
});
