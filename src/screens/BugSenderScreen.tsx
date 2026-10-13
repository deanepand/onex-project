import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/colors';
import { getMySender, getPairing, deleteSender } from '../services/api';

interface BugSenderScreenProps {
  navigation: any;
  route: {
    params: {
      sessionKey: string;
    };
  };
}

export const BugSenderScreen: React.FC<BugSenderScreenProps> = ({ navigation, route }) => {
  const { sessionKey } = route.params;

  const [senders, setSenders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [pairingCode, setPairingCode] = useState('');
  const [pairingNumber, setPairingNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchSenders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getMySender(sessionKey);
      if (response.valid === true) {
        setSenders(response.connections || []);
      }
    } catch (error) {
      console.log('Failed to fetch senders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionKey]);

  useEffect(() => {
    fetchSenders();
  }, [fetchSenders]);

  const handleAddSender = async () => {
    const number = phoneNumber.trim();
    if (!number) {
      Alert.alert('Error', 'Please enter phone number.');
      return;
    }

    setIsAdding(true);
    try {
      const response = await getPairing(sessionKey, number);
      if (response.valid === true) {
        setPairingCode(response.pairingCode);
        setPairingNumber(number);
        setShowAddModal(false);
        setShowPairingModal(true);
        setPhoneNumber('');
      } else {
        Alert.alert('Error', response.message || 'Failed to generate pairing code.');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = (senderId: string) => {
    Alert.alert('Confirm Delete', 'Delete this sender?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await deleteSender(sessionKey, senderId);
            if (response.valid === true) {
              Alert.alert('Success', 'Sender deleted.');
              fetchSenders();
            } else {
              Alert.alert('Error', response.message || 'Failed to delete.');
            }
          } catch (error) {
            Alert.alert('Error', 'Connection failed.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <LinearGradient colors={['#000000', 'rgba(220, 20, 60, 0.05)']} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primaryWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Bug Sender</Text>
          <TouchableOpacity onPress={fetchSenders} style={styles.refreshButton}>
            <Ionicons name="refresh" size={22} color={COLORS.primaryWhite} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchSenders}
              tintColor={COLORS.accentRed}
            />
          }
        >
          {senders.length === 0 && !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="phone-portrait" size={80} color={COLORS.primaryWhite} />
              <Text style={styles.emptyTitle}>No Senders Found</Text>
              <Text style={styles.emptySubtitle}>
                Add your first WhatsApp sender to get started
              </Text>
              <TouchableOpacity style={styles.emptyAddButton} onPress={() => setShowAddModal(true)}>
                <Ionicons name="add" size={20} color={COLORS.primaryWhite} />
                <Text style={styles.emptyAddText}>ADD FIRST SENDER</Text>
              </TouchableOpacity>
            </View>
          ) : (
            senders.map((sender, index) => (
              <View key={index} style={styles.senderCard}>
                <View style={styles.senderHeader}>
                  <View
                    style={[
                      styles.statusIcon,
                      {
                        backgroundColor: sender.connected
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                      },
                    ]}
                  >
                    <Ionicons
                      name={sender.connected ? 'checkmark-circle' : 'close-circle'}
                      size={24}
                      color={sender.connected ? COLORS.successGreen : COLORS.dangerRed}
                    />
                  </View>
                  <View style={styles.senderInfo}>
                    <Text style={styles.senderName}>
                      {sender.sessionName || 'Unnamed'}
                    </Text>
                    <Text style={styles.senderNumber}>{sender.phone || 'Unknown'}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: sender.connected
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                        borderColor: sender.connected
                          ? 'rgba(16, 185, 129, 0.5)'
                          : 'rgba(239, 68, 68, 0.5)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: sender.connected ? COLORS.successGreen : COLORS.dangerRed,
                        },
                      ]}
                    >
                      {sender.connected ? 'Connected' : 'Disconnected'}
                    </Text>
                  </View>
                </View>

                <View style={styles.senderActions}>
                  <TouchableOpacity
                    style={styles.refreshActionButton}
                    onPress={fetchSenders}
                  >
                    <Ionicons name="refresh" size={16} color={COLORS.primaryWhite} />
                    <Text style={styles.refreshActionText}>REFRESH</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteActionButton}
                    onPress={() => handleDelete(sender.id)}
                  >
                    <Ionicons name="trash" size={16} color={COLORS.dangerRed} />
                    <Text style={styles.deleteActionText}>DELETE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={28} color={COLORS.primaryWhite} />
        </TouchableOpacity>

        {/* Add Modal */}
        <Modal visible={showAddModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIcon}>
                  <Ionicons name="add-circle" size={24} color={COLORS.primaryWhite} />
                </View>
                <Text style={styles.modalTitle}>Add New Sender</Text>
              </View>

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="62xxx"
                placeholderTextColor="rgba(220, 20, 60, 0.5)"
                keyboardType="phone-pad"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleAddSender}
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <ActivityIndicator color={COLORS.primaryWhite} size="small" />
                  ) : (
                    <Text style={styles.confirmText}>ADD SENDER</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Pairing Modal */}
        <Modal visible={showPairingModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.pairingIconContainer}>
                <Ionicons name="qr-code" size={50} color={COLORS.primaryWhite} />
              </View>
              <Text style={styles.pairingTitle}>Pairing Required</Text>
              <Text style={styles.pairingNumber}>Number: {pairingNumber}</Text>

              <View style={styles.codeContainer}>
                <Text style={styles.codeText}>{pairingCode}</Text>
              </View>

              <Text style={styles.pairingInstructions}>
                Open WhatsApp → Settings → Linked Devices → Link a Device
                {'\n'}Enter this code to complete pairing
              </Text>

              <TouchableOpacity
                style={styles.pairingCloseButton}
                onPress={() => {
                  setShowPairingModal(false);
                  fetchSenders();
                }}
              >
                <Text style={styles.pairingCloseText}>REFRESH LIST</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
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
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.glassColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { padding: 16, paddingBottom: 120 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(220, 20, 60, 0.7)',
    fontFamily: 'ShareTechMono',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 30,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    gap: 8,
  },
  emptyAddText: {
    color: COLORS.primaryWhite,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  senderCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  senderInfo: { flex: 1 },
  senderName: {
    color: COLORS.primaryWhite,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  senderNumber: {
    color: 'rgba(220, 20, 60, 0.7)',
    fontSize: 14,
    fontFamily: 'ShareTechMono',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  senderActions: { flexDirection: 'row', gap: 12 },
  refreshActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    gap: 8,
  },
  refreshActionText: {
    color: COLORS.primaryWhite,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  deleteActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    gap: 8,
  },
  deleteActionText: {
    color: COLORS.dangerRed,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(220, 20, 60, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
  },
  inputLabel: {
    color: 'rgba(220, 20, 60, 0.7)',
    fontSize: 14,
    fontFamily: 'ShareTechMono',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
    borderRadius: 16,
    color: COLORS.primaryWhite,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: 'ShareTechMono',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  cancelButton: { paddingHorizontal: 16, paddingVertical: 12 },
  cancelText: { color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Orbitron' },
  confirmButton: {
    backgroundColor: 'rgba(220, 20, 60, 0.3)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.5)',
  },
  confirmText: {
    color: COLORS.primaryWhite,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
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
  pairingNumber: {
    color: COLORS.primaryWhite,
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'ShareTechMono',
  },
  codeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    alignItems: 'center',
  },
  codeText: {
    color: COLORS.primaryWhite,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    fontFamily: 'Orbitron',
  },
  pairingInstructions: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'ShareTechMono',
    marginBottom: 20,
  },
  pairingCloseButton: {
    backgroundColor: 'rgba(220, 20, 60, 0.3)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.5)',
  },
  pairingCloseText: {
    color: COLORS.primaryWhite,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
});