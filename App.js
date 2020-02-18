import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GRAPHQL_URL } from "react-native-dotenv";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function App() {
  return (
    <View style={styles.container}>
      <Text>GraphQL URL: {GRAPHQL_URL}</Text>
    </View>
  );
}
