import React from 'react';
import { DimensionValue } from 'react-native';
import { YStack, XStack, styled, Stack } from 'tamagui';
import { useColorScheme } from '@/hooks/useColorScheme';

const SkeletonBase = styled(Stack, {
  name: 'SkeletonBase',
  backgroundColor: '$gray5',
  overflow: 'hidden',
  position: 'relative',
  variants: {
    colorMode: {
      light: { backgroundColor: '$gray5' },
      dark: { backgroundColor: '$gray9' },
    },
  } as const,
});

const SkeletonShimmer = styled(Stack, {
  name: 'SkeletonShimmer',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  opacity: 0.5,
});

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4 }: SkeletonProps) {
  const colorScheme = useColorScheme();
  
  return (
    <SkeletonBase
      colorMode={colorScheme === 'dark' ? 'dark' : 'light'}
      width={width}
      height={height}
      borderRadius={borderRadius}
    />
  );
}

interface SkeletonRowProps {
  height?: DimensionValue;
  width?: DimensionValue;
  lines?: number;
  spacing?: number;
}

export function SkeletonRow({ height = 20, width = '100%', lines = 3, spacing = 10 }: SkeletonRowProps) {
  return (
    <YStack space={spacing}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i}
          height={height}
          width={i === lines - 1 && typeof width === 'string' ? '70%' : width}
        />
      ))}
    </YStack>
  );
}

interface SkeletonCardProps {
  height?: DimensionValue;
  width?: DimensionValue;
}

export function SkeletonCard({ height = 100, width = '100%' }: SkeletonCardProps) {
  return (
    <YStack space="$2">
      <Skeleton height={height} width={width} borderRadius={8} />
    </YStack>
  );
}

interface SkeletonAvatarProps {
  size?: number;
}

export function SkeletonAvatar({ size = 40 }: SkeletonAvatarProps) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}

interface SkeletonProfileProps {
  avatarSize?: number;
}

export function SkeletonProfile({ avatarSize = 40 }: SkeletonProfileProps) {
  return (
    <XStack space="$3" alignItems="center">
      <SkeletonAvatar size={avatarSize} />
      <YStack space="$1" flex={1}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} />
      </YStack>
    </XStack>
  );
}

interface SkeletonCircleProps {
  size?: number;
}

export function SkeletonCircle({ size = 60 }: SkeletonCircleProps) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}
