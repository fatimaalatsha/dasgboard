import { useState } from 'react'
import { 
    Card, 
    theme, 
    Space, 
    Row, 
    Typography, 
    Modal, 
    Button, 
    Tooltip, 
    Tag,
    Checkbox, 
    Input,
    message,
    Spin,
    Popover,
    Col,
    Divider,
} from 'antd'
import { 
    PlusOutlined, 
    HistoryOutlined, // Late out Icon
    FieldTimeOutlined,  // Early out Icon
    ClockCircleOutlined, // Early in Icon
    DollarOutlined, // Guarantee Icon
    CalendarOutlined,
    CommentOutlined, // Internal Comment
    MessageOutlined, // External Comment
    FlagOutlined, // Status Icon
    ExceptionOutlined,
    EditOutlined, // Edit Shift Icon
    DeleteOutlined,
    ApiOutlined,
    InteractionOutlined,
} from '@ant-design/icons'
import OvernightIcon from '../../icons/OvernightIcon'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import { Formik, Form as FormikForm } from 'formik'   // Import Formik form components
import { object, string, number, boolean, mixed, array } from 'yup' // Import Yup for form validation

import { useFilterStore } from '../../../store'

import Submit from '../../forms/SubmitWrapper'
import TimePickerWrapper from '../../forms/TimePickerWrapper'
import DatePickerWrapper from '../../forms/DatePickerWrapper'

import { 
    convertToHourTz, 
    converToUTC, 
    createWeekShift as createDayShift, 
    updateWeekShift as updateDayShift,
    deleteWeekShift as deleteDayShift,
    unassignFromShift,
    updateShiftByDriverId,
} from '../../../utils/schedule-status'
import useFetch from '../../../hooks/use-new-fetch'

dayjs.extend(utc)
dayjs.extend(timezone)

const { useToken } = theme
const { Text, Title } = Typography

const timeslotSchema = object().shape({
    start_time: string().required('Start time is required'),
    end_time: string().required('End time is required'),
    driver_ids: number().required('Driver is required'),
    city_id: mixed().required('Required'),
    is_individual: boolean().required('Required'),
    is_recurring: boolean().required('Required'),
    capacity: number().required('Required'),
    checked: boolean(),
    guarantee: number()
                .when('checked', {
                    is: true,
                    then: number().min(1, 'Guarantee must be greater than 0').max(1000, 'Guarantee must be less than 1000').required('Guarantee is required'),
                    otherwise: number().notRequired()
                }),
    guarantee_specs: string().notRequired(),
})

const SHIFT_STATUS = [
    { value: 'No show' , label: 'No show'},
    { value: 'Early-in' , label: 'Early in'},
    { value: 'Early-out' , label: 'Early out'},
    { value: 'Late-in' , label: 'Late in'},
    { value: 'Late-out' , label: 'Late out'},
]

const SHIFT_STATUS_TAGS = {
    'No show': <Tag color="red">No Show</Tag>,
    'Early-in': <Tag color="green">Early-in</Tag>,
    'Early-out': <Tag color="red">Early out</Tag>,
    'Late-out': <Tag color="magenta">Late out</Tag>,
    'Late-in': <Tag color="volcano">Late in</Tag>,
}

const tagsSchema = object().shape({
    tags: array().of(string().nullable()).required('Required'),
    internal_comment: string().notRequired(),
})

