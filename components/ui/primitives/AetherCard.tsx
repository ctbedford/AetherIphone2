import React from 'react';
import { Card, CardProps, YStack, styled } from 'tamagui';

type AetherCardVariant = 'default' | 'elevated' | 'outlined';

interface AetherCardProps extends CardProps {
  variant?: AetherCardVariant;
  // Additional props specific to AetherCard
  isInteractive?: boolean;
}

// Create a styled Card component that uses our custom Tamagui theme variables
const StyledCard = styled(Card, {
  name: 'AetherCard',
  backgroundColor: '$cardBackground',
  borderRadius: '$4',
  padding: '$4',
  elevate: true,

  variants: {
    variant: {
      default: {
        // Using our theme tokens
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
      elevated: {
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$borderColor',
        shadowOpacity: 0,
        elevation: 0,
      },
    },
    isInteractive: {
      true: {
        pressStyle: {
          backgroundColor: '$cardBackgroundPress',
          opacity: 0.9,
        },
        hoverStyle: {
          backgroundColor: '$cardBackgroundHover',
        },
      },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
    isInteractive: false,
  },
});

/**
 * AetherCard - A stylized card component following Aether design system
 *
 * @param variant - The visual style variant: 'default', 'elevated', or 'outlined'
 * @param isInteractive - Whether the card responds to press/hover states
 */
export function AetherCard({ children, variant, isInteractive, ...props }: AetherCardProps) {
  return (
    <StyledCard variant={variant} isInteractive={isInteractive} {...props}>
      {children}
    </StyledCard>
  );
}
