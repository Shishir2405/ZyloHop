// CommonScrollView.tsx
import React from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import {Colors} from './Theam';

interface CommonScrollViewProps extends ScrollViewProps {
  containerStyle?: ViewStyle;
  children: React.ReactNode;
}

const CommonScrollView: React.FC<CommonScrollViewProps> = ({
  containerStyle,
  children,
  contentContainerStyle,
  ...props
}) => {
  return (
    <ScrollView
      style={[styles.scrollView, containerStyle]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...props}>
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.white, // customize globally here
  },
  contentContainer: {
    paddingBottom: 20,
  },
});

export default CommonScrollView;
