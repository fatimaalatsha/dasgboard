import { useState } from 'react' // Import React hooks
import { Table, Space, Typography, Result } from 'antd' // Import Ant components
import { geekblue } from '@ant-design/colors' // Import Ant colors
import dayjs from 'dayjs' // Import dayjs

import qs from 'qs' // Import qs library
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import CurrentTimeLine from '../CurrentTimeLine' // Import Red Bar component
import CellShift from '../CellShift' // Import CellShift component
import { CitySelect } from '../CitySelect'
import { useFilterStore } from '../../store'
import useWeekSchedule from '../../hooks/use-week-schedule'

dayjs.extend(utc)
dayjs.extend(timezone)

const { Text, Title } = Typography

//get the papams that will be passed to filters through qs
const queryHandler = (params) => ({ // Get table params
  filter:{...params}
})

const WeekView = ({selectedWeek, dummy, days, tz, city }) => {
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const setScheduleFilter = useFilterStore(state => state.setScheduleFilter)
    const filters = {
        city_id: scheduleFilter.filter.city_id,
        start_time: `between|${selectedWeek.startOf('week').format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')},${selectedWeek.endOf('week').format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')}`,
    }
    const { data, isLoading, error, refetch } = useWeekSchedule(`/v1/shifts?${qs.stringify(queryHandler(filters), { skipNulls: true, arrayFormat: 'comma' })}`, scheduleFilter.tz) // Call useSchedule hook
    const [hoveredCell, setHoveredCell] = useState(null) // Create state to store the hover state

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
        width: 200,
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
                if (dayjs(record[day][item]?.start_time).tz(scheduleFilter.tz).format('dddd').toLowerCase() === day && dayjs(record[day][item]?.start_time).tz(scheduleFilter.tz).format('HH:mm') === record.time) {
                    return (
                        <CellShift 
                            key={item} 
                            isCellFilled={dayjs(record[day][item]?.start_time).tz(scheduleFilter.tz).format('dddd').toLowerCase() === day && dayjs(record[day][item]?.start_time).tz(scheduleFilter.tz).format('HH:mm') === record.time} 
                            record={record[day][item]} 
                            setHoveredCell={(values) => setHoveredCell({ time: values.time, day: values.day })}
                            selectedDay={selectedWeek.day(idx).format('YYYY-MM-DD')}
                            refetch={refetch}
                            city={city}
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
                    selectedDay={selectedWeek.day(idx).format('YYYY-MM-DD')}
                    refetch={refetch}
                    city={city}
                />
            )
        },
        })),
    ]

    error && <>Something went wrong...</>

    return (
    <>
        { scheduleFilter.filter.city_id?.split('|')[1] ? 
        <div style={{ position: 'relative'}}>
            <Table 
                columns={columns}
                dataSource={data}
                loading={isLoading}
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
                    value={scheduleFilter.filter.city_id ? Number(scheduleFilter.filter.city_id.replace('in|', '')) : null}
                    onChange={(value, label) => setScheduleFilter({ ...scheduleFilter, filter: { ...scheduleFilter.filter, city_id: `in|${value}`}, tz: label.timezone, city_label: label.label })}   
                    style={{ width: 200 }}
                />
            }
        />
    }
    </>
    )
}

export default WeekView