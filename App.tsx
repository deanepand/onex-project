import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import { AppNavigator } from './src/navigation/AppNavigator';
import { COLORS } from './src/utils/colors';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadFonts();
  }, []);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        Orbitron: require('./assets/fonts/Orbitron-Regular.ttf'),
        'Orbitron-Bold': require('./assets/fonts/Orbitron-Bold.ttf'),
        ShareTechMono: require('./assets/fonts/ShareTechMono-Regular.ttf'),
        ...Ionicons.font,
      });
      setFontsLoaded(true);
    } catch (error) {
      console.log('Font loading error:', error);
      setFontsLoaded(true); // Continue with default fonts
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accentRed} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: COLORS.accentRed,
              background: COLORS.primaryDark,
              card: COLORS.cardDark,
              text: COLORS.primaryWhite,
              border: 'rgba(220, 20, 60, 0.3)',
              notification: COLORS.accentRed,
            },
          }}
        >
          <StatusBar style="light" />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: COLORS.primaryWhite,
    fontSize: 14,
    fontFamily: 'ShareTechMono',
    letterSpacing: 2,
  },
});