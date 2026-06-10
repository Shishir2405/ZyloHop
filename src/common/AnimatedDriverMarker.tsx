import React, { ReactNode, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { MarkerAnimated, AnimatedRegion } from 'react-native-maps';

interface Props {
  latitude: number;
  longitude: number;
  children?: ReactNode;
  duration?: number;
  title?: string;
}

/**
 * Smoothly interpolates a map marker between successive coordinate updates.
 * Drop-in replacement for a <Marker> that would otherwise snap to new coords.
 * Uses react-native-maps' AnimatedRegion — on iOS we animate the MarkerAnimated
 * directly; on Android we call `animateMarkerToCoordinate` on the ref for the
 * smoother native path.
 */
const AnimatedDriverMarker = ({
  latitude,
  longitude,
  children,
  duration = 1000,
  title,
}: Props) => {
  const coordinate = useRef(
    new AnimatedRegion({
      latitude,
      longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
  ).current;
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    if (Platform.OS === 'android' && markerRef.current?.animateMarkerToCoordinate) {
      markerRef.current.animateMarkerToCoordinate(
        { latitude, longitude },
        duration,
      );
    } else {
      (coordinate.timing as any)({
        latitude,
        longitude,
        duration,
        useNativeDriver: false,
      }).start();
    }
  }, [latitude, longitude, duration, coordinate]);

  return (
    <MarkerAnimated ref={markerRef} coordinate={coordinate} title={title} anchor={{ x: 0.5, y: 0.5 }}>
      {children}
    </MarkerAnimated>
  );
};

export default AnimatedDriverMarker;
