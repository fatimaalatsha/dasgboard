import { useState } from 'react'
import { Card, Space, Button, DatePicker, Select, Radio, Modal, Input, TimePicker, Checkbox, Spin} from 'antd' // Import Ant components
import { LeftOutlined, RightOutlined } from '@ant-design/icons' // Import Ant icons

import dayjs from 'dayjs' // Import date handlers
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import WeekView from '../../components/WeekView'
import DayView from '../../components/DayView'
import generateName from '../../utils/name-creation'
import { CitySelect } from '../../components/CitySelect'
import { useFilterStore } from '../../store'
import { getCityTimezone, getCities } from '../../utils/city-status'

dayjs.extend(utc)
dayjs.extend(timezone)

const days = ["sunday","monday", "tuesday", "wednesday", "thursday", "friday", "saturday",]

/* const weekHours = [];
for (let hour = 0, minute = 0; hour < 24 && !(hour === 23 && minute === 30); minute += 30) {
    if (minute === 60) {
      hour += 1
      minute = 0
    }
    weekHours.push( dayjs().hour(hour).minute(minute).format('HH:mm') )
} */

const weekHours = [];
for (let hour = 0; hour < 24 ; hour++) {
    weekHours.push( dayjs().hour(hour).minute(0).format('HH:mm') )
} 

const dayHours = [];
for (let hour = 0; hour < 24; hour++) {
    dayHours.push( dayjs().hour(hour).minute(0).format('HH:mm') )
}

const generateNames = (numNames) => {
    const names = [];
    for (let i = 0; i < numNames; i++) {
      names.push(generateName());
    }
    return names;
}
  
const namesArray = generateNames(150)

const generateRandomHour = () => { // Generate a random hour
    const randomHour = Math.floor(Math.random() * 20)
    return `${randomHour < 10 ? '0' : ''}${randomHour}:00`
}

const addFourHours = (hourString) => { // Add 4 hours to a time string
    const [hour, minute] = hourString.split(':')
    const newHour = (parseInt(hour, 10) + 4) % 24
    return `${newHour < 10 ? '0' : ''}${newHour}:${minute}`
  }


