import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { AvatarCircle } from '@/components/avatars';
import { AVATARS } from '@/store/constants/avatars';
import type { AllAvatarId } from '@/store/constants/avatars';
import type { NewChildProfile } from '@/store/helpers/childDataHelpers';

type WizardStep = 'name' | 'age-grade' | 'avatar';

export interface ProfileCreationWizardProps {
  onComplete: (profile: NewChildProfile) => void;
  onCancel?: () => void;
  initialValues?: Partial<NewChildProfile>;
}

const NAME_MAX_LENGTH = 20;
const AGES = [5, 6, 7, 8, 9, 10, 11, 12];
const GRADES = [
  { label: 'K', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
];

export function ProfileCreationWizard({
  onComplete,
  onCancel,
  initialValues,
}: ProfileCreationWizardProps) {
  const { colors } = useTheme();

  const [step, setStep] = useState<WizardStep>('name');
  const [name, setName] = useState(initialValues?.childName ?? '');
  const [age, setAge] = useState<number | null>(initialValues?.childAge ?? null);
  const [grade, setGrade] = useState<number | null>(
    initialValues?.childGrade ?? null,
  );
  const [avatarId, setAvatarId] = useState<AllAvatarId | null>(
    initialValues?.avatarId ?? null,
  );

  const trimmedName = name.trim();
  const isNameValid =
    trimmedName.length > 0 && name.length <= NAME_MAX_LENGTH;
  const isAgeGradeValid = age !== null && grade !== null;

  function handleAgeSelect(selectedAge: number) {
    setAge(selectedAge);
    // Auto-link grade: grade = age - 5, clamped to [0, 6]
    const autoGrade = Math.max(0, Math.min(6, selectedAge - 5));
    setGrade(autoGrade);
  }

  function handleGradeSelect(selectedGrade: number) {
    setGrade(selectedGrade);
  }

  function handleNext() {
    if (step === 'name' && isNameValid) {
      setStep('age-grade');
    } else if (step === 'age-grade' && isAgeGradeValid) {
      setStep('avatar');
    }
  }

  function handleBack() {
    if (step === 'age-grade') {
      setStep('name');
    } else if (step === 'avatar') {
      setStep('age-grade');
    }
  }

  function handleDone() {
    onComplete({
      childName: trimmedName,
      childAge: age!,
      childGrade: grade!,
      avatarId,
    });
  }

  function handleAvatarSelect(id: AllAvatarId) {
    setAvatarId((prev) => (prev === id ? null : id));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cancel button */}
      {onCancel && step === 'name' && (
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
            Cancel
          </Text>
        </Pressable>
      )}

      {step === 'name' && (
        <View style={styles.stepContainer}>
          <Text style={[styles.heading, { color: colors.textPrimary }]}>
            {"What's your learner's name?"}
          </Text>

          <TextInput
            style={[
              styles.nameInput,
              {
                color: colors.textPrimary,
                borderColor: colors.surfaceLight,
                backgroundColor: colors.surface,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor={colors.textSecondary}
            maxLength={NAME_MAX_LENGTH + 5}
            autoFocus
          />

          <Text
            style={[
              styles.charCount,
              {
                color:
                  name.length > NAME_MAX_LENGTH
                    ? colors.incorrect
                    : colors.textSecondary,
              },
            ]}
          >
            {name.length}/{NAME_MAX_LENGTH}
          </Text>

          <View style={styles.buttonRow}>
            <View style={styles.buttonSpacer} />
            <Pressable
              style={[
                styles.navButton,
                {
                  backgroundColor: isNameValid
                    ? colors.primary
                    : colors.surface,
                },
              ]}
              onPress={handleNext}
              disabled={!isNameValid}
              accessibilityState={{ disabled: !isNameValid }}
            >
              <Text
                style={[
                  styles.navButtonText,
                  { color: isNameValid ? '#fff' : colors.textSecondary },
                ]}
                accessibilityState={{ disabled: !isNameValid }}
              >
                Next
              </Text>
              <ChevronRight
                size={18}
                color={isNameValid ? '#fff' : colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      )}

      {step === 'age-grade' && (
        <View style={styles.stepContainer}>
          <Text style={[styles.heading, { color: colors.textPrimary }]}>
            How old is {trimmedName}?
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectorRow}
          >
            {AGES.map((a) => (
              <Pressable
                key={a}
                style={[
                  styles.selectorChip,
                  {
                    backgroundColor:
                      age === a ? colors.primary : colors.surface,
                    borderColor:
                      age === a ? colors.primary : colors.surfaceLight,
                  },
                ]}
                onPress={() => handleAgeSelect(a)}
              >
                <Text
                  style={[
                    styles.selectorChipText,
                    { color: age === a ? '#fff' : colors.textPrimary },
                  ]}
                >
                  {String(a)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text
            style={[styles.subHeading, { color: colors.textPrimary, marginTop: 24 }]}
          >
            What grade?
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectorRow}
          >
            {GRADES.map((g) => (
              <Pressable
                key={g.value}
                style={[
                  styles.selectorChip,
                  {
                    backgroundColor:
                      grade === g.value ? colors.primary : colors.surface,
                    borderColor:
                      grade === g.value ? colors.primary : colors.surfaceLight,
                  },
                ]}
                onPress={() => handleGradeSelect(g.value)}
              >
                <Text
                  style={[
                    styles.selectorChipText,
                    {
                      color: grade === g.value ? '#fff' : colors.textPrimary,
                    },
                  ]}
                >
                  {g.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.navButton, { backgroundColor: colors.surface }]}
              onPress={handleBack}
            >
              <ChevronLeft size={18} color={colors.textPrimary} />
              <Text style={[styles.navButtonText, { color: colors.textPrimary }]}>
                Back
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.navButton,
                {
                  backgroundColor: isAgeGradeValid
                    ? colors.primary
                    : colors.surface,
                },
              ]}
              onPress={handleNext}
              disabled={!isAgeGradeValid}
              accessibilityState={{ disabled: !isAgeGradeValid }}
            >
              <Text
                style={[
                  styles.navButtonText,
                  {
                    color: isAgeGradeValid ? '#fff' : colors.textSecondary,
                  },
                ]}
                accessibilityState={{ disabled: !isAgeGradeValid }}
              >
                Next
              </Text>
              <ChevronRight
                size={18}
                color={isAgeGradeValid ? '#fff' : colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      )}

      {step === 'avatar' && (
        <View style={styles.stepContainer}>
          <Text style={[styles.heading, { color: colors.textPrimary }]}>
            Choose an avatar for {trimmedName}!
          </Text>

          <View style={styles.avatarGrid}>
            {AVATARS.map((avatar) => (
              <View
                key={avatar.id}
                style={[
                  styles.avatarCell,
                  avatarId === avatar.id && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                    borderRadius: 40,
                  },
                ]}
              >
                <AvatarCircle
                  emoji={avatar.emoji}
                  size={56}
                  onPress={() => handleAvatarSelect(avatar.id)}
                />
              </View>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.navButton, { backgroundColor: colors.surface }]}
              onPress={handleBack}
            >
              <ChevronLeft size={18} color={colors.textPrimary} />
              <Text style={[styles.navButtonText, { color: colors.textPrimary }]}>
                Back
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.navButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleDone}
            >
              <Check size={18} color="#fff" />
              <Text style={[styles.navButtonText, { color: '#fff' }]}>
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  stepContainer: {
    alignItems: 'center',
  },
  cancelButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  subHeading: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  nameInput: {
    width: '100%',
    fontSize: 20,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    textAlign: 'center',
  },
  charCount: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  selectorChip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorChipText: {
    fontSize: 18,
    fontWeight: '600',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  avatarCell: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
    gap: 16,
  },
  buttonSpacer: {
    flex: 1,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
