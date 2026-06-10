/* eslint-disable prettier/prettier */
import React, {useEffect, useRef, useState} from 'react';
import {View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native';
import MapView, {Marker, Region, LatLng} from 'react-native-maps';

import {MapTheme, MAP_THEMES, getMapStyle} from '../../utils/mapStyles';
import MapViewDirections from 'react-native-maps-directions';

import * as Location from 'expo-location';

import {GOOGLE_MAPS_APIKEY} from '../../utils/helper';
import {Colors} from '../../common/Theam';
import CustomText from '../../common/CustomText';

interface RouteInfo {
  distance: number;
  duration: number;
}
type DirectionsResult = {
  distance: number;
  duration: number;
  coordinates: {latitude: number; longitude: number}[];
};

interface GeoCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

interface GeoPosition {
  coords: GeoCoords;
  timestamp: number;
}

interface GeoWatchOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number;
  interval?: number;
}

const MapScreen: React.FC = () => {
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [info, setInfo] = useState<RouteInfo>({distance: 0, duration: 0});
  const [mapTheme, setMapTheme] = useState<MapTheme>('standard');

  // Replace with your real pickup and drop points
  const source: LatLng = {latitude: 37.771707, longitude: -122.4053769};
  const destination: LatLng = {latitude: 37.7987, longitude: -122.48329};

  // Watch and update rider's current location
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
        return;
      }
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        pos => {
          setCurrentLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
      );
    })();

    return () => { subscription?.remove(); };
  }, []);

  // Animate map to rider’s position
  useEffect(() => {
    if (currentLocation && mapRef.current) {
      const region: Region = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      mapRef.current.animateToRegion(region);
    }
  }, [currentLocation]);

  if (!currentLocation) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.default} />
        <Text style={{marginTop: 10, color: Colors.default}}>
          Fetching your location...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider="google"
        style={styles.map}
        customMapStyle={getMapStyle(mapTheme)}
        showsUserLocation
        followsUserLocation
        loadingEnabled
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}>
        {/* Rider Marker */}
        {/* <Marker coordinate={currentLocation} title="You" />
         */}
        {currentLocation.latitude && currentLocation.longitude && (
          <Marker coordinate={currentLocation} title="Rider">
            <Image
              source={require('../../assets/image/other/Car.png')} // add your bike image here
              style={{width: 60, height: 60}}
              resizeMode="contain"
            />
          </Marker>
        )}

        {/* Source Marker */}
        {/* <Marker
          coordinate={currentLocation}
          title="Pickup Point"
          pinColor="green"
        /> */}

        {/* Destination Marker */}
        <Marker coordinate={destination} title="Drop Point">
          <Image
            source={require('../../assets/image/other/HomeLocation.png')} // add your bike image here
            style={{width: 60, height: 60}}
            resizeMode="contain"
          />
        </Marker>

        {/* Route Directions */}
        <MapViewDirections
          origin={currentLocation}
          destination={destination}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={6}
          strokeColor={Colors.default}
          onReady={(result: DirectionsResult) => {
            setInfo({
              distance: result.distance,
              duration: result.duration,
            });

            mapRef.current?.fitToCoordinates(result.coordinates, {
              edgePadding: {top: 100, right: 50, bottom: 100, left: 50},
              animated: true,
            });
          }}
          onError={err => console.warn('Directions error:', err)}
        />
      </MapView>

      {/* Map Theme Toggle */}
      <View style={styles.themeToggleRow}>
        {MAP_THEMES.map(theme => (
          <TouchableOpacity
            key={theme.key}
            style={[
              styles.themeButton,
              mapTheme === theme.key && styles.themeButtonActive,
            ]}
            onPress={() => setMapTheme(theme.key)}>
            <Text
              style={[
                styles.themeButtonText,
                mapTheme === theme.key && styles.themeButtonTextActive,
              ]}>
              {theme.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Route Info Card */}
      {/* <View style={styles.infoCard}>
        <CustomText style={styles.infoText}>
          🚗 Distance: {info.distance.toFixed(2)} km
        </CustomText>
        <CustomText style={styles.infoText}>
          ⏱ Duration: {Math.ceil(info.duration)} min
        </CustomText>
      </View> */}
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  map: {flex: 1},
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  infoCard: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.default,
  },
  themeToggleRow: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 6,
  },
  themeButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  themeButtonActive: {
    backgroundColor: '#EDAE10',
    borderColor: '#EDAE10',
  },
  themeButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  themeButtonTextActive: {
    color: '#fff',
  },
});
