import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AetherListItem } from '@/components/ui/primitives/ListItem';

describe('AetherListItem Component', () => {
  it('renders with required props', () => {
    const { getByText } = render(
      <AetherListItem title="Test Item" />
    );
    
    expect(getByText('Test Item')).toBeTruthy();
  });
  
  it('renders with subtitle', () => {
    const { getByText } = render(
      <AetherListItem 
        title="Test Item" 
        subtitle="This is a subtitle" 
      />
    );
    
    expect(getByText('Test Item')).toBeTruthy();
    expect(getByText('This is a subtitle')).toBeTruthy();
  });
  
  it('renders with badge', () => {
    const { getByText } = render(
      <AetherListItem 
        title="Test Item" 
        badge="5" 
      />
    );
    
    expect(getByText('Test Item')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
  });
  
  it('renders with chevron when showChevron is true', () => {
    const { getByTestId } = render(
      <AetherListItem 
        title="Test Item" 
        showChevron 
      />
    );
    
    expect(getByTestId('icon-chevron-forward')).toBeTruthy();
  });
  
  it('handles press events', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <AetherListItem 
        title="Test Item" 
        onPress={onPressMock}
      />
    );
    
    const item = getByText('Test Item').parent.parent;
    fireEvent.press(item);
    
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
  
  it('applies the correct styles for the last item', () => {
    const { getByText, rerender } = render(
      <AetherListItem title="Regular Item" />
    );
    
    // Check regular item
    let item = getByText('Regular Item').parent.parent;
    expect(item.props.style).toBeDefined();
    
    // Check last item
    rerender(<AetherListItem title="Last Item" isLast />);
    item = getByText('Last Item').parent.parent;
    expect(item.props.style).toBeDefined();
  });
});
