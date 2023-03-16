import { useState } from 'react';
import { Typography, Card, Space, DatePicker, Button, Tooltip, Result, Row, Col, Table} from 'antd';
import useFetch from '../../hooks/use-fetch';
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

const NumberOfLead = (dateFrom) => {
  const [chartType, setChartType] = useState('bar');

  const dummyData = [
    {
      year: '1991',
      value: 3,
      city: 'Tunder Bay',
    },
    {
      year: '1992',
      value: 4,
      city: 'Tunder Bay',
    },
    {
      year: '1993',
      value: 3.5,
      city: 'Tunder Bay',
    },
    {
      year: '1994',
      value: 5,
      city: 'Tunder Bay',

    },
    {
      year: '1995',
      value: 4.9,
      city: 'Tunder Bay',

    },
    {
      year: '1996',
      value: 6,
      city: 'Tunder Bay',

    },
    {
      year: '1997',
      value: 7,
            city: 'Tunder Bay',

    },
    {
      year: '1998',
      value: 9,
      city: 'Tunder Bay',

    },
    {
      year: '1999',
      value: 13,
      city: 'Tunder Bay',

    },
       {
      year: '1991',
      value: 3,
      city: 'north bay',
    },
    {
      year: '1992',
      value: 4,
      city: 'north bay',
    },
    {
      year: '1993',
      value: 3.5,
      city: 'north bay',
    },
    {
      year: '1994',
      value: 5,
      city: 'north bay',

    },
    {
      year: '1995',
      value: 4.9,
      city: 'north bay',

    },
    {
      year: '1996',
      value: 6,
      city: 'north bay',

    },
    {
      year: '1997',
      value: 7,
            city: 'north bay',

    },
    {
      year: '1998',
      value: 9,
      city: 'north bay',

    },
    {
      year: '1999',
      value: 13,
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
 
  console.log(data);
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
 console.log(mapDataToObjects(data));
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
            <Title level={3}>Number of Leads By Application in Thunder Bay </Title>
          </Space>
            }>
         <Row  align="middle">
          <Col span={24}>
            <Space direction='horizontal' size="large" >
          {/* <Button
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
              </Button> */}
        </Space>
       
           <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Space direction="horizontal" size="large">
                <CardStatistic title="Total" value={countAll(mapDataToObjects(data))} color="#3f8600" />
                <CardStatistic title="Active" value={data.total_items} color="#3f8600" />
                <CardStatistic title="Awating" value={15} color="#1307f5" />
                <CardStatistic title="New Leads" value={7} color="#f507c9" />
                <CardStatistic title="Average Time" value={'3 Days'} color="#07f5b5" />
                <CardStatistic title="ConversionRate" value={"23%"} color="#3f8600" />               
              </Space>
              <ChartColumn props={mapDataToObjects(data)} xField="status" yField="count" seriesField="city" />
              <ChartLine props={dummyData} xField='year' yField="value" seriesField="city" />
              <Table
                Title={() => <h1>Table</h1>}
                columns={
                  [
                    {
                      title: 'Name',
                      dataIndex: 'name',
                      key: 'name',
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



        
 


const ReportDetails = () => {
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


export default ReportDetails;