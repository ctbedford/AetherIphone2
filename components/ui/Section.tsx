import React, { ReactNode } from 'react';
import { YStack, Text } from 'tamagui';

interface SectionProps {
  title?: string;
  children: ReactNode;
}

/**
 * Semantic section wrapper with optional title and consistent spacing.
 */
const Section: React.FC<SectionProps> = ({ title, children }) => (
  <YStack marginVertical="$4">
    {title && (
      <Text fontSize="$6" fontWeight="bold" marginBottom="$2">
        {title}
      </Text>
    )}
    {children}
  </YStack>
);

export default Section;
