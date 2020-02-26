import React, { useRef, useState } from "react";
import { Duration } from "luxon";
import { assoc } from "ramda";
import { DateTime } from "luxon";
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import FontAwesome, {
  RegularIcons,
  SolidIcons,
} from "react-native-fontawesome";
import MyAppText from "./MyAppText";
import TimeAllotmentChooser from "./TimeAllotmentChooser";
import { formatDuration } from "./formatUtil";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "white",

    ...Platform.select({
      android: {
        elevation: 1,
      },
    }),
    display: "flex",
    padding: 40,
    paddingTop: 80,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 80,
  },
  startDateText: {
    fontFamily: "AvenirMedium",
    color: "rgba(0, 0, 0, .8)",
    fontSize: 14,
  },
  closeButton: {
    padding: 10,
    marginTop: -10,
    marginLeft: -10,
  },
  closeIcon: {
    fontSize: 24,
    color: "rgba(0, 0, 0, .5)",
  },
  body: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  completeButton: {
    padding: 10,
    marginTop: -12,
    marginLeft: -10,
  },
  completeCheck: {
    fontSize: 24,
    color: "rgb(77, 205, 125)",
    flex: 0,
  },
  incompleteCheck: {
    fontSize: 24,
    color: "rgba(0, 0, 0, .3)",
    flex: 0,
  },
  bodyFormElements: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-start",
    marginLeft: 14,
  },
  taskNameInput: {
    fontFamily: "Avenir",
    fontSize: 20,
    marginBottom: 30,
  },
  taskNotesInput: {
    fontFamily: "Avenir",
    fontSize: 16,
    padding: 0,
    borderBottomWidth: 1,
    borderColor: "rgba(0, 0, 0, .2)",
    marginBottom: 30,
    height: 160,
  },
  timeAllotmentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeAllotmentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginLeft: -20,
  },
  timeAllotmentIcon: {
    fontSize: 20,
    color: "rgba(0, 0, 0, .5)",
    marginRight: 14,
  },
  timeAllotmentText: {
    fontFamily: "AvenirMedium",
    fontSize: 24,
  },
});

const isToday = taskData =>
  DateTime.local().hasSame(DateTime.fromISO(taskData.date), "day");

const TaskDetail = ({ taskData, onClose, onUpdate }) => {
  const taskNameInputRef = useRef(null);
  const [task, setTask] = useState(taskData);
  const [showTimeAllotmentChooser, setShowTimeAllotmentChooser] = useState(
    false,
  );

  // useEffect(() => {
  //   taskNameInputRef.current.focus();
  // }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableWithoutFeedback
          onPress={() => {
            if (task.name) {
              onUpdate(task);
              onClose();
            }
          }}
        >
          <View style={styles.closeButton}>
            <FontAwesome icon={SolidIcons.arrowLeft} style={styles.closeIcon} />
          </View>
        </TouchableWithoutFeedback>
        <MyAppText style={styles.startDateText}>
          Start:{" "}
          {isToday(taskData)
            ? "Today"
            : DateTime.fromISO(task.date).toFormat("MMM d")}
        </MyAppText>
      </View>
      <View style={styles.body}>
        <TouchableWithoutFeedback
          onPress={() => {
            const newTask = assoc("complete", !task.complete, task);
            setTask(newTask);
            onUpdate(newTask);
          }}
        >
          <View style={styles.completeButton}>
            {task.complete ? (
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
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.bodyFormElements}>
          <TextInput
            ref={taskNameInputRef}
            value={task.name}
            style={styles.taskNameInput}
            onChangeText={text => {
              setTask(assoc("name", text, task));
            }}
            onEndEditing={() => {
              if (task.name) {
                onUpdate(task);
              }
            }}
            onBlur={() => {
              if (Platform.OS === "web") {
                if (task.name) {
                  onUpdate(task);
                }
              }
            }}
          />
          <TextInput
            placeholder="Notes..."
            multiline
            numberOfLines={8}
            {...Platform.select({
              android: {
                textAlignVertical: "top",
              },
              ios: {
                textAlignVertical: "top",
              },
            })}
            style={styles.taskNotesInput}
            value={task.notes || ""}
            onChangeText={text => {
              setTask(assoc("notes", text ? text : null, task));
            }}
            onEndEditing={() => {
              onUpdate(task);
            }}
            onBlur={() => {
              if (Platform.OS === "web") {
                onUpdate(task);
              }
            }}
          />
          <View style={styles.timeAllotmentRow}>
            <TouchableWithoutFeedback
              onPress={() => setShowTimeAllotmentChooser(true)}
            >
              <View style={styles.timeAllotmentButton}>
                {task.timeAllotment ? (
                  <MyAppText styles={styles.timeAllotmentText}>
                    {formatDuration(Duration.fromISO(task.timeAllotment))}
                  </MyAppText>
                ) : (
                  <FontAwesome
                    icon={RegularIcons.clock}
                    style={styles.timeAllotmentIcon}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
      {showTimeAllotmentChooser && (
        <TimeAllotmentChooser
          selectedDuration={
            task.timeAllotment ? Duration.fromISO(task.timeAllotment) : null
          }
          onClear={() => {
            setTask(assoc("timeAllotment", null, task));
            onUpdate(task);
            setShowTimeAllotmentChooser(false);
          }}
          onChange={duration => {
            setTask(assoc("timeAllotment", duration.toISO(), task));
            onUpdate(task);
            setShowTimeAllotmentChooser(false);
          }}
          onClose={() => setShowTimeAllotmentChooser(false)}
        />
      )}
    </View>
  );
};

export default TaskDetail;
