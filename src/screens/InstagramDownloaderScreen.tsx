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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/colors';
import { downloadInstagram } from '../services/api';

const { width } = Dimensions.get('window');

interface InstagramDownloaderScreenProps {
  navigation: any;
}

export const InstagramDownloaderScreen: React.FC<InstagramDownloaderScreenProps> = ({
  navigation,
}) => {
  const [url, setUrl] = useState('');
  const [mediaData, setMediaData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      Alert.alert('Error', 'URL cannot be empty.');
      return;
    }

    setIsLoading(true);
    setMediaData(null);

    try {
      const response = await downloadInstagram(trimmed);
      if (response.status === true && response.data) {
        setMediaData(response.data);
      } else {
        Alert.alert('Error', 'Failed to fetch Instagram data.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
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
          <Text style={styles.headerTitle}>Instagram Downloader</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="logo-instagram" size={20} color={COLORS.accentRed} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero */}
          <LinearGradient colors={GRADIENTS.primary} style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="camera" size={40} color={COLORS.primaryWhite} />
            </View>
            <Text style={styles.heroTitle}>Instagram Media Downloader</Text>
            <Text style={styles.heroSubtitle}>
              Download photos and videos from Instagram
            </Text>
          </LinearGradient>

          {/* Input */}
          <View style={styles.inputCard}>
            <Text style={styles.inputTitle}>Instagram URL</Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="https://www.instagram.com/reel/xxx/"
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
                    <Text style={styles.downloadText}>DOWNLOAD MEDIA</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Media Grid */}
          {mediaData && mediaData.length > 0 && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="images" size={20} color={COLORS.accentRed} />
                <Text style={styles.resultTitle}>
                  Media Gallery ({mediaData.length})
                </Text>
              </View>

              <View style={styles.mediaGrid}>
                {mediaData.map((media, index) => (
                  <View key={index} style={styles.mediaItem}>
                    <Image
                      source={{ uri: media.thumbnail || media.url }}
                      style={styles.mediaImage}
                      resizeMode="cover"
                    />
                    <View style={styles.mediaBadge}>
                      <Ionicons
                        name={media.type === 'video' ? 'videocam' : 'image'}
                        size={16}
                        color={COLORS.primaryWhite}
                      />
                    </View>
                  </View>
                ))}
              </View>
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
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
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
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaItem: {
    width: (width - 92) / 2,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: { width: '100%', height: '100%' },
  mediaBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});