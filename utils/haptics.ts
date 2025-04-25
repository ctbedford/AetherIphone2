import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utilities for iOS-style tactile feedback
 * Maps directly to iOS UIFeedbackGenerator patterns
 */
export const haptics = {
  /**
   * Light impact - subtle tap for small UI elements (buttons, toggles)
   */
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  
  /**
   * Medium impact - standard tap for medium elements (picker selections)
   */
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  
  /**
   * Heavy impact - stronger bump for significant actions
   */
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  
  /**
   * Selection feedback - subtle tap for navigating through options
   */
  selection: () => Haptics.selectionAsync(),
  
  /**
   * Success notification - double-tap vibration for completed actions
   */
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  
  /**
   * Warning notification - attention-grabbing pattern for warnings
   */
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  
  /**
   * Error notification - strong buzz pattern for errors
   */
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
}; 