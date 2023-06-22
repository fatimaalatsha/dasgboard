import { useState } from 'react'
import { Row, Col, Card, Descriptions, Button, Badge, Typography, Table, Space, Popconfirm, Modal, DatePicker } from 'antd'
import { DeleteOutlined, EditOutlined, SendOutlined, QuestionCircleOutlined } from '@ant-design/icons'

import dayjs from 'dayjs' // Import date handlers
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import { Formik, Form as FormikForm } from 'formik'   // Import Formik form components
import { object, string, number, boolean, array, mixed } from 'yup' // Import Yup for form validation

import { useFilterStore } from '../../../store' // Import useFilterStore to access filter store state
import { CitySelect } from '../../CitySelect' // Import CitySelect component
import DriverSelect from '../../DriverSelect' // Import DriverSelect component
import SubmitWrapper from '../../forms/SubmitWrapper'

dayjs.extend(utc)

const { Text } = Typography

const publishSchema = object().shape({
    city_id: number().required('Required'),
    day: string().required('Required'),
    driver_ids: array().of(number().nullable()).notRequired(),
})

const ShiftTemplates = () => {
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const DEFAULT_DAY = dayjs()
    const [open, setOpen] = useState(false)
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
                    onConfirm={() => console.log('delete', record)}
                    onCancel={() => console.log('cancel')}
                    okText="Yes, Delete it"
                    cancelText="Cancel"
                    >
                        <Button danger type="text" icon={<DeleteOutlined />} />
                    </Popconfirm>
                    <Button ghost type="primary" icon={<EditOutlined />} />
                    <Popconfirm
                    title="Publish template"
                    description="Are you sure to publish this template?"
                    onConfirm={handleModalOpen}
                    onCancel={() => console.log('cancel')}
                    okText="Yes, Publish it"
                    cancelText="Cancel"
                    >
                        <Button icon={<SendOutlined />} type="primary"> Publish </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ]
    
    const colConfig = {
        span: 6,
    }
    
    const handleModalOk = () => { // Asynchronous function to handle feeding DB with new shift data
        setOpen(false)
    }

    const handleModalCancel = () => {
        setOpen(false)
    }

    const handleModalOpen = () => {
        setOpen(true)
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
                                <Popconfirm
                                title="Delete template"
                                description="Are you sure to delete this template?"
                                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                onConfirm={() => console.log('delete', item)}
                                onCancel={() => console.log('cancel')}
                                okText="Yes, Delete it"
                                cancelText="Cancel"
                                >
                                    <Button danger type="text" key="delete" icon={<DeleteOutlined />} />
                                </Popconfirm>,
                                <Button ghost type="primary" key="edit" icon={<EditOutlined />} />,
                                <Popconfirm
                                title="Publish template"
                                description="Are you sure to publish this template?"
                                onConfirm={handleModalOpen}
                                onCancel={() => console.log('cancel')}
                                okText="Yes, Publish it"
                                cancelText="Cancel"
                                >
                                    <Button icon={<SendOutlined />} type="primary"> Publish </Button>
                                </Popconfirm>,
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
                    pagination={false}
                    bordered
                    rowKey="id"
                />
            )
        }
        
        <Formik
                initialValues={{
                    day: DEFAULT_DAY,
                    city_id: null,
                    driver_ids: [],
                }}
                validationSchema={publishSchema}
                onSubmit={ async (values, { setSubmitting }) => {
                    console.table(values)
                }}
            >
                {props => (
                    <FormikForm>
                        <Modal 
                            title="Publish Template"
                            open={open} 
                            onOk={handleModalOk} 
                            onCancel={ () => {
                                handleModalCancel()
                                props.resetForm()
                            }}
                            destroyOnClose
                            footer={[
                                <Button 
                                    key="back" 
                                    onClick={() => {
                                        handleModalCancel()
                                        props.resetForm()
                                    }}
                                >
                                    Cancel
                                </Button>,
                                <SubmitWrapper key="submit" type="primary" htmlType="submit" loading={props.isSubmitting}>
                                    Publish
                                </SubmitWrapper>,
                            ]}
                         >
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            
                            <CitySelect
                                onChange={(value) => {
                                    props.setFieldValue('city', Number(value))
                                }}   
                                style={{ width: '100%' }}
                            />
                            <DatePicker 
                                style={{ width: '100%' }}
                                format="ddd D MMM" 
                                allowClear={false}
                                onChange={(date) => props.setFieldValue('day', date ) } 
                            />
                            <DriverSelect 
                                onChange={(value) => {
                                    props.setFieldValue('driver_ids', value)
                                }}
                            />
                        </Space>
                        </Modal>
                    </FormikForm>
                )}
            </Formik>
        </>
    )
}

export default ShiftTemplates