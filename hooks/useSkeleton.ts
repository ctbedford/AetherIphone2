import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { durations, easings } from '@/constants/motion';

export interface SkeletonOptions {
  /**
   * Width of the gradient shimmer (as % of the component width)
   * @default 0.7
   */
  shimmerWidth?: number;
  /**
   * Base color of the skeleton component
   * @default '#E1E9EE'
   */
  baseColor?: string;
  /**
   * Highlight color for the shimmer effect
   * @default '#F2F8FC'
   */
  highlightColor?: string;
  /**
   * Duration for a complete shimmer cycle in ms
   * @default 2000
   */
  duration?: number;
  /**
   * Delay before starting animation in ms
   * @default 0
   */
  delay?: number;
  /**
   * Whether animation should start automatically
   * @default true
   */
  autoStart?: boolean;
}

/**
 * Hook to create skeleton loading animations with shimmer effect
 */
export function useSkeleton(options: SkeletonOptions = {}) {
  const {
    shimmerWidth = 0.7,
    baseColor = '#E1E9EE',
    highlightColor = '#F2F8FC',
    duration = durations.long * 2,
    delay = 0,
    autoStart = true,
  } = options;
  
  // Animation value to track shimmer position
  const translateX = useSharedValue(-1);
  
  // Start the animation
  useEffect(() => {
    if (autoStart) {
      translateX.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-1, { duration: 0 }),
            withTiming(1, { 
              duration, 
              easing: easings.linear 
            }),
          ),
          -1, // Infinite repeat
        ),
      );
    }
  }, [translateX, duration, delay, autoStart]);
  
  // Generate the animated styles for the shimmer effect
  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value * (1 + shimmerWidth) }],
    };
  });
  
  // Create styles for both container and shimmer
  const styles = StyleSheet.create({
    container: {
      backgroundColor: baseColor,
      overflow: 'hidden',
    },
    shimmer: {
      width: `${shimmerWidth * 100}%`,
      height: '100%',
      backgroundColor: highlightColor,
      position: 'absolute',
      top: 0,
      bottom: 0,
      opacity: 0.7,
    },
  });
  
  // Utility function to manually start the animation
  const startAnimation = () => {
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-1, { duration: 0 }),
          withTiming(1, { 
            duration, 
            easing: easings.linear 
          }),
        ),
        -1, // Infinite repeat
      ),
    );
  };
  
  // Utility function to stop the animation
  const stopAnimation = () => {
    translateX.value = withTiming(-1, { duration: 200 });
  };
  
  return {
    baseColor,
    shimmerStyle,
    styles,
    startAnimation,
    stopAnimation,
  };
} 