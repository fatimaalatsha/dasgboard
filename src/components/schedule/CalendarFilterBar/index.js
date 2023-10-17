import { useState } from 'react'
import {Space, Button, DatePicker, Select, Radio, Tooltip } from 'antd' // Import Ant components
import { LeftOutlined, RightOutlined, ReloadOutlined } from '@ant-design/icons' // Import Ant icons

import { CitySelect } from '../../CitySelect'
import CreateWeekShift from '../CreateWeekShift'
import { useFilterStore } from '../../../store'

const CalendarFilterBar = ({
    handleWeekChange, 
    handleTodayClick, 
    selectedDate, 
    setSelectedDate,
    checkDisabled,
    refetch
}) => {
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const setScheduleFilter = useFilterStore(state => state.setScheduleFilter)
    const [selectedCity, setSelectedCity] = useState(Number(scheduleFilter.filter.city_id.replace('in|', ''))) // Create state to store the selected city

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
          disabled: true
        },
    ]

    const refetchConfig = {
        icon: <ReloadOutlined />,
        onClick: () => refetch(),
        type: 'primary',
        ghost: true,
    }

    return (   
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
                    <Tooltip title="Reload data">
                        <Button {...refetchConfig} />
                    </Tooltip>
                    { scheduleFilter.navigation.view === 1 && <CreateWeekShift selectedWeek={selectedDate.week} tz={scheduleFilter.tz} city={selectedCity} /> }
                    <Button type="primary" disabled={checkDisabled} onClick={handleTodayClick}>Today</Button>
                    <Button icon={<LeftOutlined />} onClick={() => setSelectedDate({...selectedDate, ...(scheduleFilter.navigation.view === 1 ? { week: selectedDate.week.subtract(1, 'week') } : { day: selectedDate.day.subtract(1, 'day') })})} />
                    <Button icon={<RightOutlined />} onClick={() => setSelectedDate({...selectedDate, ...(scheduleFilter.navigation.view === 1 ? { week: selectedDate.week.add(1, 'week') } : { day: selectedDate.day.add(1, 'day') })})} />
                    <DatePicker 
                        defaultValue={scheduleFilter.navigation.view === 1 ? selectedDate.week : selectedDate.day} 
                        picker={ scheduleFilter.navigation.view === 1 ? "week" : "date" } 
                        onChange={handleWeekChange} 
                        value={scheduleFilter.navigation.view === 1 ? selectedDate.week : selectedDate.day}
                        allowClear={false}
                    />
                    <Radio.Group options={options} value={scheduleFilter.navigation.view} defaultValue={scheduleFilter.navigation.view} optionType="button" onChange={(e) => setScheduleFilter({...scheduleFilter, navigation:{ ...scheduleFilter.navigation, view: Number(e.target.value)} })}/>
                </Space>
            </>
        </Space>
    )
}

export default CalendarFilterBar