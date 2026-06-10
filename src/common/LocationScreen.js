import React, {useState} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import Button from './Button';
import GooglePlacesInput from './GooglePlacesInput';
import {Font} from './Theam';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_APIKEY } from '../utils/helper';

// Neutral, international-friendly default region used only until the user's
// real coordinates come in (or if permission is denied). Chosen so the map
// always has *something* to render — a blank (0, 0) region renders an empty
// ocean tile and looks broken.
const DEFAULT_REGION = {
  latitude: 40.7128,
  longitude: -74.006,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const LocationScreen = ({
  setopenLocationModal,
  // formikObj,
  fieldName,
  setLocationDetails,
}) => {
  // const {location} = useSelector(state => state.userRedux);
  const [region, setRegion] = React.useState(DEFAULT_REGION);
  const [hasLocatedUser, setHasLocatedUser] = useState(false);
  const [currentAddress, setCurrentAddress] = useState({});

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Location permission denied — using default region');
          if (!cancelled) setHasLocatedUser(true);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (cancelled) return;
        setRegion({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setHasLocatedUser(true);
      } catch (err) {
        console.log('Location fetch error:', err);
        if (!cancelled) setHasLocatedUser(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkerDragEnd = async e => {
    const {latitude, longitude} = e.nativeEvent.coordinate;
    setRegion(prev => ({
      ...prev,
      latitude,
      longitude,
    }));
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components || [];
        let city = '', state = '', country = '', postal_code = '';
        let cityFullName = '', stateFullName = '', countryFullName = '';
        addressComponents.forEach(component => {
          const types = component.types || [];
          if (types.includes('locality')) {
            city = component.short_name;
            cityFullName = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            state = component.short_name;
            stateFullName = component.long_name;
          } else if (types.includes('country')) {
            country = component.short_name;
            countryFullName = component.long_name;
          } else if (types.includes('postal_code')) {
            postal_code = component.long_name;
          }
        });
        const streetAddress = data.results[0].formatted_address || cityFullName || '';
        setCurrentAddress({
          streetAddress: streetAddress,
          city: cityFullName,
          state: stateFullName,
          zipcode: postal_code,
          country: countryFullName,
          addressLink: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        });
      }
    } catch (err) {
      console.log('Geocoding Error: ', err);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.mapWrapper}>
          <MapView
            // PROVIDER_GOOGLE is required on Android so the API key in
            // AndroidManifest is actually used. On iOS we fall back to Apple
            // Maps (Google Maps on iOS needs GMSServices.provideAPIKey, which
            // this project does not currently call).
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={styles.map}
            initialRegion={DEFAULT_REGION}
            region={{
              latitude: region.latitude,
              longitude: region.longitude,
              latitudeDelta: region.latitudeDelta || 0.05,
              longitudeDelta: region.longitudeDelta || 0.05,
            }}
            showsUserLocation={hasLocatedUser}
            loadingEnabled
            onRegionChangeComplete={setRegion}>
            {!!region.latitude && !!region.longitude && (
              <Marker
                draggable
                onDragEnd={handleMarkerDragEnd}
                coordinate={{
                  latitude: region.latitude,
                  longitude: region.longitude,
                }}
                title={'Your Location'}
              />
            )}
          </MapView>
          <View style={styles.searchOverlay} pointerEvents="box-none">
            <GooglePlacesInput
              setRegion={setRegion}
              fieldName={fieldName}
              setLocationDetails={setLocationDetails}
              setCurrentAddress={setCurrentAddress}
              currentLatitude={region.latitude}
              currentLongitude={region.longitude}
            />
          </View>
        </View>

        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginVertical: 10,
          }}>
          <View style={{width: '20%', marginVertical: 0, marginHorizontal: 20}}>
            <Button
              buttonName={'Cancel'}
              onPress={() => {
                setopenLocationModal(false);
              }}
            />
          </View>
          <View style={{width: '20%', marginVertical: 0}}>
            <Button
              buttonName={'Save'}
              onPress={() => {
                if (setLocationDetails && region.latitude !== 0 && region.longitude !== 0) {
                  const finalAddress = Object.keys(currentAddress).length > 0 
                  ? currentAddress 
                  : { addressLink: `https://www.google.com/maps/search/?api=1&query=${region.latitude},${region.longitude}` };
                  setLocationDetails(finalAddress);
                }
                setopenLocationModal(false);
              }}
            />
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  mapWrapper: {
    flex: 1,
    // minHeight guarantees the native MapView has measurable bounds even
    // when react-native-modal's animated container hasn't fully laid out
    // yet — without it MapView can render at 0×0 (looks like the map
    // "didn't load") on some Android devices and on first-mount iOS.
    minHeight: 300,
    marginTop: 10,
    overflow: 'hidden',
    borderRadius: 12,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
  },
  subContainer: {
    // flex: 1,
    // margin: 20,
  },
  card: {
    // borderWidth: 1,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  edit: {
    fontSize: 14,
    fontFamily: Font.textNormal,
    textDecorationLine: 'underline',
  },
  contentText: {
    fontSize: 14,
    fontFamily: Font.textNormal,
  },
  noContent: {
    fontSize: 14,
    fontFamily: Font.textNormal,
    color: 'red',
  },
  line: {marginVertical: 20},
});

export default LocationScreen;
