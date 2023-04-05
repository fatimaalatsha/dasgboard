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
  
  const processData = (data) => {
      const result = [];
      // loop over the items array
      data.items.forEach((item) => {
        // create a new object for active users with the required properties
        const activeObj = {
          city: item.city,
          count: item.active,
          status: 'active',
        };

        // push the new object into the result array
        result.push(activeObj);

        // create a new object for applicants users with the required properties
        const applicantsObj = {
          city: item.city,
          count: item.applicants,
          status: 'applicants',
        }; 
    // push the new object into the result array
        result.push(applicantsObj);
        
        // create a new object for  Ineligible users with the required properties
        const IneligibleObj = {
          city: item.city,
          count: item.ineligible,
          status: 'Ineligible',
        };
        // push the new object into the result array
        result.push(IneligibleObj);
        
        // create a new object for  New Leads users with the required properties
        const NewLeadsObj = {
          city: item.city,
          count: item.applicants_seven_days,
          status: 'New Leads',
        };
        // push the new object into the result array
        result.push(NewLeadsObj);

      });
  return result;
};

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;
  return (
    <Card title={<Title level={2}>Reports</Title>}>
      <Space direction="vertical" size="large" style={{ width: '100%' }} align='center'>
          <Space direction="horizontal" size="large">
              <CardStatistic title="Total Leads" height ={120} width = {165} value={data.meta.total} color="#3f8600" popInfo="Total number of leads " />
              <CardStatistic title="Active" height ={120} width = {165} value={data.meta.total_active} popInfo="Total active drivers" color="#3f8600" />
              <CardStatistic title="Total Applicants" height ={120} width = {165} value={data.meta.total_applicants} color="#1307f5" popInfo="Number of applicants who are in the process" />
              <CardStatistic title="New Leads" height ={120} width = {165} value={data.meta.total_applicants_seven_days} color="#f507c9" popInfo="Number of new leads in the last 7 days" />
              <CardStatistic title="Ineligible" height ={120} width = {165} value={data.meta.total_ineligible} color="#3f8600" popInfo="Total number of ineligible applicants " />               
            </Space> 
        </Space>
      <Divider orientation="left">Number of Leads Per City </Divider>
      <div style={{ height: "700px" }}>
      <ChartColumn props={processData(data)} xField="city" yField="count" seriesField="status" isGroup={false} isStack={true}
      label={
                  {
                    position: 'middle',
                    style: {
                      fill: '#000',
                      opacity: 1,                      
                    },
                    content: (item) => {
                        return item.count ? `${item.count}` : '';
                    }, 
                   rotate: false,
                    layout: [
                      { type: 'interval-hide-overlap', },
                      { type: 'adjust-color' },
                      { type: 'interval-adjust-position' },
                      { type: 'interval-rect-mask' },
                     
                    ],
            }} />
      </div>
<Divider orientation="left" />

<Space direction="horizontal" size={100} style={{ marginTop: '10px' }}>
  <Card title={<Title level={4}>Inter-city Reports</Title>} style={{ width: 600 }}>
    <Table
      columns={[
        {
          title: 'City',
          dataIndex: 'city',
          key: 'city_id',
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
          title: 'Ineligible',
          dataIndex: 'ineligible',
          key: 'ineligible',
        },
        {
          title: 'Recent Applicants',
          dataIndex: 'applicants_seven_days',
          key: 'applicants_seven_days',
        },
      ]}
      dataSource={data.items}
      style={{ width: 600, height: 500, overflow: 'auto',  color: '#b7eb8f' }}     
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
          navigate(`/reports/city_overview/${record.city_id}`);
        },
            })}  
    />
  </Card>
  <Card title={<Title level={4}>Cross-cities Reports</Title>} style={{ width:400,}}>
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
      style={{ width: 550, height: 500, overflow: 'auto',  color: '#b7eb8f' }}     
    />
  </Card>
</Space>

    </Card>
  );
};

export default Reports;
