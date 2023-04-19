import qs from "qs";
import { Divider, Typography, Card, Space, Col, Row } from "antd";
import useNewFetch from "../../hooks/use-new-fetch";
import { useFilterStore } from "../../store";
import ChartColumn from "../../components/ChartColumn";
import CardStatistic from "../../components/CardStatistic";


const { Text, Title } = Typography;

const getUserParams = (filter) => ({
   ...filter
 })


const IneligibleApplicants = () => {

  const reportFilter = useFilterStore(state => state.reportFilter);
  
  const { data, error, isLoading } = useNewFetch(
    `/v1/reports/status-breakdown?${qs.stringify(getUserParams(reportFilter), {
      skipNulls: true,
      arrayFormat: "comma",
    })}`
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

  const totalNumberOfIneligibleApplicants = (data) => {
    const { items } = data;
    let total = 0;
    for (const statusObj of Object.values(items)) {
      if (typeof statusObj === "object" && statusObj.data) {
        for (const dataObj of statusObj.data) {
          total += dataObj.count;
        }
      } else {
        total += statusObj.count;
      }
    }
    return total;
  };

  const getTopReason = (data) => {
    const counts = {};
    data.forEach((obj) => {
      if (obj.status in counts) {
        counts[obj.status] += 1;
      } else {
        counts[obj.status] = 1;
      }
    });

    let topReason = "";
    let topCount = 0;
    for (const [reason, count] of Object.entries(counts)) {
      if (count > topCount) {
        topReason = reason;
        topCount = count;
      }
    }
    return topReason;
  };


  



   
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;

  return (
    <Card
      title={
        <Space direction="vertical" size="large">
          <Title level={3}>Number Of Ineligible Applicants per City </Title>
        </Space>
      }
    >
      <Row align="middle">
        <Col span={24}>
          <Space direction="horizontal" size="large" style={{ width: "100%" }}>
            <CardStatistic
              title="Total Number of Ineligible Applicants"
              value={totalNumberOfIneligibleApplicants(data)}
              width={300}
              popInfo={
                "Total number of applicants that are ineligible in the selected date range."
              }
              color={"#11ba09"}
            />
            <CardStatistic
              title="Top Reason for Ineligibility"
              value={getTopReason(mapDataToObjects(data))}
              width={500}
              popInfo={
                "The most common reason for ineligibility in the selected date range."
              }
              color={"#0911ba"}
            />
          </Space>
        </Col>
      </Row>
      <Divider orientation="left">
        Ineligible Applicants from
        <Text strong> {reportFilter.date_from} </Text> to
        <Text strong> {reportFilter.date_to} </Text>
      </Divider>
      <div style={{ height: "700px" }}>
        <ChartColumn
          props={mapDataToObjects(data)}
          xField="status"
          yField="count"
          seriesField="city"
        />
      </div>
    </Card>
  );
};

export default IneligibleApplicants;
