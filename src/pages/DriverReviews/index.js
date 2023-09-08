import React, { useState } from "react";
import { Table, Rate, Tag, Space, Typography, Descriptions } from "antd";
import useNewFetch from "../../hooks/use-new-fetch";
import qs from "qs";

const { Text } = Typography;

const getUserParams = (params) => ({
  // Get table params
  limit: params.pagination?.pageSize,
  page: params.pagination?.current,
  ...params,
});

const DriverReviews = ({ driverId }) => {
  const [params, setParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50"],
      position: ["bottomRight", "topRight"],
    },
    sort: {
      created_at: "desc",
    },
  }); // Set params state
    
  const [expandedRowKey, setExpandedRowKey] = useState(null); // Track the row key

  const { data, loading, error } = useNewFetch(
    `/v1/active-drivers/${driverId}/reviews?${qs.stringify(
      // Pass the params to the query string
      getUserParams(params)
    )}`
  );

  // on table change
  const handleTableChange = (pagination, filters, sorter) => {
    // Update the params when the table state changes
    setParams({
      ...params,
      pagination: {
        current: pagination.current,
        pageSize: pagination.pageSize,
        limit: pagination.pageSize,
        },
        sort: {
            [sorter.field]: sorter.order === "ascend" ? "asc" : "desc",
        },
      ...filters,
    });
  };

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
      sorter: true,
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
        pagination={params.pagination}
        onChange={handleTableChange}
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

export default DriverReviews;