import React, { useState } from "react";
import { Table, Button, Modal, Input } from "antd";
import dayjs from "dayjs";

const WeekView = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const handleModalOk = () => {
    // Do something with the modal content, e.g. save to database
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
      render: (text) => <span>{text.format("h:mm A")}</span>,
    },
    {
      title: "Monday",
      dataIndex: "monday",
      key: "monday",
      render: (_, record) => (
        <Button onClick={() => handleAddClick(record.time, "monday")}>
          Add Component
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
    },
  ];

  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push({ key: i, time: dayjs().hour(i).minute(0) });
  }

  const data = hours.map((hour) => ({
    key: hour.key.toString(),
    time: hour.time,
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
}));

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
title={`Add component for ${selectedTime.format( "h:mm A" )} on ${selectedDay}`}
visible={modalVisible}
onOk={handleModalOk}
onCancel={handleModalCancel}
>
<p>Selected time: {selectedTime.format("h:mm A")}</p>
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