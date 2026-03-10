/**
 * CharacterSelectScreen — avatar selection during onboarding flow.
 *
 * Simplified version of AvatarPickerScreen for first-time onboarding.
 * Shows base avatars only (no special avatars or frames) with a
 * large preview and animated character reaction on selection.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { AVATARS, resolveAvatar } from '@/store/constants/avatars';
import type { AllAvatarId } from '@/store/constants/avatars';
import { AvatarCircle } from '@/components/avatars';
import { CharacterReaction } from '@/components/animations/CharacterReaction';
import type { RootStackParamList } from '@/navigation/types';

type CharacterSelectRouteProp = RouteProp<RootStackParamList, 'CharacterSelect'>;

const GRID_COLUMNS = 4;
const AVATAR_ITEM_SIZE = 56;
const PREVIEW_SIZE = 96;

export default function CharacterSelectScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<CharacterSelectRouteProp>();
  const { colors } = useTheme();

  const fromOnboarding = route.params?.fromOnboarding ?? false;
  const currentAvatarId = useAppStore((s) => s.avatarId);
  const setChildProfile = useAppStore((s) => s.setChildProfile);

  const [selectedId, setSelectedId] = useState<AllAvatarId>(
    (currentAvatarId as AllAvatarId) ?? 'fox',
  );

  const selectedAvatar = resolveAvatar(selectedId);

  const handleSelect = useCallback((id: AllAvatarId) => {
    setSelectedId(id);
  }, []);

  const handleConfirm = useCallback(() => {
    setChildProfile({ avatarId: selectedId });

    if (fromOnboarding) {
      // Continue to placement test after character selection
      navigation.navigate('PlacementTest' as never);
    } else {
      navigation.goBack();
    }
  }, [selectedId, setChildProfile, fromOnboarding, navigation]);

  const handleSkip = useCallback(() => {
    if (fromOnboarding) {
      navigation.navigate('PlacementTest' as never);
    } else {
      navigation.goBack();
    }
  }, [fromOnboarding, navigation]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.md,
    },
    previewSection: {
      alignItems: 'center',
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
    },
    title: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.display,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    previewName: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.textPrimary,
      marginTop: spacing.sm,
    },
    gridSection: {
      paddingHorizontal: spacing.sm,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    gridItem: {
      width: 72,
      height: 72,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: layout.borderRadius.md,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedItem: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceLight,
    },
    buttonSection: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    confirmButton: {
      backgroundColor: colors.primary,
      minHeight: 56,
      borderRadius: layout.borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    confirmButtonText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.textPrimary,
    },
    skipButton: {
      alignItems: 'center',
      padding: spacing.md,
    },
    skipButtonText: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.sm,
      color: colors.textMuted,
    },
  }), [colors]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 160 },
        ]}
      >
        {/* Title */}
        <View style={styles.previewSection}>
          <Text style={styles.title}>Choose Your Character</Text>
          <Text style={styles.subtitle}>Pick a math buddy to learn with!</Text>

          {/* Animated Preview */}
          <CharacterReaction
            avatarId={selectedId}
            reaction="idle"
            testID="character-preview"
          />
          <Text style={styles.previewName}>{selectedAvatar?.label ?? ''}</Text>
        </View>

        {/* Avatar Grid */}
        <View style={styles.gridSection}>
          <View style={styles.grid}>
            {AVATARS.map((avatar) => (
              <Pressable
                key={avatar.id}
                style={[
                  styles.gridItem,
                  selectedId === avatar.id && styles.selectedItem,
                ]}
                onPress={() => handleSelect(avatar.id as AllAvatarId)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${avatar.label}`}
                testID={`avatar-${avatar.id}`}
              >
                <AvatarCircle emoji={avatar.emoji} size={AVATAR_ITEM_SIZE} />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom buttons */}
      <View
        style={[
          styles.buttonSection,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <Pressable
          style={styles.confirmButton}
          onPress={handleConfirm}
          accessibilityRole="button"
          testID="confirm-button"
        >
          <Text style={styles.confirmButtonText}>
            {fromOnboarding ? 'Next' : 'Choose'}
          </Text>
        </Pressable>
        {fromOnboarding && (
          <Pressable
            style={styles.skipButton}
            onPress={handleSkip}
            accessibilityRole="button"
            testID="skip-button"
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
