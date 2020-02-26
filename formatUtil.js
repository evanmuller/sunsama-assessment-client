export const formatDuration = duration => {
  const hours = duration.get("hours");

  if (hours >= 1) {
    return `${hours} hr`;
  } else {
    return `${duration.get("minutes")} min`;
  }
};
