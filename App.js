import React, { useEffect, useState } from "react";
import * as Font from "expo-font";
import { DateTime } from "luxon";
import { Platform, View } from "react-native";
import ClientProvider from "./ClientProvider";
import DayView from "./DayView";

const App = () => {
  const [dateTime, setDateTime] = useState(DateTime.local());

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      ...Platform.select({
        web: {
          "fa-regular-400": require("./assets/fonts/fa-regular-400.ttf"),
          "fa-solid-900": require("./assets/fonts/fa-solid-900.ttf"),
        },
        android: {
          "fa-regular-400": require("./assets/fonts/fa-regular-400.ttf"),
          "fa-solid-900": require("./assets/fonts/fa-solid-900.ttf"),
        },
        ios: {
          FontAwesome5FreeRegular: require("./assets/fonts/fa-regular-400.ttf"),
          FontAwesome5FreeSolid: require("./assets/fonts/fa-solid-900.ttf"),
        },
      }),
      Avenir: require("./assets/fonts/AvenirLTStd-Book.otf"),
      AvenirMedium: require("./assets/fonts/AvenirLTStd-Medium.otf"),
    }).then(() => {
      setFontsLoaded(true);
    });
  }, []);

  return fontsLoaded ? (
    <ClientProvider>
      <DayView
        currentDateTime={dateTime}
        onDateTimeChange={dateTime => setDateTime(dateTime)}
      />
    </ClientProvider>
  ) : (
    <View /> // use empty view for loading for now
  );
};

export default App;
