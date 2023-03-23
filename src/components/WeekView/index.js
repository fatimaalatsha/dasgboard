import { useState } from 'react' // Import React hooks
import { Table, Space, Typography, Result } from 'antd' // Import Ant components
import { geekblue } from '@ant-design/colors' // Import Ant colors
import dayjs from 'dayjs' // Import dayjs

import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import CurrentTimeLine from '../CurrentTimeLine' // Import Red Bar component
import CellShift from '../CellShift' // Import CellShift component
import { CitySelect } from '../CitySelect'
import { useFilterStore } from '../../store'
import { getCityTimezone } from '../../utils/city-status'

const { Text, Title } = Typography

dayjs.extend(utc)
dayjs.extend(timezone)

const WeekView = ({selectedWeek, data, days, tz }) => {
  const [hoveredCell, setHoveredCell] = useState(null) // Create state to store the hover state
  const scheduleFilter = useFilterStore(state => state.scheduleFilter)
  const setScheduleFilter = useFilterStore(state => state.setScheduleFilter)

  const columns = [
    {
      title: (
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Title level={5} style={{ margin: 0 }}>Time</Title>
            <Text>{`${dayjs().tz(tz).format('HH:mm')} ${dayjs().tz(tz).format('zZ')}`}</Text>
        </Space>
        ),
      dataIndex: 'time',
      key: 'time',
      render: (text, record) => (
        <Text strong align="center" style={{ textTransform: 'capitalize', width: '100%', display: 'block' }}>{text}</Text>
        ),
    },
    ...days.map((day, idx) => ({ // Loop through the days
      title: (
          <Space direction="vertical">
              <Title 
                  level={2} 
                  style={{ 
                      margin: 0,
                      ...(selectedWeek.day(idx).format('DD-MM-YYYY') === dayjs().format('DD-MM-YYYY') && { 
                          color: '#FFFFFF', 
                          backgroundColor: geekblue[6], 
                          padding: '2px 8px', 
                          borderRadius: 100 
                      }),
                  }}
              >
                  {selectedWeek.day(idx).date()}
              </Title>
              <Text 
                  type="secondary" 
                  style={{ 
                      ...(selectedWeek.day(idx).format('DD-MM-YYYY') === dayjs().format('DD-MM-YYYY') && { 
                          color: geekblue[6], 
                          fontWeight: 'bold',
                          }),
                      textTransform: 'capitalize',
                  }}
              >
                  {day.substring(0, 3)}
              </Text>
          </Space>
      ),
      dataIndex: day,
      key: idx,
      width: 200,
      align: 'center',
      onCell: (record) => {
          return {
              onMouseEnter: () => { // Mouse enter event
                  setHoveredCell({ time: record.time, day: day })
              },
              onMouseLeave: () => { // Mouse leave event
                  setHoveredCell(null)
              },
          }
      },
      render: (text, record ) => {
        for ( let item = 0; item < record[day].length; item++ ) {
            if (record[day][item].dayOfWeek === day && record[day][item].start === record.time) {
                return (
                    <CellShift 
                        key={item} 
                        isCellFilled={record[day][item].dayOfWeek === day && record[day][item].start === record.time} record={record[day][item]} 
                        setHoveredCell={(values) => setHoveredCell({ time: values.time, day: values.day })}
                    />
                )
            } 
        }

        return (
            <CellShift
                display={hoveredCell?.time === record.time && hoveredCell?.day === day}
                record={record}
                dayWeek={day}
                day={selectedWeek.day(idx).date()}
                setHoveredCell={(values) => setHoveredCell({ time: values.time, day: values.day })}
            />
        )
      },
    })),
  ]

  return (
    <>
      { scheduleFilter.city ? 
        <div style={{ position: 'relative'}}>
            <Table 
                columns={columns}
                dataSource={data}
                pagination={false}
                className="schedule-week-table"
                bordered
            />
            <CurrentTimeLine tz={tz} />
        </div>
        :
        <Result
            status="error"
            title="You have not selected a city"
            subTitle="Please select a city to view the schedule"
            extra={
                <CitySelect 
                    defaultValue={scheduleFilter.city} 
                    onChange={value => setScheduleFilter({ city: value, tz: getCityTimezone(value) })} 
                    style={{ width: 200 }}
                />
            }
        />
    }
    </>
  )
}

export default WeekView