import React, { ReactNode } from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle, ImageStyle, ImageSourcePropType, View, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text, YStack, StackProps } from 'tamagui';
import { useSkeleton, SkeletonOptions } from '@/hooks/useSkeleton';

export interface EmptyStateProps {
  /** Title text for the empty state */
  title?: string;
  /** Subtitle/description text for the empty state */
  message?: string;
  /** Optional image/illustration to display */
  image?: ImageSourcePropType;
  /** Optional custom component to render instead of default empty state */
  customEmptyComponent?: ReactNode;
  /** Style for the container */
  containerStyle?: StyleProp<ViewStyle>;
  /** Style for the title */
  titleStyle?: StyleProp<TextStyle>;
  /** Style for the message */
  messageStyle?: StyleProp<TextStyle>;
  /** Style for the image container */
  imageContainerStyle?: StyleProp<ViewStyle>;
  /** Style for the image */
  imageStyle?: StyleProp<ImageStyle>;
}

export interface EmptyOrSkeletonProps extends EmptyStateProps, StackProps {
  /** Whether data is loading */
  isLoading: boolean;
  /** Children to display when not loading and not empty */
  children: ReactNode;
  /** Whether the content is empty (no data) */
  isEmpty?: boolean;
  /** Number of skeleton placeholders to display when loading */
  skeletonCount?: number;
  /** Height of each skeleton item */
  skeletonHeight?: number;
  /** Width of each skeleton item (default: 100%) */
  skeletonWidth?: number | string;
  /** Gap between skeleton items */
  skeletonGap?: number;
  /** Border radius for skeleton items */
  skeletonBorderRadius?: number;
  /** Custom skeleton component */
  customSkeletonComponent?: ReactNode;
  /** Options for the skeleton animation */
  skeletonOptions?: SkeletonOptions;
}

/**
 * Placeholder component for the skeleton loading state
 */
const SkeletonPlaceholder = ({
  height, 
  width = '100%',
  borderRadius = 8,
  options
}: {
  height: number;
  width?: number | string;
  borderRadius?: number;
  options?: SkeletonOptions;
}) => {
  const { shimmerStyle, styles } = useSkeleton(options);
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          height,
          width: typeof width === 'string' ? width : width,
          borderRadius
        } as ViewStyle
      ]}
    >
      <Animated.View style={[styles.shimmer, shimmerStyle]} />
    </Animated.View>
  );
};

/**
 * Default empty state component
 */
const EmptyState = ({
  title = 'No data found',
  message = 'There is nothing to display at the moment.',
  image,
  containerStyle,
  titleStyle,
  messageStyle,
  imageContainerStyle,
  imageStyle
}: EmptyStateProps) => {
  return (
    <YStack
      alignItems="center"
      justifyContent="center"
      padding="$4"
      space="$3"
      style={containerStyle}
    >
      {image && (
        <View style={[styles.imageContainer, imageContainerStyle]}>
          <Image source={image} style={[styles.image, imageStyle]} />
        </View>
      )}
      <Text 
        fontSize="$6" 
        fontWeight="bold" 
        textAlign="center"
        style={titleStyle}
      >
        {title}
      </Text>
      <Text 
        fontSize="$4" 
        color="$gray10" 
        textAlign="center"
        style={messageStyle}
      >
        {message}
      </Text>
    </YStack>
  );
};

/**
 * A component that conditionally renders skeleton, empty state, or content
 * based on loading and data states.
 */
export default function EmptyOrSkeleton({
  isLoading,
  isEmpty = false,
  children,
  skeletonCount = 3,
  skeletonHeight = 80,
  skeletonWidth = '100%',
  skeletonGap = 12,
  skeletonBorderRadius = 8,
  customSkeletonComponent,
  customEmptyComponent,
  skeletonOptions,
  title,
  message,
  image,
  containerStyle,
  titleStyle,
  messageStyle,
  imageContainerStyle,
  imageStyle,
  ...stackProps
}: EmptyOrSkeletonProps) {
  // If loading, show skeleton
  if (isLoading) {
    if (customSkeletonComponent) {
      return <>{customSkeletonComponent}</>;
    }
    
    return (
      <YStack space={skeletonGap} width="100%" {...stackProps}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <SkeletonPlaceholder
            key={`skeleton-${index}`}
            height={skeletonHeight}
            width={skeletonWidth}
            borderRadius={skeletonBorderRadius}
            options={skeletonOptions}
          />
        ))}
      </YStack>
    );
  }
  
  // If empty, show empty state
  if (isEmpty) {
    if (customEmptyComponent) {
      return <>{customEmptyComponent}</>;
    }
    
    return (
      <EmptyState
        title={title}
        message={message}
        image={image}
        containerStyle={containerStyle}
        titleStyle={titleStyle}
        messageStyle={messageStyle}
        imageContainerStyle={imageContainerStyle}
        imageStyle={imageStyle}
      />
    );
  }
  
  // Otherwise, show children
  return <>{children}</>;
}

const styles = StyleSheet.create({
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
}); 