import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Typography, Descriptions, Rate } from "antd";
import useNewFetch from "../../hooks/use-new-fetch";
import qs from "qs";


//get the papams that will be passed to filters through qs
const getUserParams = (params) => ({
  // Get table params
  limit: params.pagination?.pageSize,
  page: params.pagination?.current,
  ...params,
  
});

const { Text } = Typography;

const Rides = ({ driverId }) => {
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
        filter: {
            status: ["in|completed", "cancelled"],
        }, 
  }); // Set params state
  const [expandedRowKey, setExpandedRowKey] = useState(null); // Track the row key

  const { data, loading, error } = useNewFetch(
    `/v1/rides/drivers/${driverId}?${qs.stringify(getUserParams(params))}`
    );
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
    {
      title: "Completed At",
      dataIndex: "dropoff_completed_at",
      key: "dropoff_completed_at",
      sorter: true,
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
    
    // handle table change
    const handleTableChange = (pagination, filters, sorter) => {
        // Update the params when the table state changes
        setParams({
            ...params,
            pagination: {
                current: pagination.current,
                pageSize: pagination.pageSize,
                limit: pagination.pageSize,

            },
            

            ...filters,
        });
    };

  const handleRowExpand = (record) => {
    // Toggle the expanded row when a row is clicked
    setExpandedRowKey((prevExpandedKey) =>
      prevExpandedKey === record.ride_id ? null : record.ride_id
    );
  };
// {
//           total: data?.meta?.total_items,
//           showSizeChanger: true,
//           pageSizeOptions: ["10", "20", "50"],
//           showTotal: (total, range) =>
//             `${range[0]}-${range[1]} of ${total} rides`,
    //         }
    // (pagination, filters, sorter) => {
    //       // Update the params when the table state changes
    //       setParams({
    //         ...params,
    //         pagination: {
    //           current: pagination.current,
    //           pageSize: pagination.pageSize,
    //           limit: pagination.pageSize,
    //         },
    //         sortField: sorter.field,
    //         sortOrder: sorter.order,
    //         ...filters,
    //       });
    //     }
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

export default Rides;