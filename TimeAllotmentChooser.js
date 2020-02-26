import React, { useState } from "react";
import { Duration } from "luxon";
import FontAwesome, { SolidIcons } from "react-native-fontawesome";
import {
  Platform,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import MyAppText from "./MyAppText";
import { formatDuration } from "./formatUtil";

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, .2)",

    ...Platform.select({
      android: {
        elevation: 1,
      },
    }),
    justifyContent: "center",
    alignItems: "center",
  },
  chooserContainer: {
    backgroundColor: "white",
    borderRadius: 4,
    padding: 20,

    // Really need to make this common
    ...Platform.select({
      web: {
        boxShadow: "0 1px 1px 1px rgba(0,0,0,.1)",
      },
      android: {
        elevation: 1,
      },
      ios: {
        shadowOffset: { width: 1, height: 1 },
        shadowColor: "#000",
        shadowOpacity: 0.1,
      },
    }),
  },
  durationButton: {
    width: 210,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
  },
  durationButtonText: {},
  clearButton: {
    borderTopWidth: 1,
    borderColor: "rgba(0, 0, 0, .1)",
    width: 182,
    marginTop: 10,
    marginRight: 14,
    marginLeft: 14,
    paddingTop: 24,
    paddingBottom: 4,
  },
  clearButtonText: {
    color: "#2ca7ff",
  },
  checkIcon: {},
});

const durations = [
  Duration.fromObject({ minutes: 5 }),
  Duration.fromObject({ minutes: 10 }),
  Duration.fromObject({ minutes: 15 }),
  Duration.fromObject({ minutes: 20 }),
  Duration.fromObject({ minutes: 25 }),
  Duration.fromObject({ minutes: 30 }),
  Duration.fromObject({ minutes: 45 }),
  Duration.fromObject({ hours: 1 }),
];

const TimeAllotmentChooser = ({
  selectedDuration,
  onClear,
  onChange,
  onClose,
}) => {
  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.chooserContainer}>
          {durations.map(duration => (
            <TouchableWithoutFeedback
              key={`duration:${duration.toISO()}`}
              onPress={() => {
                onChange(duration);
              }}
            >
              <View style={styles.durationButton}>
                <MyAppText style={styles.durationButtonText}>
                  {formatDuration(duration)}
                </MyAppText>
                {selectedDuration &&
                  selectedDuration.equals(duration) && (
                    <FontAwesome
                      icon={SolidIcons.check}
                      style={styles.checkIcon}
                    />
                  )}
              </View>
            </TouchableWithoutFeedback>
          ))}
          {selectedDuration && (
            <TouchableWithoutFeedback onPress={onClear}>
              <View style={styles.clearButton}>
                <MyAppText style={styles.clearButtonText}>
                  Clear time allotment
                </MyAppText>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default TimeAllotmentChooser;
