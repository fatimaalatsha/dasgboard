import { useState, useEffect } from 'react'
import { Card, Divider, Table, Space, Typography, Button, DatePicker, Select } from 'antd' // Import Ant components
import { geekblue } from '@ant-design/colors' // Import Ant colors

import dayjs from 'dayjs' // Import date handlers
import utc from 'dayjs/plugin/advancedFormat' // Import dayjs utc plugin

dayjs.extend(utc)

const { Text, Title } = Typography

const CurrentTimeLine = () => {
    const [currentTime, setCurrentTime] = useState(dayjs())

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(dayjs())
        }, 1000)

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
        style: {
            position: 'absolute',
            marginTop: 48,
            top: `${percentOfDay}%`,
            left: 0,
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

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
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
                        ...(dayjs().day(idx).date() === dayjs().date() && { color: '#FFFFFF', backgroundColor: geekblue[6], padding: '2px 8px', borderRadius: 100 })
                    }}
                >
                    {dayjs().day(idx).date()}
                </Title>
                <Text type="secondary" style={{ ...(dayjs().day(idx).date() === dayjs().date() && { color: geekblue[6], fontWeight: 'bold'}) }}>
                    {day}
                </Text>
            </Space>
        ),
        dataIndex: day,
        key: day,
        align: 'center',
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

    return (
        <Card 
            title="Schedule"
            extra={<Button type="primary">Create Shift</Button>}
            style={{ margin: 15 }} 
            bodyStyle={{ position: 'relative' }}
            tabList={tabList}
        >
            <Space>
                <Space>
                    <Select
                        placeholder="City"
                        optionFilterProp="children"
                        options={[
                            { label: 'Thunder Bay', value: 'Thunder Bay' },
                            { label: 'Toronto', value: 'Toronto' },
                        ]}
                    />
                    <Select
                        placeholder="Status"
                        optionFilterProp="children"
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
                <DatePicker defaultValue={dayjs()} picker="week" />
            </Space>
            <Table 
                columns={columns}
                dataSource={data}
                pagination={false}
            />
            <CurrentTimeLine />
        </Card>
    )
}

export default Schedule