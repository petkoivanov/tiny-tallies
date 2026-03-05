import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Lock } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import {
  AVATARS,
  SPECIAL_AVATARS,
  FRAMES,
  resolveAvatar,
  isCosmeticUnlocked,
} from '@/store/constants/avatars';
import type { AllAvatarId, FrameId } from '@/store/constants/avatars';
import { AvatarCircle } from '@/components/avatars';
import { CosmeticDetailOverlay } from '@/components/avatars/CosmeticDetailOverlay';

interface DetailItem {
  label: string;
  emoji: string;
  badgeId: string;
  itemType: 'avatar' | 'frame';
}

const GRID_COLUMNS = 4;
const AVATAR_ITEM_SIZE = 56;
const PREVIEW_SIZE = 80;

export default function AvatarPickerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();

  const storeAvatarId = useAppStore((s) => s.avatarId);
  const storeFrameId = useAppStore((s) => s.frameId);
  const earnedBadges = useAppStore((s) => s.earnedBadges);
  const setChildProfile = useAppStore((s) => s.setChildProfile);

  const [previewAvatarId, setPreviewAvatarId] = useState<AllAvatarId>(
    (storeAvatarId as AllAvatarId) ?? 'fox',
  );
  const [previewFrameId, setPreviewFrameId] = useState<FrameId | null>(
    storeFrameId ?? null,
  );
  const [detailItem, setDetailItem] = useState<DetailItem | null>(null);

  const previewAvatar = resolveAvatar(previewAvatarId);
  const previewFrameColor = previewFrameId
    ? FRAMES.find((f) => f.id === previewFrameId)?.color
    : undefined;
  const previewIsSpecial = SPECIAL_AVATARS.some(
    (a) => a.id === previewAvatarId,
  );

  const handleSave = () => {
    setChildProfile({ avatarId: previewAvatarId, frameId: previewFrameId });
    navigation.goBack();
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
    },
    previewSection: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
    previewLabel: {
      color: colors.textPrimary,
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      marginTop: spacing.sm,
    },
    sectionHeader: {
      color: colors.textPrimary,
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.lg,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    gridItem: {
      width: `${100 / GRID_COLUMNS - 2}%` as unknown as number,
      minWidth: 72,
      alignItems: 'center',
      padding: spacing.xs,
      borderRadius: layout.borderRadius.md,
      borderWidth: 2,
      borderColor: 'transparent',
      position: 'relative',
    },
    selectedItem: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceLight,
    },
    lockOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    framePreview: {
      width: AVATAR_ITEM_SIZE,
      height: AVATAR_ITEM_SIZE,
      borderRadius: AVATAR_ITEM_SIZE / 2,
      borderWidth: 3,
      backgroundColor: colors.surface,
    },
    frameLabel: {
      color: colors.textSecondary,
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.xs,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    saveContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      backgroundColor: colors.background,
    },
    saveButton: {
      backgroundColor: '#84cc16',
      height: 48,
      borderRadius: layout.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveButtonText: {
      color: colors.textPrimary,
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.lg,
    },
  }), [colors]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
      >
        {/* Live Preview */}
        <View style={styles.previewSection}>
          <AvatarCircle
            emoji={previewAvatar?.emoji ?? ''}
            size={PREVIEW_SIZE}
            frameColor={previewFrameColor}
            isSpecial={previewIsSpecial}
          />
          <Text testID="avatar-preview-label" style={styles.previewLabel}>
            {previewAvatar?.label ?? ''}
          </Text>
        </View>

        {/* Avatars Section */}
        <Text style={styles.sectionHeader}>Avatars</Text>
        <View style={styles.grid}>
          {AVATARS.map((avatar) => (
            <Pressable
              key={avatar.id}
              testID="avatar-item"
              style={[
                styles.gridItem,
                previewAvatarId === avatar.id && styles.selectedItem,
              ]}
              onPress={() => setPreviewAvatarId(avatar.id)}
            >
              <AvatarCircle emoji={avatar.emoji} size={AVATAR_ITEM_SIZE} />
            </Pressable>
          ))}
        </View>

        {/* Special Avatars Section */}
        <Text style={styles.sectionHeader}>Special Avatars</Text>
        <View style={styles.grid}>
          {SPECIAL_AVATARS.map((avatar) => {
            const unlocked = isCosmeticUnlocked(avatar.badgeId, earnedBadges);
            return (
              <Pressable
                key={avatar.id}
                testID={unlocked ? 'special-avatar-item' : 'locked-item'}
                style={[
                  styles.gridItem,
                  previewAvatarId === avatar.id && styles.selectedItem,
                  !unlocked && { opacity: 0.4 },
                ]}
                onPress={() => {
                  if (unlocked) {
                    setPreviewAvatarId(avatar.id);
                  } else {
                    setDetailItem({
                      label: avatar.label,
                      emoji: avatar.emoji,
                      badgeId: avatar.badgeId,
                      itemType: 'avatar',
                    });
                  }
                }}
              >
                <AvatarCircle
                  emoji={avatar.emoji}
                  size={AVATAR_ITEM_SIZE}
                  isSpecial={unlocked}
                />
                {!unlocked && (
                  <View style={styles.lockOverlay}>
                    <Lock size={20} color={colors.textSecondary} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Frames Section */}
        <Text style={styles.sectionHeader}>Frames</Text>
        <View style={styles.grid}>
          {FRAMES.map((frame) => {
            const unlocked = isCosmeticUnlocked(frame.badgeId, earnedBadges);
            return (
              <Pressable
                key={frame.id}
                testID={unlocked ? 'frame-item' : 'locked-item'}
                style={[
                  styles.gridItem,
                  previewFrameId === frame.id && styles.selectedItem,
                  !unlocked && { opacity: 0.4 },
                ]}
                onPress={() => {
                  if (unlocked) {
                    setPreviewFrameId(
                      previewFrameId === frame.id ? null : frame.id,
                    );
                  } else {
                    setDetailItem({
                      label: frame.label,
                      emoji: '',
                      badgeId: frame.badgeId,
                      itemType: 'frame',
                    });
                  }
                }}
              >
                <View
                  style={[
                    styles.framePreview,
                    { borderColor: frame.color },
                  ]}
                />
                {!unlocked && (
                  <View style={styles.lockOverlay}>
                    <Lock size={20} color={colors.textSecondary} />
                  </View>
                )}
                <Text style={styles.frameLabel}>{frame.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.saveContainer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable testID="save-button" style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      {/* Cosmetic Detail Overlay */}
      <CosmeticDetailOverlay
        visible={detailItem !== null}
        onClose={() => setDetailItem(null)}
        itemLabel={detailItem?.label ?? ''}
        itemEmoji={detailItem?.emoji ?? ''}
        badgeId={detailItem?.badgeId ?? ''}
        itemType={detailItem?.itemType ?? 'avatar'}
      />
    </View>
  );
}
