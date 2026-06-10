import React, {useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {IAddress} from '../api/types/userTypes'; // adjust the import path
import CustomText from './CustomText';

interface AddressCardProps {
  address: IAddress;
  onEdit?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  isSelected = false,
  onSelect,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onSelect) return;
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.97,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.92,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (!onSelect) return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(opacity, {
        toValue: 1,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onSelect}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.card,
          {borderColor: isSelected ? '#4CAF50' : '#ddd'},
          {transform: [{scale}], opacity},
        ]}>
        <View style={styles.header}>
          <CustomText style={styles.name}>{address.addressTitle}</CustomText>
          {isSelected && <Text style={styles.selected}>Selected</Text>}
        </View>

        <CustomText style={styles.detail}>
          Street address : {address.streetAddress}
        </CustomText>
        {address.country && (
          <CustomText style={styles.detail}>{address.country}</CustomText>
        )}
        <CustomText style={styles.detail}>
          {address.city}, {address.state} - {address.zipcode}
        </CustomText>

        <View style={styles.actions}>
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={onDelete}>
              <Text style={[styles.actionText, {color: '#e53935'}]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  selected: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  detail: {
    fontSize: 14,
    color: '#333',
    marginVertical: 2,
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  actionBtn: {
    marginLeft: 12,
  },
  deleteBtn: {
    marginLeft: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#007BFF',
    textTransform: 'capitalize',
  },
});

export default AddressCard;