const EditShiftModal = ({shift_id, open, tz, refetch}) => {
    const { data, isLoading, error } = useFetch(`v1/shifts/${shift_id}`)
    const [isModalOpen, setIsModalOpen] = useState(open)

    const handleCancel = () => {
        setIsModalOpen(false)
        refetch()
    }

    if (isLoading) { return <Spin /> }
    if (error) {return <>Error...</>}

    return (
        <Formik
            initialValues={{
                start_time: convertToHourTz(data.start_time, tz),
                end_time: convertToHourTz(data.end_time, tz),
                checked: Boolean(data.guarantee),
                guarantee: data.guarantee || 0,
                guarantee_specs: data.guarantee_specs || '',
                driver_ids: Number(data.drivers[0].user_id),
                city_id: Number(data.city_id),
                is_recurring: false,
                capacity: 1,
                is_individual: true,
                overnight: data.is_overnight || false
            }}
            validationSchema={timeslotSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
                const payload ={
                    'start_time': converToUTC( dayjs(data.start_time).tz(tz).utc().format('YYYY-MM-DD'), values.start_time, tz),
                    'end_time': converToUTC( values.overnight ? dayjs(data.start_time).add(1, 'day').tz(tz).utc().format('YYYY-MM-DD') : dayjs(data.start_time).tz(tz).utc().format('YYYY-MM-DD'), values.end_time, tz),
                    'drivers': [{'driver_id': values.driver_ids, 'is_permanent': false}],
                    'city_id': values.city_id,
                    'is_recurring': values.is_recurring,
                    'is_individual': values.is_individual,
                    'capacity': values.capacity,
                    ...(values.checked && { 
                        'guarantee': Number(values.guarantee),
                        'guarantee_specs': values.guarantee_specs,
                    }),
                }
                await updateDayShift(payload, shift_id)
                .then(() => {
                    message.success('Shift updated successfully')
                    setSubmitting(false)
                    resetForm()
                    setIsModalOpen(false)
                    refetch()
                })
            }}
        >
            { props => (
            <FormikForm>
                <Modal 
                    title="Edit Timeslot" 
                    open={isModalOpen} 
                    onCancel={handleCancel}
                    destroyOnClose
                    footer={[
                        <Button key="back" onClick={handleCancel}>
                            Cancel
                        </Button>,
                        <Submit key="submit" type="primary">
                            Update Timeslot
                        </Submit>,
                    ]}
                >
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                        <TimePickerWrapper 
                            name="start_time"
                            style={{ width: '100%' }} 
                            value={dayjs(props.values.start_time, 'HH:mm')}
                            defaultValue={dayjs(props.values.start_time, 'HH:mm')}
                            format="HH:mm" 
                            allowClear={false}
                            showNow={false}
                            disabled
                            hideDisabledOptions
                            disabledTime={(current) => {
                                return {
                                    disabledMinutes: () => {
                                        const minuteSteps = [0, 30, 59]
                                        const minutes = []
                                        for (let i = 0; i < 60; i++) {
                                            if (!minuteSteps.includes(i)) {
                                                minutes.push(i)
                                            }
                                        }
                                        return minutes
                                    },
                                }
                            }}
                        />
                        {!props.values.overnight && (
                            <TimePickerWrapper 
                                name="end_time"
                                style={{ width: '100%' }} 
                                value={props.values.end_time ? dayjs(props.values.end_time, 'HH:mm') : ''}
                                format="HH:mm" 
                                allowClear={false}
                                showNow={false}
                                hideDisabledOptions
                                disabledTime={(current) => {
                                    return {
                                        disabledHours: () => {
                                            const hours = []
                                            for (let i = 0; i < 24; i++) {
                                                if (i < (dayjs(data.start_time).tz(tz).utc().hour()) + 1) {
                                                    hours.push(i)
                                                }
                                            }
                                            return hours
                                        },
                                        disabledMinutes: () => {
                                            const minuteSteps = [0, 30, 59]
                                            const minutes = []
                                            for (let i = 0; i < 60; i++) {
                                                if (!minuteSteps.includes(i)) {
                                                    minutes.push(i)
                                                }
                                            }
                                            return minutes
                                        },
                                    }
                                }}
                            />
                        )}
                        <Space direction="vertical" >
                            <Text strong >&nbsp;</Text>
                            <Tooltip title="Overnight Shift">
                            <Button type="primary" ghost={!props.values.overnight} onClick={() => props.setFieldValue('overnight', !props.values.overnight)}>
                            +1
                            </Button>
                            </Tooltip>
                        </Space>
                        </div>
                                {   props.values.overnight && (
                                    <div size={16} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                        <div style={{ width: '100%', display: 'block' }}>
                                            <DatePickerWrapper 
                                                name="end_day"
                                                style={{ width: '100%' }} 
                                                value={dayjs(data.start_time).add(1, 'day')} 
                                                allowClear={false}
                                                disabled
                                            />
                                        </div>
                                        <TimePickerWrapper 
                                            name="end_time"
                                            style={{ width: '100%' }} 
                                            value={props.values.end_time ? dayjs(props.values.end_time, 'HH:mm') : ''}
                                            format="HH:mm" 
                                            allowClear={false}
                                            showNow={false}
                                            hideDisabledOptions
                                            disabledTime={(current) => {
                                                return {
                                                    disabledHours: () => {
                                                        const hours = []
                                                        for (let i = 8; i < 24; i++) {
                                                            hours.push(i)
                                                        }
                                                        return hours
                                                    },
                                                    disabledMinutes: () => {
                                                        const minuteSteps = [0, 30, 59]
                                                        const minutes = []
                                                        for (let i = 0; i < 60; i++) {
                                                            if (!minuteSteps.includes(i)) {
                                                                minutes.push(i)
                                                            }
                                                        }
                                                        return minutes
                                                    },
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                        <Checkbox 
                            name="checked"
                            checked={props.values.checked}
                            disabled={props.values.checked}
                            onChange={(e) => {
                                props.setFieldValue('checked', e.target.checked)
                            }}>
                            Guarantee?
                        </Checkbox>
                        { props.values.checked && (
                            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                <Input 
                                    name="guarantee"
                                    placeholder="Guarantee amount"
                                    type="number"
                                    min={0}
                                    max={1000}
                                    prefix="$" 
                                    suffix="CAD" 
                                    defaultValue={props.values.guarantee}
                                    onChange={(e) => {
                                        props.setFieldValue('guarantee', Number(e.target.value))
                                    }}
                                />
                                <Input.TextArea 
                                    name="guarantee_specs"
                                    defaultValue={props.values.guarantee_specs}
                                    rows={4} 
                                    placeholder="Guarantee description (optional)"
                                    onChange={(e) => {
                                        props.setFieldValue('guarantee_specs', e.target.value)
                                    }}
                                />
                            </Space>
                        )}
                    </Space>
                </Modal>
            </FormikForm>
            )}
        </Formik>
    )
}

const CardStatus = ({ status }) => {
    return (
        <Space size={0}>
            { status.hasOwnProperty('break') && (
                <Tooltip title="Break">
                    <Tag color="purple">
                        <ClockCircleOutlined />
                    </Tag>
                </Tooltip>
            )}
            { status === 'Early-in' && (
                <Tooltip title="Early In">
                    <Tag color="green">
                        <HistoryOutlined style={{ transform: "scaleX(-1)" }} />
                    </Tag>
                </Tooltip>
            )}
            { status === 'Early-out' &&(
                <Tooltip title="Early Out">
                    <Tag color="red">
                        <HistoryOutlined />
                    </Tag>
                </Tooltip>
            )}
            { status === 'Late-out' && (
                <Tooltip title="Late Out">
                    <Tag color="magenta">
                        <FieldTimeOutlined />
                    </Tag>
                </Tooltip>
            )}
        </Space>
    )
}

const ShiftDetails = ({
        shift_id, 
        driver_id, 
        start_time, 
        end_time, 
        day, 
        guarantee, 
        is_individual, 
        is_overnight,
        overnight_start,
        overnight_end,
        handleEdit, 
        handleOpen, 
        handleUnassign, 
        handleDelete,
        handleStatus
    }) => {
    const { data, isLoading, error } = useFetch(`v1/shifts/${shift_id}/drivers-shift/${driver_id}`)
    const { token } = useToken()
    
    const iconStyle = { 
        style: { color: token.colorTextDisabled, fontSize: 16 }
    }

    const dividerStyle = {
        style: { margin: '8px 0'}
    }
    
    if (isLoading) return <Spin />
    if (error) return <>Error...</>
    
    return (
        <Card
            title={<Title level={4} style={{ marginTop: 10 }}>Shift Details</Title>}
            size="small"
            style={{ boxShadow: 'none' }}
            bordered={false}
            headStyle={{ borderBottom: 'none' }}
            extra={
                <Space>
                    <Tooltip title="Edit">
                        <Button 
                            onClick={() => {
                                handleOpen(false)
                                handleEdit(true)
                            }} 
                            type="link" 
                            disabled={is_individual}
                            icon={<EditOutlined />} 
                        />
                    </Tooltip>
                    <Tooltip title="Change Status">
                        <Button 
                            onClick={() => {
                                handleOpen(false)
                                handleStatus()
                            }} 
                            type="link" 
                            icon={<InteractionOutlined />} 
                        />
                    </Tooltip>
                    { is_individual ? (
                            <Tooltip title="Unassign">
                                <Button 
                                    onClick={() => {handleUnassign()}} 
                                    type="text" 
                                    danger 
                                    icon={<ApiOutlined />} 
                                />
                            </Tooltip>
                        ) : (
                            <Tooltip title="Delete">
                                <Button 
                                    onClick={() => handleDelete()} 
                                    type="text" 
                                    danger 
                                    icon={<DeleteOutlined />} 
                                />
                            </Tooltip>
                        )
                    }
                </Space>
            }
        >
            <Space direction="vertical">
                { is_overnight && (
                    <Row gutter={[16, 0]}>
                        <Col span={2}>
                            <OvernightIcon />
                        </Col>
                        <Col span={22}>
                            <Text style={{ whiteSpace: 'nowrap' }}>Overnight</Text>
                        </Col>
                    </Row>
                )}
                <Row gutter={[16, 0]}>
                    <Col span={2}>
                        <CalendarOutlined {...iconStyle} />
                    </Col>
                    <Col span={22}>
                        { is_overnight && start_time !== overnight_start ? (
                            <Text style={{ whiteSpace: 'nowrap' }}>{`${dayjs(day).subtract(1, 'day').format('dddd, MMMM DD')} ⋅ ${overnight_start} ➡ ${end_time}`}</Text>
                            ) : (
                            <Text style={{ whiteSpace: 'nowrap' }}>{`${dayjs(day).format('dddd, MMMM DD')} ⋅ ${start_time} ➡ ${is_overnight && end_time !== overnight_end ? overnight_end : end_time}`}</Text>
                        )}
                    </Col>
                </Row>
                <Row gutter={[16, 0]}>
                    <Col span={2}>
                        <DollarOutlined  {...iconStyle} />
                    </Col>
                    <Col span={22}>
                        <Text>{guarantee.active ? `$ ${guarantee.amount}` : `No guarantee`}</Text>
                    </Col>
                </Row>
                {guarantee.description && (
                    <Row gutter={[16, 0]}>
                        <Col span={2}>
                            <ExceptionOutlined  {...iconStyle} />
                        </Col>
                        <Col span={22}>
                            <Text style={{ whiteSpace: 'nowrap' }}>{guarantee.description}</Text>
                        </Col>
                    </Row>
                )}
                {data.tags && (
                    <>
                        <Row gutter={[16, 0]}>
                            <Col span={2}>
                                <FlagOutlined {...iconStyle} />
                            </Col>
                            <Col span={22}>
                                <Space size={0}>
                                    { data.tags?.map((tag, idx) => (
                                        <div key={idx}>
                                            {SHIFT_STATUS_TAGS[tag]}
                                        </div>
                                    )) }
                                </Space>
                            </Col>
                        </Row>
                        {data.internal_comment && (
                            <Row gutter={[16, 0]}>
                                <Col span={2}>
                                    <CommentOutlined {...iconStyle} />
                                </Col>
                                <Col span={22}>
                                    <Text>{data.internal_comment}</Text>
                                </Col>
                            </Row>
                        )}
                    </>
                )}
                {data.comment && (
                    <>
                    <Divider {...dividerStyle}/>
                    <Row gutter={[16, 0]}>
                        <Col span={2}>
                            <MessageOutlined  {...iconStyle} />
                        </Col>
                        <Col span={22}>
                            <Text>{data.comment}</Text>
                        </Col>
                    </Row>
                    </>
                )}
            </Space>
        </Card>
    )
}

const ShiftCard = ({ record, cardStyle, handleEdit, handleStatus, application, refetch }) => {
    const [ open, setOpen ] = useState(false)

    const ellipsisStyle = {
        style: cardStyle.width < 100 ? { width: cardStyle.width, textAlign: 'left', 
        ...(record.is_overnight && { color: '#FFFFFF' })} : {...(record.is_overnight && { color: '#FFFFFF' })},
        ellipsis: { tooltip: true, suffix: '' },
        strong: true,
    }

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen)
    }

    const handleUnassign = async () => {
        await unassignFromShift({driver_id: record.driver_id}, record.id)
            .then(() => {
                message.success('Shift unassigned')
                refetch()
            })
    }

    const handleDelete = async () => {
        await deleteDayShift({"affects_to": "current"},record.id)
        .then(() => {
            message.success('Shift deleted')
            refetch()
        })
    }

    return (
        <Popover 
            open={open} 
            content={
                <ShiftDetails 
                    shift_id={record.id} 
                    driver_id={record.driver_id} 
                    start_time={record.start} 
                    end_time={record.end} 
                    day={record.current_day}
                    guarantee={record.guarantee}
                    is_individual={!record.is_individual}
                    is_overnight={record.is_overnight}
                    overnight_start={record.overnight_start}
                    overnight_end={record.overnight_end}
                    handleEdit={(value) => handleEdit(value)}
                    handleOpen={(value) => handleOpenChange(value)}
                    handleUnassign={handleUnassign}
                    handleDelete={handleDelete}
                    handleStatus={handleStatus}
                />
            } 
            onOpenChange={handleOpenChange} 
            trigger="click"
        >
            <div className="floating-component" style={{ position: 'absolute', top: -1, left: -1, zIndex: 999, height: '100%' }}>
                <Card 
                    style={cardStyle}
                    bodyStyle={{ height: '100%', padding: 4 }}
                >
                    <Space direction="horizontal" style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'flex-start' }}>
                        <Space direction="vertical" size={0}>
                            <Row>
                                <Space>
                                    <Text {...ellipsisStyle} >{`${record.is_overnight && record.start !== record.overnight_start ? `🌙` + record.overnight_start : record?.start} ➡ ${record.is_overnight && record.end !== record.overnight_end ? record.overnight_end + `🌙` : record?.end}`}</Text>
                                </Space>
                            </Row>
                            <Row>
                                <Space size={0}>
                                { !!record.guarantee?.amount && (
                                    <Tooltip title={`Guarantee: $${record.guarantee.amount}`}>
                                        <Tag color="gold">
                                            <DollarOutlined /> 
                                        </Tag>
                                    </Tooltip>
                                )}
                                { application?.tags?.map((tag, idx) => (
                                    <CardStatus key={idx} status={tag} guarantee={record?.guarantee?.amount}/>
                                )) }
                                    </Space>
                            </Row>
                        </Space>
                    </Space>
                </Card>
            </div>
        </Popover>
    )
}

