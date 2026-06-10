import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
  'DashboardScreen'
>;
type PaymentsuccessRouteProp = RouteProp<AuthStackParamList, 'Paymentsuccess'>;

const Paymentsuccess = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<PaymentsuccessRouteProp>();
  const orderId = route.params?.orderId;
  const [isModalVisible, setisModalVisible] = useState(false);

  return (
    <WrapperScreen>
      <Header showBack />
      <View style={styles.container}>
        <View style={styles.header}>
          <SVG.GreenTick />
          <Heading style={styles.heading}>Payment Success</Heading>
          <CustomText style={styles.subheading}>
            Your order being prepared
          </CustomText>
        </View>
        <SVG.DottedLine style={styles.dottedLine} />
        <CustomText style={styles.feedbackText}>
          Yum!{'\n'}
          Your order is in the works.
        </CustomText>
        <CustomText style={styles.feedbackDescription}>
          We'll keep you updated every step of the way so you know exactly when
          to expect your meal.
        </CustomText>
      </View>
      <View style={{ marginHorizontal: 15 }}>
        {orderId ? (
          <Button
            buttonName={'Track your order'}
            bgcolor={'#FFFFFF'}
            btncolor={'#EDAE10'}
            bordercolor={'#10101020'}
            btnborder={1}
            onPress={() => navigation.navigate('TrackOrder', { orderId })}
          />
        ) : null}
        <Button
          buttonName="Back to home"
          btnwidth="100%"
          style={styles.feedbackButton}
          onPress={() =>
            navigation.reset({ index: 0, routes: [{ name: 'DashboardScreen' }] })
          }
        />
      </View>
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // height: '80%',
    flex: 1,
  },
  header: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontFamily: Font.textSemiBolder,
    color: '#2A2A2A',
    fontSize: 20,
  },
  modalHeading: {
    fontSize: 20,
    fontFamily: Font.textSemiBolder,
    marginVertical: 10,
  },
  modalContent: {
    marginHorizontal: 10,
    paddingHorizontal: 20,
  },
  subheading: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: Font.textSemiBolder,
  },
  dottedLine: {
    width: '100%',
    marginVertical: 20,
  },
  feedbackText: {
    fontFamily: Font.textSemiBolder,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
    color: '#5A5A5A',
    marginVertical: 20,
  },
  feedbackDescription: {
    fontFamily: Font.textSemiBolder,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    textAlign: 'center',
  },
  feedbackButton: {
    marginVertical: 20,
  },
});

export default Paymentsuccess;
