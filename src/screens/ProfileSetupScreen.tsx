import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PinGate } from '@/components/profile/PinGate';
import { PrivacyDisclosure } from '@/components/profile/PrivacyDisclosure';
import { ProfileCreationWizard } from '@/components/profile/ProfileCreationWizard';
import { useAppStore } from '@/store/appStore';
import type { NewChildProfile } from '@/store/helpers/childDataHelpers';
import {
  hasPrivacyAcknowledged,
  setPrivacyAcknowledged,
} from '@/services/consent/privacyStorage';

/**
 * ProfileSetupScreen handles two flows:
 * 1. Fresh install (no children): PinGate create -> Disclosure -> wizard -> Home
 * 2. Add another child (children exist): PinGate verify -> wizard -> Home
 *
 * Also handles _needsMigrationPrompt for v0.7 -> v0.8 migration.
 */
export default function ProfileSetupScreen() {
  const navigation = useNavigation();

  const childCount = useAppStore(
    (s) => Object.keys(s.children ?? {}).length,
  );
  const addChild = useAppStore((s) => s.addChild);
  const needsMigrationPrompt = useAppStore((s) => s._needsMigrationPrompt);
  const setMigrationComplete = useAppStore((s) => s.setMigrationComplete);
  const setYoutubeConsentGranted = useAppStore((s) => s.setYoutubeConsentGranted);

  const isFreshInstall = childCount === 0;

  const [showDisclosure, setShowDisclosure] = useState(false);
  const [disclosureChecked, setDisclosureChecked] = useState(false);

  useEffect(() => {
    if (isFreshInstall) {
      hasPrivacyAcknowledged().then((acked) => {
        setShowDisclosure(!acked);
        setDisclosureChecked(true);
      });
    } else {
      setDisclosureChecked(true);
    }
  }, [isFreshInstall]);

  const handleDisclosureAccept = useCallback(async () => {
    await setPrivacyAcknowledged();
    setShowDisclosure(false);
  }, []);

  function handleComplete(profile: NewChildProfile, youtubeConsent: boolean) {
    addChild(profile);
    if (youtubeConsent) setYoutubeConsentGranted(true);

    if (needsMigrationPrompt) {
      setMigrationComplete();
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }

  function handlePinCancel() {
    if (isFreshInstall) {
      return;
    }
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <PinGate
        onCancel={handlePinCancel}
        title={isFreshInstall ? 'Parent Setup' : undefined}
        subtitle={
          isFreshInstall ? 'Create a PIN to manage profiles' : undefined
        }
      >
        {disclosureChecked && showDisclosure ? (
          <PrivacyDisclosure onAccept={handleDisclosureAccept} />
        ) : (
          <>
            {needsMigrationPrompt && (
              <View style={styles.migrationBanner}>
                <Text style={styles.migrationText}>
                  {"Welcome! Let's set up your learner's profile."}
                </Text>
              </View>
            )}
            <ProfileCreationWizard
              onComplete={handleComplete}
              onCancel={isFreshInstall ? undefined : () => navigation.goBack()}
            />
          </>
        )}
      </PinGate>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  migrationBanner: {
    padding: 16,
    alignItems: 'center',
  },
  migrationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});
