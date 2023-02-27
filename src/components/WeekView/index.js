import React, { useState } from "react"
import { Table, Button, Modal, Input, Space, Typography } from "antd"
import { geekblue } from '@ant-design/colors' // Import Ant colors
import dayjs from "dayjs"

const { Text, Title } = Typography

const hours = [];
for (let hour = 0; hour < 24; hour++) {
  hours.push( dayjs().hour(hour).minute(0).format('HH:mm') );
}

const WeekView = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [modalContent, setModalContent] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedWeek, setSelectedWeek] = useState(dayjs().startOf('week')) // Create state to store the selected week's date
  const [data, setData] = useState(hours.map((time) => ({
    key: time,
    time,
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
    
})))
  const days = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ]

  const handleModalOk = () => {
    // Do something with the modal content, e.g. save to database
    const newData = [...data];
    const rowIndex = hours.indexOf(selectedTime);
    const colIndex = days.indexOf(selectedDay);
    newData[rowIndex][selectedDay.toLowerCase()] = modalContent;
    console.log("New data:", newData)
    setData(newData)
    console.log("Modal content:", modalContent);
    setModalVisible(false);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleAddClick = (time, day) => {
    setSelectedTime(time);
    setSelectedDay(day);
    setModalVisible(true);
  };

  const columns = [
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      render: (text) => <span>{text}</span>,
    },
    ...days.map((day, idx) => ({ // Loop through the days
      title: (
          <Space direction="vertical">
              <Title 
                  level={2} 
                  style={{ 
                      margin: 0,
                      ...(selectedWeek.day(idx).format('DD-MM-YYYY') === dayjs().format('DD-MM-YYYY') && { 
                          color: '#FFFFFF', 
                          backgroundColor: geekblue[6], 
                          padding: '2px 8px', 
                          borderRadius: 100 
                      }),
                  }}
              >
                  {selectedWeek.day(idx).date()}
              </Title>
              <Text 
                  type="secondary" 
                  style={{ 
                      ...(selectedWeek.day(idx).format('DD-MM-YYYY') === dayjs().format('DD-MM-YYYY') && { 
                          color: geekblue[6], 
                          fontWeight: 'bold',
                          }),
                  }}
              >
                  {day}
              </Text>
          </Space>
      ),
      dataIndex: day.toLowerCase(),
      key: idx,
      width: 200,
      align: 'center',
      render: (text, record) => (
        <Button onClick={() => handleAddClick(record.time, day)}>
          {text}
        </Button>
      ),
    })),
    /* {
      title: "Monday",
      dataIndex: "monday",
      key: "monday",
      render: (text, record) => (
        <Button onClick={() => handleAddClick(record.time, "monday")}>
          {text}
        </Button>
      ),
    },
    {
      title: "Tuesday",
      dataIndex: "tuesday",
      key: "tuesday",
      render: (_, record) => (
        <Button onClick={() => handleAddClick(record.time, "tuesday")}>
          Add Component
        </Button>
      ),
    },
    {
      title: "Wednesday",
      dataIndex: "wednesday",
      key: "wednesday",
      render: (_, record) => (
        <Button onClick={() => handleAddClick(record.time, "wednesday")}>
          Add Component
        </Button>
      ),
    },
    {
      title: "Thursday",
      dataIndex: "thursday",
      key: "thursday",
      render: (_, record) => (
        <Button onClick={() => handleAddClick(record.time, "thursday")}>
          Add Component
        </Button>
      ),
    },
    {
      title: "Friday",
      dataIndex: "friday",
      key: "friday",
      render: (_, record) => (
        <Button onClick={() => handleAddClick(record.time, "friday")}>
          Add Component
        </Button>
      ),
    },
    {
      title: "Saturday",
      dataIndex: "saturday",
      key: "saturday",
      render: (_, record) => (
        <Button onClick={() => handleAddClick(record.time, "saturday")}>
          Add Component
        </Button>
      ),
    },
    {
      title: "Sunday",
      dataIndex: "sunday",
      key: "sunday",
      render: (_, record) => (
        <Button onClick={() => handleAddClick(record.time, "sunday")}>
          Add Component
        </Button>
      ),
    }, */
  ];


 /*  const data = hours.map((hour) => ({
    key: hour.key.toString(),
    time: hour.time,
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
})); */

return (
<>
<Table
     columns={columns}
     dataSource={data}
     pagination={false}
     bordered
     size="small"
   />
{modalVisible && (
<Modal
title={`Add component for ${selectedTime} on ${selectedDay}`}
open={modalVisible}
onOk={handleModalOk}
onCancel={handleModalCancel}
>
<p>Selected time: {selectedTime}</p>
<p>Selected day: {selectedDay}</p>
<Input
placeholder="Enter component content"
onChange={(e) => setModalContent(e.target.value)}
value={modalContent}
/>
</Modal>
)}
</>
);
};

export default WeekView;