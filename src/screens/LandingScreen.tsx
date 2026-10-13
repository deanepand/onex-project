import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  StatusBar,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/colors';

interface LandingScreenProps {
  navigation: any;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const openTelegram = () => {
    Linking.openURL('https://t.me/ikyhousting');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <LinearGradient colors={GRADIENTS.dark} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v1.0</Text>
          </View>
        </View>

        {/* Main Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Hero Section */}
          <Animated.View style={[styles.heroCard, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.heroGradient}>
              <View style={styles.heroIconContainer}>
                <Ionicons name="shield-checkmark" size={60} color={COLORS.primaryWhite} />
              </View>
              <Text style={styles.heroTitle}>SixEyesX</Text>
              <Text style={styles.heroSubtitle}>Advanced Security Suite</Text>
            </LinearGradient>
          </Animated.View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Ionicons name="flash" size={24} color={COLORS.accentRed} />
              <Text style={styles.featureText}>DDoS Attack</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="bug" size={24} color={COLORS.accentRed} />
              <Text style={styles.featureText}>Bug Sender</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="wifi" size={24} color={COLORS.accentRed} />
              <Text style={styles.featureText}>WiFi Killer</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="search" size={24} color={COLORS.accentRed} />
              <Text style={styles.featureText}>OSINT Tools</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <LinearGradient colors={GRADIENTS.primary} style={styles.loginGradient}>
                <Ionicons name="log-in" size={20} color={COLORS.primaryWhite} />
                <Text style={styles.loginText}>LOGIN</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={openTelegram}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add" size={20} color={COLORS.accentRed} />
              <Text style={styles.registerText}>REGISTER</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Connect With Us</Text>
          <TouchableOpacity style={styles.socialButton} onPress={openTelegram}>
            <Ionicons name="paper-plane" size={24} color={COLORS.accentRed} />
          </TouchableOpacity>
          <Text style={styles.copyright}>© 2025 SixEyesX - All Rights Reserved</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 16,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.glassColor,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  versionBadge: {
    backgroundColor: COLORS.glassColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'ShareTechMono',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 40,
    shadowColor: COLORS.primaryRed,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heroGradient: {
    padding: 40,
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
    letterSpacing: 2,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'ShareTechMono',
    marginTop: 8,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  featureItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassColor,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  featureText: {
    color: COLORS.primaryWhite,
    fontSize: 14,
    marginLeft: 12,
    fontFamily: 'ShareTechMono',
  },
  buttons: {
    gap: 16,
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primaryRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  loginText: {
    color: COLORS.primaryWhite,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    letterSpacing: 1,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.accentRed,
    gap: 12,
  },
  registerText: {
    color: COLORS.accentRed,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    letterSpacing: 1,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
  },
  footerTitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: 'ShareTechMono',
    marginBottom: 16,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.glassColor,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  copyright: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontFamily: 'ShareTechMono',
  },
});