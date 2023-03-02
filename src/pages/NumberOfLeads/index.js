import { useState } from 'react';
import { Typography, Card, Space, Collapse, DatePicker, Button, Col, Row } from 'antd';
import { Bar , Column} from '@ant-design/plots';
import useFetch from '../../hooks/use-fetch';
import qs from 'qs';
import dayjs from 'dayjs';

const { Title } = Typography;

const NumberOfLeads = () => {
  const [date, setDate] = useState({
    filter: {
      date_from: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
      date_to: dayjs().format('YYYY-MM-DD'),
    },
  });
  const [dataSet, setDataSet] = useState();
  
  const getUserParams = () => { //  get the user params to be used in the useFetch hook
    const { date_from, date_to } = date.filter;
    return qs.stringify(
      {
        date_from,
        date_to,
      },
      { skipNulls: true, arrayFormat: 'comma' }
    );
  };

  // Fetch data from API
  const { data, error, isLoading } = useFetch(
    `/v1/reports/drivers-status?${getUserParams()}`
  );
  console.log(data);
  // handle the date picker change
  const handleDatePick = (dates) => {
    setDate({
      filter: {
        date_from: dates[0].format('YYYY-MM-DD'),
        date_to: dates[1].format('YYYY-MM-DD'),
      },
    });
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;
  if (data) {
 const mapDataToObjects = (data) => {
  const { items } = data;
  const mappedData = [];

  // Loop over each city
  for (const cityObj of Object.values(items)) {
    // If cityObj is an object, it contains an array of data objects
    if (typeof cityObj === 'object' && cityObj.data) {
      for (const dataObj of cityObj.data) {
        mappedData.push({
          status: dataObj.status,
          city: cityObj.city,
          count: dataObj.count,
        });
      }
    } else {
      // If cityObj is not an object with data, it is a single data object
      mappedData.push({
        status: cityObj.status,
        city: items.city,
        count: cityObj.count,
      });
    }
  }
   return mappedData;
    }
    return (
      <>
        <Card>
         <Title level={3}>Number of Leads</Title>
        <Space direction="vertical" size="large">
          <DatePicker.RangePicker
            onChange={handleDatePick}
            renderExtraFooter={() => {
              return (
                <Button type="primary" onClick={() => {console.log('yoo')}}>
                  OK
                </Button>
              );
            }}
            />
        </Space>
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
     

        </Card>
      </>
    );
  }
};

export default NumberOfLeads;