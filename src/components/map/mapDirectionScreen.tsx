import React, {useState} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {SVG} from '../../common/SvgHelper';
import {GOOGLE_MAPS_APIKEY} from '../../utils/helper';

const DriverTrackingScreen = () => {
  const [region] = useState({
    latitude: 40.7128, // Example (Manhattan)
    longitude: -74.006,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const origin = {latitude: 40.7128, longitude: -74.006}; // driver location
  const destination = {latitude: 40.7306, longitude: -73.9352}; // customer location

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}>
        <Marker coordinate={origin} title="Driver" pinColor="orange" />
        <Marker coordinate={destination} title="You" pinColor="red" />

        <MapViewDirections
          origin={origin}
          destination={destination}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={4}
          strokeColor="hotpink"
        />
      </MapView>

      {/* Bottom Card */}
      <View style={styles.bottomCard}>
        <Text style={styles.eta}>ETA: 10 Minutes</Text>

        <View style={styles.driverRow}>
          <Image
            source={{uri: 'https://randomuser.me/api/portraits/men/32.jpg'}}
            style={styles.avatar}
          />
          <View style={{flex: 1}}>
            <Text style={styles.driverName}>Jim Roberts</Text>
            <Text style={styles.driverPhone}>396-472-7500</Text>
          </View>
          <TouchableOpacity style={styles.callBtn}>
            <SVG.CallIcon />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DriverTrackingScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1, height: 600},
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'black',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  eta: {color: 'white', fontSize: 14, marginBottom: 12},
  driverRow: {flexDirection: 'row', alignItems: 'center'},
  avatar: {width: 50, height: 50, borderRadius: 25, marginRight: 12},
  driverName: {color: 'white', fontSize: 16, fontWeight: '600'},
  driverPhone: {color: 'gray', fontSize: 14},
  callBtn: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 30,
  },
});
