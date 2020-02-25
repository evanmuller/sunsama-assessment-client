import React, { useMemo, useState, useRef } from "react";
import FontAwesome, {
  RegularIcons,
  SolidIcons,
} from "react-native-fontawesome";
import { assoc } from "ramda";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { SwipeListView, SwipeRow } from "react-native-swipe-list-view";
import MyAppText from "./MyAppText";

const moveColor = "rgb(44, 167, 255)";
const deleteColor = "rgb(251, 74, 74)";
const completeColor = "rgb(77, 205, 125)";

const styles = StyleSheet.create({
  backTextWhite: {
    color: "#FFF",
  },
  rowFront: {
    backgroundColor: "white",
    borderRadius: 4,
    justifyContent: "center",

    ...Platform.select({
      web: {
        boxShadow: "0 1px 1px 1px rgba(0,0,0,.1)",
      },
      android: {
        elevation: 1,
      },
    }),

    padding: 20,

    marginTop: 4,
    marginBottom: 4,
    marginLeft: 20,
    marginRight: 20,
  },
  rowBack: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",

    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 20,
    marginRight: 20,
  },
  rowFrontText: {
    fontSize: 16,
    marginBottom: 16,
  },
  actionRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  rowBackText: {
    color: "white",
  },
  completeCheck: {
    fontSize: 32, // this should be 42 at a minimum, but it looks bad
    color: completeColor,
    flex: 0,
  },
  incompleteCheck: {
    fontSize: 32, // this should be 42 at a minimum, but it looks bad
    color: "rgba(0, 0, 0, .3)",
    flex: 0,
  },
});

const TaskSwipeListView = ({ data, onMove, onDelete, onPress, onComplete }) => {
  const [swipeDirection, setSwipeDirection] = useState({});

  const rowMapRef = useRef(null);

  const dataWithKey = useMemo(
    () => data.map((task, index) => assoc("key", `${index}`, task)),
    [data],
  );

  return (
    <SwipeListView
      closeOnRowOpen={false}
      closeOnRowPress={false}
      data={dataWithKey}
      onRowOpen={key => {
        const task = dataWithKey[key];
        const rowRef = rowMapRef.current[key];

        if (swipeDirection[key] === "right") {
          onMove(task, rowRef);
        } else {
          onDelete(task, rowRef);
        }
      }}
      renderItem={({ item }, rowMap) => {
        rowMapRef.current = rowMap;

        return (
          <SwipeRow
            tension={120}
            friction={14}
            leftOpenValue={Dimensions.get("window").width}
            rightOpenValue={-Dimensions.get("window").width}
            disableRightSwipe={item.complete}
            disableLeftSwipe={item.complete}
            onSwipeValueChange={({ value }) => {
              const direction = value > 0 ? "right" : "left";
              if (swipeDirection[item.key] !== direction) {
                setSwipeDirection(assoc(item.key, direction, swipeDirection));
              }
            }}
          >
            <View
              style={[
                styles.rowBack,
                {
                  backgroundColor:
                    swipeDirection[item.key] === "right"
                      ? moveColor
                      : deleteColor,
                },
                item.complete ? { opacity: 0 } : { opacity: 1 },
              ]}
            >
              <Text
                style={[
                  styles.rowBackText,
                  {
                    opacity: swipeDirection[item.key] === "right" ? 1 : 0,
                  },
                ]}
              >
                Move
              </Text>
              <Text
                style={[
                  styles.rowBackText,
                  {
                    opacity: swipeDirection[item.key] === "left" ? 1 : 0,
                  },
                ]}
              >
                Delete
              </Text>
            </View>
            <TouchableWithoutFeedback onPress={() => onPress(item)}>
              <View
                style={[styles.rowFront, item.complete ? { opacity: 0.6 } : {}]}
              >
                <MyAppText style={styles.rowFrontText}>{item.name}</MyAppText>
                <View style={styles.actionRow}>
                  <TouchableWithoutFeedback onPress={() => onComplete(item)}>
                    {item.complete ? (
                      <FontAwesome
                        icon={SolidIcons.checkCircle}
                        style={styles.completeCheck}
                      />
                    ) : (
                      <FontAwesome
                        icon={RegularIcons.checkCircle}
                        style={styles.incompleteCheck}
                      />
                    )}
                  </TouchableWithoutFeedback>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </SwipeRow>
        );
      }}
    />
  );
};

export default TaskSwipeListView;
