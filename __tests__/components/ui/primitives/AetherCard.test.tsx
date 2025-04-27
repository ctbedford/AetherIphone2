import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'tamagui';
import { AetherCard } from '@/components/ui/primitives/AetherCard';

describe('AetherCard Component', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(
      <AetherCard>
        <Text>Test Card Content</Text>
      </AetherCard>
    );
    
    expect(getByText('Test Card Content')).toBeTruthy();
  });
  
  it('applies the correct variant styles', () => {
    const { rerender, getByTestId } = render(
      <AetherCard testID="test-card" variant="default">
        <Text>Default Variant</Text>
      </AetherCard>
    );
    
    // Test default variant
    let card = getByTestId('test-card');
    expect(card.props.style).toBeDefined();
    
    // Test elevated variant
    rerender(
      <AetherCard testID="test-card" variant="elevated">
        <Text>Elevated Variant</Text>
      </AetherCard>
    );
    card = getByTestId('test-card');
    expect(card.props.style).toBeDefined();
    
    // Test outlined variant
    rerender(
      <AetherCard testID="test-card" variant="outlined">
        <Text>Outlined Variant</Text>
      </AetherCard>
    );
    card = getByTestId('test-card');
    expect(card.props.style).toBeDefined();
  });
  
  it('handles press events when interactive', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <AetherCard testID="interactive-card" isInteractive onPress={onPressMock}>
        <Text>Interactive Card</Text>
      </AetherCard>
    );
    
    const card = getByTestId('interactive-card');
    fireEvent.press(card);
    
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
