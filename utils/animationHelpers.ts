import { Platform, UIManager, LayoutAnimation } from 'react-native';

export const enableLayoutAnimations = () => {
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
};

export const animateLayout = (duration = 250) => {
  LayoutAnimation.configureNext(
    LayoutAnimation.create(
      duration,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.opacity
    )
  );
};
