import { useState } from 'react';
import { Typography, Card, Space, DatePicker, Button, Tooltip, Result, Row, Col, Statistic } from 'antd';
import useFetch from '../../hooks/use-fetch';
import qs from 'qs';
import dayjs from 'dayjs';

import { EditOutlined, BarChartOutlined } from '@ant-design/icons';
import ChartBar from '../../components/ChartBar';
import ChartColumn from '../../components/ChartColumn';
import ChartPie from '../../components/ChartPie';
import CardStatistic from '../../components/CardStatistic';
import ChartLine from '../../components/ChartLine';
const { Title, Text} = Typography;

const NumberOfLead = (dateFrom) => {
  const [chartType, setChartType] = useState('bar');

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
    `/v1/reports/drivers-status?${getUserParams()}`
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

    for (const cityObj of Object.values(items)) {
      if (typeof cityObj === 'object' && cityObj.data) {
        for (const dataObj of cityObj.data) {
          mappedData.push({
            status: dataObj.status,
            city: cityObj.city,
            count: dataObj.count,
          });
        }
      } else {
        mappedData.push({
          status: cityObj.status,
          city: items.city,
          count: cityObj.count,
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
            <Title level={3}>Number of Leads By Application</Title>
          </Space>
            }>
         <Row  align="middle">
          <Col span={24}>
            <Space direction='horizontal' size="large" >
          <Button
            type="primary"
            onClick={() => setChartType('bar')}
            disabled={chartType === 'bar'}
          >
            Bar Chart
          </Button>
          <Button
            type="primary"
            onClick={() => setChartType('column')}
            disabled={chartType === 'column'}
          >
            Column Chart
          </Button>
          <Button
            type="primary"
            onClick={() => setChartType('pie')}
            disabled={chartType === 'pie'}
          >
            Pie Chart
          </Button>
              <Button
                type="primary"
                onClick={() => setChartType('line')}
                disabled={chartType === 'line'}
              >
                Line Chart
              </Button>
        </Space>
            <br />
            <br />

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Space direction="horizontal" size="large">
                <CardStatistic title="Total" value={countAll(mapDataToObjects(data))} color="#3f8600" />
                <CardStatistic title="Active" value={data.total_items} color="#3f8600" />
                <CardStatistic title="Awating" value={15} color="#1307f5" />
                <CardStatistic title="New Leads" value={7} color="#f507c9" />
                <CardStatistic title="Average Time" value={'3 Days'} color="#f57207" />
                <CardStatistic title="ConversionRate" value={"23%"} color="#3f8600" />               
              </Space>
        {chartType === 'bar' && (
            <ChartBar props={mapDataToObjects(data)} />
        )}
        {chartType === 'column' && (
            <ChartColumn props={mapDataToObjects(data)} />
          )}
          {chartType === 'pie' && (
            <ChartPie props={mapDataToObjects(data)} />
              )}
              {chartType === 'line' && (
                <ChartLine props={mapDataToObjects(data)} />
              )}


            </Space>
          </Col>
        </Row>
      </Card>
      
    </>
  );
};



        
 


const NumberOfLeads = () => {
  const [date, setDate] = useState({
    filter: {
      date_from: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
      date_to: dayjs().format('YYYY-MM-DD'),
    },
  });
  const [isEnable, setIsEnable] = useState(true); // Set isEnable state
  const [showReport, setShowReport] = useState(false);
  const [dateset, setDateset] = useState('');

  const getUserParams = ({ date_from, date_to }) => {
    // Use the selected date range from the prop
    return qs.stringify(
      {
        date_from,
        date_to,
      },
      { skipNulls: true, arrayFormat: 'comma' }
    );
  };


  return (
    <>
    <Space align="start" direction="horizontal">
      <DatePicker.RangePicker
        open={isEnable}
        allowClear={true}
        inputReadOnly={true}
        size="small"
        showToday={false}
        bordered={true}
        onChange={(dates) => {
          setDate({
            filter: {
              date_from: dates[0].format('YYYY-MM-DD'),
              date_to: dates[1].format('YYYY-MM-DD'),
            },
          });
        }}
        renderExtraFooter={() => {
          return (
            <Space direction='horizontal' style={{ display: 'flex', justifyContent: 'space-between' }}>
               <Button
                type="primary"
                onClick={() => {
                  setIsEnable(false);
                  setDateset(getUserParams(date.filter.date_from));
                }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setIsEnable(false);
                setShowReport(true);
              }}
            >
              OK
              </Button>
           </Space>
          );
        }}
      />
       <Tooltip title='Select Range'>
            <Button style={{padding: 0, height: 'auto' }} onClick={() => setIsEnable(true)} type='link' icon={<EditOutlined />} />
        </Tooltip>
      </Space>
       
      {/* Pass date as a prop and show report if showReport is true */}
      {showReport && <NumberOfLead date_from={date.filter.date_from} date_to={date.filter.date_to} />}
    </>
  );
};


export default NumberOfLeads;