import React, { useCallback, useEffect } from "react";
import { indexOf, pluck, remove, lensIndex, set, sort } from "ramda";
import { DateTime } from "luxon";
import { StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery } from "@apollo/react-hooks";
import TaskSwipeListView from "./TaskSwipeListView";
import {
  deleteTaskMutation,
  taskDataSubscription,
  tasksOnDayQuery,
  updateTaskMutation,
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
});

const DayView = ({ currentDateTime }) => {
  const { data, loading, error, subscribeToMore } = useQuery(tasksOnDayQuery, {
    variables: {
      day: currentDateTime.toISO(),
    },
  });

  const [deleteTask] = useMutation(deleteTaskMutation);
  const [updateTask] = useMutation(updateTaskMutation);

  const subscribeToMoreTasks = useCallback(
    () => {
      subscribeToMore({
        document: taskDataSubscription,
        variables: { day: currentDateTime.toISO() },
        updateQuery: (prev, { subscriptionData }) => {
          if (subscriptionData.data) {
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
    },
    [subscribeToMore, taskDataSubscription, currentDateTime],
  );

  useEffect(
    () => {
      subscribeToMoreTasks();
    },
    [subscribeToMoreTasks],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.dateLabel}>
        {currentDateTime.toFormat("EEEE, MMMM d")}
      </Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>{error.message}</Text>
      ) : (
        <TaskSwipeListView
          data={sortTasks(data.tasksOnDay)}
          onPress={task => console.log("on press task", task)}
          onMove={task => console.log("on move task", task)}
          onDelete={(task, rowRef) => {
            deleteTask({ variables: { id: task.id } }).then(() => {
              rowRef.closeRowWithoutAnimation();
            });
          }}
          onComplete={task => {
            updateTask({
              variables: { id: task.id, complete: !task.complete },
            });
          }}
        />
      )}
    </View>
  );
};

export default DayView;
