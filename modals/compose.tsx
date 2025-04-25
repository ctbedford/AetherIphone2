import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button } from '@/components/ui/iOS/Button';
import Animated, { 
  SlideInDown, 
  // SlideOutDown, // Not using exit animation with gesture
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS 
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = SCREEN_HEIGHT * 0.25; // Swipe 25% down to dismiss

export default function ComposeModal() {
  const router = useRouter();

  // Reanimated shared value for tracking vertical translation
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  // Gesture handler for swipe down
  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, context.value.y + event.translationY); // Only allow downward swipe
    })
    .onEnd(() => {
      if (translateY.value > DISMISS_THRESHOLD) {
        // Animate out and navigate back
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 }, () => {
          runOnJS(router.back)();
        });
      } else {
        // Snap back to original position
        translateY.value = withTiming(0, { duration: 150 });
      }
    });

  // Animated style for the view
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    // Wrap with GestureDetector
    <GestureDetector gesture={gesture}>
      {/* Apply animated style and entrance animation */}
      <Animated.View 
        style={[styles.container, animatedStyle]}
        entering={SlideInDown.duration(300)} 
      >
        {/* Optional: Add a small drag handle indicator */}
        <View style={styles.handleIndicator} />

        {/* Use Stack.Screen to configure the modal title */}
        <Stack.Screen 
          options={{
            title: 'Compose New',
            // Ensure header interaction doesn't conflict with gesture
            // headerLeft: () => <Button title="Close" onPress={() => router.back()} />
          }} 
        />
        <Text style={{ fontSize: 20, marginBottom: 20 }}>Swipe Down to Dismiss</Text>
        <Button onPress={() => router.back()}>Close Modal</Button>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: 'white', // Modals usually have solid background
    borderTopLeftRadius: 10, // Apply radius only to top corners for modal sheet look
    borderTopRightRadius: 10,
    // Add shadow for depth if desired
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // For Android shadow
  },
  handleIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
  }
}); 