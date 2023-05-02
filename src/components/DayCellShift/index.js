import { useState } from 'react'
import { 
    Card, 
    theme, 
    Space, 
    Row, 
    Typography, 
    Modal, 
    Button, 
    TimePicker, 
    Tooltip, 
    Dropdown,
    Tag,
    Checkbox, 
    Input,
    message,
} from 'antd'
import { 
    SwapRightOutlined, 
    PlusOutlined, 
    MoreOutlined,
    HistoryOutlined, // Late out Icon
    FieldTimeOutlined,  // Early outn Icon
    ClockCircleOutlined, // Early in Icon
    DollarOutlined, // Guarantee Icon

} from '@ant-design/icons'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import { Formik, Form as FormikForm } from 'formik'   // Import Formik form components
import { object, string, number, boolean, array } from 'yup' // Import Yup for form validation

import { useFilterStore } from '../../store'

import Submit from '../forms/SubmitWrapper'
import { 
    convertToHourTz, 
    converToUTC, 
    createWeekShift as createDayShift, 
    updateWeekShift as updateDayShift,
    deleteWeekShift as deleteDayShift,
    unassignFromShift
} from '../../utils/schedule-status'

dayjs.extend(utc)
dayjs.extend(timezone)

const { useToken } = theme
const { Text, Link } = Typography

const timeslotSchema = object().shape({
    start_time: string().required('Start time is required'),
    end_time: string().required('End time is required'),
    driver_ids: array().of(string()).required('Driver is required'),
    city_id: number().required('Required'),
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
})

const CardStatus = ({ status, guarantee }) => {
    return (
        <Space size={0}>
            { status.hasOwnProperty('break') && (
                <Tooltip title="Break">
                    <Tag color="purple">
                        <ClockCircleOutlined />
                    </Tag>
                </Tooltip>
            )}
            { status.hasOwnProperty('early-in') && (
                <Tooltip title="Early In">
                    <Tag color="green">
                        <HistoryOutlined style={{ transform: "scaleX(-1)" }} />
                    </Tag>
                </Tooltip>
            )}
            { status.hasOwnProperty('early-out') &&(
                <Tooltip title="Early Out">
                    <Tag color="red">
                        <HistoryOutlined />
                    </Tag>
                </Tooltip>
            )}
            { status.hasOwnProperty('late-out') && (
                <Tooltip title="Late Out">
                    <Tag color="magenta">
                        <FieldTimeOutlined />
                    </Tag>
                </Tooltip>
            )}
            { !!guarantee && (
                <Tooltip title={`Guarantee: $${guarantee}`}>
                    <Tag color="gold">
                        <DollarOutlined /> 
                    </Tag>
                </Tooltip>
            )}
        </Space>
    )
}

const ShiftCard = ({ record, cardStyle, handleEdit, setEdit, setStatus, refetch }) => {
    const items = [
        {
            key: 'edit',
            label: 'Edit',
            onClick: () => {
                handleEdit()
                setEdit(true)
            },
            disabled: !record?.is_individual,
        },
        {...( record.is_individual ? 
            {
                key: 'delete',
                label: 'Delete',
                danger: true,
                onClick: async () => {
                    await deleteDayShift(record.id)
                    message.success('Shift deleted')
                    refetch()
                },
            }
            :
            {
                key: 'unassign',
                label: 'Unassign',
                danger: true,
                onClick: async () => {
                    await unassignFromShift({driver_id: record.driver_id}, record.id)
                    message.success('Shift unassigned')
                    refetch()
                },
            }
        )},
        {
            key: 'no-show',
            label: 'No Show',
            onClick: () => {
                setStatus('no-show')
            },
        },
        {
            key: 'early-in',
            label: 'Early In',
            onClick: () => {
                setStatus('early-in')
            },
        },
        {
            key: 'early-out',
            label: 'Early Out',
            onClick: () => {
                setStatus('early-out')
            },
        },
        {
            key: 'late-out',
            label: 'Late Out',
            onClick: () => {
                setStatus('late-out')
            },
        },
    ]

    return (
        <div className="floating-component" style={{ position: 'absolute', top: -1, left: -1, zIndex: 999, height: '100%' }}>
            <Card 
                style={cardStyle}
                bodyStyle={{ height: '100%', padding: 4 }}
            >
                <Space direction="horizontal" style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'flex-start' }}>
                    <Dropdown menu={{items}} >
                        <Link onClick={(e) => e.preventDefault()}>
                        <Space>
                            <MoreOutlined />
                        </Space>
                        </Link>
                    </Dropdown>
                    <Space direction="vertical" size={0}>
                        <Row>
                            <Space>
                                <Space size={3}>
                                    <Text strong style={{ color: 'inherit' }}>{record?.start}</Text>
                                    <SwapRightOutlined />
                                    <Text strong style={{ color: 'inherit' }}>{record?.end}</Text>
                                </Space>
                            </Space>
                        </Row>
                        <Row>
                            <CardStatus status={record?.status} guarantee={record?.guarantee?.amount}/>
                        </Row>
                    </Space>
                </Space>
            </Card>
        </div>
    )
}

