import React, {useState} from "react";
import moment from "moment";
import ClientProvider from "./ClientProvider";
import DayView from "./DayView";

const App = () => {
  const [day] = useState(moment.utc().toDate());

  return (
    <ClientProvider>
      <DayView day={day}/>
    </ClientProvider>
  );
};

export default App;
