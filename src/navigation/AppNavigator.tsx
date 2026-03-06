import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import HomeScreen from '@/screens/HomeScreen';
import SessionScreen from '@/screens/SessionScreen';
import ResultsScreen from '@/screens/ResultsScreen';
import SandboxScreen from '@/screens/SandboxScreen';
import ConsentScreen from '@/screens/ConsentScreen';
import BadgeCollectionScreen from '@/screens/BadgeCollectionScreen';
import SkillMapScreen from '@/screens/SkillMapScreen';
import AvatarPickerScreen from '@/screens/AvatarPickerScreen';
import ThemePickerScreen from '@/screens/ThemePickerScreen';
import ProfileSetupScreen from '@/screens/ProfileSetupScreen';
import ProfileManagementScreen from '@/screens/ProfileManagementScreen';
import { useTheme } from '@/theme';
import { useAppStore } from '@/store/appStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { colors } = useTheme();
  const childCount = useAppStore((s) => Object.keys(s.children).length);

  return (
    <Stack.Navigator
      initialRouteName={childCount > 0 ? 'Home' : 'ProfileSetup'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Session"
        component={SessionScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="Sandbox" component={SandboxScreen} />
      <Stack.Screen name="BadgeCollection" component={BadgeCollectionScreen} />
      <Stack.Screen name="SkillMap" component={SkillMapScreen} />
      <Stack.Screen name="AvatarPicker" component={AvatarPickerScreen} options={{ title: 'Choose Avatar' }} />
      <Stack.Screen name="ThemePicker" component={ThemePickerScreen} options={{ title: 'Choose Theme' }} />
      <Stack.Screen
        name="Consent"
        component={ConsentScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="ProfileSetup"
        component={ProfileSetupScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="ProfileManagement" component={ProfileManagementScreen} />
    </Stack.Navigator>
  );
}
