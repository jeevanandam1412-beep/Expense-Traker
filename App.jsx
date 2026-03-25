import 'react-native-gesture-handler';
import React, { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/store/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

const LIGHT_THEME = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6750A4',
    secondary: '#625B71',
    tertiary: '#7D5260',
    background: '#F5F5F7',
    surface: '#FFFFFF',
    surfaceVariant: '#E7E0EC',
    onSurface: '#1C1B1F',
    onSurfaceVariant: '#49454F',
  },
};

const DARK_THEME = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#D0BCFF',
    secondary: '#CCC2DC',
    tertiary: '#EFB8C8',
    background: '#0F0F10',
    surface: '#1C1B1F',
    surfaceVariant: '#2B2930',
    onSurface: '#F4EFF4',
    onSurfaceVariant: '#CAC4D0',
  },
};

function ThemedApp() {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </PaperProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <ThemedApp />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
