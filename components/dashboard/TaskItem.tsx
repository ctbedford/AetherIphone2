import React from 'react';
// Use Tamagui components
import { Text, XStack, YStack } from 'tamagui'; 
// Removed TouchableOpacity, View from react-native
// import { TouchableOpacity, View } from 'react-native'; 

interface Task {
  id: string;
  title: string;
  status: string;
  due?: string;
  priority?: number;
}

interface TaskItemProps {
  task: Task;
  onPress: () => void;
}

export default function TaskItem({ task, onPress }: TaskItemProps) {
  // Map priority to color
  const priorityColor = task.priority === 1 ? '$error' : 
                        task.priority === 2 ? '$warning' : 
                        '$success';
  
  // Format due date
  const formattedDate = task.due 
    ? new Date(task.due).toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric' 
      })
    : null;
  
  // Use YStack as the base pressable component
  return (
    <YStack 
      tag="pressable" // Make YStack pressable
      onPress={onPress} 
      backgroundColor="$backgroundStrong"
      padding="$3"
      borderRadius="$4"
      pressStyle={{ opacity: 0.7 }}
      space="$1" // Add space between XStack and Date Text
    >
      // @ts-ignore // TODO: Investigate Tamagui prop type issue
      <XStack ai="center"> {/* Use XStack for horizontal layout */}
        {/* Priority Dot using YStack */}
        // @ts-ignore // TODO: Investigate Tamagui prop type issue
        <YStack 
          w="$2" // Use size token for width
          h="$2" // Use size token for height
          borderRadius="$10" // Use a large radius token
          backgroundColor={priorityColor} 
          mr="$2" // Use space token for margin
        />
        <Text 
          fontSize="$4" // Use font size token
          fontWeight={task.priority === 1 ? '600' : '400'} // Keep fontWeight
          color="$color"
          flex={1} // Allow text to take remaining space
        >
          {task.title}
        </Text>
      </XStack>
      
      {formattedDate && (
        // Removed explicit margin, rely on outer YStack space
        <Text color="$colorSecondary" fontSize="$2">
          Due: {formattedDate}
        </Text>
      )}
    </YStack>
  );
} 