const DayCellShift = ({display, record, day, setHoveredCell, isCellFilled, hour, refetch, city, user_id}) => {
    const { token } = useToken()
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const [hours, setHours] = useState({
        start: record.start_time ? convertToHourTz(record.start_time, scheduleFilter.tz) : hour,
        end: record.end_time ? convertToHourTz(record.end_time, scheduleFilter.tz) : null,
        diff: record.duration ? record.duration : 4,
        status: {},
        guarantee: {
            amount: record.guarantee ? record.guarantee : 0,
            active: false,
        },
        driver_id: user_id,
        current_day: dayjs(day).tz(scheduleFilter.tz).format('YYYY-MM-DD'),
        is_individual: record.is_individual,
        id: record.id,
    })
    const [isHovering, setIsHovering] = useState( false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [edit, setEdit] = useState(false) // State to hold edit mode

    const floatingComponentWidth = hours.diff * 60.9936  // 60.9936 is the average width of each hour in the calendar

    const cardStyleConfig = {
        backgroundColor: token['geekblue-1'],
        borderColor: token['geekblue-3'],
        width: floatingComponentWidth,
        height: 'calc(100% + 2px)'
    }
  
    const handleClick = () => {
        setIsHovering(true)
        showModal()
    }

    const handleHoursChange = (timeString) => {
        const hoursDiff = dayjs(timeString[1], 'HH:mm').diff(dayjs(timeString[0], 'HH:mm'), 'hour', true)
        setHours({
            ...hours,
            start: timeString[0],
            end: timeString[1],
            diff: hoursDiff
        })
        setHoveredCell({ time: timeString[0], day: day })
    }

    const showModal = () => {
        setIsModalOpen(true)
    }

    /* const handleOk = () => {
        setIsModalOpen(false)
    } */

    const handleCancel = () => {
        setIsModalOpen(false)
        if (!edit) {
            setIsHovering(!isHovering)
        }
        refetch()
    }

    return (
        <>
        <div className="container" style={{ minHeight: 24}}>
            { isCellFilled ? (
                    <ShiftCard 
                        cardStyle={cardStyleConfig} 
                        record={hours} 
                        handleEdit={handleClick} 
                        setEdit={setEdit} 
                        setStatus={(value) => setHours(prevHours => ({ ...prevHours, status: { ...prevHours.status, [value]: true } }))} 
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
                        handleEdit={handleClick} 
                        setEdit={setEdit} 
                        setStatus={(value) => setHours(prevHours => ({ ...prevHours, status: { ...prevHours.status, [value]: true } }))} 
                        refetch={refetch}
                    />
                )}
            </>
            )}
                </div>
            {isModalOpen && (
                <Formik
                    initialValues={{
                        start_time: hours.start,
                        end_time: hours.end,
                        checked: false,
                        guarantee: hours.guarantee.amount,
                        driver_ids: [hours.driver_id],
                        city_id: Number(city),
                        is_recurring: false,
                        capacity: 1,
                        is_individual: true,
                    }}
                    validationSchema={timeslotSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        values.start_time = converToUTC( hours.current_day, values.start_time, scheduleFilter.tz)
                        values.end_time = converToUTC( hours.current_day, values.end_time, scheduleFilter.tz)
                        values.guarantee = Number(values.guarantee)
                        !values.checked && delete values.guarantee
                        delete values.checked
                        console.log(values)
                        !edit ?
                        await createDayShift(values)
                        .then(() => {
                            setSubmitting(false)
                            setIsModalOpen(false)
                            message.success('Shift created successfully')
                            refetch()
                        })
                        :
                        delete values.driver_ids 
                        updateDayShift(values, record.id)
                        .then(() => {
                            setSubmitting(false)
                            setIsModalOpen(false)
                            message.success('Shift updated successfully')
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
                                <TimePicker.RangePicker 
                                    style={{ width: '100%' }} 
                                    format="HH:mm" 
                                    //defaultValue={[dayjs(hour, 'HH:mm'), null]} 
                                    defaultValue={[dayjs(props.values.start_time, 'HH:mm'), props.values.end_time ? dayjs(props.values.end_time, 'HH:mm') : null]} 
                                    allowClear={false}
                                    disabled={[true, false]} 
                                    //onChange={handleHoursChange}
                                    onChange={(time, timeString) => {
                                        props.setFieldValue('start_time', timeString[0])
                                        props.setFieldValue('end_time', timeString[1])
                                        handleHoursChange(timeString)
                                    }}
                                    hideDisabledOptions
                                    disabledTime={(current) => {
                                        return {
                                            disabledHours: () => {
                                                const hours = []
                                                for (let i = 0; i < 24; i++) {
                                                    if (i < dayjs(hour, 'HH:mm').hour() + 1) {
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
                                <Checkbox 
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
                                )}
                            </Space>
                        </Modal>
                    </FormikForm>
                    )}
                </Formik>
            )}
        </>
    )
}

export default DayCellShift