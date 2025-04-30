import React from 'react';
import { HStack, VStack, Text, Pressable } from '@gluestack-ui/themed';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
}

/**
 * Glue-flavoured replacement for `AetherListItem` :contentReference[oaicite:2]{index=2}&#8203;:contentReference[oaicite:3]{index=3}
 */
export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  left,
  right,
  onPress,
}) => {
  const Container: any = onPress ? Pressable : HStack;

  return (
    <Container alignItems="center" px="$4" py="$3" space="$3" onPress={onPress}>
      {left}
      <VStack flex={1}>
        <Text fontWeight="$semibold">{title}</Text>
        {subtitle && <Text size="sm" color="$muted">{subtitle}</Text>}
      </VStack>
      {right}
    </Container>
  );
};
