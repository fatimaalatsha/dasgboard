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

  // const conversionRate = (data) => {
  //   var total = 0;
  //   for (var i = 0; i < data.length; i++) {
  //     if (data[i].status === "Active") {
  //       total += data[i].active;
  //     }
  //   }
  //   return (total / countAll(data)) * 100;
  // };

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
          <CardStatistic title="Ineligible " value={17} color="#3f8600" popInfo="(Hard coded)" />               
      </Space> 
      <br />
      <br />
     
      <Divider orientation="left">Number of Leads</Divider>
<ChartColumn props={data.items} xField="city" yField="total" seriesField="city" />
<br />
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
      order={{columnKey: 'total', order: 'descend', }}
      onRow={() => ({
        onClick: () => {
          navigate(`/reports/city_overview`);
        },
      })}
    />
  </Card>
  <Card title={<Title level={4}>Inter-city Reports</Title>} style={{ width: 500,}}>
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
