import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Delete } from 'lucide-react-native';
import {
  hasParentalPin,
  setParentalPin,
  verifyParentalPin,
} from '@/services/consent/parentalPin';

type PinGateState =
  | 'checking'
  | 'creating'
  | 'confirming'
  | 'verifying'
  | 'verified';

interface PinGateProps {
  children: React.ReactNode;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

const PIN_LENGTH = 4;
const PAD_KEYS = [
  { key: 'pad-1', digit: '1' },
  { key: 'pad-2', digit: '2' },
  { key: 'pad-3', digit: '3' },
  { key: 'pad-4', digit: '4' },
  { key: 'pad-5', digit: '5' },
  { key: 'pad-6', digit: '6' },
  { key: 'pad-7', digit: '7' },
  { key: 'pad-8', digit: '8' },
  { key: 'pad-9', digit: '9' },
  { key: 'pad-empty', digit: '' },
  { key: 'pad-0', digit: '0' },
  { key: 'pad-del', digit: 'del' },
];

export function PinGate({
  children,
  onCancel,
  title,
  subtitle,
}: PinGateProps) {
  const [mode, setMode] = useState<PinGateState>('checking');
  const [digits, setDigits] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid stale closures in the digit handler
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const digitsRef = useRef(digits);
  digitsRef.current = digits;
  const firstPinRef = useRef(firstPin);
  firstPinRef.current = firstPin;

  useEffect(() => {
    let cancelled = false;
    hasParentalPin().then((exists) => {
      if (cancelled) return;
      setMode(exists ? 'verifying' : 'creating');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDigitPress = async (digit: string) => {
    if (digit === 'del') {
      setDigits((prev) => prev.slice(0, -1));
      setError(null);
      return;
    }
    if (digit === '') return;

    const currentDigits = digitsRef.current;
    const newDigits = currentDigits + digit;
    if (newDigits.length > PIN_LENGTH) return;

    setDigits(newDigits);
    digitsRef.current = newDigits;

    if (newDigits.length === PIN_LENGTH) {
      const currentMode = modeRef.current;

      if (currentMode === 'creating') {
        setFirstPin(newDigits);
        firstPinRef.current = newDigits;
        setDigits('');
        digitsRef.current = '';
        setMode('confirming');
        return;
      }

      if (currentMode === 'confirming') {
        if (newDigits === firstPinRef.current) {
          await setParentalPin(newDigits);
          setMode('verified');
        } else {
          setError("PINs don't match. Try again.");
          setDigits('');
          digitsRef.current = '';
          setFirstPin('');
          firstPinRef.current = '';
          setMode('creating');
        }
        return;
      }

      if (currentMode === 'verifying') {
        const valid = await verifyParentalPin(newDigits);
        if (valid) {
          setMode('verified');
        } else {
          setError('Incorrect PIN. Try again.');
          setDigits('');
          digitsRef.current = '';
        }
      }
    }
  };

  if (mode === 'checking') {
    return null;
  }

  if (mode === 'verified') {
    return <>{children}</>;
  }

  const heading =
    title ??
    (mode === 'creating'
      ? 'Create PIN'
      : mode === 'confirming'
        ? 'Confirm PIN'
        : 'Enter PIN');

  const sub =
    subtitle ??
    (mode === 'creating'
      ? 'Set a 4-digit parental PIN'
      : mode === 'confirming'
        ? 'Re-enter your PIN to confirm'
        : 'Enter your parental PIN');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{heading}</Text>
        <Text style={styles.subtitle}>{sub}</Text>
      </View>

      {/* Dot indicators */}
      <View style={styles.dotsRow}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < digits.length && styles.dotFilled]}
          />
        ))}
      </View>

      {/* Error message */}
      {error !== null && <Text style={styles.errorText}>{error}</Text>}

      {/* Number pad */}
      <View style={styles.padContainer}>
        {PAD_KEYS.map(({ key, digit }) => {
          if (digit === '') {
            return <View key={key} style={styles.padButton} />;
          }
          if (digit === 'del') {
            return (
              <Pressable
                key={key}
                style={styles.padButton}
                onPress={() => handleDigitPress('del')}
                accessibilityLabel="Backspace"
              >
                <Delete size={24} color="#666" />
              </Pressable>
            );
          }
          return (
            <Pressable
              key={key}
              style={styles.padButton}
              onPress={() => handleDigitPress(digit)}
              accessibilityLabel={`Digit ${digit}`}
            >
              <Text style={styles.padDigit}>{digit}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Cancel button */}
      <Pressable style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#1a1a2e',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#555',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#7c5cfc',
    borderColor: '#7c5cfc',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  padContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    justifyContent: 'center',
  },
  padButton: {
    width: 72,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  padDigit: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  cancelText: {
    fontSize: 16,
    color: '#aaa',
  },
});
