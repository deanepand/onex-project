import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/colors';

// ==================== SHARED MODAL COMPONENT ====================
interface ToolModalProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  options: ToolOption[];
  onClose: () => void;
}

interface ToolOption {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  badge?: string;
}

const ToolModalSheet: React.FC<ToolModalProps> = ({
  title,
  icon,
  options,
  onClose,
}) => {
  return (
    <View style={modalStyles.container}>
      <View style={modalStyles.modalContent}>
        {/* Header */}
        <LinearGradient colors={GRADIENTS.primary} style={modalStyles.header}>
          <View style={modalStyles.headerIcon}>
            <Ionicons name={icon} size={24} color={COLORS.primaryWhite} />
          </View>
          <Text style={modalStyles.headerTitle}>{title}</Text>
          <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={COLORS.primaryWhite} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Options */}
        <ScrollView contentContainerStyle={modalStyles.optionsContainer}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={modalStyles.optionItem}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={GRADIENTS.primary}
                style={modalStyles.optionIcon}
              >
                <Ionicons name={option.icon} size={22} color={COLORS.primaryWhite} />
              </LinearGradient>

              <View style={modalStyles.optionContent}>
                <Text style={modalStyles.optionLabel}>{option.label}</Text>
                {option.subtitle && (
                  <Text style={modalStyles.optionSubtitle}>{option.subtitle}</Text>
                )}
              </View>

              {option.badge && (
                <View style={modalStyles.badge}>
                  <Text style={modalStyles.badgeText}>{option.badge}</Text>
                </View>
              )}

              <View style={modalStyles.arrowContainer}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.lightRed} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cardDark,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '70%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    gap: 16,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: { flex: 1 },
  optionLabel: {
    color: COLORS.primaryWhite,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Orbitron',
  },
  optionSubtitle: {
    color: COLORS.accentGrey,
    fontSize: 12,
    fontFamily: 'ShareTechMono',
    marginTop: 2,
  },
  badge: {
    backgroundColor: 'rgba(220, 20, 60, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeText: {
    color: COLORS.lightRed,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ==================== DDOS TOOLS MODAL ====================
export const DDoSToolsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  navigation: any;
  sessionKey: string;
  listDoos: any[];
}> = ({ visible, onClose, navigation, sessionKey, listDoos }) => {
  if (!visible) return null;

  return (
    <ToolModalSheet
      title="DDoS Tools"
      icon="flash"
      onClose={onClose}
      options={[
        {
          icon: 'flash',
          label: 'Attack Panel',
          subtitle: 'Launch DDoS attacks',
          onPress: () => {
            onClose();
            navigation.navigate('AttackPanel', { sessionKey, listDoos });
          },
        },
        {
          icon: 'server',
          label: 'Manage Server',
          subtitle: 'Add or remove VPS servers',
          onPress: () => {
            onClose();
            navigation.navigate('ManageServer', { keyToken: sessionKey });
          },
        },
      ]}
    />
  );
};

// ==================== NETWORK TOOLS MODAL ====================
export const NetworkToolsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  navigation: any;
  sessionKey: string;
  userRole: string;
}> = ({ visible, onClose, navigation, sessionKey, userRole }) => {
  if (!visible) return null;

  const options: ToolOption[] = [
    {
      icon: 'chatbubbles',
      label: 'Spam NGL',
      subtitle: 'Automated NGL messages',
      onPress: () => {
        onClose();
        navigation.navigate('NglSpam');
      },
    },
    {
      icon: 'wifi',
      label: 'WiFi Killer (Internal)',
      subtitle: 'Attack your local network',
      onPress: () => {
        onClose();
        navigation.navigate('WifiKiller');
      },
    },
  ];

  if (userRole === 'vip' || userRole === 'owner') {
    options.push({
      icon: 'router',
      label: 'WiFi Killer (External)',
      subtitle: 'Attack external targets',
      badge: 'VIP',
      onPress: () => {
        onClose();
        navigation.navigate('WifiExternal', { sessionKey });
      },
    });
  }

  return (
    <ToolModalSheet
      title="Network Tools"
      icon="wifi"
      onClose={onClose}
      options={options}
    />
  );
};

// ==================== OSINT TOOLS MODAL ====================
export const OSINTToolsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  navigation: any;
}> = ({ visible, onClose, navigation }) => {
  if (!visible) return null;

  return (
    <ToolModalSheet
      title="OSINT Tools"
      icon="search"
      onClose={onClose}
      options={[
        {
          icon: 'card',
          label: 'NIK Detail',
          subtitle: 'Check Indonesian ID card info',
          onPress: () => {
            onClose();
            navigation.navigate('NikChecker');
          },
        },
        {
          icon: 'globe',
          label: 'Domain OSINT',
          subtitle: 'DNS records & subdomains',
          onPress: () => {
            onClose();
            navigation.navigate('DomainOsint');
          },
        },
        {
          icon: 'person',
          label: 'Phone Lookup',
          subtitle: 'Coming soon',
          badge: 'SOON',
          onPress: () => {
            onClose();
            alert('Feature coming soon!');
          },
        },
        {
          icon: 'mail',
          label: 'Email OSINT',
          subtitle: 'Coming soon',
          badge: 'SOON',
          onPress: () => {
            onClose();
            alert('Feature coming soon!');
          },
        },
      ]}
    />
  );
};

// ==================== DOWNLOADER TOOLS MODAL ====================
export const DownloaderToolsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  navigation: any;
}> = ({ visible, onClose, navigation }) => {
  if (!visible) return null;

  return (
    <ToolModalSheet
      title="Media Downloader"
      icon="download"
      onClose={onClose}
      options={[
        {
          icon: 'videocam',
          label: 'TikTok Downloader',
          subtitle: 'Download TikTok videos',
          onPress: () => {
            onClose();
            navigation.navigate('TiktokDownloader');
          },
        },
        {
          icon: 'camera',
          label: 'Instagram Downloader',
          subtitle: 'Download IG photos & videos',
          onPress: () => {
            onClose();
            navigation.navigate('InstagramDownloader');
          },
        },
      ]}
    />
  );
};

// ==================== UTILITY TOOLS MODAL ====================
export const UtilityToolsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  navigation: any;
}> = ({ visible, onClose, navigation }) => {
  if (!visible) return null;

  return (
    <ToolModalSheet
      title="Utility Tools"
      icon="build"
      onClose={onClose}
      options={[
        {
          icon: 'qr-code',
          label: 'QR Generator',
          subtitle: 'Generate QR codes from text/URL',
          onPress: () => {
            onClose();
            navigation.navigate('QrGenerator');
          },
        },
        {
          icon: 'shield',
          label: 'IP Scanner',
          subtitle: 'Coming soon',
          badge: 'SOON',
          onPress: () => {
            onClose();
            alert('Feature coming soon!');
          },
        },
        {
          icon: 'network',
          label: 'Port Scanner',
          subtitle: 'Coming soon',
          badge: 'SOON',
          onPress: () => {
            onClose();
            alert('Feature coming soon!');
          },
        },
      ]}
    />
  );
};