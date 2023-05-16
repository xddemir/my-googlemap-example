// API KEY
import { API_KEY } from "../../environment";

import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Text, View  } from "react-native";

import { InputStyle } from "./inputAutoCompleteStyle";

export default InputAutoComplete = ({
    label,
    placeholder,
    onPlaceSelected,
    autocompleteRef,
  }) => {
    return (
      <>
        <View>
          <Text>{label}</Text>
          <GooglePlacesAutocomplete
            styles={{ textInput: InputStyle.input }}
            placeholder={placeholder || ""}
            fetchDetails
            onPress={(data, details = null) => {
              onPlaceSelected(details);
            }}
            ref={autocompleteRef}
            query={{
              key: API_KEY,
              language: "en",
            }}
          />
        </View>
      </>
    );
  };