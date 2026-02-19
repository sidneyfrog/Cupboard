import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { TAB_LABELS } from '@/constants/strings';
import { COLORS } from '@/constants/colors';

/** Tab bar layout with four main tabs: Pantry, Recipes, Scan, Profile. */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary[600],
        tabBarInactiveTintColor: COLORS.neutral[400],
        tabBarStyle: {
          borderTopColor: COLORS.neutral[100],
          backgroundColor: COLORS.white,
        },
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: COLORS.neutral[800],
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: TAB_LABELS.PANTRY,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: TAB_LABELS.RECIPES,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📖</Text>,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: TAB_LABELS.SCAN,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📷</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: TAB_LABELS.PROFILE,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
