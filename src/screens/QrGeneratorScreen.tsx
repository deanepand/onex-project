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
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { COLORS, GRADIENTS } from '../utils/colors';

interface QrGeneratorScreenProps {
  navigation: any;
}

export const QrGeneratorScreen: React.FC<QrGeneratorScreenProps> = ({ navigation }) => {
  const [text, setText] = useState('');
  const [qrUri, setQrUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Text cannot be empty.');
      return;
    }

    setIsLoading(true);
    setQrUri(null);

    try {
      const url = `https://api.siputzx.my.id/api/tools/text2qr?text=${encodeURIComponent(
        trimmed
      )}`;

      const fileUri = `${FileSystem.cacheDirectory}qr_${Date.now()}.png`;
      const downloadResult = await FileSystem.downloadAsync(url, fileUri);

      if (downloadResult.status === 200) {
        setQrUri(downloadResult.uri);
      } else {
        Alert.alert('Error', 'Failed to generate QR code.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!qrUri) return;

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(qrUri, {
        dialogTitle: 'Share QR Code',
        mimeType: 'image/png',
      });
    } else {
      Alert.alert('Error', 'Sharing is not available on this device.');
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
          <Text style={styles.headerTitle}>QR Generator</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="qr-code" size={20} color={COLORS.accentRed} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero Card */}
          <LinearGradient colors={GRADIENTS.primary} style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="qr-code" size={40} color={COLORS.primaryWhite} />
            </View>
            <Text style={styles.heroTitle}>QR Code Generator</Text>
            <Text style={styles.heroSubtitle}>Create QR codes from text or URLs</Text>
          </LinearGradient>

          {/* Input Card */}
          <View style={styles.inputCard}>
            <Text style={styles.inputTitle}>Enter Text or URL</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={text}
              onChangeText={setText}
              placeholder="e.g. https://google.com"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerate}
              disabled={isLoading}
            >
              <LinearGradient colors={GRADIENTS.primary} style={styles.generateGradient}>
                {isLoading ? (
                  <>
                    <ActivityIndicator color={COLORS.primaryWhite} />
                    <Text style={styles.generateText}>GENERATING...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="qr-code" size={20} color={COLORS.primaryWhite} />
                    <Text style={styles.generateText}>GENERATE QR</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* QR Result */}
          {qrUri && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.successGreen} />
                <Text style={styles.resultTitle}>Generated QR Code</Text>
              </View>

              <View style={styles.qrContainer}>
                <Image source={{ uri: qrUri }} style={styles.qrImage} resizeMode="contain" />
                <Text style={styles.qrText} numberOfLines={2}>
                  {text}
                </Text>
              </View>

              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <LinearGradient colors={GRADIENTS.success} style={styles.shareGradient}>
                  <Ionicons name="share" size={20} color={COLORS.primaryWhite} />
                  <Text style={styles.shareText}>SHARE QR CODE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Placeholder */}
          {!qrUri && !isLoading && (
            <View style={styles.placeholder}>
              <Ionicons name="qr-code-outline" size={64} color="rgba(220, 20, 60, 0.5)" />
              <Text style={styles.placeholderTitle}>QR Code Generator</Text>
              <Text style={styles.placeholderSubtitle}>
                Enter text or URL to generate QR code
              </Text>
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
    marginBottom: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  generateButton: { borderRadius: 12, overflow: 'hidden' },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  generateText: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  resultCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  resultTitle: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  qrContainer: {
    backgroundColor: COLORS.primaryWhite,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  qrImage: { width: 200, height: 200 },
  qrText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontFamily: 'ShareTechMono',
    textAlign: 'center',
    marginTop: 12,
  },
  shareButton: { borderRadius: 12, overflow: 'hidden' },
  shareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  shareText: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  placeholder: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
    marginTop: 16,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: COLORS.accentGrey,
    fontFamily: 'ShareTechMono',
    marginTop: 8,
    textAlign: 'center',
  },
});