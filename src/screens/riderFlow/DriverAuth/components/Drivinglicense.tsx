import React, {useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Modal from 'react-native-modal';
import Button from '../../../../common/Button';
import CustomText from '../../../../common/CustomText';
import {SVG} from '../../../../common/SvgHelper';
import {Font} from '../../../../common/Theam';
import WrapperScreen from '../../../../common/WrapperScreen';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../../auth';
import {ImageType} from '../../../../api/types/authTypes';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'DashboardScreen'
>;

const Drivinglicense = ({
  setImage,
  image,
}: {
  setImage: (image: ImageType | null) => void;
  image: ImageType | null;
}) => {
  const navigation = useNavigation<NavigationProps>();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const checklist = [
    {
      id: 1,
      title: 'Photocopies and printouts of documents will not be accepted.',
    },
    {
      id: 2,
      title: 'The photo and all details must be clearly visible.',
    },
    {
      id: 3,
      title:
        'Only documents less than 10 MB in JPG, JPEG, PNG, or PDF format will be accepted.',
    },
  ];

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const selectedImage: ImageType = {
        name: asset.fileName || 'profileImage',
        uri: asset.uri,
        path: asset.uri,
        type: asset.mimeType || 'image/jpeg',
      };
      setImage(selectedImage);
    } catch (err) {
      console.log('Image Picker Cancelled');
    }
  };

  const handleSubmit = () => {
    if (!image) {
      Alert.alert('Upload Required', 'Please upload your Driving License.');
      return;
    }
    setIsModalVisible(true);
  };

  return (
    <WrapperScreen>
      <View style={styles.container}>
        {/* Checklist */}
        {checklist.map(item => (
          <View key={item.id} style={styles.checkItem}>
            <SVG.CheckedIcon height={20} width={20} />
            <CustomText style={styles.checkText}>{item.title}</CustomText>
          </View>
        ))}

        {/* Upload Section */}
        {image ? (
          <View style={styles.previewContainer}>
            <Image
              source={{uri: image.uri}}
              style={styles.previewImage}
              resizeMode="cover"
            />

            <TouchableOpacity
              style={styles.removeButton}
              activeOpacity={0.7}
              onPress={() => setImage(null)}>
              <SVG.Cross width={14} height={14} />
            </TouchableOpacity>

            <View style={styles.overlayLabel}>
              <CustomText style={styles.previewLabel}>
                Uploaded Driving License
              </CustomText>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadBox}
            activeOpacity={0.8}
            onPress={handleImagePicker}>
            <SVG.Uploadicon />
            <CustomText style={styles.uploadText}>
              Attach Driving License
            </CustomText>
          </TouchableOpacity>
        )}

        {/* Success Modal */}
        <Modal
          isVisible={isModalVisible}
          onBackButtonPress={() => setIsModalVisible(false)}
          onBackdropPress={() => setIsModalVisible(false)}
          style={{marginVertical: '50%'}}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={{alignSelf: 'flex-end', padding: 5}}
              onPress={() => setIsModalVisible(false)}>
              <SVG.Cross />
            </TouchableOpacity>

            <View style={{alignItems: 'center', marginVertical: 10}}>
              <SVG.GreenTick />
            </View>

            <CustomText style={styles.modalTitle}>Congratulations</CustomText>
            <CustomText style={styles.modalText}>
              Your account is ready to use. Expect to be contacted by Xylo
              customer within 24 hours.
            </CustomText>
            <CustomText style={styles.modalHighlight}>
              Verification process takes 24 hours.
            </CustomText>
          </View>
        </Modal>
      </View>
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkText: {
    fontSize: 12,
    fontFamily: Font.textSemiBolder,
    color: '#6B6B6B',
    marginLeft: 10,
    flex: 1,
  },
  uploadBox: {
    backgroundColor: '#EDAE104D',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#EDAE101A',
    marginVertical: 20,
  },
  uploadText: {
    color: '#333333',
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
    marginTop: 15,
  },
  previewContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 1},
  },
  overlayLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 5,
    alignItems: 'center',
  },
  previewLabel: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Font.textSemiBolder,
  },
  modalBox: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 25,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: Font.textBolder,
    color: '#2A2A2A',
    marginTop: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    fontFamily: Font.textBolder,
    color: '#A0A0A0',
    textAlign: 'center',
    marginVertical: 5,
  },
  modalHighlight: {
    fontSize: 14,
    fontFamily: Font.textBolder,
    color: '#EDAE10',
    textAlign: 'center',
  },
});

export default Drivinglicense;
