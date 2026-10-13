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
import { listUsers, deleteUser, userAdd } from '../services/api';

interface AdminScreenProps {
  navigation: any;
  route: {
    params: {
      sessionKey: string;
    };
  };
}

const ROLE_OPTIONS = ['vip', 'reseller', 'reseller1', 'owner', 'member'];

export const AdminScreen: React.FC<AdminScreenProps> = ({ navigation, route }) => {
  const { sessionKey } = route.params;

  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState('member');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'delete' | 'create'>('list');

  // Delete
  const [deleteUsername, setDeleteUsername] = useState('');

  // Create
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createDays, setCreateDays] = useState('');
  const [createRole, setCreateRole] = useState('member');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listUsers(sessionKey);
      if (response.valid === true && response.authorized === true) {
        setUsers(response.users || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch users.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionKey]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setFilteredUsers(users.filter(u => u.role === selectedRole));
  }, [users, selectedRole]);

  const handleDelete = () => {
    if (!deleteUsername.trim()) {
      Alert.alert('Error', 'Please enter a username.');
      return;
    }

    Alert.alert('Confirm Delete', `Delete user "${deleteUsername}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await deleteUser(sessionKey, deleteUsername.trim());
            if (response.deleted === true) {
              Alert.alert('Success', 'User deleted.');
              setDeleteUsername('');
              fetchUsers();
            } else {
              Alert.alert('Error', response.message || 'Failed to delete user.');
            }
          } catch (error) {
            Alert.alert('Error', 'Connection failed.');
          }
        },
      },
    ]);
  };

  const handleCreate = async () => {
    if (!createUsername.trim() || !createPassword.trim() || !createDays.trim()) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      const response = await userAdd(
        sessionKey,
        createUsername.trim(),
        createPassword.trim(),
        createRole,
        createDays.trim()
      );
      if (response.created === true) {
        Alert.alert('Success', 'Account created.');
        setCreateUsername('');
        setCreatePassword('');
        setCreateDays('');
        fetchUsers();
      } else {
        Alert.alert('Error', response.message || 'Failed to create account.');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed.');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner': return COLORS.dangerRed;
      case 'vip': return COLORS.accentRed;
      case 'reseller': return COLORS.successGreen;
      case 'reseller1': return COLORS.warningOrange;
      default: return COLORS.accentGrey;
    }
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
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['list', 'delete', 'create'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Ionicons
                name={
                  tab === 'list' ? 'list' : tab === 'delete' ? 'trash' : 'person-add'
                }
                size={18}
                color={activeTab === tab ? COLORS.accentRed : COLORS.accentGrey}
              />
              <Text
                style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
              >
                {tab === 'list' ? 'Users' : tab === 'delete' ? 'Delete' : 'Create'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* List Tab */}
          {activeTab === 'list' && (
            <>
              {/* Role Filter */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.roleFilter}
              >
                {ROLE_OPTIONS.map(role => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleChip,
                      selectedRole === role && styles.roleChipActive,
                    ]}
                    onPress={() => setSelectedRole(role)}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        selectedRole === role && styles.roleChipTextActive,
                      ]}
                    >
                      {role.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {isLoading ? (
                <ActivityIndicator color={COLORS.accentRed} style={{ marginTop: 40 }} />
              ) : filteredUsers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={64} color={COLORS.accentGrey} />
                  <Text style={styles.emptyText}>No users with role "{selectedRole}"</Text>
                </View>
              ) : (
                filteredUsers.map((user, index) => (
                  <View key={index} style={styles.userCard}>
                    <View style={styles.userHeader}>
                      <View style={styles.userAvatar}>
                        <Ionicons name="person" size={20} color={COLORS.accentRed} />
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user.username}</Text>
                        <View style={styles.userMeta}>
                          <View
                            style={[
                              styles.roleBadge,
                              { backgroundColor: `${getRoleColor(user.role)}33` },
                            ]}
                          >
                            <Text
                              style={[
                                styles.roleBadgeText,
                                { color: getRoleColor(user.role) },
                              ]}
                            >
                              {user.role.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.userExpiry}>Exp: {user.expiredDate}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.userDeleteBtn}
                        onPress={() => {
                          setDeleteUsername(user.username);
                          setActiveTab('delete');
                        }}
                      >
                        <Ionicons name="trash" size={18} color={COLORS.dangerRed} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.userParent}>
                      Parent: {user.parent || 'SYSTEM'}
                    </Text>
                  </View>
                ))
              )}
            </>
          )}

          {/* Delete Tab */}
          {activeTab === 'delete' && (
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <View style={[styles.formIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                  <Ionicons name="warning" size={24} color={COLORS.dangerRed} />
                </View>
                <View>
                  <Text style={styles.formTitle}>Delete User</Text>
                  <Text style={styles.formSubtitle}>
                    Permanently remove a user from the system
                  </Text>
                </View>
              </View>

              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={deleteUsername}
                onChangeText={setDeleteUsername}
                placeholder="Enter username to delete"
                placeholderTextColor={COLORS.accentGrey}
              />

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: COLORS.dangerRed }]}
                onPress={handleDelete}
              >
                <Ionicons name="trash" size={20} color={COLORS.primaryWhite} />
                <Text style={styles.submitText}>DELETE USER</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Create Tab */}
          {activeTab === 'create' && (
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <View style={[styles.formIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                  <Ionicons name="person-add" size={24} color={COLORS.successGreen} />
                </View>
                <View>
                  <Text style={styles.formTitle}>Create Account</Text>
                  <Text style={styles.formSubtitle}>Add a new user to the system</Text>
                </View>
              </View>

              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={createUsername}
                onChangeText={setCreateUsername}
                placeholder="Enter username"
                placeholderTextColor={COLORS.accentGrey}
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={createPassword}
                onChangeText={setCreatePassword}
                placeholder="Enter password"
                placeholderTextColor={COLORS.accentGrey}
                secureTextEntry
              />

              <Text style={styles.inputLabel}>Duration (days)</Text>
              <TextInput
                style={styles.input}
                value={createDays}
                onChangeText={setCreateDays}
                placeholder="30"
                placeholderTextColor={COLORS.accentGrey}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Role</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.roleFilter}
              >
                {ROLE_OPTIONS.map(role => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleChip,
                      createRole === role && styles.roleChipActive,
                    ]}
                    onPress={() => setCreateRole(role)}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        createRole === role && styles.roleChipTextActive,
                      ]}
                    >
                      {role.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: COLORS.successGreen }]}
                onPress={handleCreate}
              >
                <Ionicons name="person-add" size={20} color={COLORS.primaryWhite} />
                <Text style={styles.submitText}>CREATE ACCOUNT</Text>
              </TouchableOpacity>
            </View>
          )}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: {
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
  },
  tabText: {
    color: COLORS.accentGrey,
    fontSize: 12,
    fontFamily: 'Orbitron',
  },
  tabTextActive: {
    color: COLORS.accentRed,
    fontWeight: 'bold',
  },
  scrollContent: { padding: 16, paddingBottom: 40 },
  roleFilter: { gap: 8, paddingVertical: 12 },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardDark,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    marginRight: 8,
  },
  roleChipActive: {
    backgroundColor: COLORS.accentRed,
    borderColor: COLORS.accentRed,
  },
  roleChipText: {
    color: COLORS.accentGrey,
    fontSize: 12,
    fontFamily: 'Orbitron',
  },
  roleChipTextActive: {
    color: COLORS.primaryWhite,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: COLORS.accentGrey,
    fontSize: 14,
    fontFamily: 'ShareTechMono',
    marginTop: 16,
  },
  userCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: { flex: 1 },
  userName: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  userExpiry: {
    color: COLORS.accentGrey,
    fontSize: 11,
    fontFamily: 'ShareTechMono',
  },
  userDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userParent: {
    color: COLORS.accentGrey,
    fontSize: 11,
    fontFamily: 'ShareTechMono',
    marginTop: 12,
  },
  formCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  formIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    color: COLORS.primaryWhite,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  formSubtitle: {
    color: COLORS.accentGrey,
    fontSize: 12,
    fontFamily: 'ShareTechMono',
    marginTop: 2,
  },
  inputLabel: {
    color: COLORS.primaryWhite,
    fontSize: 14,
    fontFamily: 'ShareTechMono',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: COLORS.cardDarker,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    color: COLORS.primaryWhite,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'ShareTechMono',
    marginBottom: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  submitText: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
});