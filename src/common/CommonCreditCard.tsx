import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ImageSourcePropType,
} from 'react-native';
import CustomText from './CustomText';
import {SVG} from './SvgHelper';
import {Font} from './Theam';

// Define types for the card object
interface CardProps {
  icon: ImageSourcePropType;
  number: string;
  expiry: string;
}

// Define props for the component
interface CommonCreditCardProps {
  card: CardProps;
  hideEdit?: boolean;
}

const CommonCreditCard: React.FC<CommonCreditCardProps> = ({
  card,
  hideEdit,
}) => (
  <View style={styles.cardContainer}>
    <Image source={card.icon} style={styles.cardIcon} />
    <View style={{flex: 1}}>
      <CustomText style={styles.cardNumber}>{card.number}</CustomText>
      <CustomText style={styles.cardExpiry}>Expires: {card.expiry}</CustomText>
    </View>
    {!hideEdit && (
      <TouchableOpacity style={styles.editButton}>
        <SVG.Edit />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9e6',
    borderWidth: 1,
    borderColor: '#ffc107',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
  },
  cardIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 15,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A5A5A',
  },
  cardExpiry: {
    fontSize: 14,
    color: '#B8B8B8',
    fontFamily: Font.textSemiBolder,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffc107',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CommonCreditCard;
