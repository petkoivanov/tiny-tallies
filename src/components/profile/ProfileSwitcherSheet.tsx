import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, Shield } from 'lucide-react-native';
import { useAppStore } from '@/store/appStore';
import { AvatarCircle } from '@/components/avatars';
import {
  resolveAvatar,
  DEFAULT_AVATAR_ID,
  SPECIAL_AVATARS,
  FRAMES,
} from '@/store/constants/avatars';
import type { ChildData } from '@/store/helpers/childDataHelpers';

const MAX_CHILDREN = 5;

interface ProfileSwitcherSheetProps {
  visible: boolean;
  onClose: () => void;
  onManageProfiles: () => void;
}

export function ProfileSwitcherSheet({
  visible,
  onClose,
  onManageProfiles,
}: ProfileSwitcherSheetProps) {
  const children = useAppStore((s) => s.children);
  const activeChildId = useAppStore((s) => s.activeChildId);
  const activeChildName = useAppStore((s) => s.childName);
  const activeAvatarId = useAppStore((s) => s.avatarId);
  const switchChild = useAppStore((s) => s.switchChild);

  const childEntries = Object.entries(
    (children ?? {}) as Record<string, ChildData>
  );
  const profileCount = childEntries.length;

  const handleProfilePress = (childId: string) => {
    if (childId === activeChildId) return;
    switchChild(childId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        testID="switcher-backdrop"
      >
        <View />
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.title}>Switch Profile</Text>

        {childEntries.map(([childId, childData]) => {
          const isActive = childId === activeChildId;
          // Use flat state for active child (Pitfall 4: avoid stale map data)
          const name = isActive
            ? (activeChildName as string)
            : childData.childName;
          const avatarIdForChild = isActive
            ? (activeAvatarId as string | null)
            : childData.avatarId;

          const avatar = resolveAvatar(avatarIdForChild ?? DEFAULT_AVATAR_ID) ?? {
            emoji: '🧒',
          };
          const isSpecial = SPECIAL_AVATARS.some(
            (a) => a.id === avatarIdForChild
          );
          const frameColor = childData.frameId
            ? FRAMES.find((f) => f.id === childData.frameId)?.color
            : undefined;

          return (
            <Pressable
              key={childId}
              style={[styles.profileRow, isActive && styles.profileRowActive]}
              onPress={() => handleProfilePress(childId)}
              accessibilityRole="button"
              accessibilityLabel={`${name}${isActive ? ', active' : ''}`}
            >
              <AvatarCircle
                emoji={avatar.emoji}
                size={40}
                frameColor={frameColor}
                isSpecial={isSpecial}
              />
              <Text style={[styles.profileName, isActive && styles.profileNameActive]}>
                {name}
              </Text>
              {isActive && <Check size={20} color="#7c5cfc" strokeWidth={3} />}
            </Pressable>
          );
        })}

        <View style={styles.divider} />

        <Pressable
          style={styles.manageRow}
          onPress={onManageProfiles}
          accessibilityRole="button"
          accessibilityLabel="Manage Profiles"
        >
          <Shield size={20} color="#aaa" />
          <Text style={styles.manageText}>Manage Profiles</Text>
        </Pressable>

        <Text style={styles.countText}>
          {profileCount} of {MAX_CHILDREN} profiles
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  profileRowActive: {
    backgroundColor: 'rgba(124,92,252,0.1)',
  },
  profileName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  profileNameActive: {
    fontWeight: '700',
    color: '#7c5cfc',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 12,
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  manageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#aaa',
  },
  countText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});
