import { useState } from 'react'
import { Row, Col, Card, Descriptions, Button, Badge, Typography, Table, Space } from 'antd'
import { DeleteOutlined, EditOutlined, SendOutlined } from '@ant-design/icons'

import dayjs from 'dayjs' // Import date handlers
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin

import { useFilterStore } from '../../../store'

const { Text } = Typography

const ShiftTemplates = ({ shift, onEdit, onDelete }) => {
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const [dummy, setDummy] = useState([
        { id: 1, title: 'Shift 1', guarantee: null, guarantee_specs: '', capacity: 10, start_time: '2021-01-01 00:00:00', end_time: '2021-01-01 05:00:00', is_recurring: true, end_date: null, never_ends: true, pattern: 'weekly', days_of_week: [0, 1, 2, 3, 4, 5, 6], max_occurrences: 0 },
        { id: 2, title: 'Shift 2', guarantee: null, guarantee_specs: '', capacity: 5, start_time: '2021-01-01 00:00:00', end_time: '2021-01-01 05:00:00', is_recurring: false, end_date: null, never_ends: false, pattern: 'weekly', days_of_week: [ 2, 4, 6], max_occurrences: 0 },
        { id: 3, title: 'Shift 3', guarantee: 300, guarantee_specs: 'After completing at least 20 rides in a 4h shift.', capacity: 0, start_time: '2021-01-01 00:00:00', end_time: '2021-01-01 04:00:00', is_recurring: true, end_date: null, never_ends: false, pattern: 'weekly', days_of_week: [ 2, 4, 6], max_occurrences: 8 },
        { id: 4, title: 'Shift 4', guarantee: null, guarantee_specs: '', capacity: 23, start_time: '2021-01-01 00:00:00', end_time: '2021-01-01 07:00:00', is_recurring: true, end_date: '2021-01-01', never_ends: false, pattern: 'daily', days_of_week: [ 5 ], max_occurrences: 0 },
        { id: 5, title: 'Shift 5', guarantee: null, guarantee_specs: '', capacity: 100, start_time: '2021-01-01 00:00:00', end_time: '2021-01-01 22:00:00', is_recurring: true, end_date: null, never_ends: true, pattern: 'weekly', days_of_week: [0, 6], max_occurrences: 0 },
        { id: 6, title: 'Shift 6', guarantee: null, guarantee_specs: '', capacity: 200, start_time: '2021-01-01 00:00:00', end_time: '2021-01-01 18:00:00', is_recurring: true, end_date: null, never_ends: false, pattern: 'once', days_of_week: [5], max_occurrences: 1 },
        { id: 7, title: 'Shift 7', guarantee: null, guarantee_specs: '', capacity: 2, start_time: '2021-01-01 00:00:00', end_time: '2021-01-01 15:00:00', is_recurring: true, end_date: '2021-01-01', never_ends: false, pattern: 'weekly', days_of_week: [1, 3, 5], max_occurrences: 0 },
        { id: 8, title: 'Shift 8', guarantee: null, guarantee_specs: '', capacity: 33, start_time: '2021-01-01 00:00:00', end_time: '2021-01-01 13:00:00', is_recurring: true, end_date: null, never_ends: false, pattern: 'daily', days_of_week: [2, 4, 6], max_occurrences: 3 },
    ])

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Capacity',
            dataIndex: 'capacity',
            key: 'capacity',
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
            render: (text, record) => (
                <Text>{dayjs(record.start_time).format('HH:mm') + ` ➡ ` + dayjs(record.end_time).format('HH:mm')}</Text>
            )
        },
        {
            title: 'Guarantee',
            dataIndex: 'guarantee',
            key: 'guarantee',
            render: (text, record) => (
                record.guarantee && <Text>{`$ ${text}`}</Text>
            )
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (text, record) => (
                <Badge status={ record.is_recurring ? 'processing' : 'success'} text={ record.is_recurring ? 'Recurrent' : 'Single'} />
            )
        },
        {
            title: 'Pattern',
            dataIndex: 'pattern',
            key: 'pattern',
            render: (text, record) => (
                record.is_recurring && <Text style={{ textTransform: 'capitalize' }}>{text}</Text>
            )
        },
        {
            title: 'Repeats on',
            dataIndex: 'days_of_week',
            key: 'days_of_week',
            render: (text, record) => (
                record.is_recurring && <>{text.map((day, idx) => <Text strong key={idx} color="blue">{dayjs().day(day).format('ddd') + `, `}</Text>)}</>
            )
        },
        {
            title: 'Ends',
            dataIndex: 'end_date',
            key: 'end_date',
            render: (text, record) => (
                record.is_recurring && <>{record.never_ends ? <Text strong color="blue">Never</Text> : <Text strong color="blue">{dayjs(text).format('DD MMM YYYY')}</Text>}</>
            )
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            key: 'actions',
            render: (text, record) => (
                <Space size="middle">
                    <Button danger type="text" icon={<DeleteOutlined />} />
                    <Button ghost type="primary" icon={<EditOutlined />} />
                    <Button
                        icon={<SendOutlined />}
                        type="primary"
                        onClick={() => onEdit(record)}
                    >
                        Publish
                    </Button>
                </Space>
            )
        }
    ]
    
    const colConfig = {
        span: 6,
    }

    return (
        <>
        {   scheduleFilter.navigation.template === 0 ? (
            <Row gutter={[16, 16]}>
            {
                dummy.map((item, index) => (
                    <Col {...colConfig} key={index}>
                        <Card
                            title={item.title}
                            actions={[
                                <Button danger type="text" key="delete" icon={<DeleteOutlined />} />,
                                <Button ghost type="primary" key="edit" icon={<EditOutlined />} />,
                                <Button 
                                    icon={<SendOutlined />} 
                                    type="primary" 
                                    onClick={() => onEdit(item)}
                                >
                                    Publish
                                </Button>,
                            ]}
                            bordered={false}
                        >
                            <Descriptions column={1} bordered>
                                <Descriptions.Item label="Capacity">{item.capacity}</Descriptions.Item>
                                <Descriptions.Item label="Time">{dayjs(item.start_time).format('HH:mm') + ` ➡ ` + dayjs(item.end_time).format('HH:mm')}</Descriptions.Item>
                                {item.guarantee && <Descriptions.Item label="Guarantee">{`$ ` + item.guarantee}</Descriptions.Item>}
                                {item.guarantee_specs && <Descriptions.Item label="Guarantee Description">{item.guarantee_specs}</Descriptions.Item>}
                                <Descriptions.Item label="Type">
                                    <Badge status={ item.is_recurring ? 'processing' : 'success'} text={ item.is_recurring ? 'Recurrent' : 'Single'} />
                                </Descriptions.Item>
                                {item.is_recurring && <Descriptions.Item label="Pattern" style={{ textTransform: 'capitalize' }}>{item.pattern}</Descriptions.Item>}
                                {item.is_recurring && <Descriptions.Item label="Repeats on">
                                    { item.days_of_week.map((day, idx) => (
                                        <Text strong key={idx} color="blue">{dayjs().day(day).format('ddd') + `, `}</Text>
                                    ))}
                                </Descriptions.Item>}
                                {item.is_recurring && <Descriptions.Item label="Ends">
                                    <>
                                        {item.max_occurrences > 0 && <p>After {item.max_occurrences} occurrences</p>}
                                        {item.never_ends && <p>Never</p>}
                                        {item.end_date && <p>On {dayjs(item.end_date).format('MMM, dddd DD')}</p>}
                                    </>
                                </Descriptions.Item>}
                            </Descriptions>
                        </Card>
                    </Col>
                ))
            }
            </Row>
            ) : (
                <Table
                    columns={columns}
                    dataSource={dummy}
                />
            )
        }
        </>
    )
}

export default ShiftTemplates