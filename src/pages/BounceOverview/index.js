import React, { useState } from "react";
import { Descriptions, Divider, Modal , Typography} from "antd";
import useFetch from "../../hooks/use-new-fetch";

const { Text } = Typography;
const BounceOverview = ({ bounceId, onCancel }) => {
  const { data, loading, error, refetch } = useFetch(`/v1/bonuses/${bounceId}`); // Fetch data from API if bounceId is not null
    
  return (
    <Modal open={!!bounceId} onCancel={onCancel} footer={null}>
      <Descriptions
        title={
          <Divider orientation="center">
           Bonus Overview
          </Divider>
        }
        layout="horizontal"
        column={1}
      >
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
      </Descriptions>
    </Modal>
  );
}

export default BounceOverview;