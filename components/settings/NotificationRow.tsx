import React, { ReactNode } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { XStack, Text, Switch, SwitchProps, YStack } from 'tamagui';
import { useColors } from '@/utils/colors';

export interface NotificationRowProps {
  /** Title of the notification setting */
  title: string;
  /** Optional description */
  description?: string;
  /** Whether the notification is turned on */
  enabled: boolean;
  /** Called when the switch is toggled */
  onToggle: (value: boolean) => void;
  /** Icon to display in the row */
  icon?: ReactNode;
  /** Whether the control is in loading state */
  isLoading?: boolean;
  /** Switch props */
  switchProps?: Omit<SwitchProps, 'checked' | 'onCheckedChange'>;
  /** Container style */
  style?: StyleProp<ViewStyle>;
}

/**
 * A component for displaying a notification setting row with toggle switch
 */
export default function NotificationRow({
  title,
  description,
  enabled,
  onToggle,
  icon,
  isLoading,
  switchProps,
  style,
}: NotificationRowProps) {
  const colors = useColors();
  
  const handleToggle = (value: boolean) => {
    if (!isLoading) {
      onToggle(value);
    }
  };
  
  return (
    <XStack
      style={[styles.container, style]}
      alignItems="center"
      justifyContent="space-between"
      padding="$4"
      backgroundColor={colors.background.card}
      borderRadius="$4"
    >
      <XStack alignItems="center" space="$3" flex={1}>
        {icon && <XStack opacity={isLoading ? 0.5 : 1}>{icon}</XStack>}
        
        <YStack space="$1" flex={1} opacity={isLoading ? 0.5 : 1}>
          <Text
            fontSize="$4"
            fontWeight="$2"
            color={colors.content.primary}
          >
            {title}
          </Text>
          
          {description && (
            <Text
              fontSize="$3"
              color={colors.content.secondary}
            >
              {description}
            </Text>
          )}
        </YStack>
      </XStack>
      
      <Switch
        size="$2"
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={isLoading}
        {...switchProps}
      />
    </XStack>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
}); 