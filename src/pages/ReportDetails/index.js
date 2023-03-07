import { useState } from 'react';
import { Typography, Card, Space, DatePicker, Button, Tooltip } from 'antd';
import { Bar , Column, Pie} from '@ant-design/plots';
import useFetch from '../../hooks/use-fetch';
import qs from 'qs';
import dayjs from 'dayjs';

import { EditOutlined } from '@ant-design/icons';

const { Title } = Typography;

const DriversStatusPerCity= (dateFrom) => {
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
    `/v1/reports/conversion-rates?${getUserParams()}`
  );

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;
  return (
    <>
      <Card>
        <Title level={3}>Drivers Status Per City</Title>
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
          data={data.items}
          xField="total"
          yField="city"
          seriesField="active"
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
              return item.total;

  // const percent = ((item.total / item.data.total) * 100).toFixed(2);
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
            total: {
              alias: 'Number of Leads',
            },
            city: {
              alias: 'City',
            },
            active: {
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
            data={data.items}
            xField="city"
            yField="total"
            seriesField="active"
            isStack={true}
            label={{
              position: 'middle',
              content: (item) => {
                return item.total;
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
              total: {
                alias: 'Number of Leads',
              },
              city: {
                alias: 'City',
              },
              active: {
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
              data={data.items}
              angleField="total"
              colorField="city"
              radius={1.0}
              label={{
                type: 'outer',
                offset: 60,
                content: (item) => {
                  return `${item.city}: ${item.total} Leads`;
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
                total: {
                  alias: 'Number of Leads',
                },
                city: {
                  alias: 'City',
                },
                active: {
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

  
  
  const handleDatePick = () => {
    // setPickStats(true);
    setShowReport(true);
  };

  return (
    <>
    <Space align="start" direction="horizontal">
      <DatePicker.RangePicker
        // autoFocus={isEnable}
        open={isEnable}
        allowClear={true}
        inputReadOnly={true}
        size="small"
        showToday={false}
        // format={dateFormat}
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
                handleDatePick();
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
      {showReport && <DriversStatusPerCity date_from={date.filter.date_from} date_to={date.filter.date_to} />}
    </>
  );
};


export default NumberOfLeads;