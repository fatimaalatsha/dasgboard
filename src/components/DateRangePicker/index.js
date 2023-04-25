import React, { useState } from "react";
import { DatePicker, Space, Button } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const rangePresets = [
  {
    label: "Last 7 Days",
    value: [dayjs().add(-7, "d"), dayjs()],
  },
  {
    label: "Last 14 Days",
    value: [dayjs().add(-14, "d"), dayjs()],
  },
  {
    label: "Last 30 Days",
    value: [dayjs().add(-30, "d"), dayjs()],
  },
  {
    label: "Last 90 Days",
    value: [dayjs().add(-90, "d"), dayjs()],
  },
];


const DateRangePicker = ({ value, onDateSelect }) => {
  const [isEnable, setIsEnable] = useState(false); // Set isEnable state
  const [dateValue, setDateValue] = useState(value); // Set date value state
  const dateFormat = "YYYY-MM-DD"; // Set date format

  const onRangeChange = (dates, dateStrings) => {
    if (dates) {
      setDateValue(dateStrings);
      onDateSelect(dateStrings); // Call onDateSelect with the selected value
    } else {
      console.log("Clear");
    }
  };
  return (
    <Space direction="vertical" size={12}>
      <RangePicker
        presets={rangePresets}
        autoFocus={isEnable}
        allowClear={true}
        open={isEnable}
        size="small"
        format={dateFormat}
        onClick={() => {
          setIsEnable(true);
        }}
        onChange={(dates, dateStrings) => {
          onRangeChange(dates, dateStrings);
        }}
        renderExtraFooter={() => {
          return (
            <Space
              direction="horizontal"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "10px",
              }}
            >
              <Button
                type="primary"
                ghost={true}
                onClick={() => {
                  setIsEnable(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  setIsEnable(false);
                }}
              >
                Apply
              </Button>
            </Space>
          );
        }}
      />
    </Space>
  );
};
export default DateRangePicker;
