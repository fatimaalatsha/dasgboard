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

//import pages 
import DriverReviews from "../DriverReviews";


import Rides from "../Rides";

const { Title, Text } = Typography;
//get the papams that will be passed to filters through qs
  const getUserParams = (params) => ({ // Get table params
    limit: params.pagination?.pageSize,
    page: params.pagination?.current,
    ...params,
})


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
            <Rides name="Last Rides" driverId={id} />
          </Space>
        }
      />
    </Card>
  );
};

export default AutofleetDriversDetails;
