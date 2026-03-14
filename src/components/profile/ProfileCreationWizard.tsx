import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChevronLeft, ChevronRight, Check, PlayCircle, BookOpen, Shield, BarChart3, Palette } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { THEMES } from '@/theme/colors';
import type { ThemeId, ThemeColors } from '@/theme/colors';
import { AvatarCircle } from '@/components/avatars';
import { StateSelector } from '@/components/shared/StateSelector';
import { AVATARS } from '@/store/constants/avatars';
import type { AllAvatarId } from '@/store/constants/avatars';
import type { NewChildProfile } from '@/store/helpers/childDataHelpers';
import type { StateCode } from '@/store/slices/childProfileSlice';

type WizardStep = 'name' | 'age-grade' | 'location' | 'avatar' | 'theme' | 'youtube';

const FREE_THEMES: { id: ThemeId; emoji: string; label: string }[] = [
  { id: 'candy', emoji: '\uD83C\uDF6C', label: 'Candy' },
  { id: 'sky', emoji: '\u2601\uFE0F', label: 'Sky' },
  { id: 'dark', emoji: '\uD83C\uDF11', label: 'Dark' },
];

export interface ProfileCreationWizardProps {
  onComplete: (profile: NewChildProfile, youtubeConsent: boolean) => void;
  onCancel?: () => void;
  initialValues?: Partial<NewChildProfile>;
}

