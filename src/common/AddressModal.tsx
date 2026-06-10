import React, {useEffect, useState} from 'react';
import {Button, StyleSheet, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modal';
import {IAddress} from '../api/types/userTypes';
import CustomText from './CustomText';
import Input from './Input';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (address: IAddress) => void;
  initialData?: IAddress;
}

const AddressModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  initialData,
}) => {
  const [openLocationModal, setopenLocationModal] = React.useState(true);
  const [form, setForm] = useState<IAddress>({
    addressTitle: '',
    streetAddress: '',
    country: '',
    state: '',
    city: '',
    zipcode: '',
  });
  const [locationDetails, setLocationDetails] = useState({
    longitude: '',
    latitude: '',
    state: '',
    stateFullName: '',
    country: '',
    countryFullName: '',
    city: '',
    cityFullName: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof IAddress, value: string) => {
    setForm({...form, [field]: value});
  };

  return (
    <>
      <Modal
        isVisible={visible}
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
        onBackdropPress={onClose}>
        <View style={styles.modalBackground}>
          <View style={styles.container}>
            <CustomText style={styles.title}>
              {initialData ? 'Edit Address' : 'Add Address'}
            </CustomText>
            <TouchableOpacity
              onPress={() => setopenLocationModal(true)}
              style={{
                backgroundColor: '#e6f7ff',
                padding: 12,
                borderRadius: 8,
                marginVertical: 10,
              }}>
              <CustomText style={{fontSize: 16, color: '#007aff'}}>
                📍 Tap to fill address using map
              </CustomText>
            </TouchableOpacity>

            <Input
              style={styles.input}
              placeholder="Title"
              value={form.addressTitle}
              onChangeText={text => handleChange('addressTitle', text)}
            />
            <Input
              style={styles.input}
              placeholder="Street Address"
              value={form.streetAddress}
              onChangeText={text => handleChange('streetAddress', text)}
            />
            <Input
              style={styles.input}
              placeholder="City"
              value={form.city}
              onChangeText={text => handleChange('city', text)}
            />
            <Input
              style={styles.input}
              placeholder="State"
              value={form.state}
              onChangeText={text => handleChange('state', text)}
            />
            <Input
              style={styles.input}
              placeholder="Country"
              value={form.country}
              onChangeText={text => handleChange('country', text)}
            />
            <Input
              style={styles.input}
              placeholder="ZIP / Postal code"
              value={form.zipcode}
              onChangeText={text => handleChange('zipcode', text)}
            />

            <View style={styles.buttonRow}>
              <Button title="Cancel" onPress={onClose} />
              <Button title="Save" onPress={() => onSave(form)} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '600',
  },
});

export default AddressModal;
