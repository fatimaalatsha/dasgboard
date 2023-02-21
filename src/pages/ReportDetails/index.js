import { useState } from 'react';

import {Typography, Card, Space, Collapse, DatePicker,} from 'antd';

import { Bar , Column , Pie} from '@ant-design/plots';
import useFetch from '../../hooks/use-fetch' // Import useFetch custom hook

import qs from 'qs' // Import qs library
import dayjs from "dayjs"// Import date handlers

import EditableRangePicker from '../../components/EditableRangePicker';

const { Panel } = Collapse // destructuring Collapse component
const { Title } = Typography;



// const ConversionRatesPerCity = () => {

// const [date, setDate] = useState({
// filter: {
//   date_from: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
//   date_to: dayjs().format('YYYY-MM-DD'),
// }
// })

//   const { data, error, isLoading } = useFetch(`/v1/reports/conversion-rates?${qs.stringify(date)}`) // useFetch custom hook
//   console.log(data)



//   if (isLoading) return <p>Loading...</p>
//   if (error) return <p>Something went wrong...</p>
//   if (data) {

//     const dataSet = data.items.map((item) => {
//       return {
//         percentage: item.percentage,
//         city: item.city,
//       }
//     })


   
//   return (
//     <>
//           <Bar
//             data={dataSet}
//             xField="percentage"
//             yField="city"
//             seriesField= 'city'
//             //isPercent={true}
//             isStack={true}
//             label={{
//               position: 'middle',
//               content: (item) => {
//                 return item.value;
//               },
//               style: {
//                 fill: '#fff',
//               },
//               minBarWidth: 20,
//               maxBarWidth: 20,
//               color : ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
//             }}
//           />
//     </>
//   );
//   };
// };

// const ConversionRatesPerStage = () => {
//   const { data, error, isLoading } = useFetch('/v1/reports/drivers-status') // useFetch custom hook
//   console.log(data)
//   if (isLoading) return <p>Loading...</p>
//   if (error) return <p>Something went wrong...</p>
//   // const dataSet = [
//   //   {
//   // stage: 'registration',
//   //     city: 'Thunder Bay',
//   //     value: 21,
//   //   },
//   //    {
//   // stage: 'onboard',
//   //     city: 'Thunder Bay',
//   //     value: 29,
//   //   },
//   //      {
//   // stage: 'pending',
//   //     city: 'Thunder Bay',
//   //     value: 49,
//   //   },


//   if (data) {
//     const dataSet = data.items.map((item) => {
//       return {
//         city: item.city,
//         state: [ item.active, item.onboard, item.pending],
//         // onboard: item.onboard,
//         // pending: item.pending,
//         // active: item.active,
//         total_drivers: item.total_drivers,
        
//       }
//     })
//     console.log(dataSet)
//     return ( 
//       <Bar
//         data={dataSet}
//         xField="value"
//         yField="city"
//         seriesField="stage"
//         //isPercent={true}
//         isStack={true}
//         label={{
//           position: 'middle',
//           content: (item) => {
//             return item.value.toFixed(2),'%';
//           },
//           style: {
//             fill: '#fff',
//           },
//           minBarWidth: 20,
//           maxBarWidth: 20,
//           slider: {
//             start: 1,
//             end: 2,
//           },
//           color: ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
//         }}
//       />
//     );
//   };
// };


const ReportsDetails = () => {
  const [date, setDate] = useState({
filter: {
  date_from: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
  date_to: dayjs().format('YYYY-MM-DD'),
}
  })

  const getUserParams = (date) => ({ // Get table params
    ...date,
})

  
  const handleDatePick = (date, dateString) => {
    
    setDate({
      filter: {
        date_from: dateString[0],
        date_to: dateString[1],
      }
    })

  }
  const { data, error, isLoading } = useFetch(`/v1/reports/conversion-rates?${qs.stringify(getUserParams(date))}`) // useFetch custom hook
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
        <EditableRangePicker updateCallback={handleDatePick} />
      </Card>
        <Title level={4}>Conversion Rates Per City</Title>
          {/* <ConversionRatesPerCity /> */}
        <Card>
          <Title level={4}>Conversion Rates Per Stage</Title>
            {/* <ConversionRatesPerStage /> */}
        </Card>
    </Card>
  );
};



export default ReportsDetails;