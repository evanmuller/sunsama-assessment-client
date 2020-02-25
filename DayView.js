import React, { useCallback, useState, useEffect, useRef } from "react";
import { DateTime } from "luxon";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  TextInput,
} from "react-native";
import { indexOf, pluck, remove, lensIndex, set, sort } from "ramda";
import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  createTaskMutation,
  updateTaskMutation,
  deleteTaskMutation,
  tasksOnDayQuery,
  taskDataSubscription,
} from "./queries";
import FontAwesome, { RegularIcons } from "react-native-fontawesome";
import CalendarMiniMap from "./CalendarMiniMap";
import DateHeader from "./DateHeader";
import MyAppText from "./MyAppText";
import TaskSwipeListView from "./TaskSwipeListView";
import MoveTaskOverlay from "./MoveTaskOverlay";

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
  calendarMiniMap: {
    marginBottom: 6,
  },
});

const DayView = ({ currentDateTime, onDateTimeChange }) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [movingTask, setMovingTask] = useState(null);
  const newTaskNameInputRef = useRef(null);
  const newTaskPending = useRef(false);
  const moveTaskRowRef = useRef(null);

  const [createTask] = useMutation(createTaskMutation);
  const [updateTask] = useMutation(updateTaskMutation);
  const [deleteTask] = useMutation(deleteTaskMutation);

  const { data, loading, error, subscribeToMore, refetch } = useQuery(
    tasksOnDayQuery,
    {
      variables: {
        day: currentDateTime.toISO(),
      },
    },
  );

  const subscribeToMoreTasks = useCallback(
    () =>
      subscribeToMore({
        document: taskDataSubscription,
        variables: { day: currentDateTime.toISO() },
        updateQuery: (prev, { subscriptionData }) => {
          if (subscriptionData.data) {
            // Don't shut an open new task input on another device
            // But do it here so there's no lag. I'm sure there's a
            // better way to handle this
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
      }),
    [subscribeToMore, taskDataSubscription, currentDateTime],
  );

  const handleCreateTask = useCallback(
    value => {
      const now = DateTime.local();

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

  const updateCacheForTasksOnDayMutation = useCallback(
    (cache, taskData) => {
      const queryData = {
        query: tasksOnDayQuery,
        variables: {
          day: currentDateTime.toISO(),
        },
      };

      const { tasksOnDay } = cache.readQuery(queryData);

      const newTasksOnDay = updateTasksForNewSubscriptionData(
        taskData,
        currentDateTime,
        tasksOnDay,
      );

      cache.writeQuery({
        ...queryData,
        data: { tasksOnDay: newTasksOnDay },
      });
    },
    [tasksOnDayQuery, currentDateTime],
  );

  // This is a little wonky. The data has to be refetched if the date
  // changes because another client may have changed the tasks and we didn't
  // catch it in subscription data.
  useEffect(
    () => {
      refetch();
    },
    [currentDateTime],
  );

  useEffect(
    () => subscribeToMoreTasks(), // need the return value to unsubscribe
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
      <DateHeader
        open={calendarOpen}
        selectedDateTime={currentDateTime}
        onPress={() => {
          setCalendarOpen(!calendarOpen);
        }}
      />
      {loading ? (
        <View /> // use empty view for loading for now
      ) : error ? (
        <Text>{error.message}</Text>
      ) : (
        <>
          {calendarOpen && (
            <CalendarMiniMap
              style={styles.calendarMiniMap}
              selectedDateTime={currentDateTime}
              onDateTimeChange={dateTime => {
                setCalendarOpen(false);
                onDateTimeChange(dateTime);
              }}
            />
          )}

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
                  if (Platform.OS === "web") {
                    if (target.value) {
                      handleCreateTask(target.value);
                    } else {
                      setCreatingTask(false);
                    }
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
            onMove={(task, rowRef) => {
              moveTaskRowRef.current = rowRef;
              setMovingTask(task);
            }}
            onDelete={(task, rowRef) => {
              //TODO: handle errors
              deleteTask({
                variables: {
                  id: task.id,
                },
                optimisticResponse: {
                  __typename: "Mutation",
                  deleteTask: true,
                },
                update: cache => {
                  updateCacheForTasksOnDayMutation(cache, {
                    task: task,
                    mutation: "DELETED",
                  });
                },
              }).then(response => {
                console.log("Task Deleted", task.id, response);
              });

              rowRef.closeRowWithoutAnimation();
            }}
            onComplete={task => {
              //TODO: handle errors
              updateTask({
                variables: { id: task.id, complete: !task.complete },
                optimisticResponse: {
                  __typename: "Mutation",
                  updateTask: {
                    __typename: "Task",
                    ...task,
                    complete: !task.complete,
                  },
                },
              }).then(response => {
                console.log("Task Updated", response);
              });
            }}
          />
        </>
      )}

      {movingTask && (
        <MoveTaskOverlay
          task={movingTask}
          currentDateTime={currentDateTime}
          onDateTimeChange={dateTime => {
            //TODO: handle errors
            updateTask({
              variables: { id: movingTask.id, date: dateTime.toISO() },
              optimisticResponse: {
                __typename: "Mutation",
                updateTask: {
                  __typename: "Task",
                  ...movingTask,
                  date: dateTime,
                },
              },
              update: (cache, { data: { updateTask } }) => {
                updateCacheForTasksOnDayMutation(cache, {
                  task: updateTask,
                  mutation: "UPDATED",
                });
              },
            }).then(response => {
              console.log("Task Moved", response);
            });

            moveTaskRowRef.current.closeRowWithoutAnimation();
            setMovingTask(null);
          }}
          onClose={() => {
            moveTaskRowRef.current.closeRowWithoutAnimation();
            setMovingTask(null);
          }}
        />
      )}
    </View>
  );
};

export default DayView;
