import React, { ReactNode } from 'react';
import { SafeAreaView, SafeAreaViewProps } from 'react-native';
import { styled, useTheme, YStack } from 'tamagui';

interface ContainerProps extends SafeAreaViewProps {
  children: ReactNode;
}

const StyledSafeArea = styled(SafeAreaView, {
  name: 'StyledSafeArea',
  flex: 1,
});

export const Container: React.FC<ContainerProps> = ({ style, children, ...props }) => {
  const theme = useTheme();
  return (
    <StyledSafeArea
      style={[
        { backgroundColor: theme.background.val },
        style as any
      ]}
      {...props}
    >
      <YStack flex={1}>{children}</YStack>
    </StyledSafeArea>
  );
};

export default Container;
