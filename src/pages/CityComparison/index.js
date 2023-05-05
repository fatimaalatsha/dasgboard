import { useState } from "react";
import {
  Typography,
  Card,
  Space,
  Result,
  Row,
  Col,
  Divider,
  Select,
} from "antd";
import useNewFetch from "../../hooks/use-new-fetch";
import dayjs from "dayjs";
import qs from "qs";

import ChartLine from "../../components/ChartLine";
import DateRangePicker from "../../components/DateRangePicker";
const { Title, Text } = Typography;





const CityComparison = () => {

const [selectedDateRange, setSelectedDateRange] = useState({
  date_from: dayjs("2022-12-08").format("YYYY-MM-DD"),
  date_to: dayjs().format("YYYY-MM-DD"),
});
  const handleDateSelect = (dateRange) => {
    setSelectedDateRange({
      date_from: dayjs(dateRange[0]).format("YYYY-MM-DD"),
      date_to: dayjs(dateRange[1]).format("YYYY-MM-DD"),
    });
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

  const { data, error, isLoading } = useNewFetch(`/v1/reports/applicants-historical?${getUserParams()}`);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;

  // map over data and return an array of objects with date, count, and city
  const transformData = (data) => {
    const transformedData = data.items.flatMap((item) => {
      const city = item.name.toLowerCase();
      return item.data.map((d) => ({
        date: d.day,
        count: d.count,
        city,
      }));
    });
    // find earliest and latest date
    const earliestDate = new Date(
      Math.min(...transformedData.map((d) => new Date(d.date)))
    );
    // find latest date
    const latestDate = new Date(
      Math.max(...transformedData.map((d) => new Date(d.date)))
    );
    
    // add missing dates and assign count of 0
    const addMissingDates = (transformedData, earliestDate, latestDate) => {
      return data.items.flatMap((item) => {
        const city = item.name.toLowerCase();
        const dates = transformedData
          .filter((d) => d.city === city)
          .map((d) => d.date);
        return Array.from(
          { length: (latestDate - earliestDate) / (24 * 60 * 60 * 1000) + 1 },
          (_, i) => {
            const date = new Date(
              earliestDate.getTime() + i * 24 * 60 * 60 * 1000
            );
            const dateString = date.toISOString().substring(0, 10);
            if (dates.includes(dateString)) {
              return null;
            }
            return {
              date: dateString,
              count: 0,
              city,
            };
          }
        ).filter(Boolean);
      });
    };
// combine transformed data and missing dates 
    const missingDates = addMissingDates(
      transformedData,
      earliestDate,
      latestDate
    );
// order data by date
    const orderedData = [...transformedData, ...missingDates].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    return orderedData;
  };

  



  if (data.total === 0) {
    return (
      <>
        <Space direction="vertical" size="large" style={{ width: "100%", alignItems: 'center' }}>
          <Title level={3}> Driver Application Comparison Per City </Title>
            <Result
              status="404"
              title="No Data Found"
              subTitle="Sorry, there is no data for your selected date range. Please try again
              with a different date range"
            />
          <DateRangePicker vlue={selectedDateRange} onDateSelect={handleDateSelect} />
        </Space>
      </>
    );
  }
   
  return (
    <Card
      title={
        <Space
          direction="horizontal"
          size="large"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <Title level={3}> Driver Application Comparison Per City </Title>
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
            <Divider orientation="left" plain>
              Number Of Leads from Across All Cities
              <Text strong> {selectedDateRange.date_from} </Text> to
              <Text strong> {selectedDateRange.date_to} </Text>
            </Divider>
            <ChartLine
              props={transformData(data)}
              xField="date"
              yField="count"
              seriesField="city"
            />
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default CityComparison;
