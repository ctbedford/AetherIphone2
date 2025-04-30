import React from 'react';
import { Pressable } from 'react-native';
import { styled } from '@gluestack-ui/themed';

/**
 * Generic surface container that replaces the old `AetherCard`
 * (see components/ui/primitives/AetherCard.tsx) :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1}
 */
const StyledCard = styled(Pressable, {
  bg: '$surface',
  borderRadius: '$lg',
  p: '$4',
  shadow: '$2',

  variants: {
    variant: {
      elevated: { shadow: '$4' },
      outlined: { borderWidth: 1, borderColor: '$outline' },
      flat:     { shadow: 'none', bg: '$surfaceSubtle' },
    },
  },

  defaultProps: { variant: 'elevated' },
});

export type CardProps = React.ComponentProps<typeof StyledCard>;

export const Card: React.FC<CardProps> = ({ children, ...rest }) => (
  <StyledCard
    accessibilityRole={rest.onPress ? 'button' : 'summary'}
    {...rest}
  >
    {children}
  </StyledCard>
);

export default Card;
