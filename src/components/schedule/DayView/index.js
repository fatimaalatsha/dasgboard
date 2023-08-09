import { useState, useEffect } from 'react' // Import React hooks
import { Table, Typography, Tooltip, Space, Switch } from 'antd' // Import Ant components
import qs from 'qs' // Import qs library
import dayjs from 'dayjs' // Import dayjs
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import CurrentTimeLine from '../CurrentTimeLine' // Import Red Bar component
import DayCellShift from '../DayCellShift' // Import CellShift component
import { useFilterStore } from '../../../store' // Import useFilterStore hook
import useDaySchedule from '../../../hooks/use-day-schedule' // Import useDaySchedule hook
import DayColumnHighlight from '../DayColumnHighlight'

dayjs.extend(utc)
dayjs.extend(timezone)

const { Text, Title } = Typography

//get the papams that will be passed to filters through qs
const queryHandler = (params) => ({ // Get table params
  day: params.format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'),
  paginated: false,
})

const DayView = ({selectedDay, hours, tz, city, loadTimeline }) => {
  const [hoveredCell, setHoveredCell] = useState(null) // Create state to store the hover state
  const scheduleFilter = useFilterStore(state => state.scheduleFilter)
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useDaySchedule(`/v1/shifts/${scheduleFilter.filter.city_id.replace('in|', '')}/drivers?${qs.stringify(queryHandler(selectedDay), { skipNulls: true, arrayFormat: 'comma' })}`, scheduleFilter.tz, ) // Call useSchedule hook
  const controller = new AbortController()// Create a new AbortController
  
  useEffect(() => {
    refetch()
    return () => controller.abort()// Abort fetch on unmount
  }, [selectedDay, city])

  const columns = [
    {
      title: 'Drivers',
      dataIndex: ['driver', 'name'],
      key: 'key',
      width: 100,
      render: (text, record) => (
        <Tooltip 
          color={'#FFF'} 
          placement="topLeft"
          title={
            <Space direction="vertical">
              <Text>{text}</Text>
              <Text>{`DL# ${record.driver.license_number}`}</Text>
              <Text>{`Tel. ${record.driver.phone}`}</Text>
            </Space>
          } 
        >
          <Text style={{ textTransform: 'capitalize', width: 100 }} ellipsis={{ suffix: '' }} >{text}</Text>
        </Tooltip>
      )
    },
    {
      title: (
      <Title level={5}>{`${selectedDay.format('MMM, dddd DD - YYYY')} ${dayjs().tz(tz).format('HH:mm')} ${dayjs().tz(tz).format('zZ')} `}</Title>
      ),
      children: [
        ...hours.map((hour, idx) => ({ // Loop through the days
          title: <>{hour}</>,
          align: 'center',
          children: [
            {
              title: () => {
                return ( <Text key={idx} type="secondary" code >{`${hour.substring(0,2)}`}</Text> )
                /* return data.filter(item => item[hour].length > 0).map((item, idx) => {
                  //console.log(item)
                  return (
                    <Text key={idx} type="secondary" code >{`${item[hour].length}`}</Text>
                )}) */
                
              },
              dataIndex: hour,
              key: idx,
              align: 'center',
              onCell: (record) => {
                  return {
                      onMouseEnter: () => { // Mouse enter event
                          setHoveredCell({ key: record.key, hour: hour })
                      },
                      onMouseLeave: () => { // Mouse leave event
                          setHoveredCell(null)
                      },
                  }
              },
              render: (text, record ) => {
                return (
                  <div className="container" style={{ minHeight: 24, height: '100%', zIndex: 999 }}>
                    { record[hour].length > 0 ? record[hour].map((item, idx) => (
                        <DayCellShift 
                          key={idx}
                          isCellFilled={dayjs(item.start_time).tz(scheduleFilter.tz).utc().format('HH:mm') === hour}
                          record={item}
                          hour={hour}
                          day={selectedDay}
                          setHoveredCell={(values) => setHoveredCell({time: values.time, day: values.day})}
                          refetch={refetch}
                          city={city}
                          user_id={record.key}
                        />
                    )) : (
                      <DayCellShift 
                        display={hoveredCell?.key === record.key && hoveredCell?.hour === hour} 
                        record={record} 
                        hour={hour}
                        day={selectedDay}
                        setHoveredCell={(values) => setHoveredCell({time: values.time, day: values.day})}
                        refetch={refetch}
                        city={city}
                        user_id={record.key}
                      />
                    )}
                  </div>
                )
              },
            }
          ],
        })),
      ]
    }
  ]

  error && <>Something went wrong...</>
  //console.log(data)
  return (
    <div style={{ position: 'relative'}}>
      <Table 
          columns={columns}
          dataSource={data}
          loading={isLoading}
          pagination={false}
          className="schedule-day-table"
          bordered
          size="small"
          summary={pageData => {
            return (
              <></>
            )
          }}
      />
      {loadTimeline && <CurrentTimeLine axis tz={tz} />}
    </div>
  )
}

export default DayView