import React, { useState } from "react";
import { DatePicker, Space, Button } from "antd";

import dayjs from "dayjs";
const { RangePicker } = DatePicker;
const onChange = (date) => {
  if (date) {
    console.log("Date: ", date);
  } else {
    console.log("Clear");
  }
};
const onRangeChange = (dates, dateStrings) => {
  if (dates) {
    console.log("From: ", dates[0], ", to: ", dates[1]);
    console.log("From: ", dateStrings[0], ", to: ", dateStrings[1]);
  } else {
    console.log("Clear");
  }
};
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



const DateRangePicker = () => {

const [isEnable, setIsEnable] = useState(false);


    return(
         <Space direction="vertical" size={12}>
        <RangePicker presets={rangePresets} onChange={onRangeChange}
            renderExtraFooter={() => {
                return (
                  <Space
                    direction="horizontal"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      type="primary"
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
                      OK
                    </Button>
                  </Space>
                );
            }}

        />
  </Space>
    )
   
};
export default DateRangePicker;
