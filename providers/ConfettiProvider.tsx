import { ReactNode, createContext, useCallback, useContext, useRef, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { View } from 'tamagui';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COUNT = 50; // Number of confetti pieces
const COLORS = ['#ff4747', '#ffae47', '#fff347', '#47ff70', '#47d0ff', '#9147ff', '#ff47f3'];

interface ConfettiContextValue {
  showConfetti: () => void;
}

const ConfettiContext = createContext<ConfettiContextValue>({
  showConfetti: () => {},
});

export const useConfetti = () => useContext(ConfettiContext);

// Create a single confetti piece component
function ConfettiPiece({ 
  size, 
  color, 
  initialX, 
  initialY, 
  duration, 
  delay 
}: { 
  size: number, 
  color: string, 
  initialX: number, 
  initialY: number, 
  duration: number, 
  delay: number 
}) {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Create animation when component mounts
  useState(() => {
    // Random horizontal movement
    const targetX = initialX + (Math.random() * 2 - 1) * SCREEN_WIDTH * 0.5;
    
    // Fall down animation
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 100, { duration })
    );
    
    // Horizontal movement with some randomness
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(targetX, { duration: duration * 0.4 }),
        withTiming(targetX + (Math.random() * 2 - 1) * 100, { duration: duration * 0.6 })
      )
    );
    
    // Rotation animation
    rotate.value = withDelay(
      delay,
      withTiming(Math.random() * 1080, { duration })
    );
    
    // Fade out toward the end
    opacity.value = withDelay(
      delay + duration * 0.7,
      withTiming(0, { duration: duration * 0.3 })
    );
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size * (Math.random() * 0.8 + 0.2), // Varying heights
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? size / 2 : 0, // Some round, some square
        },
        animatedStyle,
      ]}
    />
  );
}

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const animationTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Generate confetti pieces data
  const generateConfettiData = useCallback(() => {
    const pieces = [];
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      pieces.push({
        id: i,
        size: Math.random() * 8 + 4, // Size between 4-12
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        initialX: Math.random() * SCREEN_WIDTH,
        initialY: -20, // Start just above the screen
        duration: Math.random() * 1000 + 2000, // Duration between 2-3 seconds
        delay: Math.random() * 500, // Random delay up to 500ms
      });
    }
    return pieces;
  }, []);

  const [confettiPieces, setConfettiPieces] = useState(generateConfettiData());

  const showConfetti = useCallback(() => {
    // Trigger haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Clear any existing timeout
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
    }
    
    // Generate new confetti data and show
    setConfettiPieces(generateConfettiData());
    setIsVisible(true);
    
    // Hide confetti after animation completes
    animationTimeout.current = setTimeout(() => {
      setIsVisible(false);
    }, 3500); // Slightly longer than the max animation time to ensure all pieces are gone
  }, [generateConfettiData]);

  return (
    <ConfettiContext.Provider value={{ showConfetti }}>
      {children}
      {isVisible && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {confettiPieces.map((piece) => (
            <ConfettiPiece
              key={piece.id}
              size={piece.size}
              color={piece.color}
              initialX={piece.initialX}
              initialY={piece.initialY}
              duration={piece.duration}
              delay={piece.delay}
            />
          ))}
        </View>
      )}
    </ConfettiContext.Provider>
  );
}

const styles = StyleSheet.create({
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: 'none',
  },
}); 