import { Card, styled } from 'tamagui';

const InteractiveCard = styled(Card, {
  name: 'InteractiveCard',
  // default props
  elevate: true,
  bordered: true,
  animation: 'bouncy',
  padding: '$4',

  hoverStyle: {
    y: -2,
    shadowColor: '$colorTransparent',
  },
  pressStyle: {
    scale: 0.97,
  },
});

export default InteractiveCard;
