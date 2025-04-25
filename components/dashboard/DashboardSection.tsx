import React, { ReactNode } from 'react';
import { Text, YStack, XStack, Button, Anchor, H4 } from 'tamagui';
import { SkeletonRow } from '../ui/Skeleton';
import { SectionError } from '../ui/ErrorBanner';

interface DashboardSectionProps<T> {
  title: string;
  data?: T[];
  isLoading: boolean;
  emptyMessage: string;
  seeAllRoute?: string;
  renderItem: (item: T) => ReactNode;
  skeletonCount?: number;
  error?: string;
  onRetry?(): void;
}

export default function DashboardSection<T>({ 
  title, 
  data, 
  isLoading, 
  emptyMessage,
  seeAllRoute,
  renderItem,
  skeletonCount = 2,
  error,
  onRetry
}: DashboardSectionProps<T>) {
  return (
    <YStack space="$2">
      {/* @ts-ignore // TODO: Investigate Tamagui prop type issue */}
      <XStack jc="space-between" ai="center" mb="$2">
        <H4>{title}</H4>
        {data && data.length > 0 && seeAllRoute && (
          <Button 
            chromeless 
            size="$2" 
            onPress={() => {
              console.log(`Navigate to: ${seeAllRoute}`);
            }}
          >
            See All
          </Button>
        )}
      </XStack>
      
      {isLoading ? (
        <SkeletonRow count={skeletonCount} />
      ) : error ? (
        <SectionError message={error} onRetry={onRetry} />
      ) : data && data.length === 0 ? (
        <Text color="$colorSecondary" fontSize="$3">{emptyMessage}</Text>
      ) : (
        <YStack space="$3">
          {data && data.slice(0, 3).map((item: any, index) => (
            <React.Fragment key={item.id ?? index}>
              {renderItem(item)}
            </React.Fragment>
          ))}
        </YStack>
      )}
    </YStack>
  );
} 