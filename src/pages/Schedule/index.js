import { useState } from 'react'
import { Card, Space, Button, DatePicker, Select, Radio, Modal, Input, TimePicker, Checkbox} from 'antd' // Import Ant components
import { LeftOutlined, RightOutlined } from '@ant-design/icons' // Import Ant icons

import dayjs from 'dayjs' // Import date handlers
import utc from 'dayjs/plugin/advancedFormat' // Import dayjs utc plugin
import WeekView from '../../components/WeekView'
import DayView from '../../components/DayView'
import generateName from '../../utils/name-creation'

dayjs.extend(utc)

const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

const hours = [];
for (let hour = 0, minute = 0; hour < 24 && !(hour === 23 && minute === 30); minute += 30) {
    if (minute === 60) {
      hour += 1
      minute = 0
    }
    hours.push( dayjs().hour(hour).minute(minute).format('HH:mm') )
}
const generateNames = (numNames) => {
    const names = [];
    for (let i = 0; i < numNames; i++) {
      names.push(generateName());
    }
    return names;
  }
  
const namesArray = generateNames(30)
namesArray.push('patient alpaca')

const Schedule = () => {
    //const [tabKey, setTabKey] = useState('active') // Create state to store the tab key
    const [selectedWeek, setSelectedWeek] = useState(dayjs().startOf('week')) // Create state to store the selected week's date
    const [names, setNames] = useState(generateName())
    const [modal, setModal] = useState({ // Create state to store the modal
        open: false,
        drivers: null,
        selectedTime: null,
        selectedDay: null,
    })
    const [data, setData] = useState(hours.map((time) => ({
        key: time,
        time,
        monday: [],
        tuesday: [{dayOfWeek: 'tuesday', day: '28', start: '00:00', end: '03:00', drivers: 25}, {dayOfWeek: 'tuesday', day: '28', start: '04:00', end: '06:00', drivers: 25}],
        wednesday: [{dayOfWeek: 'wednesday', day: '28', start: '00:00', end: '03:00', drivers: 25}],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
        
    })))
    const [dayData, setDayData] = useState(namesArray.reduce((acc, name) => {
        const timeObj = hours.reduce((obj, time) => {
          obj[time] = time === '04:00' ? [{name: 'patient alpaca', day: '28', start: time, end: '03:00', drivers: 25}] : []
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
      setSelectedWeek(dayjs(date))
    }

    /* const handleThisWeekClick = () => { // Handle this week click
      setSelectedWeek(dayjs())
    }  */
    
    const handleModalOk = () => { // Asynchronous function to handle feeding DB with new shift data
        const newData = [...data]
        const rowIndex = hours.indexOf(modal.selectedTime.start)
        //const colIndex = days.indexOf(modal.selectedDay)
        newData[rowIndex][modal.selectedDay.dayOfWeek.toLowerCase()] = [{dayOfWeek: modal.selectedDay.dayOfWeek.toLowerCase(), day: modal.selectedDay.day, start: modal.selectedTime.start, end: modal.selectedTime.end, drivers: Number(modal.drivers)}]
        setData(newData)
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
                        <Select
                            placeholder="City"
                            optionFilterProp="children"
                            style={{ width: 150 }}
                            options={[
                                { label: 'Thunder Bay', value: 'Thunder Bay' },
                                { label: 'Toronto', value: 'Toronto' },
                            ]}
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
                        <Button icon={<LeftOutlined />} onClick={() => setSelectedWeek(selectedWeek.subtract(1, 'week'))} />
                        <Button icon={<RightOutlined />} onClick={() => setSelectedWeek(selectedWeek.add(1, 'week'))} />
                        <DatePicker defaultValue={selectedWeek} picker="week" onChange={handleWeekChange} />
                        <Radio.Group options={options} value={view} defaultValue={view} optionType="button" onChange={(e) => setView(e.target.value)}/>
                    </Space>
                </Space>
                { view === 1 ? <WeekView selectedWeek={selectedWeek} data={data} days={days} />
                : view === 2 ? <div>Month View 👀</div>
                : <DayView selectedWeek={selectedWeek} data={dayData} hours={hours} />
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