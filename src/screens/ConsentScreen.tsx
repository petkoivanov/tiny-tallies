/**
 * ConsentScreen - Parental consent gate for AI tutor access.
 *
 * Two modes determined on mount:
 * - 'create': Parent sets a new 4-digit PIN (enter + confirm)
 * - 'verify': Parent verifies existing PIN
 *
 * After successful PIN entry, sets tutorConsentGranted to true
 * in the store and navigates back.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Shield, Delete } from 'lucide-react-native';
import { colors, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import {
  hasParentalPin,
  setParentalPin,
  verifyParentalPin,
} from '@/services/consent/parentalPin';

type PinMode = 'loading' | 'create' | 'verify';
type CreateStep = 'enter' | 'confirm';

const PIN_LENGTH = 4;

const SAFEGUARDS = [
  'No personal information is shared with the AI',
  'All responses are age-appropriate and checked',
  'Your child uses buttons only \u2014 no typing',
  'You can turn this off anytime',
];

export default function ConsentScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const setTutorConsentGranted = useAppStore(
    (s) => s.setTutorConsentGranted,
  );

  const [mode, setMode] = useState<PinMode>('loading');
  const [displayPin, setDisplayPin] = useState('');
  const [createStep, setCreateStep] = useState<CreateStep>('enter');
  const [error, setError] = useState('');

  // Refs for immediate reads — state setters are async/batched,
  // but refs update synchronously for rapid digit presses.
  const pinRef = useRef('');
  const firstPinRef = useRef('');
  const stepRef = useRef<CreateStep>('enter');

  useEffect(() => {
    let mounted = true;
    hasParentalPin().then((exists) => {
      if (mounted) {
        setMode(exists ? 'verify' : 'create');
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const resetAll = useCallback(() => {
    pinRef.current = '';
    firstPinRef.current = '';
    stepRef.current = 'enter';
    setDisplayPin('');
    setCreateStep('enter');
  }, []);

  const handlePinComplete = useCallback(
    async (pin: string) => {
      if (mode === 'create') {
        if (stepRef.current === 'enter') {
          firstPinRef.current = pin;
          stepRef.current = 'confirm';
          pinRef.current = '';
          setCreateStep('confirm');
          setDisplayPin('');
          return;
        }

        // confirm step
        if (pin === firstPinRef.current) {
          await setParentalPin(firstPinRef.current);
          setTutorConsentGranted(true);
          navigation.goBack();
        } else {
          setError("PINs don't match. Try again.");
          resetAll();
        }
      } else if (mode === 'verify') {
        const valid = await verifyParentalPin(pin);
        if (valid) {
          setTutorConsentGranted(true);
          navigation.goBack();
        } else {
          setError('Wrong PIN. Try again.');
          pinRef.current = '';
          setDisplayPin('');
        }
      }
    },
    [mode, setTutorConsentGranted, navigation, resetAll],
  );

  const handleDigitPress = useCallback(
    (digit: string) => {
      setError('');

      const nextPin = pinRef.current + digit;
      if (nextPin.length > PIN_LENGTH) return;

      pinRef.current = nextPin;
      setDisplayPin(nextPin);

      if (nextPin.length === PIN_LENGTH) {
        handlePinComplete(nextPin);
      }
    },
    [handlePinComplete],
  );

  const handleBackspace = useCallback(() => {
    setError('');
    pinRef.current = pinRef.current.slice(0, -1);
    setDisplayPin(pinRef.current);
  }, []);

  if (mode === 'loading') {
    return (
      <View
        style={[
          styles.loadingContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const pinSectionTitle =
    mode === 'create'
      ? createStep === 'enter'
        ? 'Create a PIN'
        : 'Confirm your PIN'
      : 'Enter your PIN';

  const pinSectionSubtitle =
    mode === 'create' && createStep === 'enter'
      ? 'Enter a 4-digit PIN'
      : undefined;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Shield size={40} color={colors.primary} />
        <Text style={styles.title}>AI Helper Setup</Text>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Your child's AI helper provides gentle guidance during math practice.
          Here's how we keep things safe:
        </Text>
        {SAFEGUARDS.map((item) => (
          <View key={item} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>{'\u2022'}</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* PIN Section */}
      <View style={styles.pinSection}>
        <Text style={styles.pinTitle}>{pinSectionTitle}</Text>
        {pinSectionSubtitle && (
          <Text style={styles.pinSubtitle}>{pinSectionSubtitle}</Text>
        )}

        {/* Dot Indicators */}
        <View style={styles.dotsRow}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View
              key={i}
              testID="pin-dot"
              style={[
                styles.dot,
                i < displayPin.length
                  ? styles.dotFilled
                  : styles.dotEmpty,
              ]}
            />
          ))}
        </View>

        {/* Error Message */}
        {error !== '' && <Text style={styles.errorText}>{error}</Text>}

        {/* Number Pad */}
        <View style={styles.numPad}>
          {/* Row 1: 1 2 3 */}
          <View style={styles.numRow}>
            {['1', '2', '3'].map((d) => (
              <NumButton key={d} digit={d} onPress={handleDigitPress} />
            ))}
          </View>
          {/* Row 2: 4 5 6 */}
          <View style={styles.numRow}>
            {['4', '5', '6'].map((d) => (
              <NumButton key={d} digit={d} onPress={handleDigitPress} />
            ))}
          </View>
          {/* Row 3: 7 8 9 */}
          <View style={styles.numRow}>
            {['7', '8', '9'].map((d) => (
              <NumButton key={d} digit={d} onPress={handleDigitPress} />
            ))}
          </View>
          {/* Row 4: empty 0 backspace */}
          <View style={styles.numRow}>
            <View style={styles.numButtonPlaceholder} />
            <NumButton digit="0" onPress={handleDigitPress} />
            <Pressable
              style={styles.numButton}
              onPress={handleBackspace}
              accessibilityLabel="Delete"
              accessibilityRole="button"
            >
              <Delete size={24} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// --- Sub-components ---

interface NumButtonProps {
  digit: string;
  onPress: (digit: string) => void;
}

function NumButton({ digit, onPress }: NumButtonProps) {
  return (
    <Pressable
      style={styles.numButton}
      onPress={() => onPress(digit)}
      accessibilityRole="button"
    >
      <Text style={styles.numButtonText}>{digit}</Text>
    </Pressable>
  );
}

// --- Styles ---

const BUTTON_SIZE = 64;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
  },
  infoSection: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
  bulletDot: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.primary,
    marginRight: spacing.sm,
    lineHeight: 24,
  },
  bulletText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 24,
  },
  pinSection: {
    alignItems: 'center',
    width: '100%',
  },
  pinTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  pinSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: layout.borderRadius.round,
    borderWidth: 2,
  },
  dotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderColor: colors.surface,
  },
  errorText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.incorrect,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  numPad: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  numRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  numButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: layout.borderRadius.round,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
  },
  numButtonPlaceholder: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  numButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
  },
});
