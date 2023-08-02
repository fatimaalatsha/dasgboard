import { useState } from 'react'
import { Card, Space, Button, DatePicker, Select, Radio, Tooltip } from 'antd' // Import Ant components
import { LeftOutlined, RightOutlined, TableOutlined, AppstoreOutlined } from '@ant-design/icons' // Import Ant icons

import dayjs from 'dayjs' // Import date handlers
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import WeekView from '../../components/schedule/WeekView'
import DayView from '../../components/schedule/DayView'
import ShiftApproval from '../../components/schedule/ShiftApproval'
import ShiftTemplates from '../../components/schedule/ShiftTemplates'
import CreateTemplate from '../../components/schedule/CreateTemplate'
import { CitySelect } from '../../components/CitySelect'
import { useFilterStore } from '../../store'

dayjs.extend(utc)
dayjs.extend(timezone)

const days = ["sunday","monday", "tuesday", "wednesday", "thursday", "friday", "saturday",]

const dayHours = [];
for (let hour = 0; hour < 24; hour++) {
    dayHours.push( dayjs().hour(hour).minute(0).format('HH:mm') )
}

const Schedule = () => {
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const setScheduleFilter = useFilterStore(state => state.setScheduleFilter)
    const [selectedDate, setSelectedDate] = useState({ // Create state to store the selected week's date
        week: dayjs().startOf('week'),
        day: dayjs().startOf('day'),
    })
    const [selectedCity, setSelectedCity] = useState(Number(scheduleFilter.filter.city_id.replace('in|', ''))) // Create state to store the selected city
        
    const [view, setView] = useState(1)

    const tabList = [
        {
            key: 'active',
            tab: 'Calendar',
        },
        {
            key: 'draft',
            tab: 'Templates',
        },
        {
            key: 'approval',
            tab: 'Pending Approval',
        }
    ]

    const options = [
      {
        label: 'Day',
        value: 0,
      },
      {
        label: 'Week',
        value: 1,
      },
      {
        label: 'Month',
        value: 2,
      },
    ]

    const TODAY = {
        week: dayjs().startOf('week'),
        day: dayjs().startOf('day'),
    }

    const handleWeekChange = (date) => { // Handle week change
        setSelectedDate({ 
            ...selectedDate, 
            ...(view === 1 ? { week: dayjs(date) } : { day: dayjs(date) }) 
        })
    }

    const handleTodayClick = () => { // Handle this week click
      setSelectedDate({week: dayjs().startOf('week'), day: dayjs().startOf('day')})
    } 

    const checkDisabled = () => { // Disable dates before today
        if (view === 1) {
            return  TODAY.week.format('DD/MM/YYYY') === selectedDate.week.format('DD/MM/YYYY')
        } 
        return TODAY.day.format('DD/MM/YYYY') === selectedDate.day.format('DD/MM/YYYY')
    }

    const scheduleTabContent = {
        active:   view === 1 ? <WeekView selectedWeek={selectedDate.week} days={days} tz={scheduleFilter.tz} city={selectedCity} loadTimeline={checkDisabled()} />
                : view === 2 ? <div>Month View 👀</div>
                : <DayView selectedDay={selectedDate.day} hours={dayHours} tz={scheduleFilter.tz} city={selectedCity} loadTimeline={checkDisabled()} />
        ,
        draft: <ShiftTemplates />,
        approval: <ShiftApproval selectedDate={selectedDate} tz={scheduleFilter.tz} view={view}/>,
    }

    return (
        <>
            <Card 
                title="Schedule"
                style={{ margin: 15 }} 
                tabList={tabList}
                activeTabKey={scheduleFilter.navigation.tab}
                onTabChange={key => setScheduleFilter({...scheduleFilter, navigation: { ...scheduleFilter.navigation, tab: key } })}
                bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, ...(scheduleFilter.navigation.tab === 'draft' && { backgroundColor: '#F9F9F9'} )  }}
            >
                { scheduleFilter.navigation.tab !== 'draft' && (     
                    <Space style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>               
                        <>
                            <Space style={{ display: 'flex', width: '100%'}}>
                                <CitySelect
                                    value={scheduleFilter.filter.city_id ? Number(scheduleFilter.filter.city_id.replace('in|', '')) : null}
                                    onChange={(value, label) => {
                                        setSelectedCity(Number(value))
                                        setScheduleFilter({ ...scheduleFilter, filter: { ...scheduleFilter.filter, city_id: `in|${value}`}, tz: label.timezone, city_label: label.label })}
                                    }   
                                    style={{ width: 200 }}
                                />
                                <Select
                                    placeholder="Status"
                                    optionFilterProp="children"
                                    style={{ width: 150 }}
                                    options={[
                                        { label: 'Scheduled Shifts', value: 'Scheduled Shifts' },
                                        { label: 'Available Shifts', value: 'Available Shifts' },
                                        { label: 'Unassigned Shifts', value: 'Unassigned Shifts' },
                                        { label: 'Time Off', value: 'Time Off' },
                                        { label: 'Absent', value: 'Absent' },
                                        { label: 'Early In', value: 'Early In' },
                                        { label: 'Late Out', value: 'Late Out' },
                                        { label: 'Unavailability', value: 'Unavailability' },
                                    ]}
                                />
                            </Space>
                            <Space style={{ display: 'flex', width: '100%'}}>
                                <Button type="primary" disabled={checkDisabled()} onClick={handleTodayClick}>Today</Button>
                                <Button icon={<LeftOutlined />} onClick={() => setSelectedDate({...selectedDate, ...(view === 1 ? { week: selectedDate.week.subtract(1, 'week') } : { day: selectedDate.day.subtract(1, 'day') })})} />
                                <Button icon={<RightOutlined />} onClick={() => setSelectedDate({...selectedDate, ...(view === 1 ? { week: selectedDate.week.add(1, 'week') } : { day: selectedDate.day.add(1, 'day') })})} />
                                <DatePicker 
                                    defaultValue={view === 1 ? selectedDate.week : selectedDate.day} 
                                    picker={ view === 1 ? "week" : "date" } 
                                    onChange={handleWeekChange} 
                                    value={view === 1 ? selectedDate.week : selectedDate.day}
                                    allowClear={false}
                                />
                                <Radio.Group options={options} value={view} defaultValue={scheduleFilter.navigation.view} optionType="button" onChange={(e) => setView(e.target.value)}/>
                            </Space>
                        </>
                    </Space>
                )}
                {scheduleTabContent[scheduleFilter.navigation.tab]}
            </Card>
        </>
    )
}

export default Schedule