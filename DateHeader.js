import React from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";

import MyAppText from "./MyAppText";

const styles = StyleSheet.create({
  container: {
    display: "flex",
    marginTop: 80,
    marginBottom: 24,
    marginLeft: 22,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayName: {
    fontFamily: "AvenirMedium",
    fontSize: 26,
    marginRight: 20,
    marginBottom: 4,
  },
  monthDay: {
    fontFamily: "AvenirMedium",
    color: "rgba(0, 0, 0, .6)",
    fontSize: 16,
  },
  dateLabel: {
    fontSize: 20,
    marginTop: 80,
    marginBottom: 40,
    marginLeft: 20,
  },
});

const DateHeader = ({ selectedDateTime, open, onPress }) => {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.dateContainer}>
          <MyAppText style={styles.dayName}>
            {selectedDateTime.toFormat("EEEE")}
          </MyAppText>
          {open ? <Text>▶︎</Text> : <Text>▲</Text>}
        </View>
        <MyAppText style={styles.monthDay}>
          {selectedDateTime.toFormat("MMMM d")}
        </MyAppText>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default DateHeader;
