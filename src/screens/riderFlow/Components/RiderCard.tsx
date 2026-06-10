import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { SVG } from '../../../common/SvgHelper';
import CustomText from '../../../common/CustomText';
import { Font } from '../../../common/Theam';

interface Props {
  driverName?: string;
  distance?: string;
  rating?: number;
  vehicleName?: string;
  vehicleNumber?: string;
  driverImageUrl?: string;
  vehicleImageUrl?: string;
}

const RiderCard = ({
  driverName,
  distance,
  rating,
  vehicleName,
  vehicleNumber,
  driverImageUrl,
  vehicleImageUrl,
}: Props) => {
  return (
    <View style={styles.card}>
      <View style={styles.profileInfo}>
        <Image
          source={
            driverImageUrl
              ? { uri: driverImageUrl }
              : require('../../../assets/image/other/ProfileImg.png')
          }
          style={styles.profileImage}
        />
        <View>
          <CustomText style={styles.name}>
            {driverName || 'Finding driver...'}
          </CustomText>
          <CustomText style={styles.location}>
            <SVG.MarkerDark /> {distance || 'Calculating...'}
          </CustomText>
          {(() => {
            // rating may arrive as a number, a numeric string, or null —
            // .toFixed on a string throws and unmounts the modal.
            const n = typeof rating === 'number' ? rating : Number(rating);
            if (!Number.isFinite(n)) return null;
            return (
              <CustomText style={styles.rating}>
                <SVG.SingleStar /> {n.toFixed(1)}
              </CustomText>
            );
          })()}
          {vehicleName && (
            <CustomText style={styles.vehicleInfo}>
              {vehicleName} {vehicleNumber ? `(${vehicleNumber})` : ''}
            </CustomText>
          )}
        </View>
      </View>
      <Image
        source={
          vehicleImageUrl
            ? { uri: vehicleImageUrl }
            : require('../../../assets/image/other/Car3.png')
        }
        style={styles.carImage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 5,
  },
  profileInfo: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 54, height: 59, marginRight: 10 },
  name: {
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
    marginBottom: 2,
    color: '#2A2A2A',
  },
  location: { fontSize: 14, color: 'gray' },
  rating: { fontSize: 14, color: 'gray' },
  vehicleInfo: { fontSize: 12, color: '#999', marginTop: 2 },
  carImage: { width: 93, height: 54, resizeMode: 'contain' },
});

export default RiderCard;
