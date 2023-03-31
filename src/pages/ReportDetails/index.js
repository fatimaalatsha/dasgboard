import { useState } from 'react';
import { Typography, Card, Space, DatePicker, Button, Tooltip, Result, Row, Col, Table} from 'antd';
import useNewFetch from '../../hooks/use-new-fetch';
import qs from 'qs';
import dayjs from 'dayjs';

import { EditOutlined, BarChartOutlined } from '@ant-design/icons';
import ChartBar from '../../components/ChartBar';
import ChartColumn from '../../components/ChartColumn';
import ChartPie from '../../components/ChartPie';
import CardStatistic from '../../components/CardStatistic';
import ChartLine from '../../components/ChartLine';
import ChartRadialBar from '../../components/ChartRadialBar';
const { Title, Text} = Typography;

const ReportDetails = () => {

  const dummyData = [
    {
      year: '01',
      value: 3,
      city: 'Tunder Bay',
    },
    {
      year: '02',
      value: 4,
      city: 'Tunder Bay',
    },
    {
      year: '03',
      value: 3.5,
      city: 'Tunder Bay',
    },
    {
      year: '04',
      value: 5,
      city: 'Tunder Bay',

    },
    {
      year: '05',
      value: 4.9,
      city: 'Tunder Bay',

    },
    {
      year: '06',
      value: 6,
      city: 'Tunder Bay',

    },
    {
      year: '07',
      value: 7,
            city: 'Tunder Bay',

    },
    {
      year: '08',
      value: 9,
      city: 'Tunder Bay',

    },
    {
      year: '09',
      value: 13,
      city: 'Tunder Bay',

    },
       {
      year: '01',
      value: 3,
      city: 'north bay',
    },
    {
      year: '02',
      value: 4,
      city: 'north bay',
    },
    {
      year: '03',
      value: 3.5,
      city: 'north bay',
    },
    {
      year: '04',
      value: 5,
      city: 'north bay',

    },
    {
      year: '05',
      value: 19,
      city: 'north bay',

    },
    {
      year: '06',
      value: 6,
      city: 'north bay',

    },
    {
      year: '07',
      value: 7,
            city: 'north bay',

    },
    {
      year: '08',
      value: 19,
      city: 'north bay',

    },
    {
      year: '09',
      value: 16,
      city: 'north bay',

    },
  ];

  const dummyData2 = [
    {
      name: "john doe",
      status: "Ready to drive",
      applied: "2021-01-01",
      city: "Tunder Bay",
      
    },
    {
      name: "john Cena",
      status: "unable to contact",
      applied: "2021-02-01",
      city: "Tunder Bay",
    },
      {
      name: "john F. Kennedy",
      status: "unqualified",
      applied: "2021-01-01",
      city: "Tunder Bay",
      
    },
    {
      name: "john  Lennon",
      status: "awaiting",
      applied: "2021-01-01",
      city: "Tunder Bay",
    },
      {
      name: "john Stamos",
      status: "pending",
      applied: "2021-01-01",
      city: "Tunder Bay",
      
    },
    {
      name: "john Travolta",
      status: "Step 1",
      applied: "2021-01-01",
      city: "Tunder Bay",
    }
  ];


 

  const { data, error, isLoading } = useNewFetch(
    `/v1/reports/city-overview/1`
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
       
           <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Space direction="horizontal" size="large">
                <CardStatistic title="Total" value={data.total} color="#3f8600" />
                <CardStatistic title="Active" value={data.active} color="#3f8600" />
                <CardStatistic title="Applicants" value={data.applicants} color="#3f8600" />
                <CardStatistic title="New Applicants" value={data.applicants_seven_days} color="#1307f5" />        
              </Space>
              {/* <ChartColumn props={mapDataToObjects(data)} xField="status" yField="count" seriesField="city" /> */}
              <ChartLine props={dummyData} xField='year' yField="value" seriesField="city" />
              <Table
                Title={() => <h1>Table</h1>}
                columns={
                  [
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
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                    },
                    {
                      title: 'Time Applied',
                      dataIndex: 'applied',
                      key: 'applied',
                    },
                  ]
                }
                dataSource={dummyData2}
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