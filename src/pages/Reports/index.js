import { Card, Table, Typography,Space } from 'antd';
import { AreaChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/use-fetch';
import CardStatistic from '../../components/CardStatistic';
import ChartColumn from '../../components/ChartColumn';
import ChartLine from '../../components/ChartLine';
import qs from 'qs';


const { Title } = Typography;

const columns = [
  {
    title: '',
    dataIndex: 'icon',
    key: 'icon',
    width: 50,
    render: () => <AreaChartOutlined />,
  },
  {
    title: 'Report Name',
    dataIndex: 'name',
    key: 'name',
  },
];

const dataSet = [
  {
    key: 'conversion_rates',
    name: 'Conversion Rates Per City',
  },
  {
    key: 'conversion_rates_per_stage',
    name: 'Drivers Status Per City',
  },
  {
    key: 'number_of_leads_per_stage',
    name: 'Number of Leads per Stage',
  },
  {
    key: 'number_of_leads_per_city',
    name: 'Number of Leads per City',
  },
];

const Reports = () => {
  const navigate = useNavigate();
  const handleRowClick = (record) => {
    navigate(`/reports/${record.key}`);
  };

  const dateFrom = {  
    date_from: '2021-01-01',
    date_to: '2024-01-31',
  };
 const getUserParams = () => {
    const { date_from, date_to } = dateFrom;
    return qs.stringify(
      {
        date_from,
        date_to,
      },
      { skipNulls: true, arrayFormat: 'comma' }
    );
  };

  const { data, error, isLoading } = useFetch(
    `/v1/reports/conversion-rates?${getUserParams()}`
  );
  console.log(data);
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;
  return (
    <Card title={<Title level={2}>Reports</Title>}>
      <Space direction="horizontal" size="large">
                <CardStatistic title="Total Leads" value={980} color="#3f8600" />
                <CardStatistic title="Active" value={460} color="#3f8600" />
                <CardStatistic title="Awating" value={15} color="#1307f5" />
                <CardStatistic title="New Leads" value={7} color="#f507c9" />
                <CardStatistic title="Cities " value={15} color="#f57207" />
                <CardStatistic title="Total Rides" value={"23%"} color="#3f8600" />               
      </Space> 
      
      <Card>
        <ChartColumn props={data.items} xField='city' yField='active' seriesField='active' />
      </Card>
      <Card>
        <ChartLine props={data.items} yField='total' xField='city' />
      </Card>
      <Table
        columns={columns}
        dataSource={dataSet}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
      />
    </Card>
  );
};

export default Reports;
