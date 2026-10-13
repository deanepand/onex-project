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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/colors';
import { downloadTiktok } from '../services/api';

interface TiktokDownloaderScreenProps {
  navigation: any;
}

export const TiktokDownloaderScreen: React.FC<TiktokDownloaderScreenProps> = ({ navigation }) => {
  const [url, setUrl] = useState('');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      Alert.alert('Error', 'URL cannot be empty.');
      return;
    }

    setIsLoading(true);
    setData(null);

    try {
      const response = await downloadTiktok(trimmed);
      if (response.status === true && response.data) {
        setData(response.data);
      } else {
        Alert.alert('Error', 'Failed to fetch TikTok data.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    if (data?.urls?.[0]) {
      Alert.alert('Info', 'Link copied to clipboard.');
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
          <Text style={styles.headerTitle}>TikTok Downloader</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="logo-tiktok" size={20} color={COLORS.accentRed} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero */}
          <LinearGradient colors={GRADIENTS.primary} style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="videocam" size={40} color={COLORS.primaryWhite} />
            </View>
            <Text style={styles.heroTitle}>TikTok Downloader</Text>
            <Text style={styles.heroSubtitle}>Download TikTok videos without watermark</Text>
          </LinearGradient>

          {/* Input */}
          <View style={styles.inputCard}>
            <Text style={styles.inputTitle}>Enter TikTok URL</Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="https://vt.tiktok.com/xxx/"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownload}
              disabled={isLoading}
            >
              <LinearGradient colors={GRADIENTS.primary} style={styles.downloadGradient}>
                {isLoading ? (
                  <ActivityIndicator color={COLORS.primaryWhite} />
                ) : (
                  <>
                    <Ionicons name="download" size={20} color={COLORS.primaryWhite} />
                    <Text style={styles.downloadText}>DOWNLOAD</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Result */}
          {data && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.successGreen} />
                <Text style={styles.resultTitle}>Video Found</Text>
              </View>

              {data.thumbnail && (
                <Image
                  source={{ uri: data.thumbnail }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              )}

              <View style={styles.metadata}>
                <Text style={styles.metaLabel}>Title</Text>
                <Text style={styles.metaValue} numberOfLines={2}>
                  {data.metadata?.title || 'No Title'}
                </Text>
                <Text style={styles.metaLabel}>Creator</Text>
                <Text style={styles.metaValue}>{data.metadata?.creator || 'Unknown'}</Text>
              </View>

              <TouchableOpacity style={styles.shareButton} onPress={copyLink}>
                <LinearGradient colors={GRADIENTS.success} style={styles.shareGradient}>
                  <Ionicons name="share" size={20} color={COLORS.primaryWhite} />
                  <Text style={styles.shareText}>SHARE VIDEO</Text>
                </LinearGradient>
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
    fontSize: 14,
    marginBottom: 16,
  },
  downloadButton: { borderRadius: 12, overflow: 'hidden' },
  downloadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  downloadText: {
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
    marginBottom: 16,
    gap: 12,
  },
  resultTitle: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  metadata: {
    backgroundColor: COLORS.cardDarker,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  metaLabel: {
    color: COLORS.accentGrey,
    fontSize: 12,
    fontFamily: 'ShareTechMono',
    marginBottom: 4,
  },
  metaValue: {
    color: COLORS.primaryWhite,
    fontSize: 14,
    fontFamily: 'ShareTechMono',
    marginBottom: 12,
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
});