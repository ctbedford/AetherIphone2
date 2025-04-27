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
    shadowColor: '$color.transparent',
    backgroundColor: '$backgroundHover',
  },
  pressStyle: {
    scale: 0.97,
    backgroundColor: '$backgroundPress',
  },
  focusStyle: {
    backgroundColor: '$backgroundFocus',
    outlineColor: '$borderColorFocus',
  },
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
});

export default InteractiveCard;
