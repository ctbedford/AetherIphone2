import React, { createContext, useContext, useRef, useState, ReactNode, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Theme, YStack, useTheme, Button, XStack } from 'tamagui';
import Animated, { 
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOAST_PADDING = 16;
const TOAST_WIDTH = SCREEN_WIDTH - (TOAST_PADDING * 2);

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
  message: string;
  title?: string;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [toastOptions, setToastOptions] = useState<ToastOptions>({ message: '' });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation values
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  
  const clearToastTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  
  const hideToast = useCallback(() => {
    translateY.value = withTiming(-100, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    opacity.value = withTiming(0, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }, () => {
      runOnJS(setVisible)(false);
    });
    clearToastTimeout();
  }, [translateY, opacity]);

  const showToast = useCallback((options: ToastOptions) => {
    // Always clear any existing timeout
    clearToastTimeout();
    
    // Trigger haptic feedback based on toast type
    switch (options.type) {
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setToastOptions(options);
    setVisible(true);
    
    // Animate in
    translateY.value = -100;
    opacity.value = 0;
    
    translateY.value = withSequence(
      withTiming(20, { duration: 300, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 150, easing: Easing.inOut(Easing.cubic) })
    );
    opacity.value = withTiming(1, { duration: 300 });
    
    // Auto-hide after duration
    const duration = options.duration || 3000;
    timeoutRef.current = setTimeout(hideToast, duration);
  }, [hideToast, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });
  
  // Get toast background color based on type
  const getToastBackgroundColor = () => {
    switch (toastOptions.type) {
      case 'success':
        return theme?.green6?.get() || '#22c55e'; // Default green if theme is undefined
      case 'error':
        return theme?.red6?.get() || '#ef4444'; // Default red if theme is undefined
      case 'info':
      default:
        return theme?.blue6?.get() || '#3b82f6'; // Default blue if theme is undefined
    }
  };
  
  // Get toast text color
  const getToastTextColor = () => {
    return theme?.color?.get() || '#ffffff';
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {visible && (
        <Animated.View 
          style={[
            styles.toastContainer, 
            { backgroundColor: getToastBackgroundColor() },
            animatedStyle
          ]}
        >
          <YStack flex={1} paddingRight={10}>
            {toastOptions.title && (
              <Text fontSize={16} fontWeight="bold" color={getToastTextColor()}>
                {toastOptions.title}
              </Text>
            )}
            <Text fontSize={14} color={getToastTextColor()}>
              {toastOptions.message}
            </Text>
          </YStack>
          <Button
            size="$2"
            circular
            chromeless
            onPress={hideToast}
            icon={<Text color={getToastTextColor()} opacity={0.7}>×</Text>}
          />
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    width: TOAST_WIDTH,
    alignSelf: 'center',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  }
}); 