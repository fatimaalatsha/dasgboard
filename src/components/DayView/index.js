import { useState, useEffect } from 'react' // Import React hooks
import { Table, Typography } from 'antd' // Import Ant components
import qs from 'qs' // Import qs library
import dayjs from 'dayjs' // Import dayjs
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import CurrentTimeLine from '../CurrentTimeLine' // Import Red Bar component
import DayCellShift from '../DayCellShift' // Import CellShift component
import { useFilterStore } from '../../store' // Import useFilterStore hook
import useDaySchedule from '../../hooks/use-day-schedule' // Import useDaySchedule hook

dayjs.extend(utc)
dayjs.extend(timezone)

const { Text, Title } = Typography

//get the papams that will be passed to filters through qs
const queryHandler = (params) => ({ // Get table params
  day: params.format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'),
  paginated: false,
})

const DayView = ({selectedDay, dummy, hours, tz, city }) => {
  const [hoveredCell, setHoveredCell] = useState(null) // Create state to store the hover state
  const scheduleFilter = useFilterStore(state => state.scheduleFilter)
  const { data, isLoading, error, refetch } = useDaySchedule(`/v1/shifts/${scheduleFilter.filter.city_id.replace('in|', '')}/drivers?${qs.stringify(queryHandler(selectedDay), { skipNulls: true, arrayFormat: 'comma' })}`, scheduleFilter.tz, ) // Call useSchedule hook
  const controller = new AbortController()// Create a new AbortController
  
  useEffect(() => {
    refetch()
    return () => controller.abort()// Abort fetch on unmount
  }, [selectedDay])

  const columns = [
    {
      title: 'Drivers',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (text, record) => (
        <Text style={{ textTransform: 'capitalize', width: 100 }} ellipsis={{ suffix: '...', tooltip: true }} >{text}</Text>
      )
    },
    {
      title: (
      <Title level={5}>{`${selectedDay.format('MMM, dddd DD - YYYY')} ${dayjs().tz(tz).format('HH:mm')} ${dayjs().tz(tz).format('zZ')} `}</Title>
      ),
      children: [
        ...hours.map((hour, idx) => ({ // Loop through the days
          title: `${hour}`,
          align: 'center',
          children: [
            {
              title: (<Text type="secondary" code >{`${hour.substring(1,2) + idx}`}</Text>),
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
                for ( let item = 0; item < record[hour].length; item++ ) {
                  if ( dayjs(record[hour][item].start_time).tz(scheduleFilter.tz).format('HH:mm') === hour ) {
                    return (
                      <DayCellShift 
                        isCellFilled={dayjs(record[hour][item].start_time).tz(scheduleFilter.tz).format('HH:mm') === hour}
                        record={record[hour][item]}
                        hour={hour}
                        day={selectedDay}
                        setHoveredCell={(values) => setHoveredCell({time: values.time, day: values.day})}
                        refetch={refetch}
                        city={city}
                      />
                    )
                  }
                }
    
                return (
                  <DayCellShift 
                    display={hoveredCell?.key === record.key && hoveredCell?.hour === hour} 
                    record={record} 
                    hour={hour}
                    day={selectedDay}
                    setHoveredCell={(values) => setHoveredCell({time: values.time, day: values.day})}
                    refetch={refetch}
                    city={city}
                  />
                )
              },
            }
          ],
        })),
      ]
    }
  ]

  error && <>Something went wrong...</>
  
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
      />
      <CurrentTimeLine axis tz={tz} />
    </div>
  )
}

export default DayView