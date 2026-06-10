import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import Button from '../../../../common/Button';
import CustomText from '../../../../common/CustomText';
import Header from '../../../../common/Header';
import {SVG} from '../../../../common/SvgHelper';
import {Font} from '../../../../common/Theam';
import WrapperScreen from '../../../../common/WrapperScreen';
import {AuthStackParamList} from '../../../auth';
type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'DashboardScreen'
>;

const Selfverfication = () => {
  const navigation = useNavigation<NavigationProps>();
  const [imageUri, setImageUri] = useState<string | null>(null);

  const Data = [
    {
      id: 1,
      type: true,
      row: true,
    },
    {
      id: 2,
      type: true,
      row: true,
    },
    {
      id: 3,
      type: false,
      row: true,
    },
    {
      id: 4,
      type: false,
      row: false,
    },
  ];
  const checklist = [
    {
      id: 1,
      title: 'Please upload a clear selfie.',
    },
    {
      id: 2,
      title: 'The Selfie Should have the applicants face alone.',
    },
    {
      id: 3,
      title: 'Upload PDF / JPEG/PNG.',
    },
  ];

  const openGallery = async () => {
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  return (
    <WrapperScreen>
      <View style={{padding: 20, flex: 1}}>
        {checklist.map(item => {
          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 5,
              }}>
              <SVG.CheckedIcon height={20} width={20} />
              <CustomText style={styles.checktitle}>{item.title}</CustomText>
            </View>
          );
        })}
        <TouchableOpacity
          style={styles.chooseimage}
          onPress={() => openGallery()}>
          <SVG.Uploadicon />
          <CustomText style={styles.Upload}>Upload</CustomText>
        </TouchableOpacity>
      </View>
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  Upload: {
    color: '#333333',
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
    marginTop: 15,
  },
  chooseimage: {
    backgroundColor: '#EDAE104D',
    alignItems: 'center',
    justifyContent: 'center',
    height: 130,
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#EDAE101A',
    marginVertical: 20,
  },
  checktitle: {
    fontSize: 12,
    fontFamily: Font.textSemiBolder,
    color: '#6B6B6B',
    marginLeft: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  linewith: {
    backgroundColor: '#6B6B6B',
    height: 1,
    width: 30,
  },
  indexnumtext: {
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
    color: '#FFFFFF',
  },
  indexnum: {
    height: 40,
    width: 40,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});

export default Selfverfication;
