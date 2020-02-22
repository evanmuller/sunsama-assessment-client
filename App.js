import React, { useEffect, useState } from "react";
import * as Font from "expo-font";
import { DateTime } from "luxon";
import { Text } from "react-native";
import ClientProvider from "./ClientProvider";
import DayView from "./DayView";

const App = () => {
  const [dateTime] = useState(
    DateTime.local().setZone("utc", { keepLocalTime: true }),
  ); // Pretend we're in Greenwich for now...

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      "fa-regular-400": require("./assets/fonts/fa-regular-400.ttf"),
      "fa-solid-900": require("./assets/fonts/fa-solid-900.ttf"),
      Avenir: require("./assets/fonts/AvenirLTStd-Book.otf"),
    }).then(() => {
      setFontsLoaded(true);
    });
  }, []);

  return fontsLoaded ? (
    <ClientProvider>
      <DayView currentDateTime={dateTime} />
    </ClientProvider>
  ) : (
    <Text>Loading Fonts...</Text>
  );
};

export default App;
