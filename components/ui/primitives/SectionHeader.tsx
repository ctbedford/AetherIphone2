import React from 'react';
import { XStack, Text, styled, GetProps, Button } from 'tamagui';

const SectionContainer = styled(XStack, {
  name: 'SectionContainer',
  paddingVertical: '$2',
  paddingHorizontal: '$4',
  marginTop: '$4',
  marginBottom: '$2',
  justifyContent: 'space-between',
  alignItems: 'center',
});

type SectionContainerProps = GetProps<typeof SectionContainer>;

export interface SectionHeaderProps extends SectionContainerProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * SectionHeader - A consistent section header with optional action button
 * 
 * Used to separate content sections in screens like Home, Settings, etc.
 *
 * @param title - The section title
 * @param actionLabel - Optional label for the action button
 * @param onAction - Optional callback when action button is pressed
 */
export function SectionHeader({ 
  title, 
  actionLabel, 
  onAction, 
  ...props 
}: SectionHeaderProps) {
  return (
    <SectionContainer {...props}>
      <Text 
        fontSize="$5" 
        fontWeight="600" 
        color="$color"
      >
        {title}
      </Text>
      
      {actionLabel && onAction && (
        <Button
          onPress={onAction}
          fontSize="$2"
          backgroundColor="transparent"
          color="$primary"
          paddingHorizontal="$2"
          height="$5"
        >
          {actionLabel}
        </Button>
      )}
    </SectionContainer>
  );
}
