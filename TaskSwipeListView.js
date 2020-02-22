import React, { useMemo, useState, useRef } from "react";
import { assoc } from "ramda";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableHighlight,
  Platform,
} from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";

const moveColor = "rgb(44, 167, 255)";
const deleteColor = "rgb(251, 74, 74)";

const styles = StyleSheet.create({
  backTextWhite: {
    color: "#FFF",
  },
  rowFront: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 4,
    justifyContent: "center",
    height: 70,

    ...Platform.select({
      web: {
        boxShadow: "0 1px 1px 1px rgba(0,0,0,.1)",
      },
      android: {
        elevation: 1,
      },
    }),

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
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 20,
    marginRight: 20,
  },
  rowFrontText: {
    fontSize: 14,
    // fontFamily: `Avenir, "Helvetica Neue", Helvetica, Arial, sans-serif`,
    fontFamily: "sans-serif",
  },
  rowBackText: {
    color: "white",
  },
});

const TaskSwipeListView = ({ data, onMove, onDelete, onPress }) => {
  const [swipeDirection, setSwipeDirection] = useState({});

  const rowMapRef = useRef();

  const dataWithKey = useMemo(
    () => data.map((task, index) => assoc("key", `${index}`, task)),
    [data],
  );

  return (
    <SwipeListView
      useFlatList
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
      onSwipeValueChange={({ value, key }) => {
        const direction = value > 0 ? "right" : "left";
        if (swipeDirection[key] !== direction) {
          setSwipeDirection(assoc(key, direction, swipeDirection));
        }
      }}
      renderItem={({ item }) => (
        <TouchableHighlight
          underlayColor="#f7f8fa"
          onPress={() => onPress(item)}
        >
          <View style={styles.rowFront}>
            <Text style={styles.rowFrontText}>{item.name}</Text>
          </View>
        </TouchableHighlight>
      )}
      renderHiddenItem={({ item }, rowMap) => {
        rowMapRef.current = rowMap;

        return (
          <View
            style={[
              styles.rowBack,
              {
                backgroundColor:
                  swipeDirection[item.key] === "right"
                    ? moveColor
                    : deleteColor,
              },
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
        );
      }}
      leftOpenValue={Dimensions.get("window").width}
      rightOpenValue={-Dimensions.get("window").width}
    />
  );
};

export default TaskSwipeListView;
