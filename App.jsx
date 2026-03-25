import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <AppProvider>
          <AppNavigator />
        </AppProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
