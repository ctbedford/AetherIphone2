// app/components/SwipeableRow.tsx
import React from 'react';
import { View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Button } from '@/design-system/Primitives';
import { Ionicons } from '@expo/vector-icons';

type SwipeableRowProps = {
  children: React.ReactNode;
  onComplete?: () => void;
  onDelete?: () => void;
};

export const SwipeableRow = ({ children, onComplete, onDelete }: SwipeableRowProps) => {
  // Render left-swipe (complete) action
  const renderLeftActions = () => {
    if (!onComplete) return null;
    return (
      <View className="flex-row">
        <Button 
          className="w-20 h-full justify-center items-center bg-korokGreen" 
          onPress={onComplete}
          aria-label="Complete task"
        >
          <Ionicons name="checkmark-outline" size={20} color="#FDFFE0" /* parchment */ />
        </Button>
      </View>
    );
  };

  // Render right-swipe (delete) action
  const renderRightActions = () => {
    if (!onDelete) return null;
    return (
      <View className="flex-row justify-end">
        <Button 
          className="w-20 h-full justify-center items-center bg-guardianOrange" 
          onPress={onDelete}
          aria-label="Delete task"
        >
          <Ionicons name="trash-outline" size={20} color="#FDFFE0" /* parchment */ />
        </Button>
      </View>
    );
  };

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootFriction={8}
      containerStyle={{ backgroundColor: 'transparent' }}
    >
      {children}
    </Swipeable>
  );
};
