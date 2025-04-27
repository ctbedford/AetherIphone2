import React from 'react';
import { YStack, Text, Button } from 'tamagui';
import { SkeletonCard, SkeletonRow, SkeletonCircle } from './Skeleton';
import { SectionError } from './ErrorBanner';

export interface EmptyOrSkeletonProps {
  // Loading state
  isLoading?: boolean;
  count?: number;
  type?: 'card' | 'row' | 'circle';
  
  // Empty state
  isEmpty?: boolean;
  text?: string;
  actionText?: string;
  onAction?: () => void;
  
  // Error state
  isError?: boolean;
  onRetry?: () => void;
  
  // Children to render when not in any special state
  children?: React.ReactNode;
}

export const EmptyOrSkeleton = ({
  isLoading = false,
  count = 3,
  type = 'row',
  isEmpty = false,
  text = 'No items found',
  actionText = 'Add New',
  onAction,
  isError = false,
  onRetry,
  children
}: EmptyOrSkeletonProps) => {
  // Generate skeleton based on type
  const renderSkeletons = () => {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      if (type === 'card') {
        skeletons.push(<SkeletonCard key={i} />);
      } else if (type === 'circle') {
        skeletons.push(<SkeletonCircle key={i} />);
      } else {
        skeletons.push(<SkeletonRow key={i} />);
      }
    }
    return skeletons;
  };

  // Show skeleton if loading
  if (isLoading) {
    return (
      <YStack space="$3">
        {renderSkeletons()}
      </YStack>
    );
  }
  
  // Show error state if there's an error
  if (isError) {
    return (
      <SectionError 
        message={text} 
        onRetry={onRetry} 
      />
    );
  }
  
  // Show empty state if empty
  if (isEmpty) {
    return (
      <YStack
        padding="$4"
        alignItems="center"
        justifyContent="center"
        space="$3"
      >
        <Text textAlign="center" color="$gray11">
          {text}
        </Text>
        {onAction && (
          <Button size="$3" onPress={onAction}>
            {actionText}
          </Button>
        )}
      </YStack>
    );
  }
  
  // Default: return children
  return <>{children}</>;
};
