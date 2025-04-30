import React from 'react';
import { XStack, YStack, Text, styled, GetProps, Stack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

// Base ListItem container
const ListItemContainer = styled(XStack, {
  name: 'ListItemContainer',
  backgroundColor: '$cardBackground',
  paddingVertical: '$3',
  paddingHorizontal: '$4',
  borderRadius: '$3',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  minHeight: 60,
  
  variants: {
    isLast: {
      true: {
        borderBottomWidth: 0,
      },
    },
    interactive: {
      true: {
        pressStyle: {
          backgroundColor: '$backgroundPress',
          opacity: 0.9,
        },
        hoverStyle: {
          backgroundColor: '$backgroundHover',
        },
      },
    },
    variant: {
      default: {},
      header: {
        backgroundColor: '$backgroundStrong',
        borderBottomColor: '$borderColor',
        paddingVertical: '$2',
      },
    },
  } as const,
  
  defaultVariants: {
    isLast: false,
    interactive: true,
    variant: 'default',
  },
});

type ListItemContainerProps = GetProps<typeof ListItemContainer>;

export interface AetherListItemProps extends ListItemContainerProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showChevron?: boolean;
  badge?: string | number;
}

/**
 * AetherListItem - A consistent list item component for use in lists, menus, and settings
 *
 * @param title - The primary text
 * @param subtitle - Optional secondary text shown below the title
 * @param leftIcon - Optional icon component to show on the left side
 * @param rightIcon - Optional icon component to show on the right side
 * @param showChevron - Whether to show a right chevron (useful for navigation items)
 * @param badge - Optional badge text/number to display
 * @param isLast - Whether this is the last item in a list (removes bottom border)
 * @param interactive - Whether the item should visually respond to touch
 */
export function AetherListItem({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  showChevron = false,
  badge,
  isLast,
  interactive,
  ...props
}: AetherListItemProps) {
  return (
    <ListItemContainer isLast={isLast} interactive={interactive} {...props}>
      {/* Left section with icon and text */}
      <XStack space="$3" flex={1} alignItems="center">
        {leftIcon && (
          <Stack marginRight="$2">{leftIcon}</Stack>
        )}
        
        <YStack>
          <Text fontWeight="500" fontSize="$4">{title}</Text>
          {subtitle && (
            <Text fontSize="$2" color="$gray10">{subtitle}</Text>
          )}
        </YStack>
      </XStack>
      
      {/* Right section with badge, custom icon or chevron */}
      <XStack space="$2" alignItems="center">
        {badge && (
          <XStack 
            backgroundColor="$primary"
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$2"
          >
            <Text color="white" fontSize="$1" fontWeight="bold">{badge}</Text>
          </XStack>
        )}
        
        {rightIcon && rightIcon}
        
        {showChevron && (
          <Ionicons name="chevron-forward" size={16} color="$gray10" />
        )}
      </XStack>
    </ListItemContainer>
  );
}
