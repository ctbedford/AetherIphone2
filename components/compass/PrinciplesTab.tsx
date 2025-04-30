import React from 'react';
import { YStack } from 'tamagui';
import { router, type Href } from 'expo-router';
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton';
import { trpc, type RouterOutputs } from '@/utils/trpc';
import { PrincipleCard } from './PrincipleCard';

type Principle = RouterOutputs['value']['getValues'][number];

export default function PrinciplesTab() {
  const { data, isLoading, error, refetch } =
    trpc.value.getValues.useQuery();

  if (isLoading) return <EmptyOrSkeleton isLoading count={3} type="card" />;

  if (error)
    return (
      <EmptyOrSkeleton
        isError
        onRetry={refetch}
        text={error.message ?? 'Failed to load principles'}
      />
    );

  if (!Array.isArray(data) || !data.length)
    return (
      <EmptyOrSkeleton
        isEmpty
        text="No principles yet"
        actionText="Add Principle"
        onAction={() => router.push('/compose?type=value' as Href)}
      />
    );

  return (
    <YStack space="$3">
      {data.map((p: Principle) => (
        <PrincipleCard
          key={p.id}
          principle={p}
          onPress={() => router.push(`/values/${p.id}` as Href)}
        />
      ))}
    </YStack>
  );
}
