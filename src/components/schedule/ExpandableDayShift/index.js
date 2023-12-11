import { Table } from 'antd'
import qs from 'qs'

import { useFilterStore } from '../../../store'
import useDayShifts from '../../../hooks/use-day-shifts'

//get the papams that will be passed to filters through qs
const queryHandler = (params) => ({ // Get table params
    city_id: params.city_id,
    date_from: params.date_from,
    date_to: params.date_to,
    paginated: false,
})

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
        },
        ...[...Array(24)].map((_, idx) => ({
            title: idx < 10 ? `0${idx}:00` : `${idx}:00`,
            dataIndex: idx,
            key: idx,
            align: 'center',
            width: 100
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