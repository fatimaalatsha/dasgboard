import { useState, useEffect, useRef } from 'react' // Import React hooks
import { Table, Typography, Tooltip, Space, theme } from 'antd' // Import Ant components
import qs from 'qs' // Import qs library
import dayjs from 'dayjs' // Import dayjs
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import CurrentTimeLine from '../CurrentTimeLine' // Import Red Bar component
import DayCellShift from '../DayCellShift' // Import CellShift component
import CalendarFilterBar from '../CalendarFilterBar' // Calendar Filters and navigation
import { useFilterStore } from '../../../store' // Import useFilterStore hook
import useDaySchedule from '../../../hooks/use-day-schedule' // Import useDaySchedule hook
import { shiftCount } from '../../../utils/schedule-status' // Import counter for each hour on shifts
import ExpandableDayShift from '../ExpandableDayShift'

dayjs.extend(utc)
dayjs.extend(timezone)

const { Text, Title } = Typography
const { useToken } = theme

//get the papams that will be passed to filters through qs
const queryHandler = (params) => ({ // Get table params
  day: params.day,
  limit: params.pagination?.pageSize,
  page: params.pagination?.current,
  ...params
})

const DayView = ({
  selectedDay, 
  hours, 
  setHours,
  tz, 
  city, 
  loadTimeline,
  handleWeekChange,
  handleTodayClick,
  selectedDate,
  setSelectedDate
 }) => {
  const [hoveredCell, setHoveredCell] = useState(null) // Create state to store the hover state
  const scheduleFilter = useFilterStore(state => state.scheduleFilter)
  const dayFilter = useFilterStore( state => state.dayFilter) // get local day view filters
  const setDayFilter = useFilterStore( state => state.setDayFilter ) // set local day view filters
  const componentIsMounted = useRef(false) // Create a ref to store the component mount state
  const { token } = useToken() // Antd Theme token property
  const MIN_DRIVER = 0
  const { 
    data,
    response, 
    isLoading, 
    error, 
    refetch 
  } = useDaySchedule(`/v1/shifts/${scheduleFilter.filter.city_id.replace('in|', '')}/drivers?${qs.stringify(queryHandler({day: selectedDay.format('YYYY-MM-DD'), ...dayFilter}), { skipNulls: true, arrayFormat: 'comma' })}`, scheduleFilter.tz, selectedDay ) // Call useSchedule hook

  const titleStyle = {
    backgroundColor: token['red-3'],
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }

  const handleTableChange = (pagination, filter, sorter) => { // Table filters handler
    setDayFilter({
      pagination: {
        ...dayFilter.pagination,
        ...pagination,
      }
    })
  }

  const getShiftCount = ( filteredData, hourLabel, tz, selectedDay) => { // Shift column counter
    return shiftCount(filteredData, hourLabel, tz, selectedDay)
  }
  
  useEffect(() => {
    setDayFilter({
      pagination: {
        ...dayFilter.pagination,
        total: response.meta?.total_items,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} Drivers`,
      }
    })

    refetch()
  }, [selectedDay, city])

  error && <>Something went wrong...</>

  const filteredData = response?.data.map(item => ({ // Filter response to include only approved shifts
    ...item,
    shifts: item.shifts.filter(shift => shift.application.status === 'approved')
  })).filter(item => item.shifts.length > 0)

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
            record.driver.name === 'Week Shift' ?
            '' : (
            <Space direction="vertical">
              <Text>{text}</Text>
              <Text>{`DL# ${record.driver.license_number}`}</Text>
              <Text>{`Tel. ${record.driver.phone}`}</Text>
            </Space>
          )} 
        >
          <Text style={{ textTransform: 'capitalize', width: 100 }} ellipsis={{ suffix: '' }} >{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: (
      <Title level={5}>{`${selectedDay.format('MMM, dddd DD - YYYY')} ${dayjs().tz(tz).format('HH:mm')} ${dayjs().tz(tz).format('zZ')} `}</Title>
      ),
      children: [
        ...hours.map((hour, idx) => { // Loop through the days
          const computedCount = getShiftCount(filteredData, hour.label, scheduleFilter.tz, selectedDay)
          return { 
            title: <>{hour.label}</>,
            align: 'center',
            children: [
              {
                title: () => {
                  
                  return ( 
                    <div>
                        <Text key={idx} code>
                          {computedCount}
                        </Text> 
                    </div>
                  )
                },
                onHeaderCell: () => ({
                  style: computedCount < scheduleFilter.staff ? { backgroundColor: token['red-2'], color: 'white', borderColor: token['red-1'] } : { }
                }),
                dataIndex: hour.label,
                key: idx,
                align: 'center',
                onCell: (record) => ({
                    style: computedCount < scheduleFilter.staff ? { backgroundColor: token['red-3'], color: 'white', borderColor: token['red-2'], width: 60 } : { width: 60 },
                    onMouseEnter: () => { // Mouse enter event
                        setHoveredCell({ key: record.key, hour: hour.label })
                    },
                    onMouseLeave: () => { // Mouse leave event
                        setHoveredCell(null)
                    },
                }),
                render: (text, record ) => {
                  return (
                    <div className="container" style={{ minHeight: 24, height: '100%', zIndex: 999 }}>
                      { record[hour.label].length > 0 ? record[hour.label].map((item, idx) => (
                          <DayCellShift 
                            key={idx}
                            isCellFilled={dayjs(item.start_time).tz(scheduleFilter.tz).utc().format('HH:mm') === hour.label}
                            record={item}
                            hour={hour.label}
                            day={selectedDay}
                            setHoveredCell={(values) => setHoveredCell({time: values.time, day: values.day})}
                            refetch={refetch}
                            city={city}
                            user_id={record.key}
                          />
                      )) : (
                        <DayCellShift 
                          display={hoveredCell?.key === record.key && hoveredCell?.hour === hour.label} 
                          record={record} 
                          hour={hour.label}
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
          }
      }),
      ]
    }
  ]

  return (
    <>
      <CalendarFilterBar 
          checkDisabled={loadTimeline}
          handleWeekChange={handleWeekChange}
          handleTodayClick={handleTodayClick}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          refetch={refetch}
          hours={hours}
          setHours={setHours}
          data={response.data}
      />
      <div style={{ position: 'relative'}}>
        <Table 
            columns={columns}
            dataSource={data}
            loading={isLoading}
            pagination={dayFilter.pagination}
            onChange={handleTableChange}
            className="schedule-day-table"
            bordered
            size="small"
            expandable={{
              expandedRowRender: () => (
                <ExpandableDayShift 
                  day={selectedDay}
                />
              ),
              rowExpandable: (record) => record.driver.name === 'Week Shift'
            }}
        />
        {loadTimeline && <CurrentTimeLine axis tz={tz} />}
      </div>
    </>
  )
}

export default DayView