import React from "react";
import { DateTime } from "luxon";
import { keys, mergeRight } from "ramda";
import { Dimensions } from "react-native";
import { CalendarList, LocaleConfig } from "react-native-calendars";

const localeKey = keys(LocaleConfig.locales)[0];
const localeObject = LocaleConfig.locales[localeKey];

LocaleConfig.locales[localeKey] = mergeRight(localeObject, {
  dayNamesShort: ["S", "M", "T", "W", "T", "F", "S"],
});

const CalendarMiniMap = ({ selectedDateTime, onDateTimeChange, ...props }) => {
  const selectedDayString = selectedDateTime.toFormat("yyyy-MM-dd");

  return (
    <CalendarList
      horizontal={true}
      pagingEnabled={true}
      calendarWidth={Dimensions.get("window").width}
      onDayPress={({ year, month, day }) => {
        onDateTimeChange(
          DateTime.fromObject({ year, month, day }).setZone("utc", {
            keepLocalTime: true,
          }), // Stay in Greenwich for now...
        );
      }}
      hideExtraDays={false}
      markedDates={{
        [selectedDayString]: { selected: true, marked: true, disabled: true },
      }}
      theme={{
        calendarBackground: "transparent",
        textSectionTitleColor: "black",
        textMonthFontWeight: "100",
        textDayFontFamily: "Avenir",
        textMonthFontFamily: "AvenirMedium",
        textDayHeaderFontFamily: "AvenirMedium",
        textDayHeaderFontSize: 12,
        textDayFontSize: 12,
        textMonthFontSize: 18,
        textDisabledColor: "rgba(0, 0, 0, .3)",
        selectedDayTextColor: "white",
        selectedDayBackgroundColor: "#00adf5",
      }}
      {...props}
    />
  );
};

export default CalendarMiniMap;
