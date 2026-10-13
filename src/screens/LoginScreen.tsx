import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS } from '../utils/colors';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { validateLogin, getMyInfo } from '../services/api';
import { getDeviceId } from '../utils/helpers';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    checkSavedSession();
  }, []);

  const checkSavedSession = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('username');
      const savedPass = await AsyncStorage.getItem('password');
      const savedKey = await AsyncStorage.getItem('key');

      if (savedUser && savedPass && savedKey) {
        const androidId = await getDeviceId();
        const response = await getMyInfo(savedUser, savedPass, androidId, savedKey);

        if (response.valid === true) {
          navigation.replace('Dashboard', {
            username: savedUser,
            password: savedPass,
            role: response.role,
            sessionKey: response.key,
            expiredDate: response.expiredDate,
            listBug: response.listBug || [],
            listDoos: response.listDDoS || [],
            news: response.news || [],
          });
        }
      }
    } catch (error) {
      console.log('No saved session');
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const androidId = await getDeviceId();
      const response = await validateLogin(username.trim(), password.trim(), androidId);

      if (response.expired === true) {
        Alert.alert(
          '⏳ Access Expired',
          'Your access has expired. Please renew it.',
          [
            { text: 'Contact Admin', onPress: () => navigation.navigate('Landing') },
            { text: 'Close', style: 'cancel' },
          ]
        );
      } else if (response.valid !== true) {
        Alert.alert('❌ Login Failed', 'Invalid username or password.');
      } else {
        await AsyncStorage.setItem('username', username.trim());
        await AsyncStorage.setItem('password', password.trim());
        await AsyncStorage.setItem('key', response.key);

        navigation.replace('Dashboard', {
          username: username.trim(),
          password: password.trim(),
          role: response.role,
          sessionKey: response.key,
          expiredDate: response.expiredDate,
          listBug: response.listBug || [],
          listDoos: response.listDDoS || [],
          news: response.news || [],
        });
      }
    } catch (error) {
      Alert.alert('⚠️ Connection Error', 'Failed to connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <LinearGradient colors={['#1A0000', '#0A0A0A', '#1A0000']} style={styles.background}>
        {/* Decorative Circles */}
        <Animated.View
          style={[styles.circle1, { transform: [{ rotate }] }]}
        />
        <Animated.View
          style={[styles.circle2, { transform: [{ rotate: rotate }] }]}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Logo */}
              <View style={styles.logoContainer}>
                <LinearGradient colors={GRADIENTS.primary} style={styles.logoGradient}>
                  <Ionicons name="shield-checkmark" size={40} color={COLORS.primaryWhite} />
                </LinearGradient>
              </View>

              <Text style={styles.title}>SixEyesX</Text>
              <Text style={styles.subtitle}>Please Log-in</Text>

              {/* Form */}
              <View style={styles.form}>
                <CustomInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Username"
                  icon="person"
                />

                <CustomInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  icon="lock-closed"
                  secureTextEntry
                />

                <CustomButton
                  title="LOGIN"
                  onPress={handleLogin}
                  loading={isLoading}
                  style={styles.loginButton}
                />
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  circle1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: 'rgba(220, 20, 60, 0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: -150,
    right: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    borderWidth: 2,
    borderColor: 'rgba(139, 0, 0, 0.1)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  formContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accentRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    textAlign: 'center',
    fontFamily: 'Orbitron',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    fontFamily: 'ShareTechMono',
  },
  form: {
    gap: 8,
  },
  loginButton: {
    marginTop: 16,
  },
});