import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  TextInput,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/colors';
import { sendNglMessage } from '../services/api';
import { generateDeviceId } from '../utils/helpers';

interface NglSpamScreenProps {
  navigation: any;
}

export const NglSpamScreen: React.FC<NglSpamScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [counter, setCounter] = useState(0);
  const [statusLog, setStatusLog] = useState('');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  const sendMessage = async () => {
    const deviceId = generateDeviceId(42);
    try {
      const response = await sendNglMessage(username, message, deviceId);
      if (response.status === 200) {
        setCounter(prev => prev + 1);
        setStatusLog(`✅ [${counter + 1}] Message sent`);
      } else {
        setStatusLog(`❌ Ratelimit (${response.status}), waiting 5s...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      setStatusLog(`⚠️ Error occurred`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const startLoop = () => {
    if (!username.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in username and message.');
      return;
    }

    setIsRunning(true);
    setCounter(0);
    setStatusLog('▶️ Starting...');

    intervalRef.current = setInterval(sendMessage, 2000);
  };

  const stopLoop = () => {
    setIsRunning(false);
    setStatusLog('⏹️ Stopped');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const getStatusColor = () => {
    if (statusLog.includes('✅')) return COLORS.successGreen;
    if (statusLog.includes('❌')) return COLORS.dangerRed;
    if (statusLog.includes('⚠️')) return COLORS.warningOrange;
    if (statusLog.includes('▶️')) return COLORS.successGreen;
    if (statusLog.includes('⏹️')) return COLORS.warningOrange;
    return COLORS.primaryWhite;
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
            <Text style={styles.headerTitle}>NGL AUTO SENDER</Text>
            <Text style={styles.headerSubtitle}>Automated Message System</Text>
          </View>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isRunning ? COLORS.successGreen : COLORS.dangerRed },
            ]}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Input Card */}
          <View style={styles.inputCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username NGL</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="username_ngl"
                placeholderTextColor={COLORS.accentGrey}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={message}
                onChangeText={setMessage}
                placeholder="Message to send..."
                placeholderTextColor={COLORS.accentGrey}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Control Buttons */}
          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={[styles.controlButton, isRunning && styles.controlButtonDisabled]}
              onPress={startLoop}
              disabled={isRunning}
            >
              <LinearGradient
                colors={isRunning ? ['#6B7280', '#4B5563'] : GRADIENTS.primary}
                style={styles.controlGradient}
              >
                <Ionicons name="play" size={24} color={COLORS.primaryWhite} />
                <Text style={styles.controlText}>START</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, !isRunning && styles.controlButtonDisabled]}
              onPress={stopLoop}
              disabled={!isRunning}
            >
              <LinearGradient
                colors={isRunning ? ['#DC2626', '#991B1B'] : ['#6B7280', '#4B5563']}
                style={styles.controlGradient}
              >
                <Ionicons name="stop" size={24} color={COLORS.primaryWhite} />
                <Text style={styles.controlText}>STOP</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Ionicons name="information-circle" size={20} color={COLORS.primaryWhite} />
              <Text style={styles.statusTitle}>STATUS LOG</Text>
            </View>

            <View style={styles.statusLogContainer}>
              <Text style={[styles.statusLogText, { color: getStatusColor() }]}>
                {statusLog || 'Waiting for command...'}
              </Text>
            </View>

            {counter > 0 && (
              <View style={styles.counterContainer}>
                <Ionicons name="send" size={20} color={COLORS.lightRed} />
                <Text style={styles.counterLabel}>Total sent: </Text>
                <Text style={styles.counterValue}>{counter}</Text>
              </View>
            )}

            <View style={styles.infoBox}>
              <Ionicons name="warning" size={16} color={COLORS.lightRed} />
              <Text style={styles.infoBoxText}>
                Auto send every 2 seconds. Stop manually when done.
              </Text>
            </View>
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
  headerContent: { flex: 1, marginLeft: 12 },
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
  inputCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    color: COLORS.lightRed,
    fontSize: 14,
    fontFamily: 'ShareTechMono',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    color: COLORS.primaryWhite,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'ShareTechMono',
    fontSize: 15,
  },
  multilineInput: { minHeight: 80, textAlignVertical: 'top' },
  controlButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  controlButton: { flex: 1, borderRadius: 15, overflow: 'hidden' },
  controlButtonDisabled: { opacity: 0.6 },
  controlGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  controlText: {
    color: COLORS.primaryWhite,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    fontSize: 16,
  },
  statusCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentRed,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  statusTitle: {
    color: COLORS.primaryWhite,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  statusLogContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
    marginBottom: 16,
  },
  statusLogText: {
    fontSize: 15,
    fontFamily: 'ShareTechMono',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    gap: 8,
  },
  counterLabel: {
    color: COLORS.lightRed,
    fontSize: 15,
    fontFamily: 'ShareTechMono',
  },
  counterValue: {
    color: COLORS.primaryWhite,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  infoBoxText: {
    flex: 1,
    color: COLORS.accentGrey,
    fontSize: 12,
    fontFamily: 'ShareTechMono',
  },
});