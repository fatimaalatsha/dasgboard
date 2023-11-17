import { useEffect, useState } from 'react'
import { Divider } from 'antd'
import dayjs from 'dayjs' // Import dayjs
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

dayjs.extend(utc)
dayjs.extend(timezone)

const CurrentTimeLine = ({axis, tz}) => {
    dayjs.tz.setDefault(tz)
    const [currentTime, setCurrentTime] = useState(dayjs().tz())

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(dayjs().tz())
        }, 60000)

        return () => {
            clearInterval(interval)
        }
    }, [tz])

    const currentHour = currentTime.hour() // Get current hour
    const currentMinute = currentTime.minute() // Get current minute
    const currentSecond = currentTime.second() // Get current second
    const totalSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond // Get total seconds
    const percentOfDay = totalSeconds / 86400 * 100 // Get percentage of day

    const props = {
        key: 'current-timeline',
        style: {
            position: 'absolute',
            top: axis ? 55 : `calc(${percentOfDay}% + 39px)`, // 48px is the height of the header
            left: axis ? `calc(${percentOfDay}% + 45.45px)` : 0,
            margin: 0,
            width: axis ? '2px' : '100%',
            ...(axis && { minWidth: '2px'}),
            backgroundColor: 'red',
            height: axis ? 'calc(100% - 111px)' : '2px',
            zIndex: 999,
        }
    }

    return (
        <Divider {...props} />
    )
}

export default CurrentTimeLine