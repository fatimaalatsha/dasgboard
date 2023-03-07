import { useState } from 'react';
import { Typography, Card, Space, DatePicker, Button, Tooltip, Result } from 'antd';
import { Bar , Column, Pie} from '@ant-design/plots';
import useFetch from '../../hooks/use-fetch';
import qs from 'qs';
import dayjs from 'dayjs';

import { EditOutlined } from '@ant-design/icons';

const { Title, Text} = Typography;

const NumberOfLead = (dateFrom) => {
  console.log(dateFrom);
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

        </Space>
      

        <Space direction="vertical"
          size="large"
        style={{ width: '100%' }}>
        {chartType === 'bar' && (
        <Bar
          data={mapDataToObjects(data)}
          xField="count"
          yField="city"
          seriesField="status"
          conversionTag={{
            offsetX: 10,
            offsetY: -10,
            style: {
              fill: 'white',
              fontSize: 12,
              fontWeight: 500,
              textBaseline: 'middle',
            },
          }}

          isStack={true}

          label={{
            position: 'middle',
            content: (item) => {
              return item.count;

  // const percent = ((item.count / item.data.total) * 100).toFixed(2);
  //   return `${percent}%`;
            },
            style: {
              fill: '#fff',

            },
            formatter: ({ value }) => {
              console.log(value);
              return value.toFixed(2);
            },
            

          }}
          legend={{
            position: 'top',
            flipPage: false,
          }}
          tooltip={{
            showMarkers: false,
          }}
          meta={{
            count: {
              alias: 'Number of Leads',
            },
            city: {
              alias: 'City',
            },
            status: {
              alias: 'Status',
            },
          }}
          xAxis={{
            label: {
              autoHide: true,
              autoRotate: false,
            },
          }}
          yAxis={{
            label: {
              autoHide: true,
              autoRotate: false,
            },
          }}
          responsive={true}
          padding="auto"
          forceFit={true}
          theme={{
            // colors10: ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
            minBarWidth: 20,
            maxBarWidth: 20,
            color: ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
            
          }}

            />
        )}
        {chartType === 'column' && (
           <Column
            data={mapDataToObjects(data)}
            xField="city"
            yField="count"
            seriesField="status"
            isStack={true}
            label={{
              position: 'middle',
              content: (item) => {
                return item.count;
              },
              style: {
                fill: '#fff',
              },
              formatter: ({ value }) => {
                return value.toFixed(2);
              },
            }}
            legend={{
              position: 'top',
              flipPage: false,
            }}
            tooltip={{
              showMarkers: false,
            }}
            meta={{
              count: {
                alias: 'Number of Leads',
              },
              city: {
                alias: 'City',
              },
              status: {
                alias: 'Status',
              },
            }}
            xAxis={{
              label: {
                autoHide: true,
                autoRotate: false,
              },
            }}
            yAxis={{
              label: {
                autoHide: true,
                autoRotate: false,
              },
            }}
            responsive={true}
            padding="auto"
            forceFit={true}
            theme={{
              colors10: ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
              minBarWidth: 20,
              maxBarWidth: 20,
              // color: ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
            }}

            conversionTag={{
              offsetX: 10,
              offsetY: -10,
              style: {
                fill: 'white',
                fontSize: 12,
                fontWeight: 500,
                textBaseline: 'middle',
              },
            }}
          />
          )}
          {chartType === 'pie' && (
            <Pie
              data={mapDataToObjects(data)}
              angleField="count"
              colorField="city"
              radius={1.0}
              label={{
                type: 'outer',
                offset: 60,
                content: (item) => {
                  return `${item.city}: ${item.count} Leads`;
                },
                style: {
                  textAlign: 'center',
                  fontSize: 12,
                },
              }}
              legend={{
                position: 'bottom',
                flipPage: false,
              }}
              tooltip={{
                showMarkers: false,
              }}
              meta={{
                count: {
                  alias: 'Number of Leads',
                },
                city: {
                  alias: 'City',
                },
                status: {
                  alias: 'Status',
                },
              }}
              responsive={true}
              interactions={[{ type: 'element-selected' }, { type: 'element-active' }]}
              padding="auto"
              forceFit={true}
              theme={{
                colors10: ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
                minBarWidth: 20,
                maxBarWidth: 20,
                // color: ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
              }}
            />
          )}

          </Space>
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