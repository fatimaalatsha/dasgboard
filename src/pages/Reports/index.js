import { Card, Table, Typography,Space, Divider} from 'antd';
import { AreaChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/use-fetch';
import useNewFetch from '../../hooks/use-new-fetch';
import CardStatistic from '../../components/CardStatistic';
import ChartColumn from '../../components/ChartColumn';
import qs from 'qs';


const { Title } = Typography;

const columns = [
  {
    title: '',
    dataIndex: 'icon',
    key: 'icon',
    width: 50,
    
    render: () => <AreaChartOutlined  style={{ fontSize: '25px', color: '#08c' }}/>,
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
    name: 'Number Of Leads By Application Status',
  },
  {
    key: 'number_of_drivers',
    name: 'Number Of Drivers Status Per City',
   disabled: true,
  },
  {
    key: 'conversion_rates_by_application',
    name: 'Conversion Rates By Application',
    // disabled: true,
    
  },
  // {
  //   key: 'number_of_leads_per_city',
  //   name: 'Number of Leads per City',
  //   disabled: true,
  // },
];

const Reports = () => {
  const navigate = useNavigate();
  const handleRowClick = (record) => {
    navigate(`/reports/${record.key}`);
  };

  const { data, error, isLoading } = useNewFetch(`/v1/reports/applicants-overview`);
  console.log(data)

  const processData = (data) => {
      const result = [];

      // loop over the items array
      data.items.forEach((item) => {
        // create a new object for eligible users with the required properties
        const eligibleObj = {
          city: item.city,
          count: item.active,
          status: 'active',
        };

        // push the new object into the result array
        result.push(eligibleObj);

        // create a new object for active users with the required properties
        const activeObj = {
          city: item.city,
          count: item.applicants,
          status: 'applicants',
        };

    

    // push the new object into the result array
    result.push(activeObj);
      });
    console.log(result)
  return result;
};

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;
  return (
    <Card title={<Title level={2}>Reports</Title>}>
      <Space direction="vertical" size="large" style={{ width: '100%' }} align='center'>
          <Space direction="horizontal" size="large">
              <CardStatistic title="Total Leads" height ={ 100} width = {140} value={data.meta.total} color="#3f8600" popInfo="Total number of leads " />
              <CardStatistic title="Active" value={data.meta.total_active} popInfo="Total active drivers" color="#3f8600" />
              <CardStatistic title="Total Applicants " value={data.meta.total_applicants} color="#1307f5" popInfo="Number of applicants who are in the process" />
              <CardStatistic title="New Leads" value={data.meta.total_applicants_seven_days} color="#f507c9" popInfo="Number of new leads in the last 7 days" />
              <CardStatistic title="Ineligible " value={data.meta.total_ineligible} color="#3f8600" popInfo="(Hard coded)" />               
            </Space> 
        </Space>
      <Divider orientation="left">Number of Leads</Divider>
  <ChartColumn props={processData(data)} xField="city" yField="total" seriesField="city" />
<Divider orientation="left" />

<Space direction="horizontal" size={200} style={{ marginTop: '10px' }}>
  <Card title={<Title level={4}>Inter-city Reports</Title>} style={{ width: 500 }}>
    <Table
      columns={[
        {
          title: 'City',
          dataIndex: 'city',
          key: 'city',
        },
        {
          title: 'Total',
          dataIndex: 'total',
          key: 'total',
        },
        {
          title: 'Active',
          dataIndex: 'active',
          key: 'active',
        },
        {
          title: 'Conversion Rate',
          dataIndex: 'percentage',
          key: 'percentage',
          render: (text) => <span>{text}%</span>,
        },
      ]}
      dataSource={data.items}
      style={{ width: 500, height: 500, overflow: 'auto',  color: '#b7eb8f' }}     
      // pagination={{
      //   pageSize: 4,
      //   showSizeChanger: false,
      //   hideOnSinglePage: true,
      //       }}
      scroll={{ y: 400 }}
      pagination={false}
      order={{ columnKey: 'total', order: 'descend', }}
      rowKey="city"
      onRow={(record) => ({
        onClick: () => {
          navigate(`/reports/city_overview/${record.city}`);
        },
            })}
      
    />
  </Card>
  <Card title={<Title level={4}>Cross-cities Reports</Title>} style={{ width: 500,}}>
    <Table
      columns={columns}
      dataSource={dataSet}
      onRow={(record) => ({
        onClick: () => {
          if (!record.disabled) {
            handleRowClick(record);
          }
        },
            })}
      pagination={false}
      style={{ width: 500, height: 500, overflow: 'auto',  color: '#b7eb8f' }}     

    />
  </Card>
  
</Space>

    </Card>
  );
};

export default Reports;
