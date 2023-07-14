import { Row, Col, Card, Descriptions, Button, Badge, Typography, Table, Space, Popconfirm, Radio, Tooltip, message } from 'antd'
import { DeleteOutlined, QuestionCircleOutlined, TableOutlined, AppstoreOutlined } from '@ant-design/icons'

import dayjs from 'dayjs' // Import date handlers
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin

import { useFilterStore } from '../../../store' // Import useFilterStore to access filter store state
import { CreateTemplate, EditTemplate, PublishTemplate } from '../CreateTemplate'
import { deleteShiftTemplate } from '../../../utils/schedule-status'
import useFetch from '../../../hooks/use-new-fetch'

dayjs.extend(utc)

const { Text } = Typography

const ShiftTemplates = () => {
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const setScheduleFilter = useFilterStore(state => state.setScheduleFilter)
    const { data, isLoading, error, refetch } = useFetch(`v1/shifts-templates`)

    const templateViewOptions = [
        {
            label:  <Tooltip title="Grid">
                        <AppstoreOutlined />
                    </Tooltip>,
            value: 0,
        },
        {
            label:  <Tooltip title="Table">
                        <TableOutlined />
                    </Tooltip>,
            value: 1,
        },
    ]

    const handleDelete = async (id) => {
        await deleteShiftTemplate(id)
        .then(() => {
            message.success('Shift deleted successfully')
            refetch()
        })
    }

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
                <Text>{dayjs(record.start_time, 'HH:mm').format('HH:mm') + ` ➡ ` + dayjs(record.end_time, 'HH:mm').format('HH:mm')}</Text>
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
                record.is_recurring && text && 
                <>
                    {   text.map((day, idx) => 
                        <Text strong key={idx} color="blue">
                            {dayjs().day(day).format( text.length === 1 ? 'dddd' : 'ddd') + (text.length - 1 === idx ? '' : `, `)}
                        </Text>
                    )}
                </>
            )
        },
        {
            title: 'Ends',
            dataIndex: 'end_date',
            key: 'end_date',
            render: (text, record) => (
                record.is_recurring && (
                    <>
                        {record.max_occurrences > 0 && <p>After {record.max_occurrences} occurrences</p>}
                        {record.never_ends && <p>Never</p>}
                        {record.end_date && <p>On {dayjs(record.end_date).format('MMM, dddd DD')}</p>}
                    </>
                )
            )
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            key: 'actions',
            render: (text, record) => (
                <Space size="middle">
                    <Popconfirm
                    title="Delete template"
                    description="Are you sure to delete this template?"
                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                    onConfirm={() => handleDelete(record.id)}
                    onCancel={() => refetch()}
                    okText="Yes, Delete it"
                    cancelText="Cancel"
                    >
                        <Button danger type="text" icon={<DeleteOutlined />} />
                    </Popconfirm>
                    <EditTemplate template_id={record.id} refetch={refetch}/>
                    <PublishTemplate template_id={record.id} refetch={refetch}/>
                </Space>
            )
        }
    ]
    
    const colConfig = {
        span: 6,
    }

    if (isLoading) { return <>Loading...</> }

    if (error) {return <>Error...</>}

    return (
        <>
        <Space style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
            <>
                <Radio.Group 
                    size="large" 
                    options={templateViewOptions} 
                    value={scheduleFilter.navigation.template} 
                    defaultValue={scheduleFilter.navigation.template} 
                    optionType="button" 
                    onChange={
                        (e) => setScheduleFilter({
                            ...scheduleFilter, 
                            navigation: { 
                                ...scheduleFilter.navigation, 
                                template: e.target.value 
                            }
                        })
                    }
                />
                <CreateTemplate refetch={refetch}/>
            </>
        </Space>
            {   scheduleFilter.navigation.template === 0 ? (
                <Row gutter={[16, 16]}>
                {
                    data.data.map((item, index) => (
                        <Col {...colConfig} key={index}>
                            <Card
                                title={item.title}
                                actions={[
                                    <Popconfirm
                                        title="Delete template"
                                        description="Are you sure to delete this template?"
                                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                        onConfirm={() => handleDelete(item.id)}
                                        onCancel={() => refetch()}
                                        okText="Yes, Delete it"
                                        cancelText="Cancel"
                                    >
                                        <Button danger type="text" key="delete" icon={<DeleteOutlined />} />
                                    </Popconfirm>,
                                    <EditTemplate template_id={item.id} refetch={refetch}/>,
                                    <PublishTemplate template_id={item.id} refetch={refetch}/>,
                                ]}
                                bordered={false}
                            >
                                <Descriptions column={1} bordered>
                                    <Descriptions.Item label="Capacity">{item.capacity}</Descriptions.Item>
                                    <Descriptions.Item label="Time">{dayjs(item.start_time, 'HH:mm').format('HH:mm') + ` ➡ ` + dayjs(item.end_time, 'HH:mm').format('HH:mm')}</Descriptions.Item>
                                    {item.guarantee && <Descriptions.Item label="Guarantee">{`$ ` + item.guarantee}</Descriptions.Item>}
                                    {item.guarantee_specs && <Descriptions.Item label="Guarantee Description">{item.guarantee_specs}</Descriptions.Item>}
                                    <Descriptions.Item label="Type">
                                        <Badge status={ item.is_recurring ? 'processing' : 'success'} text={ item.is_recurring ? 'Recurrent' : 'Single'} />
                                    </Descriptions.Item>
                                    {item.is_recurring && <Descriptions.Item label="Pattern" style={{ textTransform: 'capitalize' }}>{item.pattern}</Descriptions.Item>}
                                    {item.is_recurring && item.days_of_week && <Descriptions.Item label="Repeats on">
                                        { item.days_of_week.map((day, idx) => (
                                            <Text strong key={idx} color="blue">
                                                {dayjs().day(day).format( item.days_of_week.length === 1 ? 'dddd' : 'ddd') + (item.days_of_week.length - 1 === idx ? '' : `, `)}
                                            </Text>
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
                        dataSource={data.data}
                        pagination={false}
                        loading={isLoading}
                        bordered
                        rowKey="id"
                    />
                )
            }
        </>
    )
}

export default ShiftTemplates