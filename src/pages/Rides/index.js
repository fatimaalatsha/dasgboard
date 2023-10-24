import React, { useState, useEffect,  } from "react";
import { Table, Tag, Space, Typography, Descriptions, Rate, Input, Button } from "antd";
import useNewFetch from "../../hooks/use-new-fetch";
import { useRef } from "react";
import qs from "qs";

import { useFilterStore } from "../../store"; // Import filter store

//get the papams that will be passed to filters through qs
const getUserParams = (params) => ({
  // Get table params
  limit: params.pagination?.pageSize,
  page: params.pagination?.current,
  ...params,
  
});

const { Text } = Typography;
const Rides = ({ driverId }) => {
    const ridesFilter = useFilterStore((state) => state.ridesFilter); // Get filter store
    const setRidesFilter = useFilterStore((state) => state.setRidesFilter); // Get filter store
    const [expandedRowKey, setExpandedRowKey] = useState(null); // Track the row key
    const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  
  const SearchOutlined = () => <i className="fas fa-search"></i>;
      const searchInput = useRef(null);
      const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
      };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex, placeholder) => ({
    // Search function
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={placeholder}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
    // Filter icon
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      // Filter function
      return record[dataIndex]
        ? record[dataIndex]
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
        : "";
    },
    onFilterDropdownVisibleChange: (visible) => {
      // Focus on the search input when the filter icon is clicked
      if (visible) {
        setTimeout(() => searchInput.current.select(), 100);
      }
    },
    render: (text) =>
      // don not Highlight the search text
      searchedColumn === dataIndex ? (
        <Text>{text}</Text>
      ) : (
        text
      ),
  });



    const { data, loading, error, refetch } = useNewFetch(`/v1/rides/drivers/${driverId}?${qs.stringify(getUserParams(ridesFilter), { skipNulls: true, arrayFormat: 'comma' })}`) // Fetch data from API//data
        const handleTableChange = (pagination, filter, sorter) => {// handle table change
        Object.keys(filter).forEach((key) => {
            if (filter[key]) {
                filter[key].unshift("in|" + filter[key][0]);
                filter[key].splice(1, 1);
            }
        });
        
        setRidesFilter({
            // Set filter to store
            pagination: {
            ...ridesFilter.pagination,
            ...pagination,
            },
            filter: {
            ...filter,
            ...(filter.status === null && {
                status: ["in|completed", "canceled"],
            }),
            },
                ...(Object.keys(sorter).length !== 0 && {
                    sort: {
                        [sorter.field]: sorter.order === "ascend" ? "asc" : "desc",
                    },
            }),
                
            
        });
        };
  const handleRowExpand = (record) => {
    // Toggle the expanded row when a row is clicked
    setExpandedRowKey((prevExpandedKey) =>
      prevExpandedKey === record.ride_id ? null : record.ride_id
    );
    };
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
        align: "center",
        filters: [
          { text: "Completed", value: "completed" },
          { text: "Canceled", value: "canceled" },
        ],
        filteredValue: null,
        ...(ridesFilter.filter?.status && {
          filteredValue: ridesFilter.filter?.status.map((status) =>
            status.replace("in|", "")
          ),
        }),

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
        ellipsis: true,

      },
      {
        title: "Drop Off",
        dataIndex: "dropoff_description",
        key: "dropoff_description",
        render: (dropoff_description) => <Text>{dropoff_description}</Text>,
        ellipsis: true,
      },
      {
        title: "Completed At",
        dataIndex: "dropoff_completed_at",
        key: "dropoff_completed_at",
        sorter: true,
        align: "center",
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
    
    useEffect(() => {
      // Reset the pagination when the filters change
      let isMounted = true;
      setRidesFilter({
        pagination: {
          ...ridesFilter.pagination,
          total: data?.meta?.total_items,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} Rides`,
        },
      });
    //   if (isMounted) {
    //   }
      return () => {
        isMounted = false;
      };
    }, [data]);


  return (
    <>
      <Table
        columns={columns}
        dataSource={data?.data}
        tableLayout="fixed"
        loading={loading}
        pagination={ridesFilter.pagination}
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