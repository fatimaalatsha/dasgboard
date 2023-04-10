import { useState } from "react";
import {
  Typography,
  Card,
  Space,
  DatePicker,
  Button,
  Tooltip,
  Result,
  Row,
  Col,
  Divider,
} from "antd";
import useNewFetch from "../../hooks/use-new-fetch";
import qs from "qs";
import dayjs from "dayjs";

import { EditOutlined } from "@ant-design/icons";
import ChartColumn from "../../components/ChartColumn";
import CardStatistic from "../../components/CardStatistic";
const { Title, Text } = Typography;

const NumberOfLead = (dateFrom) => {
  const getUserParams = () => {
    const { date_from, date_to } = dateFrom;
    return qs.stringify(
      {
        date_from,
        date_to,
      },
      { skipNulls: true, arrayFormat: "comma" }
    );
  };

  const { data, error, isLoading } = useNewFetch(
    `/v1/reports/status-breakdown?${getUserParams()}`
  );

  const mapDataToObjects = (data) => {
    const { items } = data;
    const mappedData = [];

    // Loop over the status objects and data objects
    for (const statusObj of Object.values(items)) {
      if (typeof statusObj === "object" && statusObj.data) {
        for (const dataObj of statusObj.data) {
          mappedData.push({
            city: dataObj.city,
            status: statusObj.status,
            count: dataObj.count,
          });
        }
      } else {
        mappedData.push({
          city: statusObj.city,
          status: items.status,
          count: statusObj.count,
        });
      }
    }
    return mappedData;
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;

  return (
    <>
      <Divider orientation="left">
        {" "}
        Details of Ineligible Applicants from{" "}
        <Text strong>{dateFrom.date_from}</Text> to{" "}
        <Text strong>{dateFrom.date_to} </Text>{" "}
      </Divider>
      <ChartColumn
        props={mapDataToObjects(data)}
        xField="status"
        yField="count"
        seriesField="city"
      />
    </>
  );
};
const NumberOfLeads = () => {
  const [date, setDate] = useState({
    filter: {
      date_from: dayjs().subtract(90, "days").format("YYYY-MM-DD"),
      date_to: dayjs().format("YYYY-MM-DD"),
    },
  });

  const [isEnable, setIsEnable] = useState(false); // Set isEnable state
  const [dateset, setDateset] = useState("");
  const [showIneligible, setShowIneligible] = useState(false);
  const getUserParams = () => {
    const { date_from, date_to } = date.filter;
    return qs.stringify(
      {
        date_from,
        date_to,
      },
      { skipNulls: true, arrayFormat: "comma" }
    );
  };

  const { data, error, isLoading } = useNewFetch(
    `/v1/reports/drivers-status?${getUserParams()}`
  );
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;

  const countActive = (data) => {
    var total = 0;
    for (var i = 0; i < data.length; i++) {
      if (data[i].status === "Active") {
        total += data[i].count;
      }
    }
    return total;
  };

  const countAll = (data) => {
    var total = 0;
    for (var i = 0; i < data.length; i++) {
      total += data[i].count;
    }
    return total;
  };

  const conversionRateEligible = (data) => {
    var total = 0;
    for (var i = 0; i < data.length; i++) {
      if (data[i].status === "Active") {
        total += data[i].count;
      }
    }

    const eligible = countAll(data) - countIneligible(data);
    return ((total / eligible) * 100).toFixed(2);
  };

  const conversionRateAll = (data) => {
    var total = 0;
    for (var i = 0; i < data.length; i++) {
      if (data[i].status === "Active") {
        total += data[i].count;
      }
    }
    return ((total / countAll(data)) * 100).toFixed(2);
  };

  const countIneligible = (data) => {
    let total = 0;
    for (let i = 0; i < data.length; i++) {
      if (
        data[i].status.includes("Ineligible") ||
        data[i].status.includes("DNC")
      ) {
        total += data[i].count;
      }
    }
    return total;
  };

  const mapDataToObjects = (data) => {
    const { items } = data;
    const mappedData = [];

    // Loop over the status objects and data objects
    for (const statusObj of Object.values(items)) {
      if (typeof statusObj === "object" && statusObj.data) {
        for (const dataObj of statusObj.data) {
          mappedData.push({
            city: dataObj.city,
            status: statusObj.status,
            count: dataObj.count,
          });
        }
      } else {
        mappedData.push({
          city: statusObj.city,
          status: items.status,
          count: statusObj.count,
        });
      }
    }
    return mappedData;
  };

  if (data.total_items === 0) {
    return (
      <Card
        title={
          <Space direction="vertical" size="large">
            <Title level={3}>Number Of Leads By Application Status</Title>
          </Space>
        }
      >
        <Result
          status="warning"
          title="No data found for the selected date range"
          extra={<Text type="warning">Select another date range.</Text>}
        />
      </Card>
    );
  }
  return (
    <>
      <Card
        title={
          <Space
            direction="horizontal"
            size="large"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <Title level={3}> Number Of Leads By Application Status</Title>
            <Space align="start" direction="horizontal">
              <DatePicker.RangePicker
                open={isEnable}
                allowClear={true}
                inputReadOnly={true}
                size="small"
                showToday={false}
                bordered={true}
                onChange={(dates) => {
                  setDate({
                    filter: {
                      date_from: dates[0].format("YYYY-MM-DD"),
                      date_to: dates[1].format("YYYY-MM-DD"),
                    },
                  });
                }}
                renderExtraFooter={() => {
                  return (
                    <Space
                      direction="horizontal"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Button
                        type="primary"
                        onClick={() => {
                          setIsEnable(false);
                          setDateset(getUserParams(date.filter.date_from));
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => {
                          setIsEnable(false);
                        }}
                      >
                        {" "}
                        OK{" "}
                      </Button>
                    </Space>
                  );
                }}
              />
              <Tooltip title="Select Range">
                <Button
                  style={{ padding: 0, height: "auto" }}
                  onClick={() => setIsEnable(true)}
                  type="link"
                  icon={<EditOutlined />}
                />
              </Tooltip>
            </Space>
          </Space>
        }
      >
        <Row align="middle">
          <Col span={24}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Space
                direction="horizontal"
                size="small"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CardStatistic
                  title="Total Applicants"
                  width={160}
                  height={120}
                  padding={5}
                  value={countAll(mapDataToObjects(data))}
                  color="#3f8600"
                  popInfo="Total Number of leads shown"
                />
                <CardStatistic
                  title="Active"
                  width={160}
                  height={120}
                  padding={5}
                  value={countActive(mapDataToObjects(data))}
                  color="#3f8600"
                  popInfo={` Number of Activated drivers in the selected period`}
                />
                <CardStatistic
                  title="Awaiting "
                  width={160}
                  height={120}
                  padding={5}
                  value={
                    countAll(mapDataToObjects(data)) -
                    countActive(mapDataToObjects(data)) -
                    countIneligible(mapDataToObjects(data))
                  }
                  color="#1307f5"
                  popInfo="In the process to be activated"
                />
                <CardStatistic
                  title="Ineligible"
                  width={160}
                  height={120}
                  padding={5}
                  value={countIneligible(mapDataToObjects(data))}
                  color="#f50707"
                  popInfo="Number of drivers that are not eligible to be activated & DNC"
                />
                <CardStatistic
                  title="Conversion Rate Total"
                  width={180}
                  height={120}
                  value={conversionRateAll(mapDataToObjects(data)) + "%"}
                  color="#3f8600"
                  popInfo="Total Conversion Rate across all cities"
                />
                <CardStatistic
                  title="Conversion Rate Eligible"
                  width={180}
                  height={120}
                  value={conversionRateEligible(mapDataToObjects(data)) + "%"}
                  color="#3f8600"
                  popInfo="Eligible Conversion Rate across all cities"
                />
              </Space>
              <Divider orientation="left" plain>
                <Text>
                  {" "}
                  Number Of Leads Per City from{" "}
                  <Text strong>{date.filter.date_from}</Text> to{" "}
                  <Text strong>{date.filter.date_to} </Text>
                </Text>
              </Divider>
              <div style={{ height: "700px" }}>
                <ChartColumn
                  props={mapDataToObjects(data)}
                  xField="status"
                  yField="count"
                  seriesField="city"
                  onReady={(plot) => {
                    plot.on("plot:click", (evt) => {
                      const { data } = evt;
                      data && data.data.status === "Ineligible"
                        ? setShowIneligible(true)
                        : setShowIneligible(false);
                    });
                  }}
                />
              </div>
              {showIneligible && (
                <NumberOfLead
                  date_from={date.filter.date_from}
                  date_to={date.filter.date_to}
                />
              )}
            </Space>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default NumberOfLeads;
