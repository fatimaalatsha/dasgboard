import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Input,
  Typography,
  Table,
  Tag,
  Modal,
  Button,
  Space,
  message,
  Col,
  Row,
  Card,
  Tooltip,
} from "antd";
import {
  ReloadOutlined,
  SolutionOutlined,
  IdcardOutlined,
  EditOutlined,
  HomeOutlined,
} from "@ant-design/icons";

import useNewFetch from "../../hooks/use-new-fetch";

import qs from "qs"; // Import qs library
import { Formik, Form } from "formik";

import SelectWrapper from "../../components/forms/SelectWrapper";
import SubmitWrapper from "../../components/forms/SubmitWrapper";

import { getAutoFleetCities } from "../../utils/city-status";
import { updateVendorId, getVendorId } from "../../utils/driver-status";

import { useFilterStore } from "../../store"; // Import filter store

const { Text } = Typography;

//get the papams that will be passed to filters through qs
const getUserParams = (params) => ({
  // Get table params
  limit: params.pagination?.pageSize,
  page: params.pagination?.current,
  ...params,
});



const AutofleetDrivers = () => {
  const autofleetFilter = useFilterStore((state) => state.autofleetFilter); // Get filter from store
  const setAutofleetFilter = useFilterStore(
    (state) => state.setAutofleetFilter
  ); // Set filter to
  const [open, setOpen] = useState(false);
  const [driver, setDriver] = useState({});
  const [vendorId, setVendorId] = useState([]);
  const [searchText, setSearchText] = useState(autofleetFilter.full_name || "");
  const [cities, setCities] = useState([]);

  const navigate = useNavigate();
  // fetch vendor id list from API
  const getVendorIdList = async () => {
    const vendorIdList = await getVendorId();
    setVendorId(
      vendorIdList.map((vendor) => ({
        name: vendor.name,
        value: vendor.id,
      }))
    );
  };

  // load cities from API
  const loadCities = async () => {
    await getAutoFleetCities().then((response) => {
      setCities(response);
    });
  };

  const { data, error, isLoading, refetch } = useNewFetch(
    `/v1/active-drivers?${qs.stringify(getUserParams(autofleetFilter), {
      skipNulls: true,
      arrayFormat: "comma",
    })}`
  );

  const handleTableChange = (pagination, filter, sorter) => {
    // Handle table change
    Object.keys(filter).forEach((key) => {
      if (filter[key] && key !== "city_id") {
        filter[key].unshift("in|" + filter[key][0]);
        filter[key].splice(1, 1);
      }
    });
  
    setAutofleetFilter({
      // Set filter to store
      pagination: {
        ...autofleetFilter.pagination,
        ...pagination,
      },
      filter: {
        ...filter,
        // ...(filter.status === null && { status: ["in|onboard", "pending"] }),
        ...(filter.application_status &&
          filter.application_status[0] === "in|null" && {
            application_status: ["is|null"],
          }),
        city_id: null,
      },
      city_id: filter.city_id,
      ...(Object.keys(sorter).length !== 0 && {
        sort: {
          [`${sorter.columnKey === "city_id" ? "city.name" : sorter.columnKey}`]:
            sorter.order === "ascend" ? "asc" : "desc",
        },
      }),
    });
  };
  const handleSearch = (selectedKeys) => {
    const regex = /^(?:\s|[\d]|\W)+$/g;
    const found = selectedKeys ? selectedKeys[0]?.match(regex) : null; // Check if search value is a number or space
    setAutofleetFilter({
      query: selectedKeys && !found ? selectedKeys[0] : null,
      pagination: {
        ...autofleetFilter.pagination,
        current: 1,
      },
    });
    selectedKeys ?? setSearchText("");
  };

  const columns = [
    {
      title: "Driver ID",
      dataIndex: "id",
      key: "id",
      sorter: true,
      align: "center",
      ...(autofleetFilter.sort?.user_id && {
        defaultSort:
          autofleetFilter.sort?.user_id === "ascend" ? "desc" : "asc",
      }),
      filteredValue: null,
    },
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
      sorter: true,
      filteredValue: null,
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
      filteredValue: null,
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city_id",
      sorter: true,
      align: "center",
      filters: cities,
      filterSearch: true,
      ...(autofleetFilter.order && {
        defaultSortOrder: autofleetFilter.order === "asc" ? "ASC" : "DESC",
      }),
      filteredValue: autofleetFilter.city_id ? autofleetFilter.city_id : null,
      ...(autofleetFilter.city_id && {
        filteredValue: autofleetFilter?.city_id,
      }),
    },
    {
      title: "Driver Licence",
      dataIndex: "external_id",
      key: "external_id",
      align: "center",
    },

    {
      title: "Vendor",
      dataIndex: "vendor",
      key: "vendor",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Stand-by", value: "stand-by" },
        { text: "Activating", value: "activating" },
        { text: "Offline", value: "offline" },
        { text: "Active", value: "active" },
      ],

      ...(autofleetFilter.filter?.status && {
        defaultFilteredValue: autofleetFilter.filter?.status.map((status) =>
          status.replace("in|", "")
        ),
      }),
      ...(autofleetFilter.filter?.status && {
        filteredValue: autofleetFilter.filter?.status.map((status) =>
          status.replace("in|", "")
        ),
      }),
      render: (status) => (
        <Tag
          color={
            status === "online"
              ? "green"
              : status === "stand-by"
              ? "gold"
              : status === "activating"
              ? "blue"
              : status === "offline"
              ? "volcano"
              : status === "active"
              ? "green"
              : "default"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "View Details",
      dataIndex: "view",
      key: "view",
      align: "center",
      render: (text, record) => (
        <Button
          type="primary"
          ghost
          onClick={() => {
            navigate(`/autofleet_drivers/${record.driver_id}`);
          }}
        >
          View
        </Button>
      ),
    },
    {
      title: "Update Vendor",
      dataIndex: "vendor_id",
      key: "vendor_id",
      align: "center",
      render: (text, record) => (
        <Button
          type="primary"
          ghost
          onClick={() => {
            setOpen(true);
            findDriver(record.id);
          }}
        >
          Update
        </Button>
      ),
    },
  ];
  //get vendor id list from api
  useEffect(() => {
    let isMounted = true;
    setAutofleetFilter({
      pagination: {
        ...autofleetFilter.pagination,
        total: data?.meta?.total_items,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} Drivers`,
      },
    });
    if (isMounted) {
      getVendorIdList();      
      loadCities();
    }
    return () => {
      isMounted = false;
    };
  }, [data]);

  const refetchConfig = {
    icon: <ReloadOutlined />,
    onClick: () => refetch(),
    type: "primary",
    ghost: true,
    size: "large",
    style: {
      marginBottom: "16px",
    },
  };

  const searchConfig = {
    placeholder: "Search Full Name or Driver Licence",
    addonBefore: (
      <Button type="text" size="small" onClick={() => handleSearch(null)}>
        Clear
      </Button>
    ),
    value: searchText,
    type: "text",
    onChange: (e) => setSearchText(e.target.value ? [e.target.value] : []),
    onPressEnter: () => handleSearch(searchText),
    style: {
      marginBottom: 8,
      width: "calc(50% - 80px)",
    },
  };

  // find one driver by id
  const findDriver = (id) => {
    const driver = data.data.find((driver) => driver.id === id);
    setDriver(driver);
    return driver;
  };
  const updateText = async (value) => {
    const idValue = value.vendor_id;
    const updated = await updateVendorId(driver.driver_id, idValue);
    if (updated) {
      message.success(updated.message);
      refetch();
      setDriver({ ...driver, vendor_id: value.vendor_id });
    } else {
      message.error("Something went wrong");
    }
  };

  isLoading && <p>Loading...</p>;
  error && <p>{error}</p>;
  return (
    <Card title={"Autofleet Drivers"} style={{ margin: 15 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Tooltip title="Reload data">
          <Button {...refetchConfig} />
        </Tooltip>
        <Input.Group compact>
          <Input {...searchConfig} />
          <Button type="primary" onClick={() => handleSearch(searchText)}>
            Search
          </Button>
        </Input.Group>
        <Table
          columns={columns}
          dataSource={data.data}
          loading={isLoading}
          rowKey="id"
          pagination={autofleetFilter.pagination}
          onChange={handleTableChange}
        />
        <Formik
          initialValues={{ vendor_id: driver.vendor_id || "" }}
          onSubmit={async (values, actions) => {
            await updateText(values).then(() => {
              actions.resetForm();
              setOpen(false);
            });
          }}
        >
          <Form>
            <Modal
              title="Update Driver Vendor ID"
              destroyOnClose={true}
              style={{
                top: 200,
                width: "100%",
                maxWidth: "500px",
              }}
              open={open}
              onCancel={() => setOpen(false)}
              footer={[
                <Button key="cancel" onClick={() => setOpen(false)}>
                  Cancel
                </Button>,
                <SubmitWrapper key="submit" type="primary">
                  Update Driver Vendor ID
                </SubmitWrapper>,
              ]}
            >
              <Space
                direction="vertical"
                position="center"
                style={{
                  width: "100%",
                  fontSize: "16px",
                  textAlign: "center",
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <SolutionOutlined style={{ color: "blue" }} /> Full Name :{" "}
                  </Col>
                  <Col span={18}>
                    <Text strong>
                      {" "}
                      {driver.first_name} {driver.last_name}
                    </Text>
                  </Col>

                  <Col span={6}>
                    <Text>
                      <IdcardOutlined style={{ color: "blue" }} /> Vendor ID :
                    </Text>
                  </Col>
                  <Col span={18}>
                    <Text strong> {driver.vendor}</Text>
                  </Col>
                  <Col span={4}>
                    <Text>
                      <HomeOutlined style={{ color: "blue" }} /> City :
                    </Text>
                  </Col>
                  <Col span={18}>
                    <Text strong> {driver.city}</Text>
                  </Col>
                  <Col span={6}>
                    <Text>
                      <EditOutlined style={{ color: "blue" }} /> Edit vendor :
                    </Text>
                  </Col>
                  <Col span={18}>
                    <SelectWrapper
                      name="vendor_id"
                      datasource={vendorId}
                      placeholder={"Select New Vendor ID"}
                    />{" "}
                  </Col>
                </Row>
              </Space>
            </Modal>
          </Form>
        </Formik>
      </Space>
    </Card>
  );
};

export default AutofleetDrivers;
