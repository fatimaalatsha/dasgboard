import useNewFetch from "../../hooks/use-new-fetch";
import React, { useState, useEffect } from "react";
import {
  Card,
  Space,
  Typography,
  Avatar,
  Tag,
  Descriptions,
  Divider,
  Rate,
  Table,
  Progress,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const DriverReviews = ({ driverId }) => {
  const [expandedRowKey, setExpandedRowKey] = useState(null); // Track the row key

  const { data, loading, error } = useNewFetch(
    `/v1/active-drivers/${driverId}/reviews`
  );

  const reviewToWords = (review) => {
    switch (review) {
      case 1:
        return "Very Bad";
      case 2:
        return "Bad";
      case 3:
        return "Average";
      case 4:
        return "Good";
      case 5:
        return "Excellent";
      default:
        return "No Rating";
    }
  };

  const columns = [
    {
      title: "Passenger",
      dataIndex: "passenger",
      key: "passenger",
    },
    // {
    //   title: "Ride Id",
    //   dataIndex: "ride_id",
    //   key: "ride_id",
    // },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => <Rate disabled defaultValue={rating} />,
    },
    {
      title: "Feedback",
      dataIndex: "feedback",
      key: "feedback",
      render: (feedback) => (
        <Text
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            ellipsis: true,
          }}
        >
          {feedback}
        </Text>
      ),
    },
  ];
  const handleRowExpand = (record) => {
    // Toggle the expanded row when a row is clicked
    setExpandedRowKey((prevExpandedKey) =>
      prevExpandedKey === record.ride_id ? null : record.ride_id
    );
  };

  return (
    <>
      <Table
        columns={columns}
        dataSource={data?.data}
        loading={loading}
        pagination={false}
        rowKey="ride_id"
        expandable={{
          expandedRowKeys: [expandedRowKey], // Specify the currently expanded row key
          onExpand: (expanded, record) => handleRowExpand(record), // Handle row expansion
          expandedRowRender: (record) => (
            <>
              <Space direction="horizontal" size="large">
                <Space direction="vertical">
                  <Rate disabled defaultValue={record.rating} />
                  <Tag
                    color={record.rating < 3 ? "red" : "green"}
                    style={{ marginLeft: 10 }}
                    className="large-badge"
                  >
                    {reviewToWords(record.rating)}
                  </Tag>
                </Space>

                <Space direction="vertical">
                  {/* <Descriptions labelStyle={{ fontWeight: "bold" }}>
              <Descriptions.Item label="First Name"> */}
                  <Descriptions labelStyle={{ fontWeight: "bold" }} column={1}>
                    <Descriptions.Item label="Feedback">
                      <Text
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          ellipsis: true,
                        }}
                      >
                        {record.feedback}{" "}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ride ID ">
                      <Text>{record.ride_id}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Passenger ID ">
                      <Text>{record.passenger_id}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Drop Off ">
                      <Text> {record.dropoff_completed_at?.split("T")[0]}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Creation Date ">
                      <Text> {record.creation_date?.split("T")[0]}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Updated ">
                      {/* make date more readable */}
                      <Text> {record.updated_at?.split("T")[0]}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Space>
              </Space>
            </>
          ),
          rowExpandable: () => true,
        }}
      />
    </>
  );
};

