import { useState } from 'react';
import { Typography, Card, Space, Collapse, DatePicker, Button } from 'antd';
import { Bar } from '@ant-design/plots';
import useFetch from '../../hooks/use-fetch';
import qs from 'qs';
import dayjs from 'dayjs';

const { Title } = Typography;

const ReportsDetails = () => {
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
  console.log(data)
  
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
        <DatePicker.RangePicker onChange={handleDatePick} />
        <Bar
          data={mapDataToObjects(data)}
          xField="count"
          yField="city"
          seriesField="status"
          isStack={true}
          // isPercent= {true}

          label={{
            position: 'middle',
            content: (item) => {
              return item.value;
            },
            style: {
              fill: '#fff',
            },
            minBarWidth: 20,
            maxBarWidth: 20,
            color: ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
          }}
        />
      </>
    );
  }
};

export default ReportsDetails;