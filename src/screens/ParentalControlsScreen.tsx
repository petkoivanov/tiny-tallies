/**
 * ParentalControlsScreen — PIN-gated parental settings.
 *
 * Sections:
 * - Privacy & Data: Sentry toggle, view privacy info, delete local data
 * - Account: Sign-in status, sign in/out, delete account
 * - AI Helper: Tutor consent toggle
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Shield,
  User,
  Brain,
  Trash2,
  LogIn,
  LogOut,
} from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { PinGate } from '@/components/profile/PinGate';
import {
  getSentryOptOut,
  setSentryOptOut,
} from '@/services/consent/privacyStorage';
import { updateSentryOptOut } from '@/services/sentry/sentryService';
import {
  signInWithGoogle,
  signInWithApple,
  signOut as authSignOut,
  isAppleSignInAvailable,
} from '@/services/auth/authService';
import { verifyAuth, deleteUserData } from '@/services/api/apiClient';

export default function ParentalControlsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();

  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const userId = useAppStore((s) => s.userId);
  const userEmail = useAppStore((s) => s.userEmail);
  const authProvider = useAppStore((s) => s.authProvider);
  const tutorConsentGranted = useAppStore((s) => s.tutorConsentGranted);
  const setTutorConsentGranted = useAppStore((s) => s.setTutorConsentGranted);
  const setAuth = useAppStore((s) => s.setAuth);
  const clearAuth = useAppStore((s) => s.clearAuth);

  const [sentryOptedOut, setSentryOptedOut] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSentryOptOut().then(setSentryOptedOut);
    isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  const handleSentryToggle = useCallback(
    async (value: boolean) => {
      setSentryOptedOut(value);
      await setSentryOptOut(value);
      updateSentryOptOut(value);
    },
    [],
  );

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      const verified = await verifyAuth(result.provider, result.idToken);
      setAuth({
        userId: verified.userId,
        provider: result.provider,
        email: verified.email,
        displayName: verified.displayName,
      });
    } catch (e) {
      Alert.alert('Sign-in failed', (e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  const handleAppleSignIn = useCallback(async () => {
    setLoading(true);
    try {
      const result = await signInWithApple();
      const verified = await verifyAuth(result.provider, result.idToken);
      setAuth({
        userId: verified.userId,
        provider: result.provider,
        email: verified.email,
        displayName: verified.displayName,
      });
    } catch (e) {
      Alert.alert('Sign-in failed', (e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  const handleSignOut = useCallback(async () => {
    await authSignOut();
    clearAuth();
  }, [clearAuth]);

  const handleDeleteAccount = useCallback(async () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete all your data from our servers and sign you out. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (userId) {
              try {
                await deleteUserData(userId);
              } catch {
                // Continue with local cleanup even if remote fails
              }
            }
            await authSignOut();
            clearAuth();
            Alert.alert('Done', 'Your account data has been deleted.');
          },
        },
      ],
    );
  }, [userId, clearAuth]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        content: {
          paddingHorizontal: spacing.lg,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          gap: spacing.sm,
        },
        backButton: {
          minWidth: layout.minTouchTarget,
          minHeight: layout.minTouchTarget,
          justifyContent: 'center',
          alignItems: 'center',
        },
        headerTitle: {
          fontFamily: typography.fontFamily.bold,
          fontSize: typography.fontSize.xl,
          color: colors.textPrimary,
          flex: 1,
        },
        section: {
          marginBottom: spacing.lg,
        },
        sectionHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.sm,
        },
        sectionTitle: {
          fontFamily: typography.fontFamily.semiBold,
          fontSize: typography.fontSize.lg,
          color: colors.textPrimary,
        },
        card: {
          backgroundColor: colors.surface,
          borderRadius: layout.borderRadius.lg,
          padding: spacing.lg,
          gap: spacing.md,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        rowLabel: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.md,
          color: colors.textPrimary,
          flex: 1,
        },
        rowSublabel: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.sm,
          color: colors.textMuted,
        },
        destructiveButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          paddingVertical: spacing.sm,
          minHeight: layout.minTouchTarget,
        },
        destructiveText: {
          fontFamily: typography.fontFamily.semiBold,
          fontSize: typography.fontSize.md,
          color: colors.incorrect,
        },
        signInButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: colors.primary,
          borderRadius: layout.borderRadius.md,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          minHeight: layout.minTouchTarget,
        },
        signInText: {
          fontFamily: typography.fontFamily.semiBold,
          fontSize: typography.fontSize.md,
          color: '#fff',
        },
        signOutButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          paddingVertical: spacing.sm,
          minHeight: layout.minTouchTarget,
        },
        signOutText: {
          fontFamily: typography.fontFamily.semiBold,
          fontSize: typography.fontSize.md,
          color: colors.textSecondary,
        },
        statusText: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
        },
        divider: {
          height: 1,
          backgroundColor: colors.background,
        },
      }),
    [colors],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          testID="back-button"
        >
          <ChevronLeft size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Parental Controls</Text>
      </View>

      <PinGate onCancel={() => navigation.goBack()}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          testID="parental-controls-content"
        >
          {/* Privacy & Data Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Privacy & Data</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Error reporting</Text>
                <Switch
                  value={!sentryOptedOut}
                  onValueChange={(val) => handleSentryToggle(!val)}
                  testID="sentry-toggle"
                />
              </View>
              <Text style={styles.rowSublabel}>
                {sentryOptedOut
                  ? 'Error reporting is off. Bug reports help us improve the app.'
                  : 'Crash reports are sent anonymously to help fix bugs.'}
              </Text>
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Account</Text>
            </View>
            <View style={styles.card}>
              {isSignedIn ? (
                <>
                  <Text style={styles.statusText}>
                    Signed in with {authProvider === 'google' ? 'Google' : 'Apple'}
                    {userEmail ? ` (${userEmail})` : ''}
                  </Text>
                  <View style={styles.divider} />
                  <Pressable
                    style={styles.signOutButton}
                    onPress={handleSignOut}
                    accessibilityRole="button"
                    testID="sign-out-button"
                  >
                    <LogOut size={18} color={colors.textSecondary} />
                    <Text style={styles.signOutText}>Sign Out</Text>
                  </Pressable>
                  <View style={styles.divider} />
                  <Pressable
                    style={styles.destructiveButton}
                    onPress={handleDeleteAccount}
                    accessibilityRole="button"
                    testID="delete-account-button"
                  >
                    <Trash2 size={18} color={colors.incorrect} />
                    <Text style={styles.destructiveText}>
                      Delete Account & Data
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.statusText}>
                    Sign in to sync progress across devices.
                  </Text>
                  <Pressable
                    style={styles.signInButton}
                    onPress={handleGoogleSignIn}
                    disabled={loading}
                    accessibilityRole="button"
                    testID="google-sign-in-button"
                  >
                    <LogIn size={18} color="#fff" />
                    <Text style={styles.signInText}>
                      Sign in with Google
                    </Text>
                  </Pressable>
                  {appleAvailable && (
                    <Pressable
                      style={styles.signInButton}
                      onPress={handleAppleSignIn}
                      disabled={loading}
                      accessibilityRole="button"
                      testID="apple-sign-in-button"
                    >
                      <LogIn size={18} color="#fff" />
                      <Text style={styles.signInText}>
                        Sign in with Apple
                      </Text>
                    </Pressable>
                  )}
                </>
              )}
            </View>
          </View>

          {/* AI Helper Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Brain size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>AI Helper</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>AI tutoring enabled</Text>
                <Switch
                  value={tutorConsentGranted}
                  onValueChange={setTutorConsentGranted}
                  testID="tutor-toggle"
                />
              </View>
              <Text style={styles.rowSublabel}>
                {tutorConsentGranted
                  ? 'Your child can get gentle math hints from the AI helper.'
                  : 'Turn on to let your child receive AI-powered math guidance.'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </PinGate>
    </View>
  );
}
