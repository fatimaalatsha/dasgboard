import { useState } from 'react';
import { Typography, Card, Space, DatePicker, Button, Tooltip, Result, Row, Col, Table} from 'antd';
import useNewFetch from '../../hooks/use-new-fetch';
import useFetch from '../../hooks/use-fetch';
//import qs from 'qs';
import dayjs from 'dayjs';

import { BarChartOutlined } from '@ant-design/icons';
import ChartBar from '../../components/ChartBar';
import ChartColumn from '../../components/ChartColumn';
import ChartPie from '../../components/ChartPie';
import CardStatistic from '../../components/CardStatistic';
import ChartLine from '../../components/ChartLine';
import ChartRadialBar from '../../components/ChartRadialBar';
const { Title, Text } = Typography;



const ReportDetails = () => {

  console.log(window.location.pathname.split('/')[3])

  const cityId = window.location.pathname.split('/')[3]


  
 const [id, setId] = useState(1);
  const { data, error, isLoading } = useNewFetch(
    `/v1/reports/city-overview/${id}`
  );
 console.log(data)
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;
  return (
    <>
      <Card
        title={
          <Space direction="vertical" size="large">
            <Title level={3}> {data.city} Overview Report</Title>
          </Space>
            }>
         <Row  align="middle">
          <Col span={24}>
            <Space direction='horizontal' size="large" >
        </Space>
       
           <Space direction="vertical" size="large" style={{ width: '100%' }} align='center' >
              <Space direction="horizontal" size="large" align='center' style={{ width: '100%' }} >
                <CardStatistic title="Total" value={data.total} color="#3f8600"  />
                <CardStatistic title="Active" value={data.active} color="#3f8600" />
                <CardStatistic title="Applicants" value={data.applicants} color="#3f8600" />
                <CardStatistic title="New Applicants"  value={data.applicants_seven_days} color="#1307f5" />        
              </Space>
            </Space>
            <Space direction="vertical" size="large" style={{ width: '100%' }} >
              {/* <ChartColumn props={mapDataToObjects(data)} xField="status" yField="count" seriesField="city" /> */}
              {/* <ChartLine props={dummyData} xField='year' yField="value" seriesField="city" /> */}
              <Table
                Title={() => <h1>Table</h1>}
                columns={
                  [
                    {
                      title: 'User Id',
                      dataIndex: 'user_id',
                      key: 'user_id',
                    },
                    {
                      title: 'First Name',
                      dataIndex: 'first_name',
                      key: 'first_name',
                    },
                    {
                      title: 'Last Name',
                      dataIndex: 'last_name',
                      key: 'last_name',
                    },

                    {
                      title: 'Created At',
                      dataIndex: 'created_at',
                      key: 'created_at',
                      render: (text) => dayjs(text).format('YYYY-MM-DD'),
                    },
                  ]
                }
                dataSource={data.applicants_list}
                pagination={false}
              />


            </Space>
          </Col>
        </Row>
      </Card>
      
    </>
  );
};



        
 





export default ReportDetails;