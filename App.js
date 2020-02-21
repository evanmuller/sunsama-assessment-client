import React, { useState } from "react";
import { DateTime } from "luxon";
import ClientProvider from "./ClientProvider";
import DayView from "./DayView";

const App = () => {
  const [dateTime] = useState(
    DateTime.local().setZone("utc", { keepLocalTime: true }),
  ); // Pretend we're in Greenwich for now...

  return (
    <ClientProvider>
      <DayView currentDateTime={dateTime} />
    </ClientProvider>
  );
};

export default App;
