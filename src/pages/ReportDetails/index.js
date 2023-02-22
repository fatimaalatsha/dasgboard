import { useState } from 'react';

import {Typography, Card, Space, Collapse, DatePicker,} from 'antd';

import { Bar , Column , Pie} from '@ant-design/plots';
import useFetch from '../../hooks/use-fetch' // Import useFetch custom hook

import qs from 'qs' // Import qs library
import dayjs from "dayjs"// Import date handlers


const { Panel } = Collapse // destructuring Collapse component
const { Title } = Typography;



const ConversionRatesPerCity = () => {

const [date, setDate] = useState({
filter: {
  date_from: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
  date_to: dayjs().format('YYYY-MM-DD'),
}
})

  const { data, error, isLoading } = useFetch(`/v1/reports/conversion-rates?date_from=2022-01-01&date_to=2022-12-01`) // useFetch custom hook
  console.log(data)



  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Something went wrong...</p>
  if (data) {

    const dataSet = data.items.map((item) => {
      return {
        percentage: item.percentage,
        city: item.city,
      }
    })


   
  return (
    <>
          <Bar
            data={dataSet}
            xField="percentage"
            yField="city"
            seriesField= 'city'
            //isPercent={true}
            isStack={true}
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
              color : ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
            }}
          />
    </>
  );
  };
};

const ConversionRatesPerStage = () => {
  const { data, error, isLoading } = useFetch('/v1/reports/drivers-status') // useFetch custom hook
  console.log(data)
  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Something went wrong...</p>
  // const dataSet = [
  //   {
  // stage: 'registration',
  //     city: 'Thunder Bay',
  //     value: 21,
  //   },
  //    {
  // stage: 'onboard',
  //     city: 'Thunder Bay',
  //     value: 29,
  //   },
  //      {
  // stage: 'pending',
  //     city: 'Thunder Bay',
  //     value: 49,
  //   },


  if (data) {
    const dataSet = data.items.map((item) => {
      return {
        city: item.city,
        state: [ item.active, item.onboard, item.pending],
        // onboard: item.onboard,
        // pending: item.pending,
        // active: item.active,
        total_drivers: item.total_drivers,
        
      }
    })
    console.log(dataSet)
    return ( 
      <Bar
        data={dataSet}
        xField="value"
        yField="city"
        seriesField="stage"
        //isPercent={true}
        isStack={true}
        label={{
          position: 'middle',
          content: (item) => {
            return item.value.toFixed(2),'%';
          },
          style: {
            fill: '#fff',
          },
          minBarWidth: 20,
          maxBarWidth: 20,
          slider: {
            start: 1,
            end: 2,
          },
          color: ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
        }}
      />
    );
  };
};


const ReportsDetails = () => {
  const [date, setDate] = useState({
filter: {
  date_from:'',
  date_to: '',
}
  })

    const [date_from, setDate_from] = useState('')
    const [date_to, setDate_to] = useState('')

  const getUserParams = (date) => ({ // Get table params
    ...date,
})

  
  const handleDatePick = (dateString) => {
      console.log(dateString)
      setDate_from(dateString[0].format('YYYY-MM-DD'))
      setDate_to(dateString[1].format('YYYY-MM-DD'))
  }
  const { data, error, isLoading } = useFetch(`/v1/reports/conversion-rates?date_from=${date_from}&date_to=${date_to}`) // useFetch custom hook
  console.log(data)

  
  return (
    <Card
    title={
                <Space align="start">
                    <Title>Conversion Rates</Title>
                </Space>
            }>
      <Card>
        <Title level={4}>choose a date</Title>
              {/* <EditableRangePicker updateCallback={handleDatePick} /> */}
              <DatePicker.RangePicker onChange={handleDatePick} />
      </Card>
        <Title level={4}>Conversion Rates Per City</Title>
          <ConversionRatesPerCity />
        <Card>
          <Title level={4}>Conversion Rates Per Stage</Title>
            {/* <ConversionRatesPerStage /> */}
        </Card>
    </Card>
  );
};



export default ReportsDetails;