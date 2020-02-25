import React from "react";
import { StyleSheet, Text } from "react-native";

const defaultStyles = StyleSheet.create({
  text: {
    fontFamily: "Avenir",
  },
});

const MyAppText = ({ style, children, ...props }) => (
  <Text style={[defaultStyles.text, ...[style]]}>{children}</Text>
);

export default MyAppText;
