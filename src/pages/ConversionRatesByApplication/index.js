import { useState, useEffect } from "react";
import {
  Typography,
  Card,
  Space,
  Result,
  Row,
  Col,
  Divider,
  Table,
} from "antd";
import useNewFetch from "../../hooks/use-new-fetch";
import qs from "qs";
import dayjs from "dayjs";

import ChartColumn from "../../components/ChartColumn";
import CardStatistic from "../../components/CardStatistic";
import DateRangePicker from "../../components/DateRangePicker";

const { Title, Text } = Typography;

const ConversionRatesByApplication = () => {

  const [selectedDateRange, setSelectedDateRange] = useState({
    date_from: dayjs().subtract(90, "days").format("YYYY-MM-DD"),
    date_to: dayjs().format("YYYY-MM-DD"),
  });
  const handleDateSelect = (dateRange) => {
    setSelectedDateRange(
      {
        date_from: dayjs(dateRange[0]).format("YYYY-MM-DD"),
        date_to: dayjs(dateRange[1]).format("YYYY-MM-DD"),
      }
    );
  };
  const getUserParams = () => {
    const { date_from, date_to } = selectedDateRange;
    return qs.stringify(
      {
        date_from,
        date_to,
      },
      { skipNulls: true, arrayFormat: "comma" }
    );
  };

  const { data, error, isLoading, refetch } = useNewFetch(
    `/v1/reports/conversion-rates?${getUserParams()}`
  );
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;

  const processData = (data) => {
    const result = [];

    // loop over the items array
    data.items.forEach((item) => {
      // create a new object for eligible users with the required properties
      const eligibleObj = {
        city: item.city,
        count: item.eligible_rate,
        status: "Eligible Rate",
      };

      // push the new object into the result array
      result.push(eligibleObj);

      // create a new object for active users with the required properties
      const activeObj = {
        city: item.city,
        count: item.total_rate,
        status: "Total Rate",
      };

      // push the new object into the result array
      result.push(activeObj);

      //order the result array by rate descending
      result.sort((a, b) => b.count - a.count);
    });
    return result;
  };

  if (data.total_items === 0) {
    return (
      <Card
        title={
          <Space direction="vertical" size="large">
            <Title level={3}>Conversion Rates By Application Date</Title>
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
            <Title level={3}>Conversion Rates By Application Date</Title>
            <Space align="start" direction="horizontal">
              <DateRangePicker
                value={selectedDateRange}
                onDateSelect={handleDateSelect}
              />
            </Space>
          </Space>
        }
      >
        <Row align="middle">
          <Col span={24}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Space
                direction="horizontal"
                size="large"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CardStatistic
                  title="Total Applicants"
                  value={data.meta.total_applicants}
                  color="#3f8600"
                  popInfo="Total Number of leads shown"
                  width={175}
                />
                <CardStatistic
                  title="Active"
                  value={data.meta.total_active}
                  color="#3f8600"
                  popInfo={` Number of Activated drivers in the selected period`}
                  width={175}
                />
                <CardStatistic
                  title="Eligible"
                  value={data.meta.total_eligible}
                  color="#f50707"
                  popInfo="Number of Eligible Drivers "
                  width={175}
                />
                <CardStatistic
                  title=" Active Rate Total"
                  fontSize={1.2}
                  value={data.meta.total_rate + "%"}
                  color="#3f8600"
                  popInfo="Total Conversion Rate across all cities"
                  width={175}
                />
                <CardStatistic
                  title=" Eligible Rate Total "
                  fontSize={1.2}
                  value={data.meta.eligible_rate + "%"}
                  color="#3f8600"
                  popInfo="Eligible Rate across all cities"
                  width={175}
                />
              </Space>
              <Divider orientation="left" plain>
                <Text>
                  {" "}
                  Eligible Rate and Total Rate from{" "}
                  <Text strong>{selectedDateRange.date_from}</Text> to{" "}
                  <Text strong>{selectedDateRange.date_to} </Text>
                </Text>
              </Divider>
              <div style={{ height: "700px" }}>
                <ChartColumn
                  props={processData(data)}
                  xField="city"
                  yField="count"
                  seriesField="status"
                  isGroup={true}
                  isStack={false}
                  label={{
                    position: "top",
                    style: {
                      fill: "#000",
                      opacity: 1,
                    },
                    content: (item) => {
                      return item.count ? `${item.count}%` : "";
                    },
                    rotate: false,
                    layout: [
                      { type: "interval-hide-overlap" },
                      { type: "adjust-color" },
                      { type: "interval-adjust-position" },
                      { type: "interval-rect-mask" },
                    ],
                  }}
                />
              </div>
            </Space>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Divider orientation="left" plain>
                <Text>
                  Eligible Rate and Active Rate Users from{" "}
                  <Text strong>{selectedDateRange.date_from}</Text> to{" "}
                  <Text strong>{selectedDateRange.date_to} </Text>per City{" "}
                </Text>
              </Divider>
              <Table
                dataSource={data.items}
                columns={[
                  {
                    title: "City",
                    dataIndex: "city",
                    key: "city",
                    render: (text) => <Text strong>{text}</Text>,
                  },
                  {
                    title: "Total Applicants",
                    dataIndex: "total",
                    key: "total",
                    render: (text) => <Text strong>{text}</Text>,
                  },
                  {
                    title: "Active",
                    dataIndex: "active",
                    key: "active",
                    render: (text) => <Text strong>{text}</Text>,
                  },
                  {
                    title: "Eligible",
                    dataIndex: "eligible",
                    key: "eligible",
                    render: (text) => <Text strong>{text}</Text>,
                  },
                  {
                    title: "Total Rate ",
                    dataIndex: "total_rate",
                    key: "total_rate",
                    render: (text) => <Text strong>{text}%</Text>,
                  },
                  {
                    title: "Eligible Rate ",
                    dataIndex: "eligible_rate",
                    key: "eligible_rate",
                    render: (text) => <Text strong>{text} %</Text>,
                  },
                ]}
              />
            </Space>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default ConversionRatesByApplication;
