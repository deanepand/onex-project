import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/colors';

// Screens
import { LandingScreen } from '../screens/LandingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ToolsScreen } from '../screens/ToolsScreen';
import { AttackPanelScreen } from '../screens/AttackPanelScreen';
import { ManageServerScreen } from '../screens/ManageServerScreen';
import { BugSenderScreen } from '../screens/BugSenderScreen';
import { WifiKillerScreen } from '../screens/WifiKillerScreen';
import { WifiExternalScreen } from '../screens/WifiExternalScreen';
import { NikCheckerScreen } from '../screens/NikCheckerScreen';
import { DomainOsintScreen } from '../screens/DomainOsintScreen';
import { QrGeneratorScreen } from '../screens/QrGeneratorScreen';
import { TiktokDownloaderScreen } from '../screens/TiktokDownloaderScreen';
import { InstagramDownloaderScreen } from '../screens/InstagramDownloaderScreen';
import { NglSpamScreen } from '../screens/NglSpamScreen';
import { SellerScreen } from '../screens/SellerScreen';
import { AdminScreen } from '../screens/AdminScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { RatScreen } from '../screens/RatScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

// ==================== CUSTOM DRAWER ====================
const CustomDrawerContent = (props: any) => {
  const { username, role, expiredDate, sessionKey } = props.state.routeNames
    ? props.route?.params || {}
    : {};

  // Get current params from the focused route
  const currentRoute = props.state.routes[props.state.index];
  const params = currentRoute?.params || {};

  const handleLogout = () => {
    props.navigation.replace('Login');
  };

  return (
    <View style={drawerStyles.container}>
      <LinearGradient colors={GRADIENTS.dark} style={drawerStyles.background}>
        {/* Header */}
        <LinearGradient colors={GRADIENTS.primary} style={drawerStyles.header}>
          <View style={drawerStyles.logoContainer}>
            <Ionicons name="shield-checkmark" size={32} color={COLORS.primaryWhite} />
          </View>
          <Text style={drawerStyles.appName}>SixEyesX</Text>
          <View style={drawerStyles.userInfo}>
            <View style={drawerStyles.infoRow}>
              <Text style={drawerStyles.infoLabel}>User:</Text>
              <Text style={drawerStyles.infoValue}>{params.username || '-'}</Text>
            </View>
            <View style={drawerStyles.infoRow}>
              <Text style={drawerStyles.infoLabel}>Role:</Text>
              <Text style={drawerStyles.infoValue}>{params.role || '-'}</Text>
            </View>
            <View style={drawerStyles.infoRow}>
              <Text style={drawerStyles.infoLabel}>Expired:</Text>
              <Text style={drawerStyles.infoValue}>{params.expiredDate || '-'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Menu Items */}
        <ScrollView contentContainerStyle={drawerStyles.menuContainer}>
          <DrawerItem
            icon="home"
            label="Dashboard"
            onPress={() => {
              props.navigation.closeDrawer();
            }}
          />

          {(params.role === 'reseller' || params.role === 'owner') && (
            <DrawerItem
              icon="store"
              label="Seller Page"
              onPress={() => {
                props.navigation.closeDrawer();
                props.navigation.navigate('Seller', { keyToken: params.sessionKey });
              }}
            />
          )}

          {params.role === 'owner' && (
            <DrawerItem
              icon="settings"
              label="Admin Panel"
              onPress={() => {
                props.navigation.closeDrawer();
                props.navigation.navigate('Admin', { sessionKey: params.sessionKey });
              }}
            />
          )}

          <DrawerItem
            icon="phone-portrait"
            label="RAT Control"
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate('Rat', { sessionKey: params.sessionKey });
            }}
          />

          <DrawerItem
            icon="bug"
            label="Bug Sender"
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate('BugSender', { sessionKey: params.sessionKey });
            }}
          />

          <DrawerItem
            icon="lock-closed"
            label="Change Password"
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate('ChangePassword', {
                username: params.username,
                sessionKey: params.sessionKey,
              });
            }}
          />

          <View style={drawerStyles.divider} />

          <DrawerItem
            icon="log-out"
            label="Logout"
            onPress={handleLogout}
            danger
          />
        </ScrollView>

        {/* Footer */}
        <View style={drawerStyles.footer}>
          <Text style={drawerStyles.footerText}>© 2025 SixEyesX</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const DrawerItem = ({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) => (
  <TouchableOpacity
    style={drawerStyles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View
      style={[
        drawerStyles.menuIcon,
        danger && { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={danger ? COLORS.dangerRed : COLORS.accentRed}
      />
    </View>
    <Text
      style={[
        drawerStyles.menuLabel,
        danger && { color: COLORS.dangerRed },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const drawerStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  background: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primaryWhite,
    fontFamily: 'Orbitron',
    letterSpacing: 2,
    marginBottom: 16,
  },
  userInfo: { gap: 6 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontFamily: 'ShareTechMono',
  },
  infoValue: {
    color: COLORS.primaryWhite,
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'ShareTechMono',
  },
  menuContainer: { paddingVertical: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    color: COLORS.primaryWhite,
    fontSize: 15,
    fontFamily: 'ShareTechMono',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
    marginHorizontal: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'ShareTechMono',
  },
});

// ==================== BOTTOM TAB NAVIGATOR ====================
const BottomTabNavigator = ({ route }: any) => {
  const params = route.params || {};

  return (
    <Tab.Navigator
      screenOptions={({ route: tabRoute }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.cardDarker,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: COLORS.accentRed,
        tabBarInactiveTintColor: COLORS.accentGrey,
        tabBarLabelStyle: {
          fontFamily: 'Orbitron',
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (tabRoute.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (tabRoute.name === 'WhatsApp') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (tabRoute.name === 'Tools') {
            iconName = focused ? 'build' : 'build-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        initialParams={params}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="WhatsApp"
        component={HomeScreen}
        initialParams={params}
        options={{ title: 'Bug Send' }}
      />
      <Tab.Screen
        name="Tools"
        component={ToolsScreen}
        initialParams={{
          sessionKey: params.sessionKey,
          userRole: params.role,
          listDoos: params.listDoos || [],
        }}
        options={{ title: 'Tools' }}
      />
    </Tab.Navigator>
  );
};

// ==================== DRAWER NAVIGATOR ====================
const DrawerNavigator = ({ route }: any) => {
  const params = route.params || {};

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: COLORS.cardDarker,
          width: 280,
        },
      }}
      initialRouteName="MainTabs"
    >
      <Drawer.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        initialParams={params}
      />
    </Drawer.Navigator>
  );
};

// ==================== MAIN STACK NAVIGATOR ====================
export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.primaryDark },
        animation: 'slide_from_right',
      }}
    >
      {/* Public Routes */}
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Main App (with Drawer + Tabs) */}
      <Stack.Screen name="Dashboard" component={DrawerNavigator} />

      {/* Feature Screens (Stack) */}
      <Stack.Screen name="AttackPanel" component={AttackPanelScreen} />
      <Stack.Screen name="ManageServer" component={ManageServerScreen} />
      <Stack.Screen name="BugSender" component={BugSenderScreen} />
      <Stack.Screen name="WifiKiller" component={WifiKillerScreen} />
      <Stack.Screen name="WifiExternal" component={WifiExternalScreen} />
      <Stack.Screen name="NikChecker" component={NikCheckerScreen} />
      <Stack.Screen name="DomainOsint" component={DomainOsintScreen} />
      <Stack.Screen name="QrGenerator" component={QrGeneratorScreen} />
      <Stack.Screen name="TiktokDownloader" component={TiktokDownloaderScreen} />
      <Stack.Screen name="InstagramDownloader" component={InstagramDownloaderScreen} />
      <Stack.Screen name="NglSpam" component={NglSpamScreen} />
      <Stack.Screen name="Seller" component={SellerScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Rat" component={RatScreen} />
    </Stack.Navigator>
  );
};