import { useState } from 'react';
import { Typography, Card, Space, DatePicker, Button, Tooltip, Result, Row, Col, Divider, Table} from 'antd';
import useNewFetch from '../../hooks/use-new-fetch';
import qs from 'qs';
import dayjs from 'dayjs';

import { EditOutlined } from '@ant-design/icons';
import ChartColumn from '../../components/ChartColumn';
import CardStatistic from '../../components/CardStatistic';

const { Title, Text} = Typography;

const NumberOfEligiblLeads = (dateFrom) => {

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

  const { data, error, isLoading } = useNewFetch(`/v1/reports/conversion-rates?${getUserParams()}`);
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong...</p>;



const processData = (data) => {
  const result = [];

  // loop over the items array
  data.items.forEach((item) => {
    // create a new object for eligible users with the required properties
    const eligibleObj = {
      city: item.city,
      count: item.eligible_rate,
      status: 'Eligible Rate',
    };

    // push the new object into the result array
    result.push(eligibleObj);

    // create a new object for active users with the required properties
    // const activeObj = {
    //   city: item.city,
    //   count: item.total_rate,
    //   status: 'Total Rate',
    // };

    

    // // push the new object into the result array
    // result.push(activeObj);
  });
  return result;
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
            <Title level={3}>Conversion Rates By Application</Title>
          </Space>
            }>
         <Row  align="middle">
          <Col span={24}>
            <Space direction="vertical" size="large" style={{ width: '100%' }} >
                  <Space direction="horizontal" size="large"  style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                        <CardStatistic title="Total Applicants" width={165} value={data.meta.total_applicants} color="#3f8600" popInfo="Total Number of leads shown"/>
                        <CardStatistic title="Active" value={data.meta.total_active} color="#3f8600" popInfo={` Number of Activated drivers in the selected period`} />
                        <CardStatistic title="Eligible" value={data.meta.total_eligible} color="#f50707" popInfo="Number of Eligible Drivers " />
                        <CardStatistic title=" Active Rate Total" fontSize={1.20} value={data.meta.total_rate} color="#3f8600" popInfo="Total Conversion Rate across all cities" />
                        <CardStatistic title=" Eligible Rate Total "  fontSize={1.20} value={data.meta.total_eligible} color="#3f8600" popInfo="Eligible Rate across all cities" />
                  </Space>
              <Divider orientation="left" plain>
                    <Text>Eligible Rate <Text strong >{dateFrom.date_from}</Text>  to <Text strong>{dateFrom.date_to} </Text></Text>
              </Divider>
              <ChartColumn props={processData(data)} xField="city" yField="count" seriesField="status" isGroup={true} isStack={false}
                label={
                  {
                    position: 'top',
                    style: {
                      fill: '#000',
                      opacity: 0.6,
                    },
                    content: (item) => {
                        return item.count ? `${item.count}%` : '';
                    }

                  }
                  
                } />
            </Space>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Divider orientation="left" plain>
                    <Text>Eligible Rate and Active Rate Users from <Text strong >{dateFrom.date_from}</Text>  to <Text strong>{dateFrom.date_to} </Text>per City </Text>
                  </Divider>
                      <Table
                        dataSource={data.items}
                        columns={[
                          {
                            title: 'City',
                            dataIndex: 'city',
                            key: 'city',
                            render: (text) => <Text strong>{text}</Text>,
                          },
                          {
                            title: 'Total Applicants',
                            dataIndex: 'total',
                            key: 'total',
                            render: (text) => <Text strong>{text}</Text>,
                          },
                          {
                            title: 'Active',
                            dataIndex: 'active',
                            key: 'active',
                            render: (text) => <Text strong>{text}</Text>,
                          },
                          {
                            title: 'Eligible',
                            dataIndex: 'eligible',
                            key: 'eligible',
                            render: (text) => <Text strong>{text}</Text>,
                          },
                          {
                            title: 'Total Rate ',
                            dataIndex: 'total_rate',
                            key: 'total_rate',
                            render: (text) => <Text strong>{text}%</Text>,
                          },
                          {
                            title: 'Eligible Rate ',
                            dataIndex: 'eligible_rate',
                            key: 'eligible_rate',
                            render: (text) => <Text strong>{text} %</Text>,
                          },
                        ]}
                      />
                </Space>
                
          </Col>
        </Row>
      </Card>
      
    </>
  );
};


