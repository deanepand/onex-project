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
import { checkNik } from '../services/api';

interface NikCheckerScreenProps {
  navigation: any;
}

export const NikCheckerScreen: React.FC<NikCheckerScreenProps> = ({ navigation }) => {
  const [nik, setNik] = useState('');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleCheck = async () => {
    const trimmedNik = nik.trim();
    if (!trimmedNik) {
      Alert.alert('Error', 'NIK cannot be empty.');
      return;
    }

    setIsLoading(true);
    setData(null);

    try {
      const response = await checkNik(trimmedNik);
      if (response.status === true && response.data) {
        setData(response.data);
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        Alert.alert('Error', 'Data not found or invalid NIK.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', `${label} copied to clipboard`);
  };

  const InfoItem = ({
    label,
    value,
    showCopy = false,
  }: {
    label: string;
    value: string;
    showCopy?: boolean;
  }) => {
    if (!value) return null;
    return (
      <View style={styles.infoItem}>
        <View style={styles.infoItemContent}>
          <Text style={styles.infoItemLabel}>{label}</Text>
          <Text style={styles.infoItemValue}>{value}</Text>
        </View>
        {showCopy && (
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToClipboard(value, label)}
          >
            <Ionicons name="copy" size={18} color={COLORS.accentRed} />
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
          <Text style={styles.headerTitle}>NIK Checker</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="card" size={20} color={COLORS.accentRed} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero Card */}
          <LinearGradient colors={GRADIENTS.primary} style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="card" size={40} color={COLORS.primaryWhite} />
            </View>
            <Text style={styles.heroTitle}>NIK Verification</Text>
            <Text style={styles.heroSubtitle}>Check Indonesian identity card information</Text>
          </LinearGradient>

          {/* Input Section */}
          <View style={styles.inputCard}>
            <Text style={styles.inputTitle}>Enter NIK Number</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={nik}
                onChangeText={setNik}
                placeholder="e.g. 5206085405880001"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="numeric"
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
                  {isLoading ? 'PROCESSING...' : 'VERIFY NIK'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Results */}
          {data && (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Personal Info */}
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Ionicons name="person" size={20} color={COLORS.primaryWhite} />
                  <Text style={styles.resultTitle}>Personal Information</Text>
                </View>
                <InfoItem label="NIK" value={data.nik || nik} showCopy />
                <InfoItem label="Full Name" value={data.data?.nama} showCopy />
                <InfoItem label="Gender" value={data.data?.kelamin} />
                <InfoItem label="Birth Place" value={data.data?.tempat_lahir} showCopy />
                <InfoItem label="Age" value={data.data?.usia} />
              </View>

              {/* Address Info */}
              <View style={styles.resultCard}>
                <View style={[styles.resultHeader, { backgroundColor: COLORS.successGreen }]}>
                  <Ionicons name="location" size={20} color={COLORS.primaryWhite} />
                  <Text style={styles.resultTitle}>Address Information</Text>
                </View>
                <InfoItem label="Province" value={data.data?.provinsi} />
                <InfoItem label="Regency/City" value={data.data?.kabupaten} />
                <InfoItem label="District" value={data.data?.kecamatan} />
                <InfoItem label="Sub-district" value={data.data?.kelurahan} />
                <InfoItem label="Full Address" value={data.data?.alamat} showCopy />
                <InfoItem label="TPS" value={data.data?.tps} />
              </View>

              {/* Additional Info */}
              <View style={styles.resultCard}>
                <View style={[styles.resultHeader, { backgroundColor: COLORS.warningOrange }]}>
                  <Ionicons name="information-circle" size={20} color={COLORS.primaryWhite} />
                  <Text style={styles.resultTitle}>Additional Information</Text>
                </View>
                <InfoItem label="Zodiac" value={data.data?.zodiak} />
                <InfoItem label="Upcoming Birthday" value={data.data?.ultah_mendatang} />
                <InfoItem label="Market Day" value={data.data?.pasaran} />
              </View>
            </Animated.View>
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
  inputWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
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
  inputLoader: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  checkButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDarker,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
  },
  infoItemContent: { flex: 1 },
  infoItemLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontFamily: 'ShareTechMono',
    marginBottom: 4,
  },
  infoItemValue: {
    color: COLORS.lightRed,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'ShareTechMono',
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});