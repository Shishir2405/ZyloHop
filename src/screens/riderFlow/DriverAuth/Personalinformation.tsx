import React, { useState } from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Modal from 'react-native-modal';

import Button from '../../../common/Button';
import CustomText from '../../../common/CustomText';
import Header from '../../../common/Header';
import Input from '../../../common/Input';
import { SVG } from '../../../common/SvgHelper';
import { Colors, Font } from '../../../common/Theam';
import WrapperScreen from '../../../common/WrapperScreen';
import Selfverfication from './components/Selfverification';
import Governmentid from './components/Governmentid';
import Drivinglicense from './components/Drivinglicense';
import { useDispatch, useSelector } from 'react-redux';
import { storeUserDetails } from '../../../Redux/Reducer/UserinfoReducer';
import { IAddress, UserType } from '../../../api/types/userTypes';
import * as ImagePicker from 'expo-image-picker';
import LocationScreen from '../../../common/LocationScreen';
import { ImageType } from '../../../api/types/authTypes';
import {
  errorToast,
  infoToast,
  successToast,
} from '../../../components/toasts';
import { riderSignUpApi } from '../../../api/riderApis';
import { RiderSignUpFormPayload } from '../../../api/types/riderTypes';
import { extractErrorMessage } from '../../../utils/helper';
import {
  getSignupDraft,
  clearSignupDraft,
} from '../../../services/signupDraft';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../auth';
import { StackNavigationProp } from '@react-navigation/stack';

const steps = [
  { id: 1, title: 'Personal Info' },
  // {id: 2, title: 'Self Verification'},
  { id: 2, title: 'Government ID' },
  { id: 3, title: 'Driving License' },
];
type NavigationProps = any;

