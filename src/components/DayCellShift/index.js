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
} from 'antd'
import { 
    SwapRightOutlined, 
    PlusOutlined, 
    MoreOutlined,
    HistoryOutlined, // Late out Icon
    FieldTimeOutlined,  // Early outn Icon
    ClockCircleOutlined, // Early in Icon

} from '@ant-design/icons'
import dayjs from 'dayjs'
import { Formik, Form as FormikForm } from 'formik'   // Import Formik form components
import { object, string } from 'yup' // Import Yup for form validation
import Submit from '../forms/SubmitWrapper'

const { useToken } = theme
const { Text, Link } = Typography
//const { Group } = Avatar

//const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

const getFilledHours = (end, start) => {
    const hoursDiff = dayjs(end, 'HH:mm').diff(dayjs(start, 'HH:mm'), 'hour', true)
    return hoursDiff
}

const timeslotSchema = object().shape({
    start: string().required('Start time is required'),
    end: string().required('End time is required'),
})

const items = [
    {
        key: 'edit',
        label: 'Edit',
    },
    {
        key: 'no-show',
        label: 'No Show',
    },
    {
        key: 'early-in',
        label: 'Early In',
    },
    {
        key: 'early-out',
        label: 'Early Out',
    },
    {
        key: 'late-out',
        label: 'Late Out',
    },
]

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
        </Space>
    )
}

const ShiftCard = ({ record, cardStyle, handleEdit, setEdit, setStatus }) => {

    const onClick = ({ key }) => {
        if (key === 'edit') {
            handleEdit()
            setEdit(true)
        }
        if (key !== 'edit') {
            setStatus(key)
        }
    }

    return (
        <div className="floating-component" style={{ position: 'absolute', top: -1, left: -1, zIndex: 999, height: '100%' }}>
            <Card 
                style={cardStyle}
                bodyStyle={{ height: '100%', padding: 4 }}
            >
                <Space direction="horizontal" style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'flex-start' }}>
                    <Dropdown menu={{items, onClick}} >
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
                            <CardStatus status={record?.status} />
                        </Row>
                    </Space>
                </Space>
            </Card>
        </div>
    )
}

const DayCellShift = ({display, record, day, setHoveredCell, isCellFilled, hour}) => {
    const { token } = useToken()
    const [hours, setHours] = useState({
        start: record.start || hour,
        end: record.end,
        diff: record.start ? getFilledHours(record.end, record.start) : 4,
        status: {}
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
    }

    return (
        <>
        <div className="container" style={{ minHeight: 24}}>
            { isCellFilled ? (
                    <ShiftCard cardStyle={cardStyleConfig} record={hours} handleEdit={handleClick} setEdit={setEdit} setStatus={(value) => setHours(prevHours => ({ ...prevHours, status: { ...prevHours.status, [value]: true } }))} />
            ) : (
            <>
                { display && (
                    <Tooltip title="Add shift">
                        <Button type="text" style={{ width: '100%', height: '100%', padding: 8 }} size="small" onClick={handleClick} icon={<PlusOutlined />} />
                    </Tooltip>
                )}
                { isHovering && (
                    <ShiftCard cardStyle={cardStyleConfig} record={hours} handleEdit={handleClick} setEdit={setEdit} setStatus={(value) => setHours(prevHours => ({ ...prevHours, status: { ...prevHours.status, [value]: true } }))} />
                )}
            </>
            )}
                </div>
            {isModalOpen && (
                <Formik
                    initialValues={{
                        start: hours.start,
                        end: hours.end,
                    }}
                    validationSchema={timeslotSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        console.log(values)
                        setSubmitting(false)
                        setIsModalOpen(false)
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
                                    defaultValue={[dayjs(props.values.start, 'HH:mm'), props.values.end ? dayjs(props.values.end, 'HH:mm') : null]} 
                                    allowClear={false}
                                    disabled={[true, false]} 
                                    //onChange={handleHoursChange}
                                    onChange={(time, timeString) => {
                                        props.setFieldValue('start', timeString[0])
                                        props.setFieldValue('end', timeString[1])
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