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
import { CustomButton } from '../components/CustomButton';
import { getMyServer, addServer, delServer } from '../services/api';

interface ManageServerScreenProps {
  navigation: any;
  route: {
    params: {
      keyToken: string;
    };
  };
}

export const ManageServerScreen: React.FC<ManageServerScreenProps> = ({ navigation, route }) => {
  const { keyToken } = route.params;

  const [vpsList, setVpsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [host, setHost] = useState('');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const fetchVpsList = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getMyServer(keyToken);
      setVpsList(Array.isArray(response) ? response : []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch VPS list.');
    } finally {
      setIsLoading(false);
    }
  }, [keyToken]);

  useEffect(() => {
    fetchVpsList();
  }, [fetchVpsList]);

  const handleAdd = async () => {
    if (!host.trim() || !user.trim() || !pass.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setIsAdding(true);
    try {
      const response = await addServer(keyToken, host.trim(), user.trim(), pass.trim());
      if (response.success === true) {
        setHost('');
        setUser('');
        setPass('');
        setShowAddModal(false);
        Alert.alert('Success', 'VPS added successfully.');
        fetchVpsList();
      } else {
        Alert.alert('Error', response.error || 'Failed to add VPS.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = (vpsHost: string) => {
    Alert.alert('Confirm Delete', `Delete VPS ${vpsHost}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await delServer(keyToken, vpsHost);
            if (response.success === true) {
              Alert.alert('Success', 'VPS deleted.');
              fetchVpsList();
            } else {
              Alert.alert('Error', 'Failed to delete VPS.');
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to connect to server.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <LinearGradient colors={GRADIENTS.dark} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primaryWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Server Management</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
            <Ionicons name="add" size={24} color={COLORS.accentRed} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchVpsList}
              tintColor={COLORS.accentRed}
            />
          }
        >
          {/* Stats Card */}
          <LinearGradient colors={GRADIENTS.primary} style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>My VPS Servers</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{vpsList.length} Servers</Text>
              </View>
            </View>
            <Text style={styles.statsSubtitle}>Manage your virtual private servers</Text>
          </LinearGradient>

          {/* Add Button */}
          <TouchableOpacity style={styles.addVpsButton} onPress={() => setShowAddModal(true)}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.addVpsGradient}>
              <Ionicons name="add" size={20} color={COLORS.primaryWhite} />
              <Text style={styles.addVpsText}>ADD NEW SERVER</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* VPS List */}
          {isLoading && vpsList.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={COLORS.accentRed} size="large" />
            </View>
          ) : vpsList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="server-outline" size={64} color="rgba(220, 20, 60, 0.3)" />
              <Text style={styles.emptyTitle}>No VPS Servers</Text>
              <Text style={styles.emptySubtitle}>Add your first VPS server</Text>
            </View>
          ) : (
            vpsList.map((vps, index) => (
              <View key={index} style={styles.vpsCard}>
                <View style={styles.vpsHeader}>
                  <View style={styles.vpsIconContainer}>
                    <Ionicons name="server" size={24} color={COLORS.accentRed} />
                  </View>
                  <View style={styles.vpsInfo}>
                    <Text style={styles.vpsLabel}>VPS Server</Text>
                    <Text style={styles.vpsHost}>{vps.host}</Text>
                  </View>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeText}>ACTIVE</Text>
                  </View>
                </View>

                <View style={styles.vpsDetail}>
                  <Ionicons name="person" size={16} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.vpsDetailText}>Username: {vps.username}</Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(vps.host)}
                >
                  <Ionicons name="trash" size={16} color={COLORS.dangerRed} />
                  <Text style={styles.deleteButtonText}>DELETE</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        {/* Add Modal */}
        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIcon}>
                  <Ionicons name="add" size={24} color={COLORS.accentRed} />
                </View>
                <Text style={styles.modalTitle}>Add New VPS</Text>
              </View>

              <Text style={styles.inputLabel}>IP VPS</Text>
              <TextInput
                style={styles.input}
                value={host}
                onChangeText={setHost}
                placeholder="1.2.3.4"
                placeholderTextColor={COLORS.accentGrey}
              />

              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={user}
                onChangeText={setUser}
                placeholder="root"
                placeholderTextColor={COLORS.accentGrey}
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={pass}
                onChangeText={setPass}
                placeholder="password"
                placeholderTextColor={COLORS.accentGrey}
                secureTextEntry
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
                  onPress={handleAdd}
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <ActivityIndicator color={COLORS.primaryWhite} size="small" />
                  ) : (
                    <Text style={styles.confirmText}>ADD</Text>
                  )}
                </TouchableOpacity>
              </View>
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
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    color: COLORS.primaryWhite,
    fontSize: 12,
    fontFamily: 'ShareTechMono',
  },
  statsSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'ShareTechMono',
  },
  addVpsButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  addVpsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  addVpsText: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.accentGrey,
    fontFamily: 'ShareTechMono',
    marginTop: 4,
  },
  vpsCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
  },
  vpsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vpsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vpsInfo: { flex: 1 },
  vpsLabel: {
    color: COLORS.accentGrey,
    fontSize: 12,
    fontFamily: 'ShareTechMono',
  },
  vpsHost: {
    color: COLORS.lightRed,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  activeText: {
    color: COLORS.successGreen,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  vpsDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDarker,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  vpsDetailText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'ShareTechMono',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    gap: 8,
  },
  deleteButtonText: {
    color: COLORS.dangerRed,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.cardDarker,
    borderRadius: 20,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cancelText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Orbitron',
  },
  confirmButton: {
    backgroundColor: COLORS.accentRed,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  confirmText: {
    color: COLORS.primaryWhite,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
});