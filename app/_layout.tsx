import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import '../global.css';

/** Root layout providing the navigation stack and auth initialisation. */
export default function RootLayout() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/index" options={{ headerShown: false }} />
        <Stack.Screen
          name="pantry/add"
          options={{ headerShown: true, title: 'Add Item', presentation: 'modal' }}
        />
        <Stack.Screen
          name="pantry/edit"
          options={{ headerShown: true, title: 'Edit Item', presentation: 'modal' }}
        />
        <Stack.Screen
          name="pantry/quick-add"
          options={{ headerShown: true, title: 'Quick Add', presentation: 'modal' }}
        />
        <Stack.Screen
          name="recipe/add"
          options={{ headerShown: true, title: 'Add Recipe', presentation: 'modal' }}
        />
        <Stack.Screen
          name="recipe/[id]"
          options={{ headerShown: true, title: 'Recipe' }}
        />
        <Stack.Screen
          name="recipe/edit"
          options={{ headerShown: true, title: 'Edit Recipe', presentation: 'modal' }}
        />
        <Stack.Screen
          name="recipe/import"
          options={{ headerShown: true, title: 'Import Recipe', presentation: 'modal' }}
        />
        <Stack.Screen
          name="scan/barcode"
          options={{ headerShown: true, title: 'Scan Barcode' }}
        />
        <Stack.Screen
          name="scan/receipt"
          options={{ headerShown: true, title: 'Scan Receipt' }}
        />
        <Stack.Screen
          name="scan/ingredient"
          options={{ headerShown: true, title: 'Identify Ingredients' }}
        />
        <Stack.Screen
          name="scan/recipe-scan"
          options={{ headerShown: true, title: 'Scan Recipe' }}
        />
      </Stack>
    </>
  );
}
