import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import * as Location from 'expo-location';
import { COLORS, GRADIENTS } from '../utils/colors';

interface WifiKillerScreenProps {
  navigation: any;
}

export const WifiKillerScreen: React.FC<WifiKillerScreenProps> = ({ navigation }) => {
  const [ssid, setSsid] = useState('-');
  const [ip, setIp] = useState('-');
  const [routerIp, setRouterIp] = useState('-');
  const [isKilling, setIsKilling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadWifiInfo();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const loadWifiInfo = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required to read WiFi info.');
        setIsLoading(false);
        return;
      }

      const networkState = await Network.getNetworkStateAsync();
      const ipAddress = await Network.getIpAddressAsync();

      setIp(ipAddress || '-');
      setSsid(networkState.type === Network.NetworkStateType.WIFI ? 'Connected' : 'Not Connected');

      // Calculate router IP (typically .1)
      if (ipAddress && ipAddress !== '0.0.0.0') {
        const parts = ipAddress.split('.');
        if (parts.length === 4) {
          setRouterIp(`${parts[0]}.${parts[1]}.${parts[2]}.1`);
        }
      }

      setIsLoading(false);
    } catch (error) {
      setSsid('Error');
      setIp('Error');
      setRouterIp('Error');
      setIsLoading(false);
    }
  };

  const startFlood = () => {
    if (routerIp === '-' || routerIp === 'Error') {
      Alert.alert('Error', 'Router IP not available.');
      return;
    }

    setIsKilling(true);
    Alert.alert('Started', 'WiFi Killer!\nStop Manually.');
    // Note: Actual UDP flood would need native modules
    // This is a simulation for the UI
  };

  const stopFlood = () => {
    setIsKilling(false);
    Alert.alert('Stopped', 'WiFi flood attack stopped.');
  };

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 2],
  });

  const waveOpacity = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <LinearGradient colors={GRADIENTS.dark} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primaryWhite} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>WIFI KILLER</Text>
            <Text style={styles.headerSubtitle}>Internal Network Disruption</Text>
          </View>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isKilling ? COLORS.dangerRed : COLORS.lightRed },
            ]}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Network Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="network" size={20} color={COLORS.lightRed} />
              <Text style={styles.cardTitle}>NETWORK INFORMATION</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="wifi" size={20} color={COLORS.lightRed} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>SSID</Text>
                <Text style={styles.infoValue}>{ssid}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="phone-portrait" size={20} color={COLORS.lightRed} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>IP Address</Text>
                <Text style={styles.infoValue}>{ip}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="router" size={20} color={COLORS.lightRed} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Router IP</Text>
                <Text style={styles.infoValue}>{routerIp}</Text>
              </View>
            </View>
          </View>

          {/* Warning */}
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={20} color={COLORS.lightRed} />
            <Text style={styles.warningText}>
              This feature can disrupt your connected WiFi network. Use only for personal testing.
            </Text>
          </View>

          {/* Animated Wave */}
          {isKilling && (
            <View style={styles.waveContainer}>
              <Animated.View
                style={[
                  styles.wave,
                  {
                    transform: [{ scale: waveScale }],
                    opacity: waveOpacity,
                  },
                ]}
              />
            </View>
          )}

          {/* Attack Button */}
          <TouchableOpacity
            style={[styles.attackButton, isKilling && styles.attackButtonActive]}
            onPress={isKilling ? stopFlood : startFlood}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isKilling ? ['#DC2626', '#991B1B'] : GRADIENTS.primary}
              style={styles.attackGradient}
            >
              {isKilling ? (
                <>
                  <Ionicons name="stop-circle" size={24} color={COLORS.primaryWhite} />
                  <Text style={styles.attackText}>STOP ATTACK</Text>
                </>
              ) : (
                <>
                  <Ionicons name="flash" size={24} color={COLORS.primaryWhite} />
                  <Text style={styles.attackText}>INITIATE ATTACK</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Status Indicator */}
          {isKilling && (
            <View style={styles.statusIndicator}>
              <View style={styles.statusDotSmall} />
              <Text style={styles.statusText}>ATTACK IN PROGRESS</Text>
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
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.lightRed,
    fontFamily: 'ShareTechMono',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  scrollContent: { padding: 16, paddingBottom: 40 },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  cardTitle: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    marginRight: 12,
  },
  infoContent: { flex: 1 },
  infoLabel: {
    color: COLORS.accentGrey,
    fontSize: 12,
    fontFamily: 'ShareTechMono',
  },
  infoValue: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'ShareTechMono',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
    gap: 12,
  },
  warningText: {
    flex: 1,
    color: COLORS.accentGrey,
    fontSize: 13,
    fontFamily: 'ShareTechMono',
  },
  waveContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -100,
    marginTop: -100,
  },
  wave: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.accentRed,
  },
  attackButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: COLORS.accentRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  attackButtonActive: {
    shadowColor: COLORS.dangerRed,
  },
  attackGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  attackText: {
    color: COLORS.primaryWhite,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    letterSpacing: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.5)',
    gap: 12,
  },
  statusDotSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.dangerRed,
  },
  statusText: {
    color: COLORS.dangerRed,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
});