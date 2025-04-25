import React from 'react';
import { StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import { View, Stack, YStack, Text, XStack, Theme } from 'tamagui';
import { useTheme } from 'tamagui';
import { useColors } from '@/utils/colors';
import { Check } from '@tamagui/lucide-icons';

export interface ThemePreviewProps {
  /** The theme name to display */
  themeName: string;
  /** Whether this theme is currently selected */
  isSelected: boolean;
  /** Called when this theme is selected */
  onSelect: () => void;
  /** Whether to force dark mode for this preview */
  forceDark?: boolean;
  /** Whether to force light mode for this preview */
  forceLight?: boolean;
  /** Container style */
  style?: StyleProp<ViewStyle>;
}

/**
 * A component that displays a preview of a theme with sample UI elements
 */
export default function ThemePreview({
  themeName,
  isSelected,
  onSelect,
  forceDark,
  forceLight,
  style,
}: ThemePreviewProps) {
  const currentTheme = useTheme();
  const previewTheme = forceDark ? 'dark' : forceLight ? 'light' : undefined;
  const colors = useColors();
  
  return (
    <Pressable 
      onPress={onSelect}
      style={({ pressed }) => [
        styles.container,
        {
          transform: [{ scale: pressed ? 0.97 : 1 }],
          borderColor: isSelected ? colors.border.focus : colors.border.default,
          borderWidth: isSelected ? 2 : 1,
        },
        style,
      ]}
    >
      <YStack space="$2">
        <Text
          fontSize="$4"
          fontWeight="$2"
          color={colors.content.primary}
          marginBottom="$1"
        >
          {themeName}
        </Text>
        
        <Theme name={previewTheme}>
          <YStack
            backgroundColor="$cardBackground"
            borderRadius="$3"
            padding="$2"
            space="$2"
          >
            {/* Header Preview */}
            <View 
              style={styles.header}
              backgroundColor="$primary"
            />
            
            {/* Content Preview */}
            <YStack space="$1">
              <View style={styles.textLine} backgroundColor="$color" opacity={0.9} />
              <View style={styles.textLine} backgroundColor="$color" opacity={0.7} width="80%" />
              <View style={styles.textLine} backgroundColor="$color" opacity={0.5} width="60%" />
            </YStack>
            
            {/* Button Preview */}
            <XStack space="$2">
              <View
                style={styles.button}
                backgroundColor="$primary"
              />
              <View
                style={styles.button}
                backgroundColor="$backgroundPress"
              />
            </XStack>
          </YStack>
        </Theme>
        
        {isSelected && (
          <View style={styles.checkContainer}>
            <XStack
              backgroundColor={colors.status.success}
              borderRadius={999}
              alignItems="center"
              justifyContent="center"
              width={24}
              height={24}
            >
              <Check color="white" size={16} />
            </XStack>
          </View>
        )}
      </YStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    height: 24,
    borderRadius: 4,
  },
  textLine: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    height: 20,
    flex: 1,
    borderRadius: 4,
  },
  checkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
}); 