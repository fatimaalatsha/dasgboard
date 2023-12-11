import { Table, Card } from 'antd'
import qs from 'qs'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import { useFilterStore } from '../../../store'
import useDayShifts from '../../../hooks/use-day-shifts'

dayjs.extend(utc)
dayjs.extend(timezone)

//get the papams that will be passed to filters through qs
const queryHandler = (params) => ({ // Get table params
    city_id: params.city_id,
    date_from: params.date_from,
    date_to: params.date_to,
    paginated: false,
})

const hoursIdx = [...Array(24)].map((_, idx) => {
    const timeLoop = dayjs().hour(idx).minute(0).format('HH:mm')
    return {
        label: timeLoop,
        value: idx
    }
})

const CellShift = ({record, tz}) => {

    console.log('record: ',record)

    const getShiftDuration = () => {
        const END_TIME = dayjs(record.end_time).tz(tz).utc()
        const START_TIME = dayjs(record.start_time).tz(tz).utc()
        return END_TIME.diff(START_TIME, 'hour', true)
    }

    const floatingComponentWidth = (record.is_overnight ? getShiftDuration() : record.duration) * 60  // 60.9936 is the average width of each hour in the calendar

    const styleConfig = {
        backgroundColor: "red",
        height: 'calc(100% + 2px)',
        width: floatingComponentWidth
    }

    return (
        <div className="floating-component" style={{ position: 'absolute', top: -1, left: -1, zIndex: 999, height: '100%' }}>
            <Card
                style={styleConfig}
                bodyStyle={{ 
                    height: '100%',
                    padding: 4
                }}
            >
                <>here</>
            </Card>
        </div>
    )
}

const ExpandableDayShift = ({day}) => {
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)

    const filters = {
        city_id: Number(scheduleFilter.filter.city_id.replace('in|', '')),
        date_from: day.format('YYYY-MM-DD'),
        date_to: day.format('YYYY-MM-DD'),
    }

    const { 
        data, 
        isLoading, 
        error 
    } = useDayShifts(`/v1/shifts?${qs.stringify(queryHandler(filters), { 
        skipNulls: true, 
        arrayFormat: 'comma' 
    })}`, scheduleFilter.tz, day)

    const columns = [
        {
            title: 'Day',
            dataIndex: 'key',
            key: 'key',
            width: 330,
            render: (text) => (
                <>{dayjs(text).format('MMM, dd DD')}</>
            )
        },
        ...hoursIdx.map((hour, idx) => ({
            title: <>{hour.label}</>,
            dataIndex: idx,
            key: idx,
            align: 'center',
            width: 100,
            render: (_, record) => {
                return (
                    <div className="container" style={{ minHeight: 24, height: '100%', zIndex: 999 }}>
                    { record[dayjs(day).format('YYYY-MM-DD')][hour.label]?.length > 0 
                        ?  record[dayjs(day).format('YYYY-MM-DD')][hour.label].map((item, idx) => (
                            <CellShift 
                                key={idx}
                                record={item}
                                tz={scheduleFilter.tz}
                            />
                        ))
                        : ( <></> )
                    }
                    </div>
                )
            }
        }))
    ]

    error && <>Something went wrong...</>

    return (
        <Table
            columns={columns}
            dataSource={data}
            loading={isLoading}
            pagination={false}
            bordered
            size="small"
        />
    )
}

export default ExpandableDayShift