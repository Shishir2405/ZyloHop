import React, {ReactNode} from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

// Define Props Interface
interface WrapperScreenProps {
  children: ReactNode;
}

const WrapperScreen: React.FC<WrapperScreenProps> = ({children}) => {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default WrapperScreen;
