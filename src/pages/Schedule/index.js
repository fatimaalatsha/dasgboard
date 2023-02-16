import { useState, useEffect } from 'react'
import { Card, Divider, Table } from 'antd' // Import Ant components

import dayjs from 'dayjs' // Import date handlers
import utc from 'dayjs/plugin/advancedFormat' // Import dayjs utc plugin

dayjs.extend(utc)

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
            top: `${percentOfDay}%`,
            paddintTop: 79,
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

    const columns = [
      {
        title: 'Time',
        dataIndex: 'time',
        key: 'time',
        width: 100,
        fixed: 'left',
      },
      {
        title: 'Monday',
        dataIndex: 'monday',
        key: 'monday',
      },
      {
        title: 'Tuesday',
        dataIndex: 'tuesday',
        key: 'tuesday',
      },
      {
        title: 'Wednesday',
        dataIndex: 'wednesday',
        key: 'wednesday',
      },
      {
        title: 'Thursday',
        dataIndex: 'thursday',
        key: 'thursday',
      },
      {
        title: 'Friday',
        dataIndex: 'friday',
        key: 'friday',
      },
      {
        title: 'Saturday',
        dataIndex: 'saturday',
        key: 'saturday',
      },
      {
        title: 'Sunday',
        dataIndex: 'sunday',
        key: 'sunday',
      },
    ]

    const data = []
    for (let hour = 0; hour < 24; hour++) {
        data.push({
            key: hour,
            time: dayjs().hour(hour).minute(0).format('HH:mm'),
            monday: '',
            tuesday: '',
            wednesday: '',
            thursday: '',
            friday: '',
            saturday: '',
            sunday: '',
        })
    }

    return (
        <Card title="Schedule" style={{ margin: 15 }} bodyStyle={{ position: 'relative' }}>
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