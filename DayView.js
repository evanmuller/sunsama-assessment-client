import React, { useCallback, useState, useEffect, useRef } from "react";
import { indexOf, pluck, remove, lensIndex, set, sort } from "ramda";
import { DateTime } from "luxon";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  TextInput,
} from "react-native";
import { useMutation, useQuery } from "@apollo/react-hooks";
import FontAwesome, { RegularIcons } from "react-native-fontawesome";
import TaskSwipeListView from "./TaskSwipeListView";
import MyAppText from "./MyAppText";
import {
  createTaskMutation,
  updateTaskMutation,
  deleteTaskMutation,
  tasksOnDayQuery,
  taskDataSubscription,
} from "./queries";

const sortTasks = sort((taskA, taskB) => {
  if (taskA.complete === taskB.complete) {
    return (
      DateTime.fromISO(taskB.date).toMillis() -
      DateTime.fromISO(taskA.date).toMillis()
    );
  } else {
    return taskA.complete ? 1 : -1;
  }
});

const indexOfTask = (task, tasks) => indexOf(task.id, pluck("id", tasks));
const isSameDay = (dateTime, task) =>
  dateTime.hasSame(DateTime.fromISO(task.date), "day");
const replaceTaskAtIndex = (task, index, tasks) =>
  set(lensIndex(index), task, tasks);

const addTask = (task, tasks) => sortTasks([task, ...tasks]);
const updateTask = (task, index, tasks) =>
  sortTasks(replaceTaskAtIndex(task, index, tasks));
const removeTask = (index, tasks) => remove(index, 1, tasks);

const updateTasksForCreatedTask = (task, currentDateTime, currentTasks) =>
  isSameDay(currentDateTime, task) ? addTask(task, currentTasks) : currentTasks;

const updateTasksForUpdatedTask = (task, currentDateTime, currentTasks) => {
  const sameDay = isSameDay(currentDateTime, task);
  const index = indexOfTask(task, currentTasks);

  if (sameDay) {
    if (index >= 0) {
      return updateTask(task, index, currentTasks);
    } else {
      return addTask(task, currentTasks);
    }
  } else {
    if (index >= 0) {
      return removeTask(index, currentTasks);
    }
  }

  return currentTasks;
};

const updateTasksForDeletedTask = (task, currentDateTime, currentTasks) => {
  const index = indexOfTask(task, currentTasks);

  if (index >= 0) {
    return removeTask(index, currentTasks);
  }

  return currentTasks;
};

