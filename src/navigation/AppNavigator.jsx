import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useApp } from '../store/AppContext';

import DashboardScreen from '../screens/DashboardScreen';
import IncomeScreen from '../screens/IncomeScreen';
import ExpenseScreen from '../screens/ExpenseScreen';
import BorrowedScreen from '../screens/BorrowedScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.surfaceVariant,
          height: 62,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: theme.colors.surface, elevation: 0, shadowOpacity: 0 },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Income"
        component={IncomeScreen}
        options={{
          title: 'Income',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="trending-up" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Expense"
        component={ExpenseScreen}
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="trending-down" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Borrowed"
        component={BorrowedScreen}
        options={{
          title: 'Borrowed',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="handshake" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-bar" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';

  const navTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: '#0F0F0F' } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#F5F5F5' } };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: true, title: 'Settings', presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
