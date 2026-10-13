import React, { useState, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { COLORS, GRADIENTS } from '../utils/colors';
import { checkDomain, getSubdomains } from '../services/api';

interface DomainOsintScreenProps {
  navigation: any;
}

export const DomainOsintScreen: React.FC<DomainOsintScreenProps> = ({ navigation }) => {
  const [domain, setDomain] = useState('');
  const [dnsData, setDnsData] = useState<any>(null);
  const [subdomains, setSubdomains] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = async () => {
    const trimmed = domain.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Domain cannot be empty.');
      return;
    }

    setIsLoading(true);
    setDnsData(null);
    setSubdomains([]);

    try {
      const [dnsResult, subdoResult] = await Promise.all([
        checkDomain(trimmed),
        getSubdomains(trimmed),
      ]);

      if (dnsResult.status === true) {
        setDnsData(dnsResult.data);
      }

      if (subdoResult.status === true && Array.isArray(subdoResult.data)) {
        const cleaned = subdoResult.data
          .map((item: any) => item.toString().split('\n').pop().trim())
          .filter((s: string) => s && !s.startsWith('*'));
        setSubdomains([...new Set(cleaned)].sort());
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch domain data.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', `${label} copied to clipboard`);
  };

  const InfoRow = ({
    label,
    value,
    showCopy = false,
  }: {
    label: string;
    value?: string | null;
    showCopy?: boolean;
  }) => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
        {showCopy && (
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToClipboard(value, label)}
          >
            <Ionicons name="copy" size={16} color={COLORS.accentRed} />
          </TouchableOpacity>
        )}
      </View>
    );
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
          <Text style={styles.headerTitle}>Domain OSINT</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="globe" size={20} color={COLORS.accentRed} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero Card */}
          <LinearGradient colors={GRADIENTS.primary} style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="globe" size={40} color={COLORS.primaryWhite} />
            </View>
            <Text style={styles.heroTitle}>Domain Intelligence</Text>
            <Text style={styles.heroSubtitle}>
              Discover DNS records and subdomains
            </Text>
          </LinearGradient>

          {/* Input Section */}
          <View style={styles.inputCard}>
            <Text style={styles.inputTitle}>Enter Domain</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={domain}
                onChangeText={setDomain}
                placeholder="e.g. example.com"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                autoCapitalize="none"
              />
              {isLoading && (
                <ActivityIndicator color={COLORS.accentRed} style={styles.inputLoader} />
              )}
            </View>

            <TouchableOpacity
              style={styles.checkButton}
              onPress={handleCheck}
              disabled={isLoading}
            >
              <LinearGradient colors={GRADIENTS.primary} style={styles.checkGradient}>
                <Ionicons name="search" size={20} color={COLORS.primaryWhite} />
                <Text style={styles.checkText}>
                  {isLoading ? 'PROCESSING...' : 'CHECK DOMAIN'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* DNS Records */}
          {dnsData && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="document-text" size={20} color={COLORS.primaryWhite} />
                <Text style={styles.resultTitle}>DNS Records</Text>
              </View>
              <InfoRow label="Domain" value={dnsData.unicodeDomain} showCopy />
              <InfoRow label="Punycode" value={dnsData.punycodeDomain} showCopy />
            </View>
          )}

          {/* Subdomains */}
          {subdomains.length > 0 && (
            <View style={styles.resultCard}>
              <View style={[styles.resultHeader, { backgroundColor: COLORS.successGreen }]}>
                <Ionicons name="list" size={20} color={COLORS.primaryWhite} />
                <Text style={styles.resultTitle}>
                  Subdomains ({subdomains.length})
                </Text>
              </View>
              {subdomains.map((sub, index) => (
                <View key={index} style={styles.subdomainItem}>
                  <Ionicons name="link" size={16} color={COLORS.accentGrey} />
                  <Text style={styles.subdomainText} numberOfLines={1}>
                    {sub}
                  </Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(sub, 'Subdomain')}
                    style={styles.copyButtonSmall}
                  >
                    <Ionicons name="copy" size={14} color={COLORS.accentRed} />
                  </TouchableOpacity>
                </View>
              ))}
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
    textAlign: 'center',
  },
  inputCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
    marginBottom: 16,
  },
  inputWrapper: { position: 'relative', marginBottom: 16 },
  input: {
    backgroundColor: COLORS.cardDarker,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    color: COLORS.primaryWhite,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: 'ShareTechMono',
    fontSize: 16,
  },
  inputLoader: { position: 'absolute', right: 16, top: 18 },
  checkButton: { borderRadius: 12, overflow: 'hidden' },
  checkGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  checkText: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  resultCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.accentRed,
    gap: 12,
  },
  resultTitle: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDarker,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
  },
  infoContent: { flex: 1 },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontFamily: 'ShareTechMono',
    marginBottom: 4,
  },
  infoValue: {
    color: COLORS.lightRed,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'ShareTechMono',
  },
  copyButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  subdomainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDarker,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
    gap: 8,
  },
  subdomainText: {
    flex: 1,
    color: COLORS.primaryWhite,
    fontSize: 13,
    fontFamily: 'ShareTechMono',
  },
  copyButtonSmall: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});