//   const getUserParams = () => {
//     const { date_from, date_to } = dateFrom;
//     return qs.stringify(
//       {
//         date_from,
//         date_to,
//         type: 'ineligible',
//       },
//       { skipNulls: true, arrayFormat: 'comma' }
//     );
//   };

//   const { data, error, isLoading } = useNewFetch(`/v1/reports/conversion-rates?${getUserParams()}`);
//   console.log(data);
 
//   if (isLoading) return <p>Loading...</p>;
//   if (error) return <p>Something went wrong...</p>;

// const countActive = (data) => {
//  var total = 0;
//     for (var i = 0; i < data.length; i++) {
//       total += data[i].active;
//     }
//     return total;
//   };
  
//   const countAll = (data) => {
//     var total = 0;
//     for (var i = 0; i < data.length; i++) {
//       total += data[i].total;
//     }
//     return total;
//   };

//   const countEligible = (data) => {
//     var total = 0;
//     for (var i = 0; i < data.length; i++) {
//       total += data[i].eligible;
//     }
//     return total;
//   };

// const processData = (data) => {
//   const result = [];

//   // loop over the items array
//   data.items.forEach((item) => {
//     // create a new object for eligible users with the required properties
//     const eligibleObj = {
//       city: item.city,
//       count: item.eligible,
//       status: 'eligible',
//     };

//     // push the new object into the result array
//     result.push(eligibleObj);

//     // create a new object for active users with the required properties
//     const activeObj = {
//       city: item.city,
//       count: item.active,
//       status: 'active',
//     };

    

//     // push the new object into the result array
//     result.push(activeObj);
//   });

//   console.log(result);
//   return result;
// };

//   if (data.total_items === 0) {
//     return (
//       <Card
//       title={
//           <Space direction="vertical" size="large">
//             <Title level={3}>Number of Leads By Application</Title>
//           </Space>
//             }
//       >
//         <Result
//           status="warning"
//           title="No data found for the selected date range"

//           extra={
//           <Text type="warning">
//              Select another date range.
//             </Text >
//            }
//         />
//       </Card>
//     )
//   }
//   return (
//     <>
        
//       <Card
//         title={
//           <Space direction="vertical" size="large">
//             <Title level={3}>Conversion Rates By Application</Title>
//           </Space>
//             }>
//          <Row  align="middle">
//           <Col span={24}>
//             <Space direction='horizontal' size="large" >
//         </Space>
       
//            <Space direction="vertical" size="large" style={{ width: '100%' }}>
//               <Space direction="horizontal"  style={{ width: '100%' }} >
//                     <CardStatistic title="Total Applicants" width={165} value={countAll(data.items)} color="#3f8600" popInfo="Total Number of leads shown"/>
//                     <CardStatistic title="Active" value={countActive(data.items)} color="#3f8600" popInfo={` Number of Activated drivers in the selected period`} />
//                     <CardStatistic title="Eligible" value={countEligible(data.items)} color="#f50707" popInfo="Number of drivers that are not eligible to be activated & DNC" />
//                     <CardStatistic title="Conversion Rate Total" fontSize={1.20} value={88} color="#3f8600" popInfo="Total Conversion Rate across all cities" />
//                     <CardStatistic title="Conversion Rate Eligible"  fontSize={1.20} value={77} color="#3f8600" popInfo="Eligible Conversion Rate across all cities" />
//               </Space>
//                 <Divider orientation="left" plain>
//                 <Text strong>Eligible and Active Users for Selected Time </Text>
//                 </Divider>
//               <ChartColumn props={processData(data)} xField="city" yField="count" seriesField="status" isGroup={true} isStack={false} />
//               <Divider orientation="left" plain>
//                 <Text strong>Ieligible and Active Users for Selected Time </Text>
              
//               </Divider>
//             </Space>
//           </Col>
//         </Row>
//       </Card>
      
//     </>
//   );
// };

        
 


const ConversionRatesByApplication = () => {
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
      {showReport && <NumberOfEligiblLeads date_from={date.filter.date_from} date_to={date.filter.date_to} />}

    </>
  );
};


export default ConversionRatesByApplication;