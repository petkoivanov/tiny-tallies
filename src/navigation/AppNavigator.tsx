import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import HomeScreen from '@/screens/HomeScreen';
import SessionScreen from '@/screens/SessionScreen';
import ResultsScreen from '@/screens/ResultsScreen';
import SandboxScreen from '@/screens/SandboxScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1a1a2e' },
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
    </Stack.Navigator>
  );
}
