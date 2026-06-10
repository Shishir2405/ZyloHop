import React, {useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Platform,
} from 'react-native';
import Button from '../../../../common/Button';
import CustomText from '../../../../common/CustomText';
import {SVG} from '../../../../common/SvgHelper';
import {Font} from '../../../../common/Theam';
import WrapperScreen from '../../../../common/WrapperScreen';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../../auth';
import {ImageType} from '../../../../api/types/authTypes';
import * as ImagePicker from 'expo-image-picker';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'DashboardScreen'
>;

const Governmentid = ({
  setImage,
  image,
}: {
  setImage: (image: ImageType | null) => void;
  image: ImageType | null;
}) => {
  const navigation = useNavigation<NavigationProps>();

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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: Platform.OS === 'ios' ? 0.8 : 1,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setImage({
      name: asset.fileName || 'profileImage',
      uri: asset.uri,
      path: asset.uri,
      type: asset.mimeType || 'image/jpeg',
    });
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
        <TouchableOpacity
          style={styles.uploadBox}
          activeOpacity={0.8}
          onPress={handleImagePicker}>
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
                <CustomText style={styles.previewLabel}>Uploaded ID</CustomText>
              </View>
            </View>
          ) : (
            <>
              <SVG.Uploadicon />
              <CustomText style={styles.uploadText}>
                Attach Government ID
              </CustomText>
            </>
          )}
        </TouchableOpacity>
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
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  previewContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    marginVertical: 10,
    elevation: 3, // for Android shadow
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 5,
    alignItems: 'center',
  },
  previewLabel: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Font.textSemiBolder,
  },
});

export default Governmentid;
