import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/colors';
import { changePassword } from '../services/api';

interface ChangePasswordScreenProps {
  navigation: any;
  route: {
    params: {
      username: string;
      sessionKey: string;
    };
  };
}

export const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({
  navigation,
  route,
}) => {
  const { username } = route.params;

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = async () => {
    if (!oldPass.trim() || !newPass.trim() || !confirmPass.trim()) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (newPass !== confirmPass) {
      Alert.alert('Error', "New password doesn't match confirmation.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await changePassword(username, oldPass, newPass);
      if (response.success === true) {
        Alert.alert('Success', 'Password changed successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to change password.');
      }
    } catch (error) {
      Alert.alert('Error', 'Server error.');
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordField = ({
    label,
    value,
    onChangeText,
    show,
    onToggle,
  }: any) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          placeholder="••••••••"
          placeholderTextColor={COLORS.accentGrey}
        />
        <TouchableOpacity onPress={onToggle} style={styles.eyeButton}>
          <Ionicons
            name={show ? 'eye-off' : 'eye'}
            size={20}
            color={COLORS.accentGrey}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <LinearGradient colors={GRADIENTS.dark} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primaryWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Security Settings</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="lock-closed" size={20} color={COLORS.accentRed} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero */}
          <LinearGradient colors={GRADIENTS.primary} style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="lock-closed" size={40} color={COLORS.primaryWhite} />
            </View>
            <Text style={styles.heroTitle}>Change Password</Text>
            <Text style={styles.heroSubtitle}>
              Update your password to keep your account secure
            </Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <Text style={styles.usernameText}>Username: {username}</Text>

            <PasswordField
              label="Current Password"
              value={oldPass}
              onChangeText={setOldPass}
              show={showOld}
              onToggle={() => setShowOld(!showOld)}
            />

            <PasswordField
              label="New Password"
              value={newPass}
              onChangeText={setNewPass}
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
            />

            <PasswordField
              label="Confirm New Password"
              value={confirmPass}
              onChangeText={setConfirmPass}
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleChange}
              disabled={isLoading}
            >
              <LinearGradient colors={GRADIENTS.primary} style={styles.submitGradient}>
                {isLoading ? (
                  <ActivityIndicator color={COLORS.primaryWhite} />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={20} color={COLORS.primaryWhite} />
                    <Text style={styles.submitText}>UPDATE PASSWORD</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={20} color={COLORS.lightRed} />
              <Text style={styles.tipsTitle}>Security Tips</Text>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.lightRed} />
              <Text style={styles.tipText}>
                Use a combination of letters, numbers, and symbols
              </Text>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.lightRed} />
              <Text style={styles.tipText}>
                Make your password at least 8 characters long
              </Text>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.lightRed} />
              <Text style={styles.tipText}>
                Avoid using personal information in your password
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  background: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.glassColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
    marginLeft: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { padding: 16, paddingBottom: 40 },
  heroCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'ShareTechMono',
    marginTop: 8,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.primaryWhite,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    marginBottom: 8,
  },
  usernameText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: 'ShareTechMono',
    marginBottom: 24,
  },
  fieldContainer: { marginBottom: 16 },
  fieldLabel: {
    color: COLORS.primaryWhite,
    fontSize: 14,
    fontFamily: 'ShareTechMono',
    marginBottom: 8,
  },
  inputWrapper: { position: 'relative' },
  input: {
    backgroundColor: COLORS.cardDarker,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    color: COLORS.primaryWhite,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontFamily: 'ShareTechMono',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitText: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  tipsCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontFamily: 'ShareTechMono',
  },
});