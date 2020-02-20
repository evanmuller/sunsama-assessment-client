import gql from "graphql-tag";

export const tasksQuery = gql`
  query {
    tasks {
      id
      name
      date
      complete
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
    }
  }
`;

export const taskOnDaySubscription = gql`
  subscription {
    taskData {
      mutation
      task {
        id
        name
        date
        complete
      }
    }
  }
`;
