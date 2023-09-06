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
import qs from "qs"; // Import qs library


const { Title, Text } = Typography;

//get the papams that will be passed to filters through qs
  const getUserParams = (params) => ({ // Get table params
    limit: params.pagination?.pageSize,
    page: params.pagination?.current,
    ...params,
})

const Test = () => {
  const { data, error, isLoading, refetch } = useNewFetch(`/v1/bonuses`);
  console.log(data);
  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {data && <p>{JSON.stringify(data)}</p>}
      <button onClick={() => refetch()}>Refetch</button>
    </div>
  );
};


const DriverReviews = ({ driverId }) => {

  const [params, setParams] = useState({}); // Set params state

  const [expandedRowKey, setExpandedRowKey] = useState(null); // Track the row key

  const { data, loading, error } = useNewFetch(
    `/v1/active-drivers/${driverId}/reviews?${qs.stringify(
      // Pass the params to the query string
      getUserParams(params)
    )}` 
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
        pagination={{
          total: data?.meta?.total_items,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} reviews`,
          
        }}
        onChange={(pagination, filters, sorter) => {
          // Update the params when the table state changes
          setParams({
            ...params,
            pagination: {
              current: pagination.current,
              pageSize: pagination.pageSize,
              limit: pagination.pageSize,
            },
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters,
          });
        }}
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

  const [params, setParams] = useState({}); // Set params state
  const [expandedRowKey, setExpandedRowKey] = useState(null); // Track the row key

  const { data, loading, error } = useNewFetch(`/v1/rides/drivers/${driverId}?${qs.stringify(getUserParams(params))}`);

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
      title: "Total Price",
      dataIndex: "total_price",
      key: "total_price",
      render: (total_price) => (
        <Text>{total_price ? `${total_price} CAD` : ""}</Text>
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
        pagination={{
          total: data?.meta?.total_items,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} rides`,
        }}
        onChange={(pagination, filters, sorter) => {
          // Update the params when the table state changes
          setParams({
            ...params,
            pagination: {
              current: pagination.current,
              pageSize: pagination.pageSize,
              limit: pagination.pageSize,
            },
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters,
          });
        }}
        rowKey="ride_id"
        expandable={{
          expandedRowKeys: [expandedRowKey], // Specify the currently expanded row key
          onExpand: (expanded, record) => handleRowExpand(record), // Handle row expansion
          expandedRowRender: (record) => (
            <>
              <Space direction="horizontal" size="large">
                <Space direction="vertical">
                  <Tag
                    color={record.status === "completed" ? "green" : "red"}
                    className="large-badge"
                  >
                    {" "}
                    {record.status}{" "}
                  </Tag>
                  {record.rating ? (
                    <Rate disabled defaultValue={record.rating} />
                  ) : null}
                </Space>
                <Space direction="vertical">
                  <Descriptions
                    labelStyle={{ fontWeight: "bold" }}
                    column={2}
                    style={{ columnGap: "40px" }}
                  >
                    <Descriptions.Item label="Ride ID ">
                      <Text>{record.ride_id}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Passenger ID ">
                      <Text>{record.passenger_id}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Price">
                      <Text>{record.total_price} CAD</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Driver Earnings">
                      <Text>{record.driver_earnings} CAD</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Pickup Date ">
                      <Text>
                        {record.pickup_completed_at
                          ? `${record.pickup_completed_at.split("T")[0]} ${
                              record.pickup_completed_at
                                .split("T")[1]
                                .split(".")[0]
                            }`
                          : ""}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Pickup Location">
                      <Text>{record.pickup_description}</Text>
                    </Descriptions.Item>
                  
                    <Descriptions.Item label="Drop Off Date ">
                      <Text>
                        {record.dropoff_completed_at
                          ? `${record.dropoff_completed_at.split("T")[0]} ${
                              record.dropoff_completed_at
                                .split("T")[1]
                                .split(".")[0]
                            }`
                          : ""}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Drop Off ">
                      <Text>{record.dropoff_description}</Text>
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
              </Descriptions.Item>
              <Descriptions.Item label="Last Name">
                <Text>{data.last_name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                <Text>{data.phone}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Licence Number">
                <Text>{data.external_id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Licence Type">
                <Text>{data.license_type_id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Vehicle Class">
                <Text>{data.vehicle_class}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="City">
                <Text>{data.city?.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Vender">
                <Text name="vendor">{data.vendor?.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                <Text name="reviewed_at">{data.updated_at?.split("T")[0]}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Last Completed Ride">
                <Text name="created_at">
                  {data.last_ride_completed_at?.split("T")[0]}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                <Text>{data.address}</Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left"> Reviews </Divider>
            <DriverReviews name="Review" driverId={id} />
            <Divider orientation="left"> Rides </Divider>
            <LastRides name="Last Rides" driverId={id} />
            <Divider orientation="left"> Bonuses </Divider>
            <Test />
          </Space>
        }
      />
    </Card>
  );
};

export default AutofleetDriversDetails;
