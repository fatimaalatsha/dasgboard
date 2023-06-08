import React, { useState, useEffect } from "react";
import useNewFetch from "../../hooks/use-new-fetch";
import qs from 'qs' // Import qs library
import { Typography, Table, Tag, Modal, Button, Space, message, Avatar, Card } from "antd";
import { UserOutlined, SolutionOutlined, IdcardOutlined, EnvironmentOutlined, PhoneOutlined, HistoryOutlined } from '@ant-design/icons';
import SelectWrapper from "../../components/forms/SelectWrapper";
import SubmitWrapper from "../../components/forms/SubmitWrapper";
import { Formik, Form } from "formik";
import { updateVendorId, getVendorId } from "../../utils/driver-status";

  //get the papams that will be passed to filters through qs
  const getUserParams = (params) => ({ // Get table params
    limit: params.pagination?.pageSize,
    page: params.pagination?.current,
    ...params,
})
    
const AutofleetDrivers = () => {
const { Text } = Typography;
    const [open, setOpen] = useState(false);
    const [driver, setDriver] = useState({});
    const [vendorId, setVendorId] = useState([]);
    const { data, error, isLoading } = useNewFetch(`/v1/active-drivers?${qs.stringify(getUserParams)}`);

    const columns = [
      {
        title: "Driver ID",
        dataIndex: "id",
        key: "id",
        sorter: (a, b) => a.id - b.id,
      },
      {
        title: "First Name",
        dataIndex: "first_name",
        key: "first_name",
      },
      {
        title: "Last Name",
        dataIndex: "last_name",
        key: "last_name",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Tag
            color={
              status === "online"
                ? "green"
                : status === "stand-by"
                ? "gold"
                : "red"
            }
          >
            {status}
          </Tag>
        ),
      },
      {
        title: "Driver Licence",
        dataIndex: "external_id",
        key: "external_id",
      },
      {
        title: "Address",
        dataIndex: "address",
        key: "address",
      },
      // {
      //   title: "Vendor ID",
      //   dataIndex: "vendor_id",
      //   key: "vendor_id",
      // },
      // {
      //   title: 'Action',
      //   dataIndex: 'action',
      //   key: 'action',
      //   render: (text, record) => (
      //       <Space size="middle">
      //       {/* <Button type="primary" onClick={() => findDriver(record.id)}>View</Button> */}
      //       <Button type="primary" onClick={() => setOpen(true)}>Update Vendor Id</Button>
      //     </Space>
      //   ),
      // }
    ];
    //get vendor id list from api
    useEffect(() => {
        const getVendorIdList = async () => {
            const vendorIdList = await getVendorId();
            setVendorId(
                vendorIdList.map((vendor) => ({
                    name: vendor.name,
                    value: vendor.id,
                }))
            );
        }
        getVendorIdList();
    }, [])
  

    // find one driver by id
    const findDriver = (id) => {
        const driver = data.data.find((driver) => driver.id === id);
        setDriver(driver);
        return driver;
    }
    const updateText = async (value) => {
        const  idValue = value.vendor_id;
        const updated = await updateVendorId(driver.driver_id, idValue);
        if (updated) {
            message.success(updated.message);
            setDriver({ ...driver, vendor_id: value.vendor_id });
        }
        else {
            message.error("Something went wrong");
        }

    }
   
    isLoading && <p>Loading...</p>
    error && <p>{error}</p>
    return (

  <Card title={'Autofleet Drivers'} style={{ margin: 15 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>    
        <Table
          columns={columns}
          dataSource={data.data}
          loading={isLoading}
          rowKey="id"
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                setOpen(true);
                findDriver(record.id);
              },
            };
          }}
          pagination={{
            pageSize: data?.meta?.pagination?.limit,
            total: data?.meta?.pagination?.total,
            current: data?.meta?.pagination?.page,
          }}
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
                margin: "0 auto",
                left: "0",
                right: "0",
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
                {/* <Space
                  direction="vertical"
                  position="center"
                  style={{ width: "100%", fontSize: "16px", textAlign: "center" }}
                >
                  <Avatar
                    style={{
                      backgroundColor: "#87d068",
                      verticalAlign: "middle",
                    }}
                    size="large"
                    gap={4}
                  > 
                      <UserOutlined />
                  </Avatar>
                </Space> */}
                <Space
                  direction="vertical"
                  position="center"
                  style={{ width: "100%", fontSize: "16px", textAlign: "center" }}
                >
                      <Space>
                        <Text>
                          <SolutionOutlined style={{ color: "blue" }} /> Full Name:{" "}
                        </Text>
                        <Text strong>
                          { driver.first_name } { driver.last_name } 
                      
                      </Text>
                      <Tag color={driver.status === "online" ? "green" : (driver.status === "stand-by" ? "gold" : "red")}> {driver.status} </Tag>
                      {/* <Tag color = "blue"> {driver.rank} </Tag> */}
                                  </Space>
                                  {/* <Space>
                                      <Text>
                                          <PhoneOutlined style={{ color: "blue" }} /> Phone Number:{" "}
                                      </Text>
                                      <Text strong>{driver.phone}</Text>
                                  </Space> */}

                      {/* <Space>
                      <Text>
                        <EnvironmentOutlined style={{ color: "blue" }} /> Address:{" "}
                      </Text>
                      <Text strong>{driver.address}</Text>
                    </Space> */}
                    <Space>
                    <Text>
                      <IdcardOutlined style={{ color: "blue" }} /> Vendor ID:
                    </Text>
                      <Text strong> {driver.vendor_id}</Text>
                    </Space>
                    <Text>
                        <IdcardOutlined style={{ color: "blue" }} /> Select New Vendor ID:{" "}
                    </Text>
                        {/* <Text>
                        <HistoryOutlined  style={{ color: "blue" }} />
                          last update: {driver.updated_at}                                
                        </Text> */}
                    <SelectWrapper
                      name="vendor_id"
                      datasource={vendorId}
                      placeholder={driver.vendor_id}
                                />
              </Space>
            </Modal>
          </Form>
                </Formik>
            </Space>
      </Card>
    );
}

export default AutofleetDrivers