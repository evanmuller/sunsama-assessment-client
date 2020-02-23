import gql from "graphql-tag";

export const tasksQuery = gql`
  query {
    tasks {
      id
      name
      date
      complete
      notes
      timeAllotment
    }
  }
`;

export const tasksOnDayQuery = gql`
  query($day: DateTime!) {
    tasksOnDay(day: $day) {
      id
      name
      date
      complete
      notes
      timeAllotment
    }
  }
`;

export const createTaskMutation = gql`
  mutation($name: String, $date: DateTime!) {
    createTask(name: $name, date: $date) {
      id
    }
  }
`;

export const updateTaskMutation = gql`
  mutation(
    $id: ID!
    $name: String
    $date: DateTime
    $complete: Boolean
    $notes: String
    $timeAllotment: Duration
  ) {
    updateTask(
      id: $id
      name: $name
      date: $date
      complete: $complete
      notes: $notes
      timeAllotment: $timeAllotment
    ) {
      id
    }
  }
`;

export const deleteTaskMutation = gql`
  mutation($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const taskDataSubscription = gql`
  subscription {
    taskData {
      mutation
      task {
        id
        name
        date
        complete
        notes
        timeAllotment
      }
    }
  }
`;
