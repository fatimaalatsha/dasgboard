import useNewFetch from "../../hooks/use-new-fetch";

import { Card, Space, Typography, Avatar, Tag, Descriptions, Row, Col } from "antd";
import { UserOutlined } from "@ant-design/icons";
import EditableText from "../../components/EditableText";

const AutofleetDriversDetails = () => {

  const { Title, Text } = Typography;
  const { data, loading, error } = useNewFetch(`/v1/active-drivers/30c2cf46-a92c-4de6-8138-3913d70cb185`)
  console.log(data, loading, error)
   
  const isLoading = loading || !data;



  return (
    <Card title="Autofleet Drivers Details" style={{ width: "100%" }}>
      <Card.Meta
        ghost={false}
        // onBack={() => navigate(parentUrl)}
        title={
          <Space direction="vertical">
            <Space direction="horizontal">
              <Avatar size={64} icon={<UserOutlined />} />
              <Title level={4} style={{ marginTop: 0 }}>
                {`${data.first_name} ${data.last_name}`}
              </Title>
              <Tag color="green" style={{ marginLeft: 10 }}>
                {data.status}
              </Tag>
            </Space>
            <Space direction="horizontal" size={0}></Space>
            <Descriptions labelStyle={{ fontWeight: "bold" }}>
              <Descriptions.Item label="First Name">
                <EditableText
                  name="first_name"
                  value={data.first_name}
                  // updateCallback={updateText}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Last Name">
                <EditableText
                  name="last_name"
                  value={data.last_name}
                  // updateCallback={updateText}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <EditableText
                  name="email"
                  value={data.email}
                  // updateCallback={updateText}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                <EditableText name="phone" value={data.phone} copyable />
              </Descriptions.Item>
              <Descriptions.Item label="Licence Number">
                <EditableText
                  name="license_number"
                  value={data.license_number}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Licence Type">
                {/* <LicenseTypeFeeder name='license_type_id' province={data.city?.province_id} value={data.license?.name}  /> */}
                <EditableText
                  name="license_type_id"
                  value={data.license_type_id}
                />
              </Descriptions.Item>
              <Descriptions.Item label="City">
                {/* <SelectFeeder value={data.city?.name}  /> */}
                <EditableText name="city_id" value={data.city_id} />
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                <EditableText name="address" value={data.address} />
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {/* <EditableDate name='birth_date' value={data.birth_date}  /> */}
                <Text name="birth_date">{data.birth_date?.split("T")[0]}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="HST Number">
                <EditableText name="hst_number" value={data.hst_number} />
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {/* <EditableDate name='reviewed_at' value={data.reviewed_at.split('T')[0]} updateCallback={updateText} /> */}
                <Text name="reviewed_at">{data.updated_at?.split("T")[0]}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Application Date">
                <Text name="created_at">{data.created_at?.split("T")[0]}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Space>
        }
      />
    </Card>
  );
};

export default AutofleetDriversDetails;
