import { useState, useEffect } from 'react'
import { Card, Divider, Table, Space, Typography, Button, DatePicker, Select, Radio } from 'antd' // Import Ant components
import { geekblue } from '@ant-design/colors' // Import Ant colors
import { LeftOutlined, RightOutlined } from '@ant-design/icons' // Import Ant icons

import dayjs from 'dayjs' // Import date handlers
import utc from 'dayjs/plugin/advancedFormat' // Import dayjs utc plugin
import CellShift from '../../components/CellShift' // Import CellShift component
import WeekView from '../../components/WeekView'

dayjs.extend(utc)

const { Text, Title } = Typography

const CurrentTimeLine = () => {
    const [currentTime, setCurrentTime] = useState(dayjs())

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(dayjs())
        }, 60000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    const currentHour = currentTime.hour() // Get current hour
    const currentMinute = currentTime.minute() // Get current minute
    const currentSecond = currentTime.second() // Get current second
    const totalSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond // Get total seconds
    const percentOfDay = totalSeconds / 86400 * 100 // Get percentage of day

    const props = {
        key: 'current-timeline',
        style: {
            position: 'absolute',
            top: `calc(${percentOfDay}% + 48px)`,
            left: 0,
            margin: 0,
            width: '100%',
            backgroundColor: 'red',
            height: '2px',
            zIndex: 999,
        }
    }

    return (
        <Divider {...props} />
    )
}

const Schedule = () => {
    const [tabKey, setTabKey] = useState('active') // Create state to store the tab key
    const [selectedWeek, setSelectedWeek] = useState(dayjs().startOf('week')) // Create state to store the selected week's date
    const [hoveredCell, setHoveredCell] = useState(null) // Create state to store the hover state
    const [eventFormValues, setEventFormValues] = useState({})
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const EditableCell = ({
      title,
      editable,
      children,
      dataIndex,
      record,
      handleSave,
      ...restProps
    }) => {
      return <td {...restProps}>{children}</td>;
    }

    const columns = [
      {
        title: 'Time',
        dataIndex: 'time',
        key: 'time',
        width: 100,
        fixed: 'left',
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
                    }}
                >
                    {day}
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
                    setHoveredCell({ record, day })
                },
                onMouseLeave: () => { // Mouse leave event
                    setHoveredCell(null)
                },
            }
        },
        render: (text, record ) => {
            return (
                <CellShift display={hoveredCell?.record.time === record.time && hoveredCell?.day === day} record={record} /> 
            )
        },
      })),
    ]

    const data = []
    for (let hour = 0; hour < 24; hour++) { // Loop through the hours
        data.push({
            key: hour,
            time: dayjs().hour(hour).minute(0).format('HH:mm'),
            Mon: '',
            Tue: '',
            Wed: '',
            Thu: '',
            Fri: '',
            Sat: '',
            Sun: '',
        })
    }

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
        value: 'Day',
      },
      {
        label: 'Week',
        value: 'Week',
      },
      {
        label: 'Month',
        value: 'Month',
      },
    ]

    const handleWeekChange = (date) => { // Handle week change
      setSelectedWeek(dayjs(date))
    }

    const handleThisWeekClick = () => { // Handle this week click
      setSelectedWeek(dayjs())
    }

    return (
        <>
        <Card 
            title="Schedule"
            extra={<Button type="primary">Create Shift</Button>}
            style={{ margin: 15 }} 
            bodyStyle={{ position: 'relative' }}
            tabList={tabList}
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
                    <Radio.Group options={options} value="Week" optionType="button" />
                </Space>
            </Space>
            <Table 
                columns={columns}
                dataSource={data}
                pagination={false}
                className="schedule-week-table"
                bordered
            />
            <CurrentTimeLine />
        </Card>
        <WeekView />
        </>
    )
}

export default Schedule