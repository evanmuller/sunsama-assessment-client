import React from "react";
import { DateTime } from "luxon";
import {
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CalendarMiniMap from "./CalendarMiniMap";
import MyAppText from "./MyAppText";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, .1)",
    justifyContent: "flex-end",

    ...Platform.select({
      android: {
        elevation: 1,
      },
    }),
  },
  calendarContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  startDateText: {
    fontFamily: "AvenirMedium",
    marginTop: 30,
    marginLeft: 40,
    fontSize: 12,
  },
  closeArea: {
    flex: 1,
  },
});

const MoveTaskOverlay = ({
  task,
  currentDateTime,
  onDateTimeChange,
  onClose,
}) => {
  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.closeArea} />
      </TouchableWithoutFeedback>
      <View style={styles.calendarContainer}>
        <MyAppText style={styles.startDateText}>Start date:</MyAppText>
        <CalendarMiniMap
          selectedDateTime={currentDateTime}
          onDateTimeChange={newDate => {
            const currentTaskDateTime = DateTime.fromISO(task.date).toUTC();

            const newTaskDateTime = DateTime.utc(
              newDate.get("year"),
              newDate.get("month"),
              newDate.get("day"),
              currentTaskDateTime.get("hour"),
              currentTaskDateTime.get("minute"),
              currentTaskDateTime.get("second"),
              currentTaskDateTime.get("millisecond"),
            );

            onDateTimeChange(newTaskDateTime);
          }}
        />
      </View>
    </View>
  );
};

export default MoveTaskOverlay;
