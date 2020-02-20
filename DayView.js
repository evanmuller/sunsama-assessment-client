import React, { useCallback, useEffect } from "react";
import moment from "moment";
import { indexOf, pluck, remove, lensIndex, set } from "ramda";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@apollo/react-hooks";
import { tasksOnDayQuery, taskOnDaySubscription } from "./queries";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    width: "100%",
  },
  dateLabel: {
    fontSize: 20,
  },
  item: {
    flex: 1,
    margin: 4,
    backgroundColor: "#eee",
    padding: 10,
    fontSize: 12,
    textAlign: "center",
  },
});

const DayView = ({ day }) => {
  const { data, loading, error, subscribeToMore } = useQuery(tasksOnDayQuery, {
    variables: {
      day,
    },
  });

  const subscribeToMoreTasks = useCallback(
    () => {
      subscribeToMore({
        document: taskOnDaySubscription,
        variables: { day },
        updateQuery: (prev, { subscriptionData }) => {
          if (subscriptionData.data) {
            const { taskData } = subscriptionData.data;
            const { mutation, task } = taskData;

            if (mutation === "CREATED") {
              if (moment(day).isSame(task.date, "day")) {
                return {
                  tasksOnDay: [...prev.tasksOnDay, task],
                };
              }
            } else if (mutation === "UPDATED") {
              const { tasksOnDay } = prev;
              const index = indexOf(task.id, pluck("id", tasksOnDay));
              const isSameDay = moment(day).isSame(task.date, "day");

              if (isSameDay && index >= 0) {
                // same day in the list
                return {
                  tasksOnDay: set(lensIndex(index), task, tasksOnDay),
                };
              } else if (isSameDay && index < 0) {
                // same day not in the list
                // gonna need to sort this
                return {
                  tasksOnDay: [...prev.tasksOnDay, task],
                };
              } else if (!isSameDay && index >= 0) {
                // different day in the list
                return {
                  tasksOnDay: remove(index, 1, tasksOnDay),
                };
              }
            } else if (mutation === "DELETED") {
              const { tasksOnDay } = prev;
              const index = indexOf(task.id, pluck("id", tasksOnDay));

              if (index > 0) {
                return {
                  tasksOnDay: remove(index, 1, tasksOnDay),
                };
              }
            }
          }

          return prev;
        },
      });
    },
    [subscribeToMore, taskOnDaySubscription, day],
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
        {moment(day).format("dddd, MMMM Do")}
      </Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>{error.message}</Text>
      ) : (
        <FlatList
          data={data.tasksOnDay}
          style={styles.list}
          renderItem={({ item }) => (
            <Text style={styles.item}>{item.name}</Text>
          )}
        />
      )}
    </View>
  );
};

export default DayView;
