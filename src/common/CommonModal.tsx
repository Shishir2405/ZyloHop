import { useNavigation } from '@react-navigation/native';
import React, { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { SVG } from './SvgHelper';

// Define Props Type
interface CommonModalProps {
  children: ReactNode;
  modalMarginFromTop?: string | number;
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
}

const CommonModal: React.FC<CommonModalProps> = ({
  children,
  modalMarginFromTop,
  isModalVisible,
  setIsModalVisible,
}) => {
  const navigation = useNavigation();

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <View style={{ margin: 0, paddingVertical: 0 }}>
      <Modal
        isVisible={isModalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={280}
        animationOutTiming={220}
        backdropTransitionInTiming={220}
        backdropTransitionOutTiming={180}
        backdropOpacity={0.5}
        useNativeDriver
        useNativeDriverForBackdrop
        hideModalContentWhileAnimating
        onSwipeComplete={() => setIsModalVisible(false)}
        onBackdropPress={() => setIsModalVisible(false)}
        style={{
          marginTop: (modalMarginFromTop ?? '60%') as any,
          marginHorizontal: 0,
          marginBottom: 0,
          backgroundColor: 'white',
          justifyContent: 'flex-start',
          alignItems: 'center',
          borderTopRightRadius: 24,
          borderTopLeftRadius: 24,
        }} >
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            marginTop: 10,
          }}>
          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={{
                width: 134,
                height: 5,
                borderWidth: 1,
                borderColor: '#A0A0A0',
                backgroundColor: '#A0A0A0',
                borderRadius: 100,
              }}
            />
          </View>
          <TouchableOpacity onPress={() => setIsModalVisible(false)}>
            <SVG.Cross />
          </TouchableOpacity>
        </View>
        {children}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({});

export default CommonModal;