const DayCellShift = ({display, record, day, setHoveredCell, isCellFilled, hour, refetch, city, user_id}) => {
    const { token } = useToken()
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const [hours, setHours] = useState({
        start: record.start_time ? convertToHourTz(record.start_time, scheduleFilter.tz) : hour,
        end: record.end_time ? convertToHourTz(record.end_time, scheduleFilter.tz) : '',
        diff: record.duration ? record.duration : 4,
        status: {},
        guarantee: {
            amount: record.guarantee ? record.guarantee : 0,
            description: record.guarantee_specs ? record.guarantee_specs : '',
            active: Boolean(record.guarantee) || false,
        },
        driver_id: user_id,
        current_day: dayjs(day).tz(scheduleFilter.tz).utc().format('YYYY-MM-DD'),
        is_individual: record.is_individual,
        id: record.id,
        is_overnight: record.is_overnight,
        ...(record.is_overnight && {
            overnight_start: convertToHourTz(record.overnight_start, scheduleFilter.tz),
            overnight_end: convertToHourTz(record.overnight_end, scheduleFilter.tz)
        })
    })
    const [isHovering, setIsHovering] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [edit, setEdit] = useState({ // State to hold edit mode
        editMode: false,
        editRecord: record.id,
    })
    const [tags, setTags] = useState({ // State to hold tags
        status: record.application?.tags,
        internal_comment: record.application?.internal_comment,
        open: false
    })

    const getShiftDuration = () => {
        const END_TIME = dayjs(record.end_time).tz(scheduleFilter.tz).utc()
        const START_TIME = dayjs(record.start_time).tz(scheduleFilter.tz).utc()
        return END_TIME.diff(START_TIME, 'hour', true)
    }

    const floatingComponentWidth = (record.is_overnight ? getShiftDuration() : hours.diff) * 60.9936  // 60.9936 is the average width of each hour in the calendar

    const cardStyleConfig = {
        backgroundColor: record.application?.status === 'approved' ? record.is_overnight ? token['purple-8'] : token['geekblue-1'] : token.colorWarningBg,
        borderColor: record.application?.status === 'approved' ? record.is_overnight ? token['geekblue-10'] : token['geekblue-3'] : token['gold-4'],
        width: floatingComponentWidth,
        height: 'calc(100% + 2px)',
    }
  
    const handleClick = () => {
        setIsHovering(true)
        showModal()
    }

    const handleEdit = (value) => {
        setEdit({
            ...edit,
            editMode: value,
        })
    }

    const showModal = () => {
        setIsModalOpen(true)
    }

    const handleCancel = () => {
        setIsModalOpen(false)
        if (!edit) {
            setIsHovering(!isHovering)
        }
        refetch()
    }

    const handleStatus = () => {
        setTags({
            ...tags,
            open: true
        })
    }

    return (
        <>
            { isCellFilled ? (
                <ShiftCard 
                    cardStyle={cardStyleConfig} 
                    record={hours} 
                    application={record.application}
                    handleEdit={(value) => handleEdit(value)} 
                    handleStatus={handleStatus} 
                    refetch={refetch}
                />
            ) : (
            <>
                { display && (
                    <Tooltip title="Add shift">
                        <Button type="text" style={{ width: '100%', height: '100%', padding: 8 }} size="small" onClick={handleClick} icon={<PlusOutlined />} />
                    </Tooltip>
                )}
                { isHovering && (
                    <ShiftCard 
                        cardStyle={cardStyleConfig} 
                        record={hours} 
                        application={record.application}
                        handleEdit={(value) => handleEdit(value)} 
                        setStatus={(value) => setHours(prevHours => ({ ...prevHours, status: { ...prevHours.status, [value]: true } }))} 
                        refetch={refetch}
                    />
                )}
            </>
            )}
            {/**Create Shift Modal */}
            { isModalOpen && (
                <Formik
                    initialValues={{
                        start_time: hours.start,
                        end_time: hours.end,
                        checked: hours.guarantee.active,
                        guarantee: hours.guarantee.amount,
                        guarantee_specs: hours.guarantee.description,
                        driver_ids: Number(hours.driver_id),
                        city_id: [Number(city)],
                        is_recurring: false,
                        capacity: 1,
                        is_individual: true,
                        overnight: false,
                    }}
                    validationSchema={timeslotSchema}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        const payload ={
                            'start_time': converToUTC( hours.current_day, values.start_time, scheduleFilter.tz),
                            'end_time': converToUTC( values.overnight ? dayjs(day).tz(scheduleFilter.tz).utc().add(1, 'day').format('YYYY-MM-DD'): hours.current_day, values.end_time, scheduleFilter.tz),
                            'drivers': [{'driver_id': values.driver_ids, 'is_permanent': false}],
                            'city_id': values.city_id,
                            'is_recurring': values.is_recurring,
                            'is_individual': values.is_individual,
                            'capacity': values.capacity,
                            ...(values.checked && { 
                                'guarantee': Number(values.guarantee),
                                'guarantee_specs': values.guarantee_specs,
                            }),
                        }
                        await createDayShift(payload)
                        .then(() => {
                            message.success('Shift created successfully')
                            setSubmitting(false)
                            resetForm()
                            setIsModalOpen(false)
                            refetch()
                        })
                    }}
                >
                    { props => (
                    <FormikForm>
                        <Modal 
                            title="New Timeslot" 
                            open={isModalOpen} 
                            onCancel={handleCancel}
                            destroyOnClose
                            footer={[
                                <Button key="back" onClick={handleCancel}>
                                    Cancel
                                </Button>,
                                <Submit key="submit" type="primary">
                                    Create Timeslot
                                </Submit>,
                            ]}
                        >
                            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                <TimePickerWrapper 
                                    name="start_time"
                                    style={{ width: '100%' }} 
                                    value={dayjs(props.values.start_time, 'HH:mm')}
                                    defaultValue={dayjs(props.values.start_time, 'HH:mm')}
                                    format="HH:mm" 
                                    allowClear={false}
                                    showNow={false}
                                    hideDisabledOptions
                                    disabledTime={(current) => {
                                        return {
                                            disabledMinutes: () => {
                                                const minuteSteps = [0, 30, 59]
                                                const minutes = []
                                                for (let i = 0; i < 60; i++) {
                                                    if (!minuteSteps.includes(i)) {
                                                        minutes.push(i)
                                                    }
                                                }
                                                return minutes
                                            },
                                        }
                                    }}
                                />
                                {!props.values.overnight && (
                                    <TimePickerWrapper 
                                        name="end_time"
                                        style={{ width: '100%' }} 
                                        value={props.values.end_time ? dayjs(props.values.end_time, 'HH:mm') : ''}
                                        format="HH:mm" 
                                        allowClear={false}
                                        showNow={false}
                                        hideDisabledOptions
                                        disabledTime={(current) => {
                                            return {
                                                disabledHours: () => {
                                                    const hours = []
                                                    for (let i = 0; i < 24; i++) {
                                                        if (i < dayjs(props.values.start_time, 'HH:mm').hour() + 1) {
                                                            hours.push(i)
                                                        }
                                                    }
                                                    return hours
                                                },
                                                disabledMinutes: () => {
                                                    const minuteSteps = [0, 30, 59]
                                                    const minutes = []
                                                    for (let i = 0; i < 60; i++) {
                                                        if (!minuteSteps.includes(i)) {
                                                            minutes.push(i)
                                                        }
                                                    }
                                                    return minutes
                                                },
                                            }
                                        }}
                                    />
                                )}
                                <Space direction="vertical" >
                                    <Text strong >&nbsp;</Text>
                                    <Tooltip title="Overnight Shift">
                                    <Button type="primary" ghost={!props.values.overnight} onClick={() => props.setFieldValue('overnight', !props.values.overnight)}>
                                    +1
                                    </Button>
                                    </Tooltip>
                                </Space>
                                </div>
                                {   props.values.overnight && (
                                    <div size={16} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                        <div style={{ width: '100%', display: 'block' }}>
                                            <DatePickerWrapper 
                                                name="end_day"
                                                style={{ width: '100%' }} 
                                                value={day.add(1, 'day')} 
                                                allowClear={false}
                                                disabled
                                            />
                                        </div>
                                        <TimePickerWrapper 
                                            name="end_time"
                                            style={{ width: '100%' }} 
                                            value={props.values.end_time ? dayjs(props.values.end_time, 'HH:mm') : ''}
                                            format="HH:mm" 
                                            allowClear={false}
                                            showNow={false}
                                            hideDisabledOptions
                                            disabledTime={(current) => {
                                                return {
                                                    disabledHours: () => {
                                                        const hours = []
                                                        for (let i = 8; i < 24; i++) {
                                                            hours.push(i)
                                                        }
                                                        return hours
                                                    },
                                                    disabledMinutes: () => {
                                                        const minuteSteps = [0, 30, 59]
                                                        const minutes = []
                                                        for (let i = 0; i < 60; i++) {
                                                            if (!minuteSteps.includes(i)) {
                                                                minutes.push(i)
                                                            }
                                                        }
                                                        return minutes
                                                    },
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                                <Checkbox 
                                    name="checked"
                                    checked={props.values.checked}
                                    onChange={(e) => {
                                        props.setFieldValue('checked', e.target.checked)
                                        setHours(prevHours => ({...prevHours, guarantee: { ...prevHours.guarantee, active: e.target.checked } }))
                                        if (!e.target.checked) {
                                            props.setFieldValue('guarantee', 0)
                                            setHours(prevHours => ({...prevHours, guarantee: { ...prevHours.guarantee, amount: 0 } }))
                                        }
                                    }}>
                                    Guarantee?
                                </Checkbox>
                                { hours.guarantee.active && (
                                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                        <Input 
                                            name="guarantee"
                                            placeholder="Guarantee amount"
                                            type="number"
                                            min={0}
                                            max={1000}
                                            prefix="$" 
                                            suffix="CAD" 
                                            defaultValue={props.values.guarantee}
                                            onChange={(e) => {
                                                const value = Number(e.target.value)
                                                props.setFieldValue('guarantee', value)
                                                setHours(prevHours => ({...prevHours, guarantee: { ...prevHours.guarantee, amount: value } }))
                                            }}
                                        />
                                        <Input.TextArea 
                                            name="guarantee_specs"
                                            defaultValue={props.values.guarantee_specs}
                                            rows={4} 
                                            placeholder="Guarantee description (optional)"
                                            onChange={(e) => {
                                                const value = e.target.value
                                                props.setFieldValue('guarantee_specs', value)
                                                setHours(prevHours => ({...prevHours, guarantee: { ...prevHours.guarantee, description: value } }))
                                            }}
                                        />
                                    </Space>
                                )}
                            </Space>
                        </Modal>
                    </FormikForm>
                    )}
                </Formik>
            )}
            {/**Edit Shift Modal */}
            { edit.editMode && (
                    <EditShiftModal
                        shift_id={edit.editRecord}
                        open={edit.editMode}
                        tz={scheduleFilter.tz}
                        refetch={refetch}
                    />
            ) }
            {/**Status Tags Modal */}
            { tags.open && (
                <Formik
                    initialValues={{
                        tags: tags.status,
                        internal_comment: tags.internal_comment || '',
                    }}
                    validationSchema={tagsSchema}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        const payload = {
                            'tags': values.tags,
                            'internal_comment': values.internal_comment,
                        }
                        await updateShiftByDriverId(payload, record.id, user_id)
                        .then(() => {
                            message.success('Status updated successfully')
                            setSubmitting(false)
                            resetForm()
                            setTags({
                                ...tags,
                                open: false,
                            })
                            refetch()
                        })
                    }}
                >
                    { props => (
                    <FormikForm>
                        <Modal
                            title="Update Status"
                            open={tags.open}
                            onCancel={() => {
                                setTags({
                                    ...tags,
                                    open: false,
                                })
                                refetch()
                            }}
                            footer={[
                                <Button key="back" onClick={() => {
                                    setTags({
                                        ...tags,
                                        open: false,
                                    })
                                    refetch()
                                }}>
                                    Cancel
                                </Button>,
                                <Submit key="submit" type="primary">
                                    Update Status
                                </Submit>,
                            ]}
                            destroyOnClose
                        >
                            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                <Space direction="vertical" size={2} style={{ width: '100%' }}>
                                    <Title level={5} style={{ marginTop: 0 }}>Status:</Title>
                                    <Checkbox.Group defaultValue={props.values.tags} onChange={(value) => props.setFieldValue('tags', value)}>
                                        <Space direction="vertical">
                                                { SHIFT_STATUS.map((status, idx) => (
                                                    <Checkbox key={idx} value={status.value}>{status.label}</Checkbox>
                                                ))}
                                        </Space>
                                    </Checkbox.Group>
                                </Space>
                                <Space direction="vertical" size={2} style={{ width: '100%' }}>
                                    <Title level={5} style={{ marginTop: 0 }}>Comment:</Title>
                                    <Input.TextArea 
                                        name="internal_comment"
                                        defaultValue={props.values.internal_comment}
                                        rows={4} 
                                        placeholder="Addition comment"
                                        onChange={(e) => {
                                            props.setFieldValue('internal_comment', e.target.value)
                                        }}
                                    />
                                </Space>
                            </Space>
                        </Modal>
                    </FormikForm>
                    )}
                </Formik>
            ) }
        </>
    )
}

export default DayCellShift