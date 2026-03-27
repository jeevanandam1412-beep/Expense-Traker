import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import DashboardScreen from '../screens/DashboardScreen';
import IncomeScreen from '../screens/IncomeScreen';
import ExpenseScreen from '../screens/ExpenseScreen';
import BorrowedLentScreen from '../screens/BorrowedLentScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useApp } from '../context/AppContext';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Dashboard: { active: 'home', inactive: 'home-outline' },
  Income: { active: 'cash', inactive: 'cash-outline' },
  Expenses: { active: 'trending-down', inactive: 'trending-down-outline' },
  Borrowed: { active: 'people', inactive: 'people-outline' },
  Reports: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

function TabBarIcon({ name, focused }) {
  const icons = TAB_ICONS[name];
  if (!icons) return null;
  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
      <Ionicons
        name={focused ? icons.active : icons.inactive}
        size={20}
        color={focused ? colors.primary : colors.navInactive}
      />
      <Text style={[styles.label, focused && styles.labelActive]}>{name}</Text>
    </View>
  );
}

export default function AppNavigator() {
  const { t } = useApp();
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />, tabBarLabel: t('dashboard') }}
        />
        <Tab.Screen
          name="Income"
          component={IncomeScreen}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="arrow-down-circle-outline" size={size} color={color} />, tabBarLabel: t('income') }}
        />
        <Tab.Screen
          name="Borrowed"
          component={BorrowedLentScreen}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />, tabBarLabel: t('borrowed') }}
        />
        <Tab.Screen
          name="Expenses"
          component={ExpenseScreen}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="arrow-up-circle-outline" size={size} color={color} />, tabBarLabel: t('expenses') }}
        />
        <Tab.Screen
          name="Reports"
          component={ReportsScreen}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="pie-chart-outline" size={size} color={color} />, tabBarLabel: t('reports') }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />, tabBarLabel: t('settings') }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 88 : 72,
    backgroundColor: colors.navBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 20,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 2,
    minWidth: 56,
  },
  iconWrapperActive: {
    backgroundColor: colors.navActiveBg,
  },
  label: {
    fontSize: 5,
    fontWeight: '600',
    color: colors.navInactive,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  labelActive: {
    color: colors.primary,
  },
});
