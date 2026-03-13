/** ParentalControlsScreen — PIN-gated parental settings. */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
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
  BarChart3,
  ChevronRight,
  Volume2,
  Youtube,
} from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { PinGate } from '@/components/profile/PinGate';
import { AppDialog } from '@/components/AppDialog';
import { BenchmarkSection } from '@/components/parental/BenchmarkSection';
import { TimeLimitsSection } from '@/components/parental/TimeLimitsSection';
import { RecentMistakesSection } from '@/components/parental/RecentMistakesSection';
import { ReminderSection } from '@/components/parental/ReminderSection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
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
  const youtubeConsentGranted = useAppStore((s) => s.youtubeConsentGranted);
  const setYoutubeConsentGranted = useAppStore((s) => s.setYoutubeConsentGranted);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled);
  const setAuth = useAppStore((s) => s.setAuth);
  const clearAuth = useAppStore((s) => s.clearAuth);

  const [sentryOptedOut, setSentryOptedOut] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dialog state for error messages and confirmations
  const [errorDialog, setErrorDialog] = useState<{ title: string; message: string } | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
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
      setErrorDialog({ title: 'Sign-in failed', message: (e as Error).message });
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
      setErrorDialog({ title: 'Sign-in failed', message: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  const handleSignOut = useCallback(async () => {
    await authSignOut();
    clearAuth();
  }, [clearAuth]);

  const handleDeleteAccount = useCallback(() => {
    setDeleteDialogVisible(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleteDialogVisible(false);
    // Remote data deletion
    if (userId) {
      try {
        await deleteUserData(userId);
      } catch {
        // Continue with local cleanup even if remote fails
      }
    }
    // Sign out from provider
    await authSignOut();
    // Clear local data: AsyncStorage (store), SecureStore (PIN, tokens, preferences)
    await AsyncStorage.clear();
    for (const key of [
      'parental-pin',
      'auth-id-token',
      'auth-provider',
      'privacy-acknowledged',
      'sentry-opt-out',
    ]) {
      await SecureStore.deleteItemAsync(key).catch(() => {});
    }
    clearAuth();
    // Reset navigation to fresh setup
    navigation.reset({
      index: 0,
      routes: [{ name: 'ProfileSetup' as never }],
    });
  }, [userId, clearAuth, navigation]);
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
        actionRow: {
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
        secondaryText: {
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
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BarChart3 size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Progress Reports</Text>
            </View>
            <View style={styles.card}>
              <Pressable
                style={styles.row}
                onPress={() => navigation.navigate('ParentReports' as never)}
                accessibilityRole="button"
                testID="view-reports-button"
              >
                <Text style={styles.rowLabel}>View learning progress</Text>
                <ChevronRight size={20} color={colors.textMuted} />
              </Pressable>
              <View style={styles.divider} />
              <Pressable
                style={styles.row}
                onPress={() => navigation.navigate('PeerBenchmarks' as never)}
                accessibilityRole="button"
                testID="view-benchmarks-button"
              >
                <Text style={styles.rowLabel}>View peer benchmarks</Text>
                <ChevronRight size={20} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>

          <RecentMistakesSection
            sectionStyle={styles.section}
            sectionHeaderStyle={styles.sectionHeader}
            sectionTitleStyle={styles.sectionTitle}
            cardStyle={styles.card}
          />

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
                    style={styles.actionRow}
                    onPress={handleSignOut}
                    accessibilityRole="button"
                    testID="sign-out-button"
                  >
                    <LogOut size={18} color={colors.textSecondary} />
                    <Text style={styles.secondaryText}>Sign Out</Text>
                  </Pressable>
                  <View style={styles.divider} />
                  <Pressable
                    style={styles.actionRow}
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
                  ? 'Your child receives gentle math hints from the AI helper.'
                  : 'AI tutoring is turned off. Turn on to let your child receive math guidance.'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Youtube size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>YouTube Videos</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>YouTube videos enabled</Text>
                <Switch
                  value={youtubeConsentGranted}
                  onValueChange={setYoutubeConsentGranted}
                  testID="youtube-consent-toggle"
                />
              </View>
              <Text style={styles.rowSublabel}>
                {youtubeConsentGranted
                  ? 'Your child can watch curated math videos when they need extra help.'
                  : 'YouTube videos are turned off. Turn on to allow instructional video access after hints are exhausted.'}
              </Text>
            </View>
          </View>

          <TimeLimitsSection
            sectionStyle={styles.section}
            sectionHeaderStyle={styles.sectionHeader}
            sectionTitleStyle={styles.sectionTitle}
            cardStyle={styles.card}
            rowStyle={styles.row}
            rowLabelStyle={styles.rowLabel}
            rowSublabelStyle={styles.rowSublabel}
            dividerStyle={styles.divider}
          />

          <BenchmarkSection
            sectionStyle={styles.section}
            sectionHeaderStyle={styles.sectionHeader}
            sectionTitleStyle={styles.sectionTitle}
            cardStyle={styles.card}
            rowStyle={styles.row}
            rowLabelStyle={styles.rowLabel}
            rowSublabelStyle={styles.rowSublabel}
            dividerStyle={styles.divider}
          />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Volume2 size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Sound</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Sound effects</Text>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  testID="sound-toggle"
                />
              </View>
              <Text style={styles.rowSublabel}>
                {soundEnabled
                  ? 'Plays sounds for correct answers, celebrations, and feedback.'
                  : 'Sound effects are turned off.'}
              </Text>
            </View>
          </View>

          <ReminderSection
            sectionStyle={styles.section}
            sectionHeaderStyle={styles.sectionHeader}
            sectionTitleStyle={styles.sectionTitle}
            cardStyle={styles.card}
            rowStyle={styles.row}
            rowLabelStyle={styles.rowLabel}
            rowSublabelStyle={styles.rowSublabel}
            dividerStyle={styles.divider}
          />
        </ScrollView>
      </PinGate>
      <AppDialog
        visible={errorDialog !== null}
        title={errorDialog?.title ?? ''}
        message={errorDialog?.message}
        buttons={[{ text: 'OK' }]}
        onDismiss={() => setErrorDialog(null)}
      />
      <AppDialog
        visible={deleteDialogVisible}
        title="Delete Account"
        message="This will permanently delete all your data from our servers and sign you out. This cannot be undone."
        buttons={[
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: handleDeleteConfirm },
        ]}
        onDismiss={() => setDeleteDialogVisible(false)}
      />
    </View>
  );
}