const updateTasksForNewSubscriptionData = (
  { task, mutation },
  currentDateTime,
  currentTasks,
) => {
  if (mutation === "CREATED") {
    return updateTasksForCreatedTask(task, currentDateTime, currentTasks);
  } else if (mutation === "UPDATED") {
    return updateTasksForUpdatedTask(task, currentDateTime, currentTasks);
  } else if (mutation === "DELETED") {
    return updateTasksForDeletedTask(task, currentDateTime, currentTasks);
  }

  return currentTasks;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  dateLabel: {
    fontSize: 20,
    marginTop: 80,
    marginBottom: 40,
    marginLeft: 20,
  },
  addTaskButton: {
    backgroundColor: "white",
    borderRadius: 4,

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
  newTask: {
    display: "flex",

    backgroundColor: "white",
    borderRadius: 4,

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
  newTaskNameInput: {
    fontFamily: "Avenir",
    marginBottom: 16,
    fontSize: 16,
    padding: 0,
  },
  addTaskText: {
    fontSize: 16,
    color: "rgba(0, 0, 0, .6)",
  },
  incompleteCheck: {
    fontSize: 32, // this should be 42 at a minimum, but it looks bad
    color: "rgba(0, 0, 0, .3)",
    flex: 0,
  },
});

const DayView = ({ currentDateTime }) => {
  const [creatingTask, setCreatingTask] = useState(false);
  const newTaskNameInputRef = useRef(null);
  const newTaskPending = useRef(false);

  const [createTask] = useMutation(createTaskMutation);
  const [updateTask] = useMutation(updateTaskMutation);
  const [deleteTask] = useMutation(deleteTaskMutation);

  const { data, loading, error, subscribeToMore } = useQuery(tasksOnDayQuery, {
    variables: {
      day: currentDateTime.toISO(),
    },
  });

  const subscribeToMoreTasks = useCallback(
    () => {
      if (subscribeToMore) {
        subscribeToMore({
          document: taskDataSubscription,
          variables: { day: currentDateTime.toISO() },
          updateQuery: (prev, { subscriptionData }) => {
            if (subscriptionData.data) {
              // Don't shut an open new task input on another device
              // But do it here so there's no lag. There's a better way to do this.
              if (newTaskPending.current) {
                setCreatingTask(false);
                newTaskPending.current = false;
              }

              return {
                tasksOnDay: updateTasksForNewSubscriptionData(
                  subscriptionData.data.taskData,
                  currentDateTime,
                  prev.tasksOnDay,
                ),
              };
            }

            return prev;
          },
        });
      }
    },
    [subscribeToMore, taskDataSubscription, currentDateTime],
  );

  const handleCreateTask = useCallback(
    value => {
      const now = DateTime.local().setZone("utc", {
        keepLocalTime: true,
      }); // stay in Greenwich for now...

      const newTaskDateTime = now.set({
        day: currentDateTime.get("day"),
        month: currentDateTime.get("month"),
        year: currentDateTime.get("year"),
      });

      newTaskPending.current = true;

      //TODO: handle errors
      createTask({
        variables: { name: value, date: newTaskDateTime.toISO() },
      }).then(response => {
        console.log("Task Created", response);
      });
    },
    [setCreatingTask, currentDateTime],
  );

  useEffect(
    () => {
      subscribeToMoreTasks();
    },
    [subscribeToMoreTasks],
  );

  useEffect(
    () => {
      if (creatingTask) {
        newTaskNameInputRef.current.focus();
      }
    },
    [creatingTask, newTaskNameInputRef],
  );

  return (
    <View style={styles.container}>
      <MyAppText style={styles.dateLabel}>
        {currentDateTime.toFormat("EEEE, MMMM d")}
      </MyAppText>
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>{error.message}</Text>
      ) : (
        <View>
          <TouchableWithoutFeedback onPress={() => setCreatingTask(true)}>
            <View style={styles.addTaskButton}>
              <MyAppText style={styles.addTaskText}>Add a task</MyAppText>
            </View>
          </TouchableWithoutFeedback>

          {creatingTask && (
            <View style={styles.newTask}>
              <TextInput
                style={styles.newTaskNameInput}
                ref={newTaskNameInputRef}
                returnKeyType="done"
                placeholder="Task description..."
                onEndEditing={({ nativeEvent }) => {
                  if (nativeEvent.text) {
                    handleCreateTask(nativeEvent.text);
                  } else {
                    setCreatingTask(false);
                  }
                }}
                onBlur={({ target }) => {
                  if (target.value) {
                    handleCreateTask(target.value);
                  } else {
                    setCreatingTask(false);
                  }
                }}
              />
              <FontAwesome
                icon={RegularIcons.checkCircle}
                style={styles.incompleteCheck}
              />
            </View>
          )}

          <TaskSwipeListView
            data={sortTasks(data.tasksOnDay)}
            onPress={task => console.log("on press task", task)}
            onMove={task => console.log("on move task", task)}
            onDelete={(task, rowRef) => {
              //TODO: handle errors
              deleteTask({ variables: { id: task.id } }).then(response => {
                console.log("Task Deleted", response);
                rowRef.closeRowWithoutAnimation();
              });
            }}
            onComplete={task => {
              //TODO: handle errors
              updateTask({
                variables: { id: task.id, complete: !task.complete },
              }).then(response => {
                console.log("Task Updated", response);
              });
            }}
          />
        </View>
      )}
    </View>
  );
};

export default DayView;
