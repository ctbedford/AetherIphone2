import React from 'react';
import { Button, YStack, XStack, Text, Theme } from 'tamagui';
import { useToast } from '@/providers/ToastProvider';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function ToastTestScreen() {
  const { showToast } = useToast();

  const testSuccessToast = () => {
    showToast({
      type: 'success',
      title: 'Success',
      message: 'This is a success toast message',
      duration: 3000,
    });
  };

  const testErrorToast = () => {
    showToast({
      type: 'error',
      title: 'Error',
      message: 'This is an error toast message',
      duration: 3000,
    });
  };

  const testInfoToast = () => {
    showToast({
      type: 'info',
      message: 'This is an info toast without a title',
      duration: 3000,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <YStack
        flex={1}
        padding={20}
        space={16}
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize={24} fontWeight="bold" marginBottom={20}>
          Toast Test Screen
        </Text>
        
        <Button 
          onPress={testSuccessToast} 
          backgroundColor="$green6" 
          size="$4"
        >
          Show Success Toast
        </Button>
        
        <Button 
          onPress={testErrorToast} 
          backgroundColor="$red6" 
          size="$4"
        >
          Show Error Toast
        </Button>
        
        <Button 
          onPress={testInfoToast} 
          backgroundColor="$blue6" 
          size="$4"
        >
          Show Info Toast
        </Button>
      </YStack>
    </View>
  );
} 