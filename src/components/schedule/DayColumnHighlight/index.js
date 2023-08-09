import { useState } from 'react'
import { Divider } from 'antd'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const DayColumnHighlight = ({tz, data, hour}) => {
    dayjs.tz.setDefault(tz)
    const [currentTime, setCurrentTime] = useState(dayjs(hour, 'HH:mm').tz())

    const currentHour = currentTime.hour() // Get current hour
    const currentMinute = currentTime.minute() // Get current minute
    const currentSecond = currentTime.second() // Get current second
    const totalSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond // Get total seconds
    const percentOfDay = totalSeconds / 86400 * 100 // Get percentage of day

    const props = {
        key: 'current-timeline',
        style: {
            position: 'absolute',
            display: 'inline-flex',
            top: 0,
            left: `calc(${percentOfDay}% + 0px)`,
            margin: 0,
            width: '59.91px',
            minWidth: '2px',
            backgroundColor: 'blue',
            height: '100%',
            opacity: 0.5,
        }
    }

    return (
        <Divider {...props} />
    )
}

export default DayColumnHighlight