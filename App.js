// React
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import * as Location from "expo-location";

// Components
import InputAutoComplete from "./components/inputAutoComplete/InputAutoComplete";

// Google API
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Geocoder from "@timwangdev/react-native-geocoder";

// API KEY
import { API_KEY } from "./environment";

export default function App() {
  const { width, height } = Dimensions.get("window");

  const [origin, setOrigin] = useState("");

  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  const ASPECT_RATIO = width / height;
  const LATITUDE_DELTA = 0.02;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  const [location, setLocation] = useState({
    latitude: 40,
    longitude: -70,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  const initialLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let currentPosition = await Location.getCurrentPositionAsync({
      enableHighAccurracy: true,
    });

    setLocation({
      latitude: currentPosition.coords.latitude,
      longitude: currentPosition.coords.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });

    const position = {
      latitude: currentPosition.coords.latitude || 0,
      longitude: currentPosition.coords.longitude || 0,
    };

    setOrigin(position);
    moveTo(position);
  };

  const moveTo = async (position) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.center = position;
      mapRef.current?.animateCamera(camera, { duration: 1000 });
    }
  };

  const onPlaceSelected = (details) => {
    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    };

    setOrigin(position);
    moveTo(position);
  };

  const onPressCoordinate = async (event) => {
    const position = {
      latitude: event.nativeEvent.coordinate.latitude || 0,
      longitude: event.nativeEvent.coordinate.longitude || 0,
    };

    const geoAddress = await Geocoder.geocodePosition(
      { lat: position.latitude, lng: position.longitude },
      {
        apiKey: API_KEY,
        forceGoogleOnIos: true,
        fallbackToGoogle: true,
      }
    );

    autocompleteRef.current?.setAddressText(geoAddress[0].formattedAddress);

    setOrigin(position);
    moveTo(position);
  };

  useEffect(() => {
    initialLocation();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={location}
        onPress={(e) => {
          onPressCoordinate(e);
        }}
      >
        {origin && <Marker coordinate={origin} />}
      </MapView>

      <View style={styles.searchContainer}>
        <InputAutoComplete
          label="Origin"
          onPlaceSelected={(details) => {
            onPlaceSelected(details);
          }}
          autocompleteRef={autocompleteRef}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },

  searchContainer: {
    position: "absolute",
    width: "90%",
    backgroundColor: "white",
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    padding: 8,
    borderRadius: 10,
    borderColor: "black",
    top: 40,
    marginLeft: 15,
  },

});
