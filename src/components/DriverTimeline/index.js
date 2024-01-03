import { Timeline } from 'antd'// Import Timeline component from antd
import useFetch from '../../hooks/use-new-fetch' // Import useFetch custom hook

const dayjs = require('dayjs')

const DriverTimeline = ({ id }) => {
  const { data, isLoading, error } = useFetch(`/v1/drivers/${id}/logs`)// Call useFetch custom hook

  if(isLoading) {
    return <div>Loading...</div>
  }

  if(error) {
    return <div>Error...</div>
  }
  
  return(
    <Timeline mode='alternate'>
      {
        data.reverse().map((item, index) => (
          <Timeline.Item 
          key={index} 
          color={item.description.includes('rejected') ? 'red' : 'green'}>
            {item.description} - {dayjs(item.created_at).format('MMM, DD - YYYY hh:mm A')}
          </Timeline.Item> 
        ))
      }
    </Timeline>
  );
};

export default DriverTimeline;