const NAME_MAX_LENGTH = 20;
const AGES = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const GRADES = [
  { label: 'K', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
  { label: '9', value: 9 },
  { label: '10', value: 10 },
  { label: '11', value: 11 },
  { label: '12', value: 12 },
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
  const [stateCode, setStateCode] = useState<StateCode>(
    initialValues?.stateCode ?? null,
  );
  const [themeId, setThemeId] = useState<ThemeId>(initialValues?.themeId ?? 'candy');
  const [youtubeConsent, setYoutubeConsent] = useState(false);

  const trimmedName = name.trim();
  const isNameValid =
    trimmedName.length > 0 && name.length <= NAME_MAX_LENGTH;
  const isAgeGradeValid = age !== null && grade !== null;

  function handleAgeSelect(selectedAge: number) {
    setAge(selectedAge);
    const autoGrade = Math.max(0, Math.min(12, selectedAge - 5));
    setGrade(autoGrade);
  }

  function handleNext() {
    if (step === 'name' && isNameValid) {
      setStep('age-grade');
    } else if (step === 'age-grade' && isAgeGradeValid) {
      setStep('location');
    } else if (step === 'location') {
      setStep('avatar');
    } else if (step === 'avatar') {
      setStep('theme');
    } else if (step === 'theme') {
      setStep('youtube');
    }
  }

  function handleBack() {
    if (step === 'age-grade') setStep('name');
    else if (step === 'location') setStep('age-grade');
    else if (step === 'avatar') setStep('location');
    else if (step === 'theme') setStep('avatar');
    else if (step === 'youtube') setStep('theme');
  }

  function handleDone() {
    onComplete(
      {
        childName: trimmedName,
        childAge: age!,
        childGrade: grade!,
        avatarId,
        stateCode,
        themeId,
      },
      youtubeConsent,
    );
  }

  function handleAvatarSelect(id: AllAvatarId) {
    setAvatarId((prev) => (prev === id ? null : id));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
                { backgroundColor: isNameValid ? colors.primary : colors.surface },
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
                    backgroundColor: age === a ? colors.primary : colors.surface,
                    borderColor: age === a ? colors.primary : colors.surfaceLight,
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
                    backgroundColor: grade === g.value ? colors.primary : colors.surface,
                    borderColor: grade === g.value ? colors.primary : colors.surfaceLight,
                  },
                ]}
                onPress={() => setGrade(g.value)}
              >
                <Text
                  style={[
                    styles.selectorChipText,
                    { color: grade === g.value ? '#fff' : colors.textPrimary },
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
                { backgroundColor: isAgeGradeValid ? colors.primary : colors.surface },
              ]}
              onPress={handleNext}
              disabled={!isAgeGradeValid}
              accessibilityState={{ disabled: !isAgeGradeValid }}
            >
              <Text
                style={[
                  styles.navButtonText,
                  { color: isAgeGradeValid ? '#fff' : colors.textSecondary },
                ]}
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

      {step === 'location' && (
        <View style={styles.stepContainer}>
          <Text style={[styles.heading, { color: colors.textPrimary }]}>
            Where does {trimmedName} go to school?
          </Text>
          <Text
            style={[styles.locationSubtext, { color: colors.textSecondary }]}
          >
            Optional — helps compare with kids in your state.
          </Text>
          <StateSelector
            value={stateCode}
            onChange={setStateCode}
            activeColor={colors.primary}
            inactiveColor={colors.surface}
            activeBorderColor={colors.primary}
            inactiveBorderColor={colors.surfaceLight}
            activeTextColor="#fff"
            inactiveTextColor={colors.textPrimary}
          />
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
              style={[styles.navButton, { backgroundColor: colors.primary }]}
              onPress={handleNext}
            >
              <Text style={[styles.navButtonText, { color: '#fff' }]}>
                {stateCode ? 'Next' : 'Skip'}
              </Text>
              <ChevronRight size={18} color="#fff" />
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
              style={[styles.navButton, { backgroundColor: colors.primary }]}
              onPress={handleNext}
            >
              <ChevronRight size={18} color="#fff" />
              <Text style={[styles.navButtonText, { color: '#fff' }]}>
                Next
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {step === 'theme' && (
        <View style={styles.stepContainer}>
          <Palette size={40} color={colors.primary} style={{ marginBottom: 12 }} />
          <Text style={[styles.heading, { color: colors.textPrimary, marginBottom: 8 }]}>
            Pick a look for {trimmedName}
          </Text>
          <Text style={[styles.locationSubtext, { color: colors.textSecondary }]}>
            You can always change this later.
          </Text>
          <View style={styles.themeGrid}>
            {FREE_THEMES.map((t) => {
              const tc: ThemeColors = THEMES[t.id];
              const selected = themeId === t.id;
              return (
                <Pressable
                  key={t.id}
                  testID={`theme-pick-${t.id}`}
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: tc.background,
                      borderColor: selected ? tc.primary : tc.surfaceLight,
                      borderWidth: selected ? 3 : 1,
                    },
                  ]}
                  onPress={() => setThemeId(t.id)}
                >
                  <Text style={{ fontSize: 28 }}>{t.emoji}</Text>
                  <Text style={[styles.themeCardLabel, { color: tc.textPrimary }]}>
                    {t.label}
                  </Text>
                  <View style={styles.swatchRow}>
                    {[tc.primary, tc.primaryLight, tc.surface, tc.textPrimary].map((c, i) => (
                      <View key={i} style={[styles.swatchDot, { backgroundColor: c }]} />
                    ))}
                  </View>
                  {selected && (
                    <View style={[styles.themeCheck, { backgroundColor: tc.primary }]}>
                      <Check size={14} color="#fff" strokeWidth={3} />
                    </View>
                  )}
                </Pressable>
              );
            })}
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
              style={[styles.navButton, { backgroundColor: colors.primary }]}
              onPress={handleNext}
            >
              <Text style={[styles.navButtonText, { color: '#fff' }]}>
                Next
              </Text>
              <ChevronRight size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}

      {step === 'youtube' && (
        <View style={styles.stepContainer}>
          <PlayCircle size={48} color={colors.primary} style={{ marginBottom: 12 }} />
          <Text style={[styles.heading, { color: colors.textPrimary, marginBottom: 8 }]}>
            Give {trimmedName} a secret weapon
          </Text>
          <Text style={[styles.locationSubtext, { color: colors.textSecondary, marginBottom: 20 }]}>
            When {trimmedName} gets stuck, a short Khan Academy video
            — matched to the exact topic — can turn confusion into an "aha!" moment.
          </Text>
          <View style={[styles.benefitList, { backgroundColor: colors.surface, borderRadius: 12 }]}>
            <View style={styles.benefitRow}>
              <BookOpen size={20} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.textPrimary }]}>
                Curated from Khan Academy — trusted by millions of parents
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <BarChart3 size={20} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.textPrimary }]}>
                See what {trimmedName} watched and if it helped in your Parent Report
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Shield size={20} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.textPrimary }]}>
                No ads, no recommendations — just the lesson they need
              </Text>
            </View>
          </View>
          <View style={[styles.optInNotice, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}40` }]}>
            <Text style={[styles.optInText, { color: colors.textPrimary }]}>
              You must opt-in for video lessons to have these recommendations be part of the app.
            </Text>
          </View>
          <View style={[styles.youtubeToggleRow, { backgroundColor: youtubeConsent ? `${colors.primaryLight}20` : colors.surface, borderRadius: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.navButtonText, { color: colors.textPrimary, fontSize: 16 }]}>
                Enable video lessons
              </Text>
              <Text style={[styles.charCount, { color: colors.textSecondary, marginTop: 2 }]}>
                Change anytime in Parental Controls
              </Text>
            </View>
            <Switch
              testID="youtube-consent-onboarding"
              value={youtubeConsent}
              onValueChange={setYoutubeConsent}
              trackColor={{ true: colors.primary }}
            />
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
              style={[styles.navButton, { backgroundColor: colors.primary }]}
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
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  stepContainer: { alignItems: 'center' },
  cancelButton: { position: 'absolute', top: 16, left: 16, zIndex: 10, padding: 8 },
  cancelText: { fontSize: 16 },
  heading: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  subHeading: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  nameInput: {
    width: '100%', fontSize: 20, padding: 16,
    borderWidth: 1, borderRadius: 12, textAlign: 'center',
  },
  charCount: { fontSize: 12, marginTop: 8, marginBottom: 16 },
  selectorRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 8, paddingVertical: 8 },
  selectorChip: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  selectorChipText: { fontSize: 18, fontWeight: '600' },
  locationSubtext: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  avatarGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 12, marginBottom: 24,
  },
  avatarCell: { padding: 4, alignItems: 'center', justifyContent: 'center' },
  optInNotice: {
    width: '100%', padding: 12, borderRadius: 10, borderWidth: 1,
    marginBottom: 12,
  },
  optInText: {
    fontSize: 13, fontWeight: '700', textAlign: 'center', lineHeight: 18,
  },
  benefitList: {
    width: '100%', padding: 16, gap: 14, marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  benefitText: {
    fontSize: 14, lineHeight: 20, flex: 1,
  },
  youtubeToggleRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 12, width: '100%', marginBottom: 24,
  },
  themeGrid: {
    flexDirection: 'row', gap: 12, marginBottom: 8, flexWrap: 'wrap',
    justifyContent: 'center',
  },
  themeCard: {
    width: 100, alignItems: 'center', padding: 12, borderRadius: 16, gap: 6,
  },
  themeCardLabel: { fontSize: 14, fontWeight: '600' },
  swatchRow: { flexDirection: 'row', gap: 4 },
  swatchDot: { width: 12, height: 12, borderRadius: 6 },
  themeCheck: {
    position: 'absolute', top: 6, right: 6,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%', marginTop: 24, gap: 16,
  },
  buttonSpacer: { flex: 1 },
  navButton: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, gap: 8,
  },
  navButtonText: { fontSize: 16, fontWeight: '600' },
});
