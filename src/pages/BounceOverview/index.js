import React, { useState, useRef, useEffect } from "react";
import {
  Descriptions,
  Divider,
  Modal,
  Space,
  Typography,
  Card,
  Tag,
  Table,
  Button,
} from "antd";
import useFetch from "../../hooks/use-new-fetch";

import {getDriversWhoMetGoal} from "../../utils/finance-status";

const { Text, Title } = Typography;

// drivers who mit the goal component
const DriversWhoMetGoal = ({ bounceId, pagination }) => {
  const [drivers, setDrivers] = useState(); // Set drivers state
  
  //flat data
  const flatData = (data) => {
    return data.map((item) => {
      return {
        full_name: item.driver.full_name,
        is_achieved: item.is_achieved,
        paid: item.paid,
        paid_out_at: item.paid_out_at ? item.paid_out_at : "N/A",
        updated_at: item.updated_at,
        id: item.driver.user_id,
      };
    });
  };
  //get drivers
  const getDrivers = async () => {
    const data = await getDriversWhoMetGoal(bounceId, pagination);
    const flatDataArray = flatData(data);
    setDrivers(flatDataArray);
  };

  useEffect(() => {
    getDrivers();
  }
    , [bounceId, pagination]);

  const driversColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
  
    }, 

    {
      title: "Name",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Completed",
      dataIndex: "is_achieved",
      key: "is_achieved",
      align: "center",
      render: (is_achieved) => {
        return is_achieved === true ? (
          <Tag color="green">Yes</Tag>
        ) : (
          <Tag color="red">No</Tag>
        );
      },
    },
    {
      title: "Paid",
      dataIndex: "paid",
      key: "paid",
      align: "center",
      render: (paid) => {
        return paid === "Yes" ? (
          <Tag color="green">Yes</Tag>
        ) : (
          <Tag color="red">No</Tag>
        );
      },
    },
    {
      title: "Paid out at",
      dataIndex: "paid_out_at",
      key: "paid_out_at",
      align: "right",
      render: (paid_out_at) => {
        //if null return null
        if (paid_out_at === null) {
          return "NA";
        }
        return paid_out_at?.split("T")[0];
      },
    },
    {
      title: "Updated at",
      dataIndex: "updated_at",
      key: "updated_at",
      align: "right",
      render: (updated_at) => {
        return updated_at?.split("T")[0];
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (text, record) => (
        <Space size="middle">
          <Button type="primary" disabled>Edit</Button>
        </Space>
      ),
    },
  ];
  // set drivers
  //return table with the info
  return (
    <Table columns={driversColumns} dataSource={drivers} pagination={false} />
  );
};



 
const BounceOverview = ({ bounceId, onCancel }) => {
  const { data, loading, error, refetch } = useFetch(`/v1/bonuses/${bounceId}`); // Fetch data from API if bounceId is not null
  const [drivers, setDrivers] = useState([]); // Set drivers state
  const [BounceTab, setBounceTab] = useState(
    { navigation: { tab: "completed" } }
  ); // Set BounceTab state
  
  const tabList = [ // Get drivers
    {
      key: "completed",
      tab: "Completed",
    },
    {
      key: "all",
      tab: "All",
    }
  ];

  return (
    <Modal
      open={!!bounceId}
      onCancel={onCancel}
      width={1000}

      closable={false}
      footer={
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
        </Space>
      }
    >
      <Card
        title={"Bonus Overview"}
        loading={loading}
        extra={
          data?.status && (
            <Space>
              <Tag color={data?.status === "active" ? "green" : "red"}>
                {data?.status}
              </Tag>
            </Space>
          )
        }
      >
        <Descriptions layout="horizontal" column={2}>
          <Descriptions.Item label="Name">
            <Text strong> {data?.name} </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Cities">
            <Text strong>
              {" "}
              {data?.cities?.map((city) => city.name).join(", ")}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            <Text strong> {data?.type} </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Text strong>{data?.status}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Start Time">
            <Text strong> {data?.start_time} </Text>
          </Descriptions.Item>
          <Descriptions.Item label="End Time">
            <Text strong> {data?.end_time} </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Goal">
            <Text strong> {data?.goal} </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Payout">
            <Text strong> {data?.payout} </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Bonus Objective">
            <Text strong> {data?.objective} </Text>
          </Descriptions.Item>
        </Descriptions>
        <Divider orientation="center"></Divider>{" "}
        <Card
          title="Drivers"
          bordered={false}
          style={{ margin: 15 }}
          tabList={tabList}
          bodyStyle={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: 16,
          }}
          onTabChange={(key) => setBounceTab({ navigation: { tab: key } })}
          activeTabKey={BounceTab.navigation.tab}
        >
          {BounceTab.navigation.tab === "completed" && (
            <DriversWhoMetGoal bounceId={bounceId} pagination={false} />
          )}
          {BounceTab.navigation.tab === "all" && (
            <DriversWhoMetGoal bounceId={bounceId} pagination={ true } />
          )}
        </Card>
      </Card>
    </Modal>
  );
}


export default BounceOverview;