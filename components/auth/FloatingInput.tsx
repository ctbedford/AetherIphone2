import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TextInput as RNTextInput, View, TextInputProps as RNTextInputProps } from 'react-native';
import { Text, InputProps, getTokens, useTheme } from 'tamagui';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { durations } from '@/constants/motion';

export interface FloatingInputProps extends RNTextInputProps {
  /** Label for the input */
  label: string;
  /** Error message to display */
  error?: string;
  /** Container style */
  containerStyle?: object;
  /** Label style */
  labelStyle?: object;
  /** Error style */
  errorStyle?: object;
  /** Tamagui tokens for theming */
  tokens?: ReturnType<typeof getTokens>;
  /** Called when focus changes */
  onFocusChange?: (focused: boolean) => void;
  /** Left icon to display */
  leftIcon?: React.ReactNode;
  /** Right icon to display */
  rightIcon?: React.ReactNode;
  /** Whether to adjust label position */
  adjustLabel?: boolean;
}

/**
 * Input component with animated floating label
 */
export default function FloatingInput({
  label,
  value,
  error,
  containerStyle,
  labelStyle,
  errorStyle,
  onFocusChange,
  leftIcon,
  rightIcon,
  adjustLabel = true,
  style,
  ...props
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<RNTextInput | null>(null);
  const animatedLabelValue = useSharedValue(value ? 1 : 0);
  const theme = useTheme();
  
  // Handle label animation when focus or value changes
  useEffect(() => {
    animatedLabelValue.value = withTiming(
      (isFocused || !!value) ? 1 : 0,
      {
        duration: 200, // Match durations.standard
        easing: Easing.bezier(0.4, 0.0, 0.2, 1.0),
      }
    );
  }, [isFocused, value, animatedLabelValue]);
  
  // Get dynamic colors from theme
  const colors = {
    input: {
      background: theme.inputBackground?.get() || theme.backgroundHover?.get() || '#F3F4F6',
      text: theme.color?.get() || '#111827',
      border: theme.borderColor?.get() || '#E5E7EB',
      focusBorder: theme.borderColorFocus?.get() || '#93C5FD',
      placeholderText: theme.colorTransparent?.get() || '#6B7280',
    },
    error: theme.red10?.get() || '#EF4444',
  };
  
  // Determine text color based on disabled state
  const textColor = props.editable === false 
    ? theme.colorTransparent?.get() || '#9CA3AF'
    : colors.input.text;
  
  // Handle focus changes
  const handleFocus = (event: any) => {
    setIsFocused(true);
    if (onFocusChange) onFocusChange(true);
    if (props.onFocus) props.onFocus(event);
  };
  
  const handleBlur = (event: any) => {
    setIsFocused(false);
    if (onFocusChange) onFocusChange(false);
    if (props.onBlur) props.onBlur(event);
  };
  
  // Animated styles
  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: leftIcon ? 40 : 16,
      top: adjustLabel ? 
        (16 + (-24 * animatedLabelValue.value)) : 
        (12 + (-20 * animatedLabelValue.value)),
      fontSize: 16 - (4 * animatedLabelValue.value),
      color: error ? colors.error : 
        animatedLabelValue.value > 0 ? 
          (isFocused ? colors.input.focusBorder : colors.input.placeholderText) : 
          colors.input.placeholderText,
      backgroundColor: animatedLabelValue.value > 0 ? 
        (theme.background?.get() || '#FFFFFF') : 'transparent',
      paddingHorizontal: 4 * animatedLabelValue.value,
      zIndex: 10,
    };
  });
  
  // Focus the input when the component is tapped
  const handleContainerPress = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Prepare input styles - flatten the array and provide default
  const inputStyles = StyleSheet.flatten([
    styles.input, 
    { color: textColor },
    leftIcon && { paddingLeft: 40 },
    rightIcon && { paddingRight: 40 },
    style // Style prop from component props
  ]) || {}; // Provide default empty style object
  
  return (
    <View style={[styles.container, containerStyle]}>
      <View 
        style={[
          styles.inputContainer, 
          { backgroundColor: colors.input.background },
          { borderColor: isFocused ? colors.input.focusBorder : colors.input.border },
          error && { borderColor: colors.error },
        ]} 
        onTouchStart={handleContainerPress}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <RNTextInput
          ref={inputRef}
          style={inputStyles}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.input.placeholderText}
          {...props}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        
        <Animated.Text style={[animatedLabelStyle, labelStyle]}>
          {label}
        </Animated.Text>
      </View>
      
      {error && (
        <Text
          style={[styles.errorText, { color: colors.error }, errorStyle]}
          fontSize="$3"
          marginTop="$1"
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    height: 56,
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    flex: 1,
  },
  label: {
    zIndex: 10,
  },
  errorText: {
    marginLeft: 4,
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    top: 16,
    zIndex: 2,
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    top: 16,
    zIndex: 2,
  },
}); 