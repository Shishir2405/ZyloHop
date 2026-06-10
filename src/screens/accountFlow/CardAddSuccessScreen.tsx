import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import Button from '../../common/Button';
import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import Heading from '../../common/Heading';
import { SVG } from '../../common/SvgHelper';
import { Font } from '../../common/Theam';
import WrapperScreen from '../../common/WrapperScreen';
import { AuthStackParamList } from '../auth';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'CardAddSuccessScreen'
>;

const CardAddSuccessScreen = () => {
  const navigation = useNavigation<NavigationProps>();

  const handleDone = () => {
    // Land back on the SavedCards list — it refetches on focus and will
    // include the newly attached card.
    navigation.navigate('AccountSaveCardsScreen');
  };

  return (
    <WrapperScreen>
      <Header showBack />
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <SVG.GreenTick />
          <Heading style={styles.heading}>Card saved</Heading>
          <CustomText style={styles.subheading}>
            Your card is ready to use for future payments.
          </CustomText>
        </View>
        <CustomText style={styles.feedbackText}>
          You can manage saved cards anytime from your Account settings.
        </CustomText>
      </View>
      <View style={styles.footer}>
        <Button
          buttonName="Done"
          btnwidth="100%"
          onPress={handleDone}
          style={styles.button}
        />
      </View>
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontFamily: Font.textSemiBolder,
    color: '#2A2A2A',
    fontSize: 20,
    marginTop: 12,
  },
  subheading: {
    textAlign: 'center',
    fontSize: 13,
    color: '#5A5A5A',
    fontFamily: Font.textSemiBolder,
    marginTop: 6,
    lineHeight: 18,
  },
  feedbackText: {
    fontFamily: Font.textNormal,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: '#5A5A5A',
    marginVertical: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  button: {
    marginVertical: 0,
  },
});

export default CardAddSuccessScreen;
