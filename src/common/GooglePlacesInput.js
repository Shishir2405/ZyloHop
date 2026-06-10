import React from 'react';
import {StyleSheet} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {Colors, Font} from './Theam';
import {storeUserDetails} from '../Redux/Reducer/UserinfoReducer';
import {useDispatch, useSelector} from 'react-redux';
import {GOOGLE_MAPS_API_KEY} from '../config';

const GooglePlacesInput = ({
  // formikObj,
  setRegion,
  fieldName,
  setLocationDetails,
  setCurrentAddress,
  placeholder,
  currentLatitude,
  currentLongitude,
  customStyles,
  textInputProps: extraTextInputProps,
  listViewDisplayed,
}) => {
  const dispatch = useDispatch();
  const userState = useSelector(state => state?.Userinfo?.user);

  const query = {
    key: GOOGLE_MAPS_API_KEY,
    language: 'en',
  };

  // Bias results toward user's current location (50km radius)
  if (currentLatitude && currentLongitude) {
    query.location = `${currentLatitude},${currentLongitude}`;
    query.radius = 50000;
  }

  return (
    <GooglePlacesAutocomplete
      placeholder={placeholder || 'Search Location'}
      minLength={2}
      autoFocus={false}
      returnKeyType={'default'}
      fetchDetails={true}
      listViewDisplayed={listViewDisplayed}
      onPress={(data, details = null) => {
        if (!details || !details.geometry) {
          console.error('Google Places Details not available. Please check API key permissions for Places API.');
          return;
        }

        const {lat, lng} = details.geometry.location;
        const addressComponents = details.address_components || [];

        let city = '', state = '', country = '', postal_code = '';
        let cityFullName = '', stateFullName = '', countryFullName = '';

        addressComponents.forEach(component => {
          const types = component.types || [];
          if (types.includes('locality')) {
            city = component.short_name;
            cityFullName = component?.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            state = component.short_name;
            stateFullName = component?.long_name;
          } else if (types.includes('country')) {
            country = component.short_name;
            countryFullName = component?.long_name;
          } else if (types.includes('postal_code')) {
            postal_code = component.long_name;
          }
        });

        // Use data.description for the full street address instead of cityFullName
        const streetAddress = data.description || cityFullName || '';

        const address = {
          streetAddress: streetAddress,
          city: cityFullName,
          state: stateFullName,
          zipcode: postal_code,
          country: countryFullName,
          addressLink: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        };

        if (setLocationDetails) {
          setLocationDetails(address);
        }

        if (setCurrentAddress) {
          setCurrentAddress(address);
        }

        if (setRegion) {
          // Preserve existing deltas — parent stores the full region and a
          // bare {latitude, longitude} would wipe them, causing the controlled
          // MapView to receive an undefined latitudeDelta/longitudeDelta on
          // the next render.
          setRegion(prev => ({
            ...(prev || {}),
            latitude: lat,
            longitude: lng,
            latitudeDelta: prev?.latitudeDelta || 0.01,
            longitudeDelta: prev?.longitudeDelta || 0.01,
          }));
        }

        dispatch(
          storeUserDetails({
            ...userState,
            address: address,
          }),
        );
      }}
      query={query}
      onFail={error => console.error('Google Places Error:', error)}
      textInputProps={{
        placeholderTextColor: Colors.black,
        ...extraTextInputProps,
      }}
      styles={customStyles || {
        container: {
          width: '100%',
          height: '100%',
        },
        textInputContainer: {
          marginVertical: 10,
          borderWidth: 1,
          borderColor: 'black',
          height: 56,
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderRadius: 8,
          fontFamily: Font.textNormal,
        },
        textInput: {
          width: '100%',
          fontSize: 16,
          fontFamily: Font.textNormal,
          shadowColor: '#6B6B66',
          padding: 10,
          color: '#1E1E1E',
        },
        predefinedPlacesDescription: {
          color: 'red',
        },
        row: {
          backgroundColor: '#ffffff',
          padding: 13,
          height: 44,
          flexDirection: 'row',
        },
        description: {
          color: 'black',
          fontFamily: Font.textNormal,
        },
      }}
    />
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInputContainer: {
    flexDirection: 'row',
  },
  textInput: {
    backgroundColor: Colors.black,
    height: 44,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 15,
    flex: 1,
  },
  poweredContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderColor: '#c8c7cc',
    borderTopWidth: 0.5,
  },
  powered: {},
  listView: {},
  row: {
    backgroundColor: '#ffffff',
    padding: 13,
    height: 44,
    flexDirection: 'row',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#c8c7cc',
  },
  description: {
    color: Colors.black,
  },
  loader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 20,
  },
});
export default GooglePlacesInput;
