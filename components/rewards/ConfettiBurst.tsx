import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { View } from 'tamagui';
import Animated, {
  useSharedValue,
  withDelay,
  withTiming,
  useAnimatedStyle,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { durations, easings } from '@/constants/motion';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define confetti piece colors
const COLORS = [
  '#FF5252', // Red
  '#FFD740', // Amber
  '#64FFDA', // Teal
  '#448AFF', // Blue
  '#B388FF', // Deep Purple
  '#FF80AB', // Pink
  '#1DE9B6', // Green
  '#F48FB1', // Light Pink
];

// Number of confetti pieces
const CONFETTI_COUNT = 50;

// Confetti piece configuration
interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  delay: number;
  duration: number;
}

interface ConfettiBurstProps {
  /** Whether to show the confetti */
  isVisible: boolean;
  /** Called when animation completes */
  onComplete?: () => void;
  /** Number of confetti pieces to display (default: 50) */
  count?: number;
  /** Custom colors to use for confetti pieces */
  colors?: string[];
  /** Duration of the animation in ms (default: 2000) */
  duration?: number;
}

/**
 * A component that displays a burst of confetti animation
 */
export default function ConfettiBurst({
  isVisible,
  onComplete,
  count = CONFETTI_COUNT,
  colors = COLORS,
  duration = 2000,
}: ConfettiBurstProps) {
  // Create confetti pieces
  const pieces = React.useMemo(() => {
    const result: ConfettiPiece[] = [];
    
    for (let i = 0; i < count; i++) {
      result.push({
        id: i,
        x: Math.random() * SCREEN_WIDTH,
        y: -20, // Start above the screen
        size: Math.random() * 8 + 4, // Size between 4-12
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        delay: Math.random() * 500, // Random delay up to 500ms
        duration: Math.random() * 1000 + 1500, // Duration between 1.5-2.5s
      });
    }
    
    return result;
  }, [count, colors]);
  
  // Trigger animation complete callback
  const animationComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };
  
  return (
    <>
      {isVisible && (
        <View style={styles.container} pointerEvents="none">
          {pieces.map((piece) => (
            <ConfettiPiece
              key={piece.id}
              piece={piece}
              animationDuration={duration}
              onComplete={animationComplete}
            />
          ))}
        </View>
      )}
    </>
  );
}

// Individual confetti piece component
function ConfettiPiece({
  piece,
  animationDuration,
  onComplete,
}: {
  piece: ConfettiPiece;
  animationDuration: number;
  onComplete: () => void;
}) {
  const translateY = useSharedValue(piece.y);
  const translateX = useSharedValue(piece.x);
  const rotate = useSharedValue(piece.rotation);
  const opacity = useSharedValue(1);
  
  // Track if this is the last piece to complete
  const wasLastPiece = React.useRef(false);
  
  useEffect(() => {
    // Last piece will trigger onComplete
    if (piece.id === CONFETTI_COUNT - 1) {
      wasLastPiece.current = true;
    }
    
    // Start Y animation (falling down)
    translateY.value = withDelay(
      piece.delay,
      withTiming(
        SCREEN_HEIGHT + 50, // End below the screen
        {
          duration: piece.duration,
          easing: easings.accelerate,
        },
        () => {
          if (wasLastPiece.current) {
            runOnJS(onComplete)();
          }
        }
      )
    );
    
    // Swaying horizontal movement
    translateX.value = withDelay(
      piece.delay,
      withSequence(
        withTiming(piece.x - 50 + Math.random() * 100, {
          duration: piece.duration * 0.3,
          easing: easings.standard,
        }),
        withTiming(piece.x + 50 + Math.random() * 100, {
          duration: piece.duration * 0.3,
          easing: easings.standard,
        }),
        withTiming(piece.x - 25 + Math.random() * 50, {
          duration: piece.duration * 0.4,
          easing: easings.standard,
        })
      )
    );
    
    // Rotation animation
    rotate.value = withDelay(
      piece.delay,
      withTiming(piece.rotation + Math.random() * 720, {
        duration: piece.duration,
        easing: easings.standard,
      })
    );
    
    // Fade out toward the end
    opacity.value = withDelay(
      piece.delay + (piece.duration * 0.7),
      withTiming(0, {
        duration: piece.duration * 0.3,
        easing: easings.standard,
      })
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: opacity.value,
    };
  });
  
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: piece.size,
          height: piece.size * (Math.random() * 0.8 + 0.2), // Varying heights
          backgroundColor: piece.color,
          borderRadius: Math.random() > 0.5 ? piece.size / 2 : 0, // Some round, some square
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    pointerEvents: 'none',
  },
}); 