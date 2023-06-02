import { useState } from 'react'
import { Button, Modal, Input, TimePicker, Checkbox, Select, Space, DatePicker } from "antd"

import { useFilterStore } from '../../../store'

import dayjs from 'dayjs' // Import date handlers
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

dayjs.extend(utc)
dayjs.extend(timezone)

const GlobalCreation = () => {
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const [open, setOpen] = useState(false)
    
    const handleModalOk = () => { // Asynchronous function to handle feeding DB with new shift data
        setOpen(false)
    }

    const handleModalCancel = () => {
        setOpen(false)
    }

    return (
        <>
            <Button onClick={() => setOpen(true)} type="primary">Create {scheduleFilter.navigation.tab === 'active' ? 'Shift' : 'Template'}</Button>
            <Modal title="New Shift" open={open} onOk={handleModalOk} onCancel={handleModalCancel}>
                <Space direction="vertical" size={16}>
                    <Input.Group compact>
                    <DatePicker 
                        style={{ width: '30%' }}
                        defaultValue={dayjs()} format="ddd D MMM" 
                        //onChange={(date) => setModal({ ...modal, selectedDay: {dayOfWeek: date.format('dddd'), day: date.format('DD')} }) } 
                        />
                    <TimePicker.RangePicker 
                        style={{ width: '70%' }} 
                        format="HH:mm" 
                        //onChange={(time, timeString) => setModal({ ...modal, selectedTime: {start: timeString[0], end: timeString[1]} })} 
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
                    <Input 
                        placeholder="Driver Limit" 
                        type="number" 
                        min={10} max={50} 
                        defaultValue={10} 
                        //onChange={(event) => {setModal({ ...modal, drivers: event.target.value})}} 
                    />
                </Space>
            </Modal>
        </>
    )
}

export default GlobalCreation