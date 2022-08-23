import { Timeline } from 'antd';
import { useEffect, useState } from 'react';
import API from '../../api/BaseUrl';
import { SmileOutlined } from '@ant-design/icons';
const dayjs = require('dayjs')

const DriverTimeline = ({ id }) => {
  const [driverHistory, setDriverHistory] = useState([]);
  const options = {
    headers: {
        'Authorization': 'accessToken'
    }
  }

  useEffect(() => {
    getDriverHistory(id)
  }, []);

  const getDriverHistory = async(id) => {
    await API.get(`/v1/drivers/cc/${id}/logs`, options).then(response => {
      setDriverHistory(response.data.data)
      console.log(response.data.data)
      console.log(driverHistory)
    })
  }
  
  return(
    <Timeline mode='alternate'>
      {
        driverHistory.slice(0).reverse().map((item) => (
          <Timeline.Item 
          key={item.id} 
          color={item.action.includes('rejected') ? 'red' : 'green'}>
            {item.action} - {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm:ss')}
          </Timeline.Item> 
        ))
      }
    </Timeline>
  );
};

export default DriverTimeline;