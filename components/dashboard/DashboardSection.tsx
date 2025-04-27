import React, { ReactNode } from 'react';
import { Text, YStack, XStack, Button, Anchor, H4 } from 'tamagui';
import { router } from 'expo-router';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { SectionError } from '@/components/ui/ErrorBanner';

interface DashboardSectionProps<T> {
  title: string;
  data?: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  seeAllRoute?: string;
  renderItem?: (item: T) => ReactNode;
  skeletonCount?: number;
  error?: string;
  onRetry?(): void;
  children?: ReactNode;
  onSeeAll?(): void;
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
  onRetry,
  children,
  onSeeAll
}: DashboardSectionProps<T>) {
  return (
    <YStack space="$2">
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
        <H4>{title}</H4>
        {((data && data.length > 0 && seeAllRoute) || onSeeAll) && (
          <Button 
            chromeless 
            size="$2" 
            onPress={() => {
              if (onSeeAll) {
                onSeeAll();
              } else if (seeAllRoute) {
                // Navigate to route using type assertions
                // Safe because the route will be a tab/screen name within the app
                router.push(seeAllRoute as any);
              }
            }}
          >
            See All
          </Button>
        )}
      </XStack>
      
      {/* If children are provided, render them */}
      {children ? (
        children
      ) : isLoading ? (
        <SkeletonRow lines={skeletonCount} />
      ) : error ? (
        <SectionError message={error ? String(error) : 'An error occurred'} onRetry={onRetry} />
      ) : data && data.length === 0 ? (
        <YStack ai="center" p="$4">
          <Text color="$gray10">{emptyMessage ?? 'No items found'}</Text>
        </YStack>
      ) : (
        data && renderItem && data.map(renderItem)
      )}
    </YStack>
  );
} 