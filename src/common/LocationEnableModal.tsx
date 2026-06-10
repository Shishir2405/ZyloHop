import React from 'react';
import {StyleSheet, View} from 'react-native';
import Modal from 'react-native-modal';
import Button from './Button';
import {useNavigation} from '@react-navigation/native';
import CustomText from './CustomText';
import {Font} from './Theam';
import {SVG} from './SvgHelper';
import Header from './Heading';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_APIKEY } from '../utils/helper';
import { useDispatch, useSelector } from 'react-redux';
import { storeUserDetails } from '../Redux/Reducer/UserinfoReducer';
import { UserType } from '../api/types/userTypes';

// Define Navigation Stack Type (Modify according to your navigation setup)
type RootStackParamList = {
  SignUpScreen: undefined;
};

// Define Props for the Modal Component
interface LocationEnableModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
}

const LocationEnableModal: React.FC<LocationEnableModalProps> = ({
  isModalVisible,
  setIsModalVisible,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const userState: UserType = useSelector((state: any) => state?.Userinfo?.user);

  return (
    <Modal
      isVisible={isModalVisible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={260}
      animationOutTiming={180}
      backdropTransitionInTiming={220}
      backdropTransitionOutTiming={180}
      backdropOpacity={0.5}
      useNativeDriver
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      style={styles.modalStyle}>
      <View style={styles.modalContainer}>
        <SVG.LocationIcon />
        <View style={styles.textContainer}>
          <Header>Enable your location</Header>
          <CustomText style={styles.descriptionText}>
            Choose your location to start finding requests around you
          </CustomText>
        </View>
        <Button
          buttonName="Use my location"
          btnwidth="90%"
          onPress={async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              console.warn('Location permission denied');
              setIsModalVisible(false);
              navigation.navigate('SignUpScreen');
              return;
            }
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const { latitude, longitude } = pos.coords;

            try {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY}`
              );
              const data = await response.json();

              if (data.results && data.results.length > 0) {
                const addressComponents = data.results[0].address_components || [];

                let cityFullName = '', stateFullName = '', countryFullName = '', postal_code = '';

                addressComponents.forEach((component: any) => {
                  const types = component.types || [];
                  if (types.includes('locality')) {
                    cityFullName = component.long_name;
                  } else if (types.includes('administrative_area_level_1')) {
                    stateFullName = component.long_name;
                  } else if (types.includes('country')) {
                    countryFullName = component.long_name;
                  } else if (types.includes('postal_code')) {
                    postal_code = component.long_name;
                  }
                });

                const streetAddress = data.results[0].formatted_address || cityFullName || '';

                const address = {
                  streetAddress: streetAddress,
                  city: cityFullName,
                  state: stateFullName,
                  zipcode: postal_code,
                  country: countryFullName,
                  addressLink: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
                };

                dispatch(storeUserDetails({ ...userState, address: address }));
              }
            } catch (error) {
              if (__DEV__) console.log('Geocoding Error: ', error);
            } finally {
              setIsModalVisible(false);
              navigation.navigate('SignUpScreen');
            }
          }}
          style={styles.button}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalStyle: {
    marginVertical: '50%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 30,
    borderRadius: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: Font.textBolder,
    color: '#A0A0A0',
    textAlign: 'center',
    marginTop: 5,
  },
  button: {
    marginTop: 20,
  },
});

export default LocationEnableModal;