const LastRides = ({ driverId }) => {
  const [expandedRowKey, setExpandedRowKey] = useState(null); // Track the row key

  const { data, loading, error } = useNewFetch(`/v1/rides/drivers/${driverId}`);

  const columns = [
    {
      title: "Ride Id",
      dataIndex: "ride_id",
      key: "ride_id",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "completed" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Passenger ID",
      dataIndex: "passenger_id",
      key: "passenger_id",
    },
    {
      title: "Total Price",
      dataIndex: "total_price",
      key: "total_price",
      render: (total_price) => (
        <Text>{total_price ? `${total_price} CD` : ""}</Text>
      ),
    },
    {
      title: "Driver Earnings",
      dataIndex: "driver_earnings",
      key: "driver_earnings",
      render: (driver_earnings) => (
        <Text>{driver_earnings ? `${driver_earnings} CD` : ""}</Text>
      ),
    },
    {
      title: "Pickup",
      dataIndex: "pickup_description",
      key: "pickup_description",
      render: (pickup_description) => <Text>{pickup_description}</Text>,
    },
    {
      title: "Drop Off",
      dataIndex: "dropoff_description",
      key: "dropoff_description",
      render: (dropoff_description) => <Text>{dropoff_description}</Text>,
    },
    {
      title: "Pickup",
      dataIndex: "pickup_completed_at",
      key: "pickup_completed_at",
      //make date more readable and making the hour more clear
      render: (pickup_completed_at) => (
        <Text>
          {pickup_completed_at
            ? `${pickup_completed_at.split("T")[0]} ${
                pickup_completed_at.split("T")[1].split(".")[0]
              }`
            : ""}
        </Text>
      ),
    },
    {
      title: "Drop Off",
      dataIndex: "dropoff_completed_at",
      key: "dropoff_completed_at",
      //make date more readable and making the hour more clear
      render: (dropoff_completed_at) => (
        <Text>
          {dropoff_completed_at
            ? `${dropoff_completed_at.split("T")[0]} ${
                dropoff_completed_at.split("T")[1].split(".")[0]
              }`
            : ""}
        </Text>
      ),
    },
  ];
  return (
    <>
      <Table
        columns={columns}
        dataSource={data?.data}
        loading={loading}
        pagination={false}
        rowKey="ride_id"
      />
    </>
  );
};

const AutofleetDriversDetails = () => {
  //get the driver id from the url
  const { id } = useParams();
  const location = useLocation(); // Get current location
  const pathArray = location.pathname.split("/");
  pathArray.pop();
  const parentUrl = pathArray.join("/");

  const { data, loading, error } = useNewFetch(`/v1/active-drivers/${id}`);
  const isLoading = loading || !data;
  return (
    <Card title="Autofleet Drivers Details" style={{ width: "100%" }}>
      <Card.Meta
        title={
          <Space direction="vertical">
            <Space direction="horizontal">
              <Avatar size={64} icon={<UserOutlined />} />
              <Title level={4} style={{ marginTop: 0 }}>
                {`${data.first_name} ${data.last_name}`}
              </Title>
              <Tag
                color={data.status === "active" ? "green" : "red"}
                style={{ marginLeft: 10 }}
              >
                {data.status}
              </Tag>
            </Space>
            <Descriptions labelStyle={{ fontWeight: "bold" }}>
              <Descriptions.Item label="First Name">
                <Text>{data.first_name}</Text>
                {/* name="first_name"
                  value=
                  // updateCallback={updateText}
                /> */}
              </Descriptions.Item>
              <Descriptions.Item label="Last Name">
                {/* <EditableText
                  name="last_name"
                  value={data.last_name}
                  // updateCallback={updateText}
                /> */}
                <Text>{data.last_name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {/* <EditableText
                  name="email"
                  value={data.email}
                  // updateCallback={updateText}
                /> */}
                <Text>{data.email}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                {/* <EditableText name="phone" value={data.phone} copyable /> */}
                <Text>{data.phone}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Licence Number">
                {/* <EditableText
                  name="license_number"
                  value={data.license_number}
                /> */}
                <Text>{data.license_number}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Licence Type">
                {/* <LicenseTypeFeeder name='license_type_id' province={data.city?.province_id} value={data.license?.name}  /> */}
                {/* <EditableText
                  name="license_type_id"
                  value={data.license_type_id}
                /> */}
                <Text>{data.license_type_id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="City">
                {/* <SelectFeeder value={data.city?.name}  /> */}
                {/* <EditableText name="city_id" value={data.city_id} /> */}
                <Text>{data.city_id}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Date of Birth">
                {/* <EditableDate name='birth_date' value={data.birth_date}  /> */}
                <Text name="birth_date">{data.birth_date?.split("T")[0]}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Vender">
                <Text name="vendor">{data.vendor?.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {/* <EditableDate name='reviewed_at' value={data.reviewed_at.split('T')[0]} updateCallback={updateText} /> */}
                <Text name="reviewed_at">{data.updated_at?.split("T")[0]}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Application Date">
                <Text name="created_at">{data.created_at?.split("T")[0]}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {/* <EditableText name="address" value={data.address} /> */}
                <Text>{data.address}</Text>
              </Descriptions.Item>
            </Descriptions>
           
            <Divider orientation="left"> Reviews </Divider>
            <DriverReviews name="Review" driverId={id} />
            <Divider orientation="left"> Last 10 Rides </Divider>
            <LastRides name="Last Rides" driverId={id} />
          </Space>
        }
      />
    </Card>
  );
};

export default AutofleetDriversDetails;
