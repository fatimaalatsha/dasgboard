import { Card, Table, Typography,Space, Divider} from 'antd';
import { AreaChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/use-fetch';
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
    name: 'Number of Drivers Status Per City',
  },
  {
    key: 'conversion_rates_per_stage',
    name: 'Drivers Status Per City',
    disabled: true,
  },
  {
    key: 'number_of_leads_per_stage',
    name: 'Number of Leads per Stage',
    disabled: true,
  },
  {
    key: 'number_of_leads_per_city',
    name: 'Number of Leads per City',
    disabled: true,
  },
];

const Reports = () => {
  const navigate = useNavigate();
  const handleRowClick = (record) => {
    navigate(`/reports/${record.key}`);
  };

  const dateFrom = {  
    date_from: '2020-01-01',
    date_to: '2023-04-16',
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

  const countActive = (data) => {
    var active = 0;
    for (var i = 0; i < data.length; i++) {
        active += data[i].active;
      
    }
    return active; 
  };

  const countAll = (data) => {
    var total = 0;
    for (var i = 0; i < data.length; i++) {
      total += data[i].total;
    }
    return total;
  };

  const conversionRate = (data) => {
    var total = 0;
    for (var i = 0; i < data.length; i++) {
      if (data[i].status === "Active") {
        total += data[i].active;
      }
    }
    return (total / countAll(data)) * 100;
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;
  return (
    <Card title={<Title level={2}>Reports</Title>}>
      <Space direction="horizontal" size="large">
          <CardStatistic title="Total Leads" value={countAll(data.items)} color="#3f8600" popInfo="Total number of leads " />
          <CardStatistic title="Active" value={countActive(data.items)} popInfo="Total active drivers" color="#3f8600" />
          <CardStatistic title="Awaiting " value={countAll(data.items)-countActive(data.items)} color="#1307f5" popInfo="Number of applicants who are in the process" />
          <CardStatistic title="New Leads" value={7} color="#f507c9" popInfo="Number of new leads in the last month(hard coded)" />
          <CardStatistic title="Cities " value={data.total_items} color="#f57207" popInfo="Number of active cities"/>
          <CardStatistic title="Ineligible " value={700} color="#3f8600" popInfo="(Hard coded)" />               
      </Space> 
      <br />
      <br />
     
       <Divider orientation="left">Number Of Leads</Divider>
          <ChartColumn props={data.items} xField='city' yField='total'  seriesField='city' />
      <br/>
      <Divider orientation="left"></Divider>

      <Space direction="horizontal" size={70}
        style={{ marginTop: '10px' }}
      >
        <Card
          title={<Title level={3}>Multi-city Reports</Title>}
          style={{ width: 500 }}
         >
        <Table
      columns={columns}
      dataSource={dataSet}
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
      })}
          />
        </Card>
         <Card
          title={<Title level={3}>Inter-city Reports</Title>}
          style={{ width: 500 }}
         >
      <Table
        columns={
          [
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
                title: 'Converison Rate',
                dataIndex: 'percentage',
                key: 'percentage',
              },

            
          ]

        }
        dataSource={data.items}
            pagination={
              {
                pageSize: 4,
                showSizeChanger: false,
                hideOnSinglePage: true,

            }
            }
            
        onRow={() => ({
          onClick: () => {
            navigate(`/reports/conversion_rates_per_stage`);
          },
        })}

      />
     </Card>
      </Space>
    </Card>
  );
};

export default Reports;
