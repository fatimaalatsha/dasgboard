import { useState } from 'react';
import { Typography, Card, Space, DatePicker, Button, Tooltip, Result, Row, Col, Table } from 'antd';
import useNewFetch from '../../hooks/use-new-fetch';
import useFetch from '../../hooks/use-fetch';
//import qs from 'qs';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom'

import { BarChartOutlined } from '@ant-design/icons';
import ChartBar from '../../components/ChartBar';
import ChartColumn from '../../components/ChartColumn';
import ChartPie from '../../components/ChartPie';
import CardStatistic from '../../components/CardStatistic';
const { Title, Text } = Typography;


const ReportDetails = () => {
  const { id } = useParams();
  const { data, error, isLoading } = useNewFetch(
    `/v1/reports/city-overview/${id}`
  );
 
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;

  const countActive = (data) => {
  var total = 0;
  for (var i = 0; i < data.length; i++) {
    if (data[i].status === "Active") {
      total += data[i].count;
    }
    }
  return total;
  };
  
  const countAll = (data) => {
    var total = 0;
    for (var i = 0; i < data.length; i++) {
      total += data[i].count;
    }
    return total;
  };

  

  const mapDataToObjects = (data) => {
    const { items } = data;
    const mappedData = [];

    for (const statusObj of Object.values(items)) {
      if (typeof statusObj === 'object' && statusObj.data) {
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
  if (data.total_items === 0) {
    return (
      <Card
      title={
          <Space direction="vertical" size="large">
            <Title level={3}>Number of Leads By Application</Title>
          </Space>
            }
      >
        <Result
          status="warning"
          title="No data found for the selected date range"

          extra={
          <Text type="warning">
             Select another date range.
            </Text >
           }
        />
      </Card>
    )
  }
  return (
    <>
      <Card
        title={
          <Space direction="vertical" size="large">
            <Title level={3}>Number Of Drivers Status Per City</Title>
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