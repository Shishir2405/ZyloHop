import {useNavigation} from '@react-navigation/native';
import React, {ReactNode} from 'react';
import {StyleSheet} from 'react-native';
import Modal from 'react-native-modal';

interface PopUpProps {
  children: ReactNode;
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  onModalHide?: () => void;
}

const PopUp: React.FC<PopUpProps> = ({
  children,
  isModalVisible,
  setIsModalVisible,
  onModalHide,
}) => {
  const navigation = useNavigation();

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

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
      onSwipeComplete={() => {
        if (!onModalHide) {
          setIsModalVisible(false);
        }
      }}
      onModalHide={() => {
        if (onModalHide) {
          onModalHide();
        }
      }}
      onBackdropPress={() => {
        if (!onModalHide) {
          setIsModalVisible(false);
        }
      }}
      style={{
        marginVertical: '50%',
      }}>
      {children}
    </Modal>
  );
};

const styles = StyleSheet.create({});

export default PopUp;
