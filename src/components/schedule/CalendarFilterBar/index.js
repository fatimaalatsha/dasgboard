import { useState } from 'react'
import { Space, Button, DatePicker, Select, Radio, Tooltip, Divider, TimePicker, Input } from 'antd' // Import Ant components
import { LeftOutlined, RightOutlined, ReloadOutlined } from '@ant-design/icons' // Import Ant icons

import dayjs from 'dayjs' // Import date handlers
import { Formik, Form as FormikForm } from 'formik'
import { object, string } from 'yup'

import { CitySelect } from '../../CitySelect'
import CreateWeekShift from '../CreateWeekShift'
import { useFilterStore } from '../../../store'
import { rangeFilter } from '../../../utils/schedule-status'
import Submit from '../../forms/SubmitWrapper'

const { RangePicker } = TimePicker

const HourDayFilter = (props) => {
    const validationSchema = object().shape({
        start_time: string().required('Required.'),
        end_time: string().required('Required.'),
    })

    return (
        <Formik
            initialValues={{
                start_time: '',
                end_time: ''
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
                const userIds = rangeFilter(values, props.data)
                console.log("Users: ",userIds)
                setSubmitting(false)
            }}
        >
            { props => (
                <FormikForm>
                    <Space.Compact>
                        <RangePicker
                            status={props.isValid ? 'success' : 'error'}
                            format="HH:mm"
                            value={
                                props.values.start_time && props.values.end_time ?
                                [
                                    dayjs(props.values.start_time, 'HH:mm'),
                                    dayjs(props.values.end_time, 'HH:mm')
                                ]
                                :
                                ''
                            }
                            hideDisabledOptions
                            disabledTime={() => {
                                return {
                                    disabledMinutes: () => {
                                        const steps = [0, 30, 59]
                                        const minutes = [...Array(60)].map((_, idx) => {
                                            if (!steps.includes(idx)) {
                                                return idx
                                            }
                                            return null
                                        })
                                        return minutes
                                    }
                                }
                            }}
                            onChange={value => {
                                props.setFieldValue('start_time', value ? dayjs(value[0]).format('HH:mm') : null)
                                props.setFieldValue('end_time', value ? dayjs(value[1]).format('HH:mm') : null)
                            }}
                        />
                        <Submit type="primary">
                            Filter
                        </Submit>
                    </Space.Compact>
                </FormikForm>
            )}
        </Formik>
    )
}

const CalendarFilterBar = ({
    handleWeekChange, 
    handleTodayClick, 
    selectedDate, 
    setSelectedDate,
    checkDisabled,
    refetch,
    ...props
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
    
    const hoursOptions = [...Array(24)].map((_, idx) => {
        const timeLoop = dayjs().hour(idx).minute(0).format('HH:mm')
        return {
            label: timeLoop,
            value: timeLoop
        }
    })

    const handleHourChange = (option) => {
        const sortOptionArr = option.sort((a, b) => {
            // Extract the hour and minute parts and convert them to numbers for comparison
            const [aHour, aMinute] = a.label.split(':').map(Number)
            const [bHour, bMinute] = b.label.split(':').map(Number)
          
            // Compare the hours first
            if (aHour < bHour) return -1
            if (aHour > bHour) return 1
          
            // If hours are equal, compare the minutes
            if (aMinute < bMinute) return -1
            if (aMinute > bMinute) return 1
          
            // If both hours and minutes are equal, they are the same
            return 0
          })
        props.setHours(sortOptionArr)
    }

    const refetchConfig = {
        icon: <ReloadOutlined />,
        onClick: () => refetch(),
        type: 'primary',
        ghost: true,
    }

    const resetConfig = {
        type: 'primary',
        block: true,
        onClick: () => handleHourChange(hoursOptions)
    }

    return (   
        <Space style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>               
            <>
                <Space style={{ display: 'flex' }} size={[8, 16]} wrap>
                    <CitySelect
                        value={scheduleFilter.filter.city_id ? Number(scheduleFilter.filter.city_id.replace('in|', '')) : null}
                        onChange={(value, label) => {
                            setSelectedCity(Number(value))
                            setScheduleFilter({ ...scheduleFilter, filter: { ...scheduleFilter.filter, city_id: `in|${value}`}, tz: label.timezone, city_label: label.label })}
                        }   
                        style={{ width: 200 }}
                    />
                    {  scheduleFilter.navigation.view === 6 && (
                        <Select 
                            placeholder="Columns"
                            style={{ width: 200 }}
                            options={hoursOptions}
                            value={props?.hours}
                            mode="multiple"
                            maxTagCount={0}
                            maxTagPlaceholder="...Filtered columns"
                            onChange={(_, option) => handleHourChange(option)}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider style={{margin: '8px 0'}} />
                                    <Button {...resetConfig}>Reset</Button>
                                </>
                            )}
                        />
                    )}
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
                    {  scheduleFilter.navigation.view === 0 && scheduleFilter.navigation.tab === 'active' && (
                        <>
                            <HourDayFilter 
                                data={props.data}
                            />
                            <Input
                                addonBefore="Shortage:"
                                placeholder="Amount"
                                type="number"
                                min={0}
                                max={99}
                                value={Number(scheduleFilter.staff)}
                                onChange={(e) => setScheduleFilter({...scheduleFilter, staff: Number(e.target.value) })}
                                style={{
                                    width: 140,
                                }}
                            />
                        </>
                    )}
                </Space>
                <Space style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }} wrap>
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
                    <Radio.Group 
                        options={options} 
                        value={scheduleFilter.navigation.view} 
                        defaultValue={scheduleFilter.navigation.view} 
                        optionType="button" 
                        onChange={(e) => setScheduleFilter({...scheduleFilter, navigation:{ ...scheduleFilter.navigation, view: Number(e.target.value)} })}
                    />
                </Space>
            </>
        </Space>
    )
}

export default CalendarFilterBar