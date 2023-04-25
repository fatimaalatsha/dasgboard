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
import { useNavigate } from "react-router-dom";
import { useFilterStore } from "../../store"; // Import filter store

import qs from "qs";

import { EditOutlined } from "@ant-design/icons";
import ChartColumn from "../../components/ChartColumn";
import CardStatistic from "../../components/CardStatistic";
import DateRangePicker from "../../components/DateRangePicker";
const { Title, Text } = Typography;

const getUserParams = (filter) => ({
  ...filter,
});

const NumberOfLeads = () => {
  const reportFilter = useFilterStore((state) => state.reportFilter); // Get filter from store
  const setReportFilter = useFilterStore((state) => state.setReportFilter); // Set filter to store
  const navigate = useNavigate();

  const [isEnable, setIsEnable] = useState(false); // Set isEnable state
  const [dateset, setDateset] = useState("");
  const [showIneligible, setShowIneligible] = useState(false);

  const { data, error, isLoading } = useNewFetch(
    `/v1/reports/drivers-status?${qs.stringify(getUserParams(reportFilter), {
      skipNulls: true,
      arrayFormat: "comma",
    })}`
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

  const handleChangeDate = (dates) => {
    console.log(dates);
    const dateFrom = dates[0];
    const dateTo = dates[1];
    setReportFilter({ ...reportFilter, date_from: dateFrom, date_to: dateTo });
  };

  if (data.total === 0) {
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
          extra={
            <>
              <Text type="warning">Select another date range.</Text>
              <DatePicker.RangePicker
                open={isEnable}
                allowClear={true}
                inputReadOnly={true}
                size="small"
                showToday={false}
                bordered={true}
                onChange={handleChangeDate}
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
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => {
                          setIsEnable(false);
                          setDateset(getUserParams());
                        }}
                      >
                        OK
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
            </>
          }
        />
      </Card>
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
          <Title level={3}> Number Of Leads By Application Status</Title>
          <Space align="start" direction="horizontal">
            <DateRangePicker
              value={reportFilter}
              onDateSelect={handleChangeDate}
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
                <Text strong>{reportFilter.date_from}</Text> to{" "}
                <Text strong>{reportFilter.date_to} </Text>
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
                    data &&
                    (data.data.status === "Ineligible" ||
                      data.data.status === "Do not contact (DNC)")
                      ? navigate(
                          `/reports/conversion_rates/${data.data.status}`,
                          {
                            state: {
                              date_from: reportFilter.date_from,
                              date_to: reportFilter.date_to,
                            },
                          }
                        )
                      : setShowIneligible(false);
                  });
                }}
              />
            </div>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default NumberOfLeads;
