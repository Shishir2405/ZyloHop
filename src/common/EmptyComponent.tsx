import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import CustomText from './CustomText';
import {Font} from './Theam';

const EmptyComponent = ({text}: any) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}>
      {/* <Image
        source={require('../assets/images/EmptyCommon.png')}
        style={{width: 300, height: 300}}
      /> */}
      <CustomText
        style={{fontSize: 20, fontFamily: Font.textLight, textAlign: 'center'}}>
        {text || 'No data found!!!'}
      </CustomText>
    </View>
  );
};

const styles = StyleSheet.create({});

export default EmptyComponent;
