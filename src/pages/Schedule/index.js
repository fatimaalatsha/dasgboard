import { useState } from 'react'
import { Card } from 'antd' // Import Ant components

import dayjs from 'dayjs' // Import date handlers
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import WeekView from '../../components/schedule/WeekView'
import DayView from '../../components/schedule/DayView'
import ShiftApproval from '../../components/schedule/ShiftApproval'
import ShiftTemplates from '../../components/schedule/ShiftTemplates'
import { useFilterStore } from '../../store'

dayjs.extend(utc)
dayjs.extend(timezone)

const days = ["sunday","monday", "tuesday", "wednesday", "thursday", "friday", "saturday",]

const Schedule = () => {
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const setScheduleFilter = useFilterStore(state => state.setScheduleFilter)
    const [selectedDate, setSelectedDate] = useState({ // Create state to store the selected week's date
        week: dayjs().startOf('week'),
        day: dayjs().startOf('day'),
    })
    const [dayHours, setDayHours] = useState([...Array(24)].map((_, idx) => {
        const timeLoop = dayjs().hour(idx).minute(0).format('HH:mm')
        return {
            label: timeLoop,
            value: timeLoop
        }
    }))

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

    const TODAY = {
        week: dayjs().startOf('week'),
        day: dayjs().startOf('day'),
    }

    const handleWeekChange = (date) => { // Handle week change
        setSelectedDate({ 
            ...selectedDate, 
            ...(scheduleFilter.navigation.view === 1 ? { week: dayjs(date) } : { day: dayjs(date) }) 
        })
    }

    const handleTodayClick = () => { // Handle this week click
      setSelectedDate({week: dayjs().startOf('week'), day: dayjs().startOf('day')})
    } 

    const checkDisabled = () => { // Disable dates before today
        if (scheduleFilter.navigation.view === 1) {
            return  TODAY.week.format('DD/MM/YYYY') === selectedDate.week.format('DD/MM/YYYY')
        } 
        return TODAY.day.format('DD/MM/YYYY') === selectedDate.day.format('DD/MM/YYYY')
    }

    const scheduleTabContent = {
        active:   scheduleFilter.navigation.view === 1 ? 
                <WeekView 
                    selectedWeek={selectedDate.week} 
                    days={days} 
                    tz={scheduleFilter.tz} 
                    city={Number(scheduleFilter.filter.city_id.replace('in|', ''))} 
                    loadTimeline={checkDisabled()} 
                    handleWeekChange={handleWeekChange}
                    handleTodayClick={handleTodayClick}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                />
                : scheduleFilter.navigation.view === 2 ? <div>Month View 👀</div>
                : 
                <DayView 
                    selectedDay={selectedDate.day} 
                    hours={dayHours} 
                    setHours={setDayHours}
                    tz={scheduleFilter.tz} 
                    city={Number(scheduleFilter.filter.city_id.replace('in|', ''))} 
                    loadTimeline={checkDisabled()}
                    handleWeekChange={handleWeekChange}
                    handleTodayClick={handleTodayClick}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                />
        ,
        draft: <ShiftTemplates />,
        approval: <ShiftApproval 
            selectedDate={selectedDate} 
            tz={scheduleFilter.tz} 
            checkDisabled={checkDisabled()}
            handleWeekChange={handleWeekChange}
            handleTodayClick={handleTodayClick}
            setSelectedDate={setSelectedDate}
        />,
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
                {scheduleTabContent[scheduleFilter.navigation.tab]}
            </Card>
        </>
    )
}

export default Schedule