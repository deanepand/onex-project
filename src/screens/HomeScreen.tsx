import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { COLORS, GRADIENTS } from '../utils/colors';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { sendBug } from '../services/api';
import { formatPhoneNumber } from '../utils/helpers';

interface HomeScreenProps {
  route: {
    params: {
      sessionKey: string;
      username: string;
      role: string;
      expiredDate: string;
      listBug: any[];
    };
  };
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ route }) => {
  const { sessionKey, username, role, expiredDate, listBug } = route.params;

  const [target, setTarget] = useState('');
  const [selectedBug, setSelectedBug] = useState(listBug[0]?.bug_id || '');
  const [isSending, setIsSending] = useState(false);
  const [showBugList, setShowBugList] = useState(false);

  const handleSendBug = async () => {
    const formattedTarget = formatPhoneNumber(target);

    if (!formattedTarget) {
      Alert.alert('Invalid Number', 'Use international format (e.g., +62, +1, +44)');
      return;
    }

    setIsSending(true);

    try {
      const response = await sendBug(sessionKey, selectedBug, formattedTarget);

      if (response.cooldown === true) {
        Alert.alert('⏳ Cooldown', 'Please wait before sending again.');
      } else if (response.valid === false) {
        Alert.alert('❌ Invalid Key', 'Your session key is invalid.');
      } else if (response.sended === false) {
        Alert.alert('⚠️ Failed', 'Server may be under maintenance.');
      } else {
        Alert.alert('✅ Success', `Bug sent to ${formattedTarget}!`);
        setTarget('');
      }
    } catch (error) {
      Alert.alert('❌ Error', 'An unexpected error occurred.');
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', 'Text copied to clipboard');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <LinearGradient colors={GRADIENTS.dark} style={styles.background}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Bug Sender</Text>
            <Text style={styles.subtitle}>Send bugs to target numbers</Text>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={24} color={COLORS.primaryWhite} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.userRole}>{role?.toUpperCase()}</Text>
            </View>
            <View style={styles.expiryBadge}>
              <Text style={styles.expiryLabel}>EXPIRES</Text>
              <Text style={styles.expiryDate}>{expiredDate}</Text>
            </View>
          </View>

          {/* Control Panel */}
          <View style={styles.controlPanel}>
            <Text style={styles.panelTitle}>Control Panel</Text>

            <CustomInput
              label="Target Number"
              value={target}
              onChangeText={setTarget}
              placeholder="e.g. +62xxxxxxxxxx"
              icon="phone-portrait"
              keyboardType="phone-pad"
            />

            {/* Bug Selection */}
            <Text style={styles.inputLabel}>Select Bug</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowBugList(!showBugList)}
            >
              <Text style={styles.dropdownText}>
                {listBug.find(b => b.bug_id === selectedBug)?.bug_name || 'Select Bug'}
              </Text>
              <Ionicons
                name={showBugList ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.accentRed}
              />
            </TouchableOpacity>

            {showBugList && (
              <View style={styles.dropdownList}>
                {listBug.map((bug, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      bug.bug_id === selectedBug && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setSelectedBug(bug.bug_id);
                      setShowBugList(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        bug.bug_id === selectedBug && styles.dropdownItemTextActive,
                      ]}
                    >
                      {bug.bug_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <CustomButton
              title="SEND BUG"
              onPress={handleSendBug}
              loading={isSending}
              style={styles.sendButton}
              icon={<Ionicons name="send" size={20} color={COLORS.primaryWhite} />}
            />
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={COLORS.accentRed} />
            <Text style={styles.infoText}>
              Cooldown varies by role: member (300s), reseller (240s), vip (60s), owner (0s)
            </Text>
          </View>
        </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.accentGrey,
    fontFamily: 'ShareTechMono',
    marginTop: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.accentRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
  },
  userRole: {
    fontSize: 12,
    color: COLORS.accentRed,
    fontFamily: 'ShareTechMono',
  },
  expiryBadge: {
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  expiryLabel: {
    fontSize: 10,
    color: COLORS.accentGrey,
    fontFamily: 'ShareTechMono',
  },
  expiryDate: {
    fontSize: 12,
    color: COLORS.primaryWhite,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  controlPanel: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
    marginBottom: 20,
  },
  inputLabel: {
    color: COLORS.primaryWhite,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: 'ShareTechMono',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardDarker,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  dropdownText: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontFamily: 'ShareTechMono',
  },
  dropdownList: {
    backgroundColor: COLORS.cardDarker,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
  },
  dropdownItemText: {
    color: COLORS.accentGrey,
    fontSize: 14,
    fontFamily: 'ShareTechMono',
  },
  dropdownItemTextActive: {
    color: COLORS.accentRed,
    fontWeight: 'bold',
  },
  sendButton: {
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
  },
  infoText: {
    flex: 1,
    color: COLORS.accentGrey,
    fontSize: 12,
    marginLeft: 12,
    fontFamily: 'ShareTechMono',
  },
});