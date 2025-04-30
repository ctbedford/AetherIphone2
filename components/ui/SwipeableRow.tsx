import React from 'react';
import { Swipeable } from 'react-native-gesture-handler';
import { XStack, Button, useTheme } from 'tamagui';
import { Trash, Check } from '@tamagui/lucide-icons';
import * as Haptics from 'expo-haptics';

type SwipeableRowProps = {
  children: React.ReactNode;
  onDelete?: () => void;
  onComplete?: () => void;
  // Add any other props needed, like unique key for Swipeable instance management
};

export default function SwipeableRow({ children, onDelete, onComplete }: SwipeableRowProps) {
  const theme = useTheme();

  const renderRightActions = () => {
    if (!onDelete) return null;
    return (
      <XStack flex={1} justifyContent="flex-end">
        <Button
          // size="$3" // Match ListItem size?
          backgroundColor="$destructive"
          borderTopRightRadius="$0" // Flatten edges
          borderBottomRightRadius="$0"
          icon={<Trash color={theme.color?.get()} />} // Use theme color for icon
          onPress={() => {
            Haptics.selectionAsync();
            onDelete();
            // Consider closing the Swipeable here if needed
          }}
          width={80} // Fixed width for the action button
          height="100%" // Fill height
          justifyContent="center"
          alignItems="center"
        />
      </XStack>
    );
  };

  const renderLeftActions = () => {
    if (!onComplete) return null;
    return (
      <XStack flex={1} justifyContent="flex-start">
        <Button
          // size="$3"
          backgroundColor="$success"
          borderTopLeftRadius="$0"
          borderBottomLeftRadius="$0"
          icon={<Check color={theme.color?.get()} />}
          onPress={() => {
            Haptics.selectionAsync();
            onComplete();
            // Consider closing the Swipeable here if needed
          }}
          width={80}
          height="100%"
          justifyContent="center"
          alignItems="center"
        />
      </XStack>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootFriction={8} // Standard friction
      containerStyle={{ backgroundColor: '$background' }} // Ensure background matches item
    >
      {children}
    </Swipeable>
  );
}
