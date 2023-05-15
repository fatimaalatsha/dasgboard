import { useState } from "react";
import {
  Typography,
  Card,
  Space,
  Result,
  Divider,
  Select,
  Modal,
  Radio,
  Button,
} from "antd";
import useNewFetch from "../../hooks/use-new-fetch"; // Import custom hook for fetching data
import * as yup from "yup"; // Import Yup validation library
import { Formik, Form } from "formik"; // Import Formik form components
import dayjs from "dayjs";
import qs from "qs";

import ChartLine from "../../components/ChartLine";
import SubmitWrapper from "../../components/forms/SubmitWrapper";

const { Title, Text } = Typography;

const CityComparison = () => {
  const [firstCityId, setFirstCityId] = useState([]);
  const [secondCityId, setSecondCityId] = useState([]);
  const [firstCityDateFrom, setFirstCityDateFrom] = useState([]);
  const [secondCityDateFrom, setSecondCityDateFrom] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [date, setDate] = useState();
  const [open, setOpen] = useState(true);
  const { data, error, isLoading } = useNewFetch(`/v1/cities`);


  const options = data?.data?.map((item) => ({
    label: item.name,
    value: item.id,
    launch_date: item.launch_date ? item.launch_date : "2021-12-08",
  }));

  const validationSchema = yup.object().shape({
    firstCityId: yup.string().required("Please select a city"),
    secondCityId: yup.string().required("Please select a city"),
    date: yup.number().required("Please select a date range"),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;
  return (
    <>
      <Modal
        title="Select Cities to Compare"
        open={open}
        closable={false}
        distroyOnClose={true}
        footer={[
          <Button key="cancel" onClick={() => setOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            disabled={!firstCityId || !secondCityId || !date}
            onClick={() => {
              setOpen(false);
              setShowReport(true);
            }}
          >
            Generate Report
          </Button>,
        ]}
      >
        <Divider orientation="left"> Select First City </Divider>
        <Select
          style={{ width: "100%" }}
          placeholder="Please select"
          onChange={(value, date) => {
            setFirstCityId(value);
            setFirstCityDateFrom(date);
          }}
          options={options}
        ></Select>
        <Divider orientation="left"> Select Secand City </Divider>
        <Select
          style={{ width: "100%" }}
          placeholder="Please select"
          onChange={(value, date) => {
            setSecondCityId(value);
            setSecondCityDateFrom(date);
          }}
          options={options}
        />
        <Divider orientation="left"> Select Date Range </Divider>
        <Radio.Group
          onChange={(e) => {
            setDate(e.target.value);
          }}
        >
          <Radio value={30}>30 Days</Radio>
          <Radio value={60}>First 60 Days</Radio>
          <Radio value={90}>First 90 Days</Radio>
          <Radio value={6}>First 6 Months</Radio>
          <Radio value={1}>All Time</Radio>
        </Radio.Group>
      </Modal>
      <Card
        title={
          <Space
            direction="horizontal"
            size="large"
            style={{ display: "flex", justifyContent: "space-between" }}>
            <Title level={3}> Driver Application Comparison Per City </Title>
            <Button type="primary" onClick={() => setOpen(true)}>
              Generate Report
            </Button>
          </Space>
        }
      >
        {!showReport && (
          <Result
            status="info"
            title="Select cities and date range to generate report"
          />
        )
        }
        {showReport && (
          <CitySelection
            cityData1={firstCityDateFrom}
            cityData2={secondCityDateFrom}
            dateTo={date}
          />
        )}
      </Card>
    </>
  );
};

const CitySelection = (city1) => {
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

  const [selectedDateRange, setSelectedDateRange] = useState({
    date_from: city1.cityData1.launch_date,
    date_to: endDate(city1.dateTo),
  });

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

  const id2 = city1.cityData2.value;
  const {
    data: data2,
    error: error2,
    isLoading: isLoading2,
  } = useNewFetch(`/v1/reports/applicants-rolling/${id2}?${getUserParams()}`);

  const addCityToData = (data) => {
    return data?.items?.map((item) => ({
      date: item.date,
      count: item.count,
      city: city1.cityData1.label,
    }));
  };

  const addCityToData2 = (data2) => {
    return data2?.items?.map((item) => ({
      date: item.date,
      count: item.count,
      city: city1.cityData2.label,
    }));
  };
  const combineCityData = (data, data2, city1) => {
    const city1Data = data?.items
      ? addCityToData(data, city1.cityData1.label)
      : [];
    const city2Data = data2?.items
      ? addCityToData2(data2, city1.cityData2.label)
      : [];
    return [...city1Data, ...city2Data];
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;

  if (data.total === 0 && data2.total === 0) {
    return (
      <>
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%", alignItems: "center" }}
        >
          <Title level={3}> Driver Application Comparison Per City </Title>
          <Result
            status="404"
            title="No Data Found"
            subTitle="Sorry, there is no data for your selected date range. Please try again
              with a different date range"
          />
        </Space>
      </>
    );
  }

  return (
    <>
      <Card>
        <Divider orientation="left">
          {city1.cityData1.label} vs {city1.cityData2.label}
          {/* <Text strong> {reportFilter.date_from} </Text> to
          <Text strong> {reportFilter.date_to} </Text> */}
        </Divider>
        <ChartLine
          props={combineCityData(data, data2, city1)}
          xField="date"
          yField="count"
          seriesField="city"
          />
      </Card>
    </>
  );
};

export default CityComparison;
