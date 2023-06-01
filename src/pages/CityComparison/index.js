import {useEffect, useState } from "react";
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
import dayjs from "dayjs";
import qs from "qs";

import ChartLine from "../../components/ChartLine";

const { Title, Text } = Typography;

const CityComparison = () => {
  const [firstCityId, setFirstCityId] = useState('');
  const [secondCityId, setSecondCityId] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [date, setDate] = useState();
  const [info, setInfo] = useState();
  const [info2, setInfo2] = useState();
  const [dateValue, setDateValue] = useState();
  const [open, setOpen] = useState(true);
  const { data, error, isLoading } = useNewFetch(`/v1/cities?order=ASC&limit=50&paginated=true`);
  const options = data?.data?.map((item) => ({
    label: item.name,
    value: item.id,
    launch_date: item.launch_date ? item.launch_date : "2021-12-08",
  }));

  const handleSubmit = () => {
    const firstCityIdValue = info;
    const secondCityIdValue = info2;
    const startDate = dateValue;
    setFirstCityId(firstCityIdValue);
    setSecondCityId(secondCityIdValue);
    setDate(startDate);
    setOpen(false);
    setShowReport(true);
  };


  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;
  return (
    <>
      <Modal
        title="Select Cities to Compare"
        open={open}
        closable={false}
        // destroyOnClose={true}
        handleCancel={() => {
          setOpen(false);
          setShowReport(false);
        }}
        footer={[
          <Button key="cancel" onClick={() => setOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            disabled={!info || !info2 || !dateValue}
            onClick={handleSubmit}
          >
            Generate Report
          </Button>,
        ]}
      >
        <Divider orientation="left"> Select First City </Divider>
        <Select
          style={{ width: "100%" }}
          placeholder="First City ..."
          onChange={(value, city) => {
            setInfo(city);
          }}
          options={options}
        />
        <Divider orientation="left"> Select Second City </Divider>
        <Select
          style={{ width: "100%" }}
          placeholder="Second City ..."
          onChange={(value, city) => {
            setInfo2(city);
          }}
          options={options}
        />
        <Divider orientation="left"> Select Date Range </Divider>
        <Radio.Group
          onChange={(e) => {
            setDateValue(e.target.value);
          }}
        >
          <Radio value={30}>First 30 Days</Radio>
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
            style={{ display: "flex", justifyContent: "space-between" }}
          >
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
        )}
        {showReport && (
          <CitySelection
            firstCityId={firstCityId}
            secondCityId={secondCityId}
            dateTo={date}
          />
        )}
      </Card>
    </>
  );
};

const CitySelection = (props) => {
  const endDate = (days) => {
    if (days === 30) {
      return dayjs(props.firstCityId.launch_date)
        .add(30, "day")
        .format("YYYY-MM-DD");
    } else if (days === 60) {
      return dayjs(props.firstCityId.launch_date)
        .add(60, "day")
        .format("YYYY-MM-DD");
    } else if (days === 90) {
      return dayjs(props.firstCityId.launch_date)
        .add(90, "day")
        .format("YYYY-MM-DD");
    } else if (days === 6) {
      return dayjs(props.firstCityId.launch_date)
        .add(6, "month")
        .format("YYYY-MM-DD");
    } else if (days === 1) {
      return dayjs().format("YYYY-MM-DD");
    }
  };

     useEffect(() => {
       const endDateValue = endDate(props.dateTo);

       setSelectedDateRange({
         date_from: props.firstCityId.launch_date,
         date_to: endDateValue,
       });
     }, [props.dateTo]);

  const [selectedDateRange, setSelectedDateRange] = useState({
    date_from: props.firstCityId.launch_date,
    date_to: endDate(props.dateTo),
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

  const id = props.firstCityId.value;  
  const { data, error, isLoading } = useNewFetch(
    `/v1/reports/applicants-rolling/${id}?${getUserParams()}`
  );

  const id2 = props.secondCityId.value;
  const {
    data: data2,
    error: error2,
    isLoading: isLoading2,
  } = useNewFetch(`/v1/reports/applicants-rolling/${id2}?${getUserParams()}`);
 
  const addCityToData = (data) => {
    return data?.items?.map((item, index) => ({
      date: `Day ${index + 1}`,
      count: item.count,
      city: props.firstCityId.label,
    }));
  };

  const addCityToData2 = (data2) => {
    return data2?.items?.map((item, index) => ({
      date: `Day ${index + 1}`,
      count: item.count,
      city: props.secondCityId.label,
    }));
  };
  const combineCityData = (data, data2, props) => {
      const city1Data = data?.items ? addCityToData(data) : [];
      const city2Data = data2?.items ? addCityToData2(data2) : []; 
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
          <Result
            status="404"
            title="No Data Found"
            subTitle="No data found for the selected cities in the selected date range."
          />
        </Space>
      </>
    );
  }

  return (
    <>
      <Card>
        <Divider orientation="left">
          {props.firstCityId.label} vs {props.secondCityId.label}
        </Divider>
        <ChartLine
          props={combineCityData(data, data2, props)}
          xField="date"
          yField="count"
          seriesField="city"
          />
      </Card>
    </>
  );
};

export default CityComparison;
