import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';

interface CustomInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
  icon?: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
  editable?: boolean;
  style?: ViewStyle;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  icon,
  multiline = false,
  editable = true,
  style,
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          !editable && styles.inputDisabled,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? COLORS.accentRed : COLORS.accentGrey}
            style={styles.icon}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.accentGrey}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          multiline={multiline}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, multiline && styles.multiline]}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
            <Ionicons
              name={isSecure ? 'eye-off' : 'eye'}
              size={20}
              color={COLORS.accentGrey}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.primaryWhite,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: 'ShareTechMono',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDarker,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: COLORS.accentRed,
    borderWidth: 2,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: COLORS.primaryWhite,
    fontSize: 16,
    paddingVertical: 14,
    fontFamily: 'ShareTechMono',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});