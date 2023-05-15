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
  Modal,
  Button,
  Radio,
} from "antd";
import useNewFetch from "../../hooks/use-new-fetch";
import dayjs from "dayjs";
import qs from "qs";

import ChartLine from "../../components/ChartLine";
import DateRangePicker from "../../components/DateRangePicker";
const { Title, Text } = Typography;

const { Option } = Select;

const CityComparison = () => {
  const [cityId1, setCityId1] = useState([]);
  const [cityDateFrom1, setCityDateFrom1] = useState([]);
  const [cityId2, setCityId2] = useState([]);
  const [cityDateFrom2, setCityDateFrom2] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [date, setDate] = useState();
  const [open, setOpen] = useState(true);
  const { data, error, isLoading } = useNewFetch(`/v1/cities`);
  console.log(data);
  console.log(data.data);
  console.log(date)

  const options = data?.data?.map((item) => ({
    label: item.name,
    value: item.id,
    launch_date: item.launch_date ? item.launch_date : "2021-12-08",
  }));

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;
  return (
    <>
      <Modal
        title="Select City"
        open={open}
        onOk={() => {
          setOpen(false);
          setShowReport(true);
          console.log(cityId1);
          console.log(cityId2);
          console.log(date);
        }}
        okText="Generate Report"
        onCancel={() => {
          setOpen(false);
        }}
      >
        <Divider />
        <Select
          style={{ width: "100%" }}
          placeholder="Please select"
          onChange={(value, date) => {
            setCityId1(value);
            setCityDateFrom1(date);
          }}
          options={options}
        ></Select>
        <Divider />
        <Select
          style={{ width: "100%" }}
          placeholder="Please select"
          onChange={(value, date) => {
            setCityId2(value);
            setCityDateFrom2(date);
          }}
          options={options}
        ></Select>
        <Radio.Group onChange={(e) => {setDate(e.target.value)}} >
          <Radio value={30} >30 Days</Radio>
          <Radio value={60}>First 60 Days</Radio>
          <Radio value={90}>First 90 Days</Radio>
          <Radio value={6}>First 6 Months</Radio>
          <Radio value={1}>All Time</Radio>
        </Radio.Group>
      </Modal>
      {showReport && (
        <CitySelection cityData1={cityDateFrom1} cityData2={cityDateFrom2} dateTo={date} />
      )}
    </>
  );
};


const CitySelection = (city1) => {
  console.log(city1);
  console.log(city1.dateTo);

  const endDate = (data) => {
    if (data === 30) {
      return dayjs(city1.cityData1.launch_date)
        .add(30, "day")
        .format("YYYY-MM-DD");
    } else if (data === 60) {
      return dayjs(city1.cityData1.launch_date)
        .add(60, "day")
        .format("YYYY-MM-DD");
    } else if (data === 90) {
      return dayjs(city1.cityData1.launch_date)
        .add(90, "day")
        .format("YYYY-MM-DD");
    } else if (data === 6) {
      return dayjs(city1.cityData1.launch_date)
        .add(6, "month")
        .format("YYYY-MM-DD");
    } else if (data === 1) {
      return dayjs().format("YYYY-MM-DD");
    }
  };

  console.log(endDate(city1.dateTo));

  const [selectedDateRange, setSelectedDateRange] = useState({
    date_from: city1.cityData1.launch_date,
    date_to: endDate(city1.dateTo),
  });
  // const handleDateSelect = (dateRange) => {
  //   setSelectedDateRange({
  //     date_from: dayjs(dateRange[0]).format("YYYY-MM-DD"),
  //     date_to: dayjs(dateRange[1]).format("YYYY-MM-DD"),
  //   });
  // };

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

  const id = city1.cityData1.value;
  const { data, error, isLoading } = useNewFetch(
    `/v1/reports/applicants-rolling/${id}?${getUserParams()}`
  );
  console.log(data);

  const id2 = city1.cityData2.value;
  const {
    data: data2,
    error: error2,
    isLoading: isLoading2,
  } = useNewFetch(`/v1/reports/applicants-rolling/${id2}?${getUserParams()}`);
  console.log(data2);


  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;
 
  // if (data.total === 0) {
  //   return (
  //     <>
  //       <Space
  //         direction="vertical"
  //         size="large"
  //         style={{ width: "100%", alignItems: "center" }}
  //       >
  //         <Title level={3}> Driver Application Comparison Per City </Title>
  //         <Result
  //           status="404"
  //           title="No Data Found"
  //           subTitle="Sorry, there is no data for your selected date range. Please try again
  //             with a different date range"
  //         />
  //         <DateRangePicker
  //           vlue={selectedDateRange}
  //           onDateSelect={handleDateSelect}
  //         />
  //       </Space>
  //     </>
  //   );
  // }

  /*const ChartLine = ({ props, xField, yField, seriesField })*/

  return (
    <>
      <Card title="we are almost there " width="100%">

      <Space
        direction="vertical"
        size="large"
        style={{ width: "100%", alignItems: "center" }}
      >
        <Title level={3}> Driver Application Comparison Per City </Title>
              <ChartLine
                props={data?.items}
                xField="date"
                yField="count"
              />
        </Space>
      </Card>

    </>
  );
};

export default CityComparison;
