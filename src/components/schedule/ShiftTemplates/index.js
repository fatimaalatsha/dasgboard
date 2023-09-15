import { useEffect } from 'react'
import { Button, Badge, Typography, Table, Space, Popconfirm, message } from 'antd'
import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons'

import qs from 'qs' // Import qs library
import dayjs from 'dayjs' // Import date handlers
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin

import { useFilterStore } from '../../../store' // Import useFilterStore to access filter store state
import { CreateTemplate, EditTemplate, PublishTemplate } from '../CreateTemplate'
import { deleteShiftTemplate } from '../../../utils/schedule-status'
import useFetch from '../../../hooks/use-new-fetch'

//get the papams that will be passed to filters through qs
const getUserParams = (params) => ({ // Get table params
  limit: params.pagination?.pageSize,
  page: params.pagination?.current,
})

dayjs.extend(utc)

const { Text } = Typography

const ShiftTemplates = () => {
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const setScheduleFilter = useFilterStore(state => state.setScheduleFilter)
    const { data, isLoading, error, refetch } = useFetch(`v1/shifts-templates?${qs.stringify(getUserParams(scheduleFilter), { skipNulls: true, arrayFormat: 'comma' })}`)

    useEffect(() => {
        setScheduleFilter({
            ...scheduleFilter,
            pagination: {
                ...scheduleFilter.pagination,
                total: data.meta?.total_items,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} Templates`,
            }
        })
    }, [data])

    const handleTableChange = (pagination, filter, sorter) => {
        setScheduleFilter({
            ...scheduleFilter,
            pagination: {
                ...scheduleFilter.pagination,
                ...pagination,
            }
        })
    }

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
                <Badge status={ record.is_recurring ? 'processing' : 'success'} text={ (record.is_recurring ? 'Recurrent' : 'Single') + (record.is_overnight ? '🌙' : '')} />
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

    if (isLoading) { return <>Loading...</> }

    if (error) {return <>Error...</>}

    return (
        <>
            <Space style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                <>
                    <CreateTemplate refetch={refetch}/>
                </>
            </Space>
            <Table
                columns={columns}
                dataSource={data.data}
                pagination={scheduleFilter.pagination}
                onChange={handleTableChange}
                loading={isLoading}
                bordered
                rowKey="id"
            />
        </>
    )
}

export default ShiftTemplates