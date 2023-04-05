import { useState } from 'react';
import { Typography, Card, Space, Divider, Row, Col, Table, Tag } from 'antd';
import useNewFetch from '../../hooks/use-new-fetch';
import useFetch from '../../hooks/use-fetch';
//import qs from 'qs';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';

import { BarChartOutlined } from '@ant-design/icons';
import ChartBar from '../../components/ChartBar';
import ChartColumn from '../../components/ChartColumn';
import ChartPie from '../../components/ChartPie';
import CardStatistic from '../../components/CardStatistic';
const { Title, Text } = Typography;



const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, error, isLoading } = useNewFetch(`/v1/reports/city-overview/${id}`);
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;

  const getStatusCount = (data) => {
  const result = [];
  result.push({ status: 'Active', count: data.active });
  result.push({ status: 'Ineligible', count: data.ineligible });
  result.push({ status: 'Applicants', count: data.applicants });
  result.push({ status: 'Applicants Seven Days', count: data.applicants_seven_days });
  result.push({ status: 'Total', count: data.total });
  return result;
};

  
  return (
    <>
      <Card
        title={
          <Space direction="vertical" size="large">
            <Title level={3}>{data.city} Overview </Title>
          </Space>
            }>
         <Row  align="middle">
          <Col span={24}>
            <Space direction='horizontal' size="large" >
        </Space>
           <Space direction="vertical"  width={165} size="large" style={{ width: '100%' }} align='center'>
              <Space direction="horizontal"  width={165} size="large" align='center' style={{ width: '100%' }}>
                <CardStatistic title="Total Applicant Pool" width={180}  value={data.total} color="#3f8600" popInfo='Total Number of applicants, active and ineligible' />
                <CardStatistic title="Active"  width={165} value={data.active} color="#3f8600" popInfo='Total Number Of Actived Drivers' />
                <CardStatistic title="Eligible Applicants"  width={165} value={data.applicants} color="#3f8600" popInfo='TTotal Number of Eligible Applicants' />
                <CardStatistic title="New Applicants" width={165} value={data.applicants_seven_days} color="#1307f5" popInfo='Number Of Applicants In The Last 7 Days' />        
              </Space>
            </Space>
            <Space direction="vertical" size="large" style={{ width: '100%' }} >
              <Divider orientation='left' ><Text strong> {data.city} Overview</Text></Divider>
              <div style={{ height: "600px" }}>
                <ChartColumn props={getStatusCount(data)} xField="status" yField="count" seriesField={'status'} />
              </div>             
              <Divider orientation='left' ><Text strong>Recent Applicants List</Text></Divider>
              <Table
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
                      title: 'Application Status',
                      dataIndex: 'application_status',
                      key: 'application_status',
                      render: (application_status) =>
                        <Tag color={application_status === 'active' ? 'green' : application_status === 'inactive' ? 'volcano' : 'orange'}>
                          {application_status}
                        </Tag>,
                      
                    },
                    {
                      title: 'Application Date',
                      dataIndex: 'created_at',
                      key: 'created_at',
                      render: (created_at) => dayjs(created_at).format('DD/MM/YYYY'),
                    },
                  ]
                }
                dataSource={data.applicants_list}
                pagination={false}
                rowKey={(record) =>
                  record.user_id
                }
                onRow={(record) => {
                  return {
                    onClick: (event) => {
                      navigate(`/applicants/${record.user_id}`); // click row
                    },
                  };
                }}
              />
            </Space>
          </Col>
        </Row>
      </Card>  
    </>
  );
};
export default ReportDetails;