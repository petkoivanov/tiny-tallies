// Polyfills for @google/genai compatibility with React Native
// These MUST be imported before anything else
import 'react-native-url-polyfill/auto';
import 'text-encoding-polyfill';
import 'cross-fetch/polyfill';

import { registerRootComponent } from 'expo';
import React from 'react';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
