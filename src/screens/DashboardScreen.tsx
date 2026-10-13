import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, GRADIENTS } from '../utils/colors';
import { getStats, validateSession } from '../services/api';
import { getDeviceId } from '../utils/helpers';

// Import screens
import { HomeScreen } from './HomeScreen';
import { ToolsScreen } from './ToolsScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

interface DashboardScreenProps {
  navigation: any;
  route: {
    params: {
      username: string;
      password: string;
      role: string;
      sessionKey: string;
      expiredDate: string;
      listBug: any[];
      listDoos: any[];
      news: any[];
    };
  };
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation, route }) => {
  const {
    username,
    password,
    role,
    sessionKey,
    expiredDate,
    listBug,
    listDoos,
    news,
  } = route.params;

  const [onlineUsers, setOnlineUsers] = useState(0);
  const [activeConnections, setActiveConnections] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    fetchStats();
    checkSession();

    // Auto scroll news
    const interval = setInterval(() => {
      if (news.length > 1) {
        setCurrentNewsIndex(prev => (prev + 1) % news.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const stats = await getStats();
      if (stats.type === 'stats') {
        setOnlineUsers(stats.onlineUsers || 0);
        setActiveConnections(stats.activeConnections || 0);
      }
    } catch (error) {
      console.log('Stats error:', error);
    }
  };

  const checkSession = async () => {
    try {
      const androidId = await getDeviceId();
      const response = await validateSession(sessionKey, androidId);

      if (response.valid === false) {
        if (response.reason === 'androidIdMismatch') {
          handleInvalidSession('Your account has logged on another device.');
        } else if (response.reason === 'keyInvalid') {
          handleInvalidSession('Key is not valid. Please login again.');
        }
      }
    } catch (error) {
      console.log('Session check error:', error);
    }
  };

  const handleInvalidSession = async (message: string) => {
    await AsyncStorage.clear();
    Alert.alert('⚠️ Session Expired', message, [
      { text: 'OK', onPress: () => navigation.replace('Login') },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    await checkSession();
    setRefreshing(false);
  };

  const getRoleColor = () => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return COLORS.dangerRed;
      case 'vip':
        return COLORS.accentRed;
      case 'reseller':
        return COLORS.successGreen;
      case 'reseller1':
        return COLORS.warningOrange;
      default:
        return COLORS.lightRed;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <LinearGradient colors={GRADIENTS.dark} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.openDrawer()}
          >
            <Ionicons name="menu" size={24} color={COLORS.primaryWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SixEyesX</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Account')}
          >
            <Ionicons name="person-circle" size={24} color={COLORS.primaryWhite} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.accentRed}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Card */}
          <LinearGradient colors={GRADIENTS.primary} style={styles.welcomeCard}>
            <View style={styles.welcomeHeader}>
              <View style={styles.welcomeIcon}>
                <Ionicons name="dashboard" size={24} color={COLORS.primaryWhite} />
              </View>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeLabel}>Welcome back</Text>
                <Text style={styles.welcomeTitle}>SixEyesX Dashboard</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={20} color="rgba(255,255,255,0.7)" />
                <View style={styles.statText}>
                  <Text style={styles.statLabel}>Online Users</Text>
                  <Text style={styles.statValue}>{onlineUsers}</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="link" size={20} color="rgba(255,255,255,0.7)" />
                <View style={styles.statText}>
                  <Text style={styles.statLabel}>Connections</Text>
                  <Text style={styles.statValue}>{activeConnections}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* News Section */}
          {news.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Latest News</Text>
              <View style={styles.newsContainer}>
                {news.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.newsCard,
                      index === currentNewsIndex ? styles.newsCardActive : styles.newsCardHidden,
                    ]}
                  >
                    {item.image && (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.newsImage}
                        resizeMode="cover"
                      />
                    )}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.9)']}
                      style={styles.newsOverlay}
                    >
                      <Text style={styles.newsTitle}>{item.title || 'No Title'}</Text>
                      <Text style={styles.newsDesc} numberOfLines={2}>
                        {item.desc || ''}
                      </Text>
                    </LinearGradient>
                  </View>
                ))}
                {/* News Indicators */}
                <View style={styles.newsIndicators}>
                  {news.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.newsIndicator,
                        index === currentNewsIndex && styles.newsIndicatorActive,
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Account Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statCardIcon, { backgroundColor: `${COLORS.accentRed}33` }]}>
                  <Ionicons name="person" size={24} color={COLORS.accentRed} />
                </View>
                <View style={styles.statCardContent}>
                  <Text style={styles.statCardLabel}>Username</Text>
                  <Text style={[styles.statCardValue, { color: COLORS.accentRed }]}>
                    {username}
                  </Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statCardIcon, { backgroundColor: `${getRoleColor()}33` }]}>
                  <Ionicons name="shield" size={24} color={getRoleColor()} />
                </View>
                <View style={styles.statCardContent}>
                  <Text style={styles.statCardLabel}>Role</Text>
                  <Text style={[styles.statCardValue, { color: getRoleColor() }]}>
                    {role?.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.statCard, styles.fullWidthCard]}>
              <View style={[styles.statCardIcon, { backgroundColor: `${COLORS.warningOrange}33` }]}>
                <Ionicons name="calendar" size={24} color={COLORS.warningOrange} />
              </View>
              <View style={styles.statCardContent}>
                <Text style={styles.statCardLabel}>Account Expires</Text>
                <Text style={[styles.statCardValue, { color: COLORS.warningOrange }]}>
                  {expiredDate}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {(role === 'reseller' || role === 'owner') && (
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() =>
                    navigation.navigate('Seller', { keyToken: sessionKey })
                  }
                >
                  <Ionicons name="store" size={28} color={COLORS.accentRed} />
                  <Text style={styles.actionText}>Seller Page</Text>
                </TouchableOpacity>
              )}

              {role === 'owner' && (
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() =>
                    navigation.navigate('Admin', { sessionKey })
                  }
                >
                  <Ionicons name="settings" size={28} color={COLORS.accentRed} />
                  <Text style={styles.actionText}>Admin Panel</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('BugSender', { sessionKey })}
              >
                <Ionicons name="bug" size={28} color={COLORS.accentRed} />
                <Text style={styles.actionText}>Bug Sender</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() =>
                  navigation.navigate('ChangePassword', { username, sessionKey })
                }
              >
                <Ionicons name="key" size={28} color={COLORS.accentRed} />
                <Text style={styles.actionText}>Change Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.glassColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: COLORS.accentRed,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: 'ShareTechMono',
  },
  welcomeTitle: {
    color: COLORS.primaryWhite,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  statText: {
    marginLeft: 12,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontFamily: 'ShareTechMono',
  },
  statValue: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    marginBottom: 12,
    fontFamily: 'Orbitron',
  },
  newsContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  newsCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.cardDark,
  },
  newsCardActive: {
    zIndex: 1,
    opacity: 1,
  },
  newsCardHidden: {
    zIndex: 0,
    opacity: 0,
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  newsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  newsTitle: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    marginBottom: 4,
  },
  newsDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontFamily: 'ShareTechMono',
  },
  newsIndicators: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 2,
  },
  newsIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  newsIndicatorActive: {
    backgroundColor: COLORS.primaryWhite,
    width: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
  },
  fullWidthCard: {
    flex: 0,
    width: '100%',
  },
  statCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statCardContent: {
    flex: 1,
  },
  statCardLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontFamily: 'ShareTechMono',
  },
  statCardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 44) / 2,
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
  },
  actionText: {
    color: COLORS.primaryWhite,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'ShareTechMono',
  },
});