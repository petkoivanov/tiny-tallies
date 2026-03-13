import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  Edit2,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react-native';

import { PinGate } from '@/components/profile/PinGate';
import { ProfileCreationWizard } from '@/components/profile/ProfileCreationWizard';
import { AvatarCircle } from '@/components/avatars';
import { useAppStore } from '@/store/appStore';
import {
  resolveAvatar,
  DEFAULT_AVATAR_ID,
  SPECIAL_AVATARS,
  FRAMES,
} from '@/store/constants/avatars';
import type { AllAvatarId } from '@/store/constants/avatars';
import type { ChildData, NewChildProfile } from '@/store/helpers/childDataHelpers';

type ViewMode = 'list' | 'editing' | 'deleting';

const MAX_CHILDREN = 5;

interface ChildDisplayInfo {
  id: string;
  name: string;
  age: number;
  grade: number;
  avatarId: AllAvatarId | null;
  frameId: string | null;
}

export default function ProfileManagementScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const children = useAppStore((s) => s.children) as Record<string, ChildData>;
  const activeChildId = useAppStore((s) => s.activeChildId) as string | null;
  const activeChildName = useAppStore((s) => s.childName) as string;
  const activeChildAge = useAppStore((s) => s.childAge) as number;
  const activeChildGrade = useAppStore((s) => s.childGrade) as number;
  const activeAvatarId = useAppStore((s) => s.avatarId) as AllAvatarId | null;
  const updateChild = useAppStore((s) => s.updateChild) as (
    id: string,
    updates: Partial<Pick<ChildData, 'childName' | 'childAge' | 'childGrade' | 'avatarId'>>
  ) => void;
  const removeChild = useAppStore((s) => s.removeChild) as (id: string) => void;

  const [mode, setMode] = useState<ViewMode>('list');
  const [editingChild, setEditingChild] = useState<ChildDisplayInfo | null>(null);
  const [deletingChild, setDeletingChild] = useState<ChildDisplayInfo | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const childEntries = Object.entries(children ?? {});
  const profileCount = childEntries.length;

  // Build display info using flat state for active child
  const getChildDisplay = (childId: string, childData: ChildData): ChildDisplayInfo => {
    const isActive = childId === activeChildId;
    return {
      id: childId,
      name: isActive ? activeChildName : childData.childName,
      age: isActive ? activeChildAge : childData.childAge,
      grade: isActive ? activeChildGrade : childData.childGrade,
      avatarId: isActive ? activeAvatarId : childData.avatarId,
      frameId: childData.frameId ?? null,
    };
  };

  const formatGrade = (grade: number): string => (grade === 0 ? 'K' : String(grade));

  const handleEditPress = (child: ChildDisplayInfo) => {
    setEditingChild(child);
    setMode('editing');
  };

  const handleEditComplete = (profile: NewChildProfile, _youtubeConsent: boolean) => {
    if (editingChild) {
      updateChild(editingChild.id, {
        childName: profile.childName,
        childAge: profile.childAge,
        childGrade: profile.childGrade,
        avatarId: profile.avatarId,
      });
    }
    setEditingChild(null);
    setMode('list');
  };

  const handleDeletePress = (child: ChildDisplayInfo) => {
    setDeletingChild(child);
    setDeleteConfirmText('');
    setMode('deleting');
  };

  const handleDeleteConfirm = () => {
    if (!deletingChild) return;

    const childId = deletingChild.id;
    const childCount = Object.keys(children).length;

    removeChild(childId);

    if (childCount <= 1) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'ProfileSetup' }],
      });
    } else {
      setDeletingChild(null);
      setMode('list');
    }
  };

  const isDeleteEnabled =
    deletingChild !== null &&
    deleteConfirmText.toLowerCase() === deletingChild.name.toLowerCase();

  // --- Editing mode ---
  if (mode === 'editing' && editingChild) {
    return (
      <PinGate onCancel={() => navigation.goBack()} title="Manage Profiles">
        <ProfileCreationWizard
          initialValues={{
            childName: editingChild.name,
            childAge: editingChild.age,
            childGrade: editingChild.grade,
            avatarId: editingChild.avatarId,
          }}
          onComplete={handleEditComplete}
          onCancel={() => {
            setEditingChild(null);
            setMode('list');
          }}
        />
      </PinGate>
    );
  }

  // --- Delete confirmation modal ---
  const renderDeleteModal = () => {
    if (mode !== 'deleting' || !deletingChild) return null;

    return (
      <Modal visible transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <AlertTriangle size={40} color="#ff6b6b" />
            <Text style={styles.modalTitle}>
              Delete {deletingChild.name}&apos;s profile?
            </Text>
            <Text style={styles.modalDescription}>
              This will permanently delete all learning progress, achievements,
              and settings.
            </Text>
            <Text style={styles.modalInputLabel}>
              Type {deletingChild.name} to confirm
            </Text>
            <TextInput
              testID="delete-confirm-input"
              style={styles.modalInput}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder={deletingChild.name}
              placeholderTextColor="#555"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setDeletingChild(null);
                  setDeleteConfirmText('');
                  setMode('list');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                testID="delete-confirm-button"
                style={[
                  styles.deleteConfirmButton,
                  !isDeleteEnabled && styles.deleteConfirmButtonDisabled,
                ]}
                onPress={handleDeleteConfirm}
                disabled={!isDeleteEnabled}
                accessibilityState={{ disabled: !isDeleteEnabled }}
              >
                <Text
                  style={[
                    styles.deleteConfirmText,
                    !isDeleteEnabled && styles.deleteConfirmTextDisabled,
                  ]}
                >
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // --- List mode ---
  return (
    <PinGate onCancel={() => navigation.goBack()} title="Manage Profiles">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Profiles</Text>
          <Pressable
            testID="close-button"
            onPress={() => navigation.goBack()}
            hitSlop={12}
          >
            <X size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Profile list */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {childEntries.map(([childId, childData]) => {
            const display = getChildDisplay(childId, childData as ChildData);
            const avatar = resolveAvatar(
              (display.avatarId as string) ?? DEFAULT_AVATAR_ID
            ) ?? { emoji: '🧒' };
            const isSpecial = SPECIAL_AVATARS.some(
              (a) => a.id === display.avatarId
            );
            const frameColor = display.frameId
              ? FRAMES.find((f) => f.id === display.frameId)?.color
              : undefined;

            return (
              <View key={childId} style={styles.profileCard}>
                <AvatarCircle
                  emoji={avatar.emoji}
                  size={48}
                  frameColor={frameColor}
                  isSpecial={isSpecial}
                />
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{display.name}</Text>
                  <Text style={styles.profileDetails}>
                    Age {display.age}, Grade {formatGrade(display.grade)}
                  </Text>
                </View>
                <Pressable
                  testID="edit-button"
                  style={styles.iconButton}
                  onPress={() => handleEditPress(display)}
                  accessibilityLabel={`Edit ${display.name}`}
                >
                  <Edit2 size={20} color="#7c5cfc" />
                </Pressable>
                <Pressable
                  testID="delete-button"
                  style={styles.iconButton}
                  onPress={() => handleDeletePress(display)}
                  accessibilityLabel={`Delete ${display.name}`}
                >
                  <Trash2 size={20} color="#ff6b6b" />
                </Pressable>
              </View>
            );
          })}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.countText}>
            {profileCount} of {MAX_CHILDREN} profiles
          </Text>
          {profileCount < MAX_CHILDREN && (
            <Pressable
              testID="add-child-button"
              style={styles.addButton}
              onPress={() => navigation.navigate('ProfileSetup')}
              accessibilityLabel="Add Child"
            >
              <UserPlus size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Child</Text>
            </Pressable>
          )}
        </View>

        {renderDeleteModal()}
      </View>
    </PinGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252547',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  profileDetails: {
    fontSize: 13,
    color: '#aaa',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 12,
  },
  countText: {
    fontSize: 13,
    color: '#666',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#7c5cfc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Delete modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#252547',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  modalInputLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 20,
    marginBottom: 8,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#aaa',
  },
  deleteConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#ff4444',
  },
  deleteConfirmButtonDisabled: {
    backgroundColor: 'rgba(255,68,68,0.3)',
  },
  deleteConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  deleteConfirmTextDisabled: {
    color: 'rgba(255,255,255,0.4)',
  },
});