const Schedule = () => {
    dayjs.locale('en')
    //const [tabKey, setTabKey] = useState('active') // Create state to store the tab key
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const setScheduleFilter = useFilterStore(state => state.setScheduleFilter)
    const [selectedDate, setSelectedDate] = useState({ // Create state to store the selected week's date
        week: dayjs().startOf('week'),
        day: dayjs().startOf('day'),
    })
    const [selectedCity, setSelectedCity] = useState(Number(scheduleFilter.filter.city_id.replace('in|', ''))) // Create state to store the selected city

    const [modal, setModal] = useState({ // Create state to store the modal
        open: false,
        drivers: null,
        selectedTime: null,
        selectedDay: null,
    })
    const [dummy, setDummy] = useState(weekHours.map((time) => ({
        key: time,
        time,
        monday: [],
        tuesday: [{dayOfWeek: 'tuesday', day: '28', start: '00:00', end: '03:00', drivers: 25}, {dayOfWeek: 'tuesday', day: '28', start: '04:00', end: '12:00', drivers: 25}],
        wednesday: [{dayOfWeek: 'wednesday', day: '28', start: '00:00', end: '06:00', drivers: 25}],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
        
    })))
    const [dayData, setDayData] = useState(namesArray.reduce((acc, name) => {
        const timeObj = dayHours.reduce((obj, time) => {
          obj[time] = time === generateRandomHour() ? [{ name: name, start: time, end: addFourHours(time) }] : []
          return obj
        }, {})
      
        acc.push({
          key: name,
          name,
          ...timeObj
        })

        return acc
      }, []))
        
    const [view, setView] = useState(1)

    const tabList = [
        {
            key: 'active',
            tab: 'Active',
        },
        {
            key: 'draft',
            tab: 'Draft',
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

    const handleWeekChange = (date) => { // Handle week change
      setSelectedDate({ 
        ...selectedDate, 
        ...(view === 1 ? { week: dayjs(date) } : { day: dayjs(date) }) 
      })
    }

    const handleTodayClick = () => { // Handle this week click
      setSelectedDate({week: dayjs().startOf('week'), day: dayjs().startOf('day')})
    } 
    
    const handleModalOk = () => { // Asynchronous function to handle feeding DB with new shift data
        const newData = [...dummy]
        const rowIndex = weekHours.indexOf(modal.selectedTime.start)
        newData[rowIndex][modal.selectedDay.dayOfWeek.toLowerCase()] = [{dayOfWeek: modal.selectedDay.dayOfWeek.toLowerCase(), day: modal.selectedDay.day, start: modal.selectedTime.start, end: modal.selectedTime.end, drivers: Number(modal.drivers)}]
        setDummy(newData)
        setModal({...modal, open: false})
    }

    const handleModalCancel = () => {
        setModal({...modal, open: false})
    }

    return (
        <>
            <Card 
                title="Schedule"
                extra={<Button onClick={() => setModal({...modal, open: true})} type="primary">Create Shift</Button>}
                style={{ margin: 15 }} 
                tabList={tabList}
                bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}
            >
                <Space style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>                    
                    <Space style={{ display: 'flex', width: '100%'}}>
                    <>{scheduleFilter.filter?.city_id}</>
                    <>{scheduleFilter.city_label}</>
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
                        <Button onClick={handleTodayClick}>Today</Button>
                        <Button icon={<LeftOutlined />} onClick={() => setSelectedDate({...selectedDate, ...(view === 1 ? { week: selectedDate.week.subtract(1, 'week') } : { day: selectedDate.day.subtract(1, 'day') })})} />
                        <Button icon={<RightOutlined />} onClick={() => setSelectedDate({...selectedDate, ...(view === 1 ? { week: selectedDate.week.add(1, 'week') } : { day: selectedDate.day.add(1, 'day') })})} />
                        <DatePicker 
                            defaultValue={view === 1 ? selectedDate.week : selectedDate.day} 
                            picker={ view === 1 ? "week" : "date" } 
                            onChange={handleWeekChange} 
                            value={view === 1 ? selectedDate.week : selectedDate.day}
                            allowClear={false}
                        />
                        <Radio.Group options={options} value={view} defaultValue={view} optionType="button" onChange={(e) => setView(e.target.value)}/>
                    </Space>
                </Space>
                { view === 1 ? <WeekView selectedWeek={selectedDate.week} dummy={dummy} days={days} tz={scheduleFilter.tz} city={selectedCity}/>
                : view === 2 ? <div>Month View 👀</div>
                : <DayView selectedDay={selectedDate.day} data={dayData} hours={dayHours} tz={scheduleFilter.tz} />
                }
            </Card>
            <Modal title="New Shift" open={modal.open} onOk={handleModalOk} onCancel={handleModalCancel}>
                <Space direction="vertical" size={16}>
                    <Input.Group compact>
                    <DatePicker 
                        style={{ width: '30%' }}
                        defaultValue={dayjs()} format="ddd D MMM" 
                        onChange={(date) => setModal({ ...modal, selectedDay: {dayOfWeek: date.format('dddd'), day: date.format('DD')} }) } 
                        />
                    <TimePicker.RangePicker 
                        style={{ width: '70%' }} 
                        format="HH:mm" 
                        onChange={(time, timeString) => setModal({ ...modal, selectedTime: {start: timeString[0], end: timeString[1]} })} 
                    />
                    </Input.Group>
                    <Checkbox>All Day</Checkbox>
                    <Select
                        placeholder="Frequency"
                        optionFilterProp="children"
                        style={{ width: '100%' }}
                        options={[
                            { label: 'Does not repeat', value: 'Does not repeat' },
                            { label: 'Daily', value: 'Daily' },
                            { label: 'Weekly on Friday', value: 'Weekly on Friday' },
                            { label: 'Montly on the second Friday', value: 'Montly on the second Friday' },
                            { label: 'Annualy on February 24', value: 'Annualy on February 24' },
                            { label: 'Every weekday (Mon to Fri)', value: 'Every weekday (Mon to Fri)' },
                            { label: 'Custom...', value: 'Custom...' },
                        ]}
                    />
                    <Select
                        placeholder="City"
                        optionFilterProp="children"
                        style={{ width: '100%' }}
                        options={[
                            { label: 'Thunder Bay', value: 'Thunder Bay' },
                            { label: 'Toronto', value: 'Toronto' },
                        ]}
                    />
                    <Select
                        placeholder="Drivers"
                        optionFilterProp="children"
                        style={{ width: '100%' }}
                        options={[
                            { label: 'Thunder Bay', value: 'Thunder Bay' },
                            { label: 'Toronto', value: 'Toronto' },
                        ]}
                    />
                    <Input placeholder="Driver Limit" type="number" min={10} max={50} defaultValue={10} onChange={(event) => {setModal({ ...modal, drivers: event.target.value})}} />
                </Space>
            </Modal>
        </>
    )
}

export default Schedule