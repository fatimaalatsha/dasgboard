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
    label: "Last 30 Days",
    value: [dayjs().add(-30, "d"), dayjs()],
  },
  {
    label: "Last 90 Days",
    value: [dayjs().add(-90, "d"), dayjs()],
  },
  {
    label: "Last 6 Months",
    value: [dayjs().add(-6, "M"), dayjs()],
  },
  {
    label: "All Time",
    value: [dayjs("2022-12-08"), dayjs()],
  },
];

const DateRangePicker = ({ value, onDateSelect, unpresets }) => {
  const [isEnable, setIsEnable] = useState(false);
  const [selectedRange, setSelectedRange] = useState(value);
  const dateFormat = "YYYY-MM-DD";

  const onRangeChange = (dates, dateStrings) => {
    if (dates) {
      setSelectedRange(dateStrings);
    } else {
      console.log("Clear");
    }
  };

  const onApply = () => {
    onDateSelect(selectedRange);
    setIsEnable(false);
  };

  return (
    <Space direction="vertical" size={12}>
      <RangePicker
        presets={unpresets ? [] : rangePresets}
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
              <Button type="primary" onClick={onApply}>
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
