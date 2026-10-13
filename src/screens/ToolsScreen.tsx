import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/colors';

import {
  DDoSToolsModal,
  NetworkToolsModal,
  OSINTToolsModal,
  DownloaderToolsModal,
  UtilityToolsModal,
} from './ToolsModalScreens';

const { width } = Dimensions.get('window');

interface ToolsScreenProps {
  navigation: any;
  route: {
    params: {
      sessionKey: string;
      userRole: string;
      listDoos: any[];
    };
  };
}

export const ToolsScreen: React.FC<ToolsScreenProps> = ({ navigation, route }) => {
  const { sessionKey, userRole, listDoos } = route.params;

  // Modal States
  const [showDDoSModal, setShowDDoSModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showOSINTModal, setShowOSINTModal] = useState(false);
  const [showDownloaderModal, setShowDownloaderModal] = useState(false);
  const [showUtilityModal, setShowUtilityModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const tools = [
    {
      id: 'ddos',
      title: 'DDoS',
      subtitle: 'Attack Tools',
      icon: 'flash' as const,
      onPress: () => setShowDDoSModal(true),
    },
    {
      id: 'network',
      title: 'Network',
      subtitle: 'WiFi & Spam',
      icon: 'wifi' as const,
      onPress: () => setShowNetworkModal(true),
    },
    {
      id: 'osint',
      title: 'OSINT',
      subtitle: 'Investigation',
      icon: 'search' as const,
      onPress: () => setShowOSINTModal(true),
    },
    {
      id: 'downloader',
      title: 'Downloader',
      subtitle: 'Social Media',
      icon: 'download' as const,
      onPress: () => setShowDownloaderModal(true),
    },
    {
      id: 'utilities',
      title: 'Utilities',
      subtitle: 'Extra Tools',
      icon: 'build' as const,
      onPress: () => setShowUtilityModal(true),
    },
    {
      id: 'rat',
      title: 'RAT',
      subtitle: 'Remote Access',
      icon: 'phone-portrait' as const,
      onPress: () => navigation.navigate('Rat', { sessionKey }),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <LinearGradient colors={GRADIENTS.dark} style={styles.background}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="security" size={30} color={COLORS.primaryWhite} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Misc Tools</Text>
              <Text style={styles.subtitle}>Advanced Security Suite</Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userRole?.toUpperCase()}</Text>
            </View>
          </View>

          {/* Tools Grid */}
          <Animated.View
            style={[
              styles.toolsGrid,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {tools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={styles.toolCard}
                onPress={tool.onPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.primaryRed, COLORS.accentRed]}
                  style={styles.toolIcon}
                >
                  <Ionicons name={tool.icon} size={28} color={COLORS.primaryWhite} />
                </LinearGradient>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </ScrollView>

        {/* Modals */}
        <DDoSToolsModal
          visible={showDDoSModal}
          onClose={() => setShowDDoSModal(false)}
          navigation={navigation}
          sessionKey={sessionKey}
          listDoos={listDoos}
        />

        <NetworkToolsModal
          visible={showNetworkModal}
          onClose={() => setShowNetworkModal(false)}
          navigation={navigation}
          sessionKey={sessionKey}
          userRole={userRole}
        />

        <OSINTToolsModal
          visible={showOSINTModal}
          onClose={() => setShowOSINTModal(false)}
          navigation={navigation}
        />

        <DownloaderToolsModal
          visible={showDownloaderModal}
          onClose={() => setShowDownloaderModal(false)}
          navigation={navigation}
        />

        <UtilityToolsModal
          visible={showUtilityModal}
          onClose={() => setShowUtilityModal(false)}
          navigation={navigation}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: COLORS.accentRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: COLORS.accentRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.lightRed,
    fontFamily: 'ShareTechMono',
  },
  roleBadge: {
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.5)',
  },
  roleText: {
    color: COLORS.lightRed,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  toolCard: {
    width: (width - 56) / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
  },
  toolIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.accentRed,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
  },
  toolSubtitle: {
    fontSize: 12,
    color: COLORS.lightRed,
    fontFamily: 'ShareTechMono',
    marginTop: 4,
  },
});