const Personalinformation = () => {
  const dispatch = useDispatch();
  const userState: UserType = useSelector(
    (state: any) => state?.Userinfo?.user,
  );
  const navigation = useNavigation<NavigationProps>();
  const [activeStep, setActiveStep] = useState(1);
  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [profileImg, setProfileImg] = useState<ImageType | null>(null);
  const [documentImg, setDocumentImg] = useState<ImageType | null>(null);
  const [drivingLicense, setDrivingLicenseImg] = useState<ImageType | null>(
    null,
  );
  const [govtIdExpiry, setGovtIdExpiry] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: Platform.OS === 'ios' ? 0.8 : 1,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setProfileImg({
      name: asset.fileName || 'profileImage',
      uri: asset.uri,
      path: asset.uri,
      type: asset.mimeType || 'image/jpeg',
    });
  };

  const nextStep = () => {
    if (activeStep === steps.length) {
      handleRiderRegistration();
    }
    if (activeStep < steps.length) setActiveStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (activeStep > 1) setActiveStep(prev => prev - 1);
  };

  const renderStepper = () => (
    <View style={styles.stepperContainer}>
      {steps.map((item, index) => {
        const isActive = activeStep >= item.id;
        return (
          <View key={item.id} style={styles.stepWrapper}>
            <View
              style={[
                styles.stepCircle,
                { backgroundColor: isActive ? '#EDAE10' : '#D9D9D9' },
              ]}
            >
              <CustomText style={styles.stepText}>{item.id}</CustomText>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  {
                    backgroundColor:
                      activeStep > item.id ? '#EDAE10' : '#D9D9D9',
                  },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Profile Picture */}
            <TouchableOpacity
              onPress={handleImagePicker}
              style={styles.profileContainer}
            >
              <View style={styles.profilePicture}>
                <Image
                  source={
                    profileImg?.path
                      ? { uri: profileImg.path }
                      : require('../../../assets/image/other/DefaultImage.jpg')
                  }
                  style={styles.profilePicture}
                />
                <SVG.CameraIcon style={styles.cameraIcon} />
              </View>
            </TouchableOpacity>

            {/* User Info */}
            <Input
              placeholder="First Name"
              value={userState?.firstName}
              editable={false}
            />
            <Input
              placeholder="Last Name"
              value={userState?.lastName}
              editable={false}
            />
            <Input
              placeholder="Phone Number"
              value={userState?.phoneNumber}
              editable={false}
            />
            <Input
              placeholder="Email"
              value={userState?.email}
              editable={false}
            />

            {/* Address Section */}
            <TouchableOpacity
              onPress={() => setOpenLocationModal(true)}
              style={styles.locationButton}
            >
              <CustomText style={styles.locationText}>
                📍 Tap to fill address using map
              </CustomText>
            </TouchableOpacity>

            <Input
              placeholder="Street"
              value={userState?.address?.streetAddress}
              editable={false}
            />
            <Input
              placeholder="City"
              value={userState?.address?.city}
              editable={false}
            />
            <Input
              placeholder="State"
              value={userState?.address?.state}
              editable={false}
            />
            <Input
              placeholder="Country"
              value={userState?.address?.country}
              editable={false}
            />
            <Input
              placeholder="Zip Code"
              value={userState?.address?.zipcode}
              editable={false}
            />

            {/* Buttons */}
            {/* <View style={styles.buttonContainer}>
          <Button
            buttonName="Cancel"
            btnwidth="45%"
            bgcolor="white"
            btncolor="#EDAE10"
            btnborder={1}
            bordercolor="#EDAE10"
            onPress={() => navigation.navigate('SignInScreen')}
          />
          <Button
            loader={loading}
            buttonName="Save"
            btnwidth="45%"
            onPress={handleSignUp}
          />
        </View> */}
          </ScrollView>
        );
      // case 2:
      //   return <Selfverfication />;
      case 2:
        return (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Governmentid image={documentImg} setImage={setDocumentImg} />
            <Input
              placeholder="Expiry Date (YYYY-MM-DD)"
              keyboardType="default"
              maxLength={10}
              value={govtIdExpiry}
              onChangeText={setGovtIdExpiry}
            />
          </ScrollView>
        );
      case 3:
        return (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Drivinglicense
              image={drivingLicense}
              setImage={setDrivingLicenseImg}
            />
            <Input
              placeholder="Expiry Date (YYYY-MM-DD)"
              keyboardType="default"
              maxLength={10}
              value={licenseExpiry}
              onChangeText={setLicenseExpiry}
            />
          </ScrollView>
        );
      default:
        return null;
    }
  };

  const validateSignUp = (
    user: UserType,
    profileImg: ImageType | null,
    documerntImg: ImageType | null,
    drivingLicense: ImageType | null,
    password: string,
  ) => {
    if (!profileImg) return 'Profile image is required';
    if (!documerntImg) return 'documerntImg image is required';
    if (!drivingLicense) return 'drivingLicense image is required';
    if (!user?.firstName?.trim()) return 'First name is required';
    if (!user?.email?.trim()) return 'Email is required';
    if (!password?.trim()) return 'Password is required';
    if (!user?.phoneNumber?.trim()) return 'Phone number is required';

    const address = user?.address || {};
    const requiredFields: (keyof IAddress)[] = [
      'streetAddress',
      'city',
      'state',
      'zipcode',
      'country',
      'addressLink',
    ];

    for (const field of requiredFields) {
      const value = address[field];
      if (!value?.trim()) {
        return `${field.replace(/([A-Z])/g, ' $1')} is required`;
      }
    }

    return null;
  };
  const handleRiderRegistration = async () => {
    try {
      const draft = getSignupDraft();
      const password = draft.password ?? '';

      const errorMsg = validateSignUp(
        userState,
        profileImg,
        documentImg,
        drivingLicense,
        password,
      );
      if (errorMsg) return infoToast(errorMsg);

      let payload: RiderSignUpFormPayload = {
        firstName: userState.firstName,
        lastName: userState.lastName || '',
        email: userState.email,
        userName: `${userState.firstName}${userState.lastName}${userState.phoneNumber}`,
        password,
        phoneNumber: userState.phoneNumber || '',
        address: {
          streetAddress: userState.address?.streetAddress || '',
          city: userState.address?.city || '',
          state: userState.address?.state || '',
          zipcode: userState.address?.zipcode || '',
          country: userState.address?.country || '',
          addressLink: userState.address?.addressLink || '',
          addressTitle: userState.address?.addressTitle || 'Rider address',
        },
        documentExpiryDate: govtIdExpiry ? `${govtIdExpiry}T00:00:00Z` : '',
        profilePicture: profileImg,
        drivingLicense: drivingLicense,
        documents: documentImg,
      };
      setLoading(true);

      const response = await riderSignUpApi(payload);

      if (response?.remote === 'success') {
        clearSignupDraft();
        successToast(response.data.data);
        navigation.navigate('DriverHomeScreen');
      } else {
        errorToast(extractErrorMessage(response));
      }
    } catch {
      errorToast('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WrapperScreen>
      <Header showBack title="Personal information" rightWidget={true} />
      {renderStepper()}
      {renderStepContent()}

      <View style={styles.btnContainer}>
        {activeStep > 1 && (
          <Button
            buttonName="Back"
            btnwidth={'48%'}
            onPress={prevStep}
            bgcolor={'#C4C4C4'}
          />
        )}
        <Button
          buttonName={activeStep === steps.length ? 'Finish' : 'Next'}
          btnwidth={activeStep > 1 ? '48%' : '100%'}
          onPress={nextStep}
        />
      </View>
      {/* Location Modal */}
      <Modal
        isVisible={openLocationModal}
        animationIn="zoomIn"
        animationOut="zoomOut"
        style={{ marginTop: 0 }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <LocationScreen
            fieldName={'location'}
            setopenLocationModal={setOpenLocationModal}
            setLocationDetails={(details: any) => {
              const updatedAddress = {
                ...userState?.address,
                ...details,
              };
              dispatch(
                storeUserDetails({
                  ...userState,
                  address: updatedAddress,
                }),
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButton: {
    backgroundColor: '#e6f7ff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  locationText: {
    fontSize: 16,
    color: '#007aff',
  },
  stepCircle: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
  },
  stepLine: {
    width: 35,
    height: 2,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D0D0D0',
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default Personalinformation;
