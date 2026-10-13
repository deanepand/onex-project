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
import { createAccount, editUser } from '../services/api';

interface SellerScreenProps {
  navigation: any;
  route: {
    params: {
      keyToken: string;
    };
  };
}

export const SellerScreen: React.FC<SellerScreenProps> = ({ navigation, route }) => {
  const { keyToken } = route.params;

  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');
  const [days, setDays] = useState('');
  const [editUser_, setEditUser] = useState('');
  const [editDays, setEditDays] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!newUser.trim() || !newPass.trim() || !days.trim()) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await createAccount(keyToken, newUser.trim(), newPass.trim(), days.trim());
      if (response.created === true) {
        Alert.alert('Success', 'Account created successfully!');
        setNewUser('');
        setNewPass('');
        setDays('');
      } else {
        Alert.alert('Error', response.message || 'Failed to create account.');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editUser_.trim() || !editDays.trim()) {
      Alert.alert('Error', 'Username and duration are required.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await editUser(keyToken, editUser_.trim(), editDays.trim());
      if (response.edited === true) {
        Alert.alert('Success', 'Duration updated successfully!');
        setEditUser('');
        setEditDays('');
      } else {
        Alert.alert('Error', response.message || 'Failed to update duration.');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed.');
    } finally {
      setIsLoading(false);
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
          <Text style={styles.headerTitle}>Account Management</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Create Account Card */}
          <View style={styles.actionCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: 'rgba(220, 20, 60, 0.2)' }]}>
                <Ionicons name="person-add" size={24} color={COLORS.accentRed} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Create New Account</Text>
                <Text style={styles.cardSubtitle}>
                  Create a new user with specified duration
                </Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={newUser}
              onChangeText={setNewUser}
              placeholder="Enter username"
              placeholderTextColor={COLORS.accentGrey}
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={newPass}
              onChangeText={setNewPass}
              placeholder="Enter password"
              placeholderTextColor={COLORS.accentGrey}
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Duration (days)</Text>
            <TextInput
              style={styles.input}
              value={days}
              onChangeText={setDays}
              placeholder="30"
              placeholderTextColor={COLORS.accentGrey}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCreate}
              disabled={isLoading}
            >
              <LinearGradient colors={GRADIENTS.primary} style={styles.actionGradient}>
                {isLoading ? (
                  <ActivityIndicator color={COLORS.primaryWhite} />
                ) : (
                  <>
                    <Ionicons name="person-add" size={20} color={COLORS.primaryWhite} />
                    <Text style={styles.actionText}>CREATE ACCOUNT</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Edit Duration Card */}
          <View style={styles.actionCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Ionicons name="refresh" size={24} color={COLORS.successGreen} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Extend Account Duration</Text>
                <Text style={styles.cardSubtitle}>Add more days to existing account</Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={editUser_}
              onChangeText={setEditUser}
              placeholder="Enter username"
              placeholderTextColor={COLORS.accentGrey}
            />

            <Text style={styles.inputLabel}>Additional Days</Text>
            <TextInput
              style={styles.input}
              value={editDays}
              onChangeText={setEditDays}
              placeholder="30"
              placeholderTextColor={COLORS.accentGrey}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEdit}
              disabled={isLoading}
            >
              <LinearGradient colors={GRADIENTS.success} style={styles.actionGradient}>
                {isLoading ? (
                  <ActivityIndicator color={COLORS.primaryWhite} />
                ) : (
                  <>
                    <Ionicons name="refresh" size={20} color={COLORS.primaryWhite} />
                    <Text style={styles.actionText}>UPDATE DURATION</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
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
  scrollContent: { padding: 16, paddingBottom: 40 },
  actionCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardHeaderText: { flex: 1 },
  cardTitle: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  cardSubtitle: {
    color: COLORS.accentGrey,
    fontSize: 12,
    fontFamily: 'ShareTechMono',
    marginTop: 4,
  },
  inputLabel: {
    color: COLORS.primaryWhite,
    fontSize: 14,
    fontFamily: 'ShareTechMono',
    marginBottom: 8,
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
    marginBottom: 16,
  },
  actionButton: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  actionText: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
});