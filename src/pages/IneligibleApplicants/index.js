import qs from "qs";
import { Divider, Typography, Card, Space } from "antd";
import useNewFetch from "../../hooks/use-new-fetch";
import { useFilterStore } from "../../store";
import ChartColumn from "../../components/ChartColumn";


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
      <Divider orientation="left">
        Ineligible Applicants from 
        <Text strong> { reportFilter.date_from } </Text> to
        <Text strong> { reportFilter.date_to } </Text>
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
