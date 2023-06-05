import React, { useState, useEffect } from "react";
import useNewFetch from "../../hooks/use-new-fetch";
import qs from 'qs' // Import qs library
import { Typography, Table, Tag, Modal, Button, Space, message } from "antd";
import { UserOutlined, SolutionOutlined, IdcardOutlined, EnvironmentOutlined } from '@ant-design/icons';
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
    console.log(data);
    console.log(vendorId);
    

    const columns = [   
        {
            title: "Driver ID",
            dataIndex: "id",
            key: "id",           
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
            render: (status) => (<Tag color={status === "online" ? "green" : (status === "stand-by" ? "gold" : "red")}>{status}</Tag>),
        },
        {
            title: "Adress",
            dataIndex: "address",
            key: "address",
        },
    ]
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
  

    // fiund one driver by id
    const findDriver = (id) => {
        const driver = data.data.find((driver) => driver.id === id);
        console.log(driver);
        setDriver(driver);
        return driver;
    }
    const updateText = async (value) => {
        console.log(value);
        const  idValue = value.vendor_id;
        const updated = await updateVendorId(driver.driver_id, idValue);
        if (updated) {
            console.log(updated);
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
      <>
        <Typography.Title level={2}>Autofleet Drivers</Typography.Title>
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
            console.log(values);
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
              style={{ top: 200 , width: "100%", maxWidth: "500px", margin: "0 auto", left: "0", right: "0" }}
              open={open}
              onCancel={() => setOpen(false)}
              footer={[
                <Button key="cancel" onClick={() => setOpen(false)}>
                  Cancel
                </Button>,
                <SubmitWrapper key="submit" type="primary">
                  update Driver Vendor ID
                </SubmitWrapper>,
              ]}
            >
              <Space
                direction="vertical"
                style={{ width: "100%", fontSize: "16px" }}
              >
                <Text strong>
                  <UserOutlined style={{ color: "blue" }} /> Driver ID:{" "}
                  {driver.id}
                </Text>
                <Text strong>
                  <SolutionOutlined style={{ color: "blue" }} /> Full Name:{" "}
                  {driver.first_name} {driver.last_name}
                </Text> 
                <Text strong>
                  <EnvironmentOutlined style={{ color: "blue" }} /> Address:{" "}
                  {driver.address}
                </Text>
                  <Text strong>
                    <IdcardOutlined style={{ color: "blue" }} /> Vendor ID:{" "}
                  </Text>
                  <SelectWrapper
                    name="vendor_id"
                    datasource={vendorId}
                    placeholder={driver.vendor_id}
                  />               
              </Space>
            </Modal>
          </Form>
        </Formik>
      </>
    );
}

export default AutofleetDrivers