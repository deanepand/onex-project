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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/colors';
import { killWifi } from '../services/api';

interface WifiExternalScreenProps {
  navigation: any;
  route: {
    params: {
      sessionKey: string;
    };
  };
}

export const WifiExternalScreen: React.FC<WifiExternalScreenProps> = ({ navigation, route }) => {
  const { sessionKey } = route.params;

  const [publicIp, setPublicIp] = useState('-');
  const [region, setRegion] = useState('-');
  const [asn, setAsn] = useState('-');
  const [isVpn, setIsVpn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttacking, setIsAttacking] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadPublicInfo();

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
  }, []);

  const loadPublicInfo = async () => {
    setIsLoading(true);
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipJson = await ipRes.json();
      const ip = ipJson.ip;

      const infoRes = await fetch(`http://ip-api.com/json/${ip}?fields=as,regionName,status,query`);
      const info = await infoRes.json();

      const asnRaw = (info.as || '').toLowerCase();
      const isBlockedAsn =
        asnRaw.includes('vpn') ||
        asnRaw.includes('cloud') ||
        asnRaw.includes('digitalocean') ||
        asnRaw.includes('aws') ||
        asnRaw.includes('google');

      setPublicIp(ip);
      setRegion(info.regionName || '-');
      setAsn(info.as || '-');
      setIsVpn(isBlockedAsn);
    } catch (error) {
      setPublicIp('Error');
      setRegion('Error');
      setAsn('Error');
    } finally {
      setIsLoading(false);
    }
  };

  const attackTarget = async () => {
    setIsAttacking(true);
    try {
      const response = await killWifi(sessionKey, publicIp, 120);
      if (response) {
        Alert.alert('✅ Attack Sent', `WiFi attack sent to ${publicIp}`);
      } else {
        Alert.alert('❌ Failed', 'Server rejected the request.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error.');
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
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>WIFI KILLER</Text>
            <Text style={styles.headerSubtitle}>External Network Disruption</Text>
          </View>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isAttacking ? COLORS.dangerRed : COLORS.lightRed },
            ]}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Target Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="locate" size={20} color={COLORS.lightRed} />
              <Text style={styles.cardTitle}>TARGET INFORMATION</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="globe" size={20} color={COLORS.lightRed} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>IP Address</Text>
                <Text style={styles.infoValue}>{publicIp}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="map" size={20} color={COLORS.lightRed} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Region</Text>
                <Text style={styles.infoValue}>{region}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="server" size={20} color={COLORS.lightRed} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ASN</Text>
                <Text style={styles.infoValue}>{asn}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name={isVpn ? 'warning' : 'checkmark-circle'}
                  size={20}
                  color={isVpn ? COLORS.dangerRed : COLORS.successGreen}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>VPN Status</Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: isVpn ? COLORS.dangerRed : COLORS.successGreen },
                  ]}
                >
                  {isVpn ? 'DETECTED' : 'CLEAN'}
                </Text>
              </View>
            </View>
          </View>

          {/* VPN Warning */}
          {isVpn && (
            <View style={styles.vpnWarning}>
              <Ionicons name="warning" size={20} color={COLORS.dangerRed} />
              <Text style={styles.vpnWarningText}>
                Target detected as VPN/Hosting. Attack blocked for security reasons.
              </Text>
            </View>
          )}

          {/* Attack Button */}
          {!isVpn && (
            <TouchableOpacity
              style={[styles.attackButton, isAttacking && styles.attackButtonDisabled]}
              onPress={attackTarget}
              disabled={isAttacking}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isAttacking ? ['#6B7280', '#4B5563'] : GRADIENTS.primary}
                style={styles.attackGradient}
              >
                {isAttacking ? (
                  <>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                      <Ionicons name="flash" size={24} color={COLORS.primaryWhite} />
                    </Animated.View>
                    <Text style={styles.attackText}>ATTACKING...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="flash" size={24} color={COLORS.primaryWhite} />
                    <Text style={styles.attackText}>INITIATE ATTACK</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.lightRed} />
            <Text style={styles.infoBoxText}>
              Attack will run for 120 seconds. Use responsibly.
            </Text>
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
  vpnWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    gap: 12,
  },
  vpnWarningText: {
    flex: 1,
    color: COLORS.dangerRed,
    fontSize: 13,
    fontFamily: 'ShareTechMono',
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
  attackButtonDisabled: {
    shadowColor: 'transparent',
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
    gap: 12,
  },
  infoBoxText: {
    flex: 1,
    color: COLORS.accentGrey,
    fontSize: 13,
    fontFamily: 'ShareTechMono',
  },
});