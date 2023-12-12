import { Table, Card, theme, Space, Row, Typography, Tooltip, Tag } from 'antd'
import { DollarOutlined, SyncOutlined } from '@ant-design/icons'
import qs from 'qs'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import { useFilterStore } from '../../../store'
import useDayShifts from '../../../hooks/use-day-shifts'

dayjs.extend(utc)
dayjs.extend(timezone)

const { useToken } = theme
const { Text } = Typography

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
    const { token } = useToken()
    const { 
        status, 
        is_overnight, 
        start_time, 
        end_time, 
        overnight_start, 
        overnight_end,
        duration,
        guarantee,
        is_recurring,
        count,
        capacity
    } = record

    const getShiftDuration = () => {
        const END_TIME = dayjs(end_time).tz(tz).utc()
        const START_TIME = dayjs(start_time).tz(tz).utc()
        return END_TIME.diff(START_TIME, 'hour', true)
    }

    const floatingComponentWidth = (is_overnight ? getShiftDuration() : duration) * 60  // 60.9936 is the average width of each hour in the calendar

    const styleConfig = {
        backgroundColor: status === "active"
            ? is_overnight 
                ? token['purple-8']
                : token.colorSuccessBg
            : token.colorWarningBg,
        borderColor: status === "active"
            ? is_overnight
                ? token['geekblue-10']
                : token['green-4']
            : token['gold-4'],
        height: 'calc(100% + 2px)',
        width: floatingComponentWidth
    }
    
    const ellipsisStyle = {
        style: styleConfig.width < 100 ? { width: styleConfig.width, textAlign: 'left', 
        ...(is_overnight && { color: '#FFFFFF' })} : {...(is_overnight && { color: '#FFFFFF' })},
        ellipsis: { tooltip: true, suffix: '' },
        strong: true,
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
                <Space direction="horizontal" style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'flex-start' }}>
                    <Space direction="vertical" size={0}>
                        <Row>
                            <Space>
                                <Text {...ellipsisStyle} >
                                    {
                                        `${ is_overnight && start_time !== overnight_start 
                                            ? `🌙` + dayjs(overnight_start).tz(tz).utc().format('HH:mm')
                                            : dayjs(record?.start_time).tz(tz).utc().format('HH:mm')} ➡ ${
                                            is_overnight && end_time !== overnight_end 
                                            ? dayjs(overnight_end).tz(tz).utc().format('HH:mm') + `🌙` 
                                            : dayjs(end_time).tz(tz).utc().format('HH:mm') }`
                                    }
                                </Text>
                            </Space>
                        </Row>
                        <Row>
                            <Space size={0}>
                                <Text 
                                    strong 
                                    style={{ 
                                        marginRight: 4, 
                                        ...(is_overnight 
                                            ? {color: '#FFFF'} 
                                            : {}
                                        ) 
                                    }}
                                >
                                    {`${count} / ${capacity}`}
                                </Text>
                                { guarantee && (
                                    <Tooltip title={`Guarantee: $${guarantee}`}>
                                        <Tag color="gold">
                                            <DollarOutlined /> 
                                        </Tag>
                                    </Tooltip>
                                )}
                                { is_recurring && (
                                    <Tooltip title="Recurring Shift">
                                        <Tag color="lime">
                                            <SyncOutlined />
                                        </Tag>
                                    </Tooltip>
                                )}
                            </Space>
                        </Row>
                    </Space>
                </Space>
            </Card>
        </div>
    )
}

const ExpandableDayShift = ({day}) => { //TODO: Add overlapping shift visuals
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