import { useState } from 'react'
import { 
    Card, 
    theme, 
    Space, 
    Row, 
    Typography, 
    Tag, 
    Modal, 
    Button, 
    TimePicker, 
    Checkbox, 
    Dropdown,
    Tooltip,
    message,
    Divider,
    Radio,
    DatePicker,
    InputNumber 
} from 'antd'
import { SwapRightOutlined, UserOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin
import { Formik, Form as FormikForm } from 'formik'   // Import Formik form components
import { object, string, number, boolean, array, mixed, date } from 'yup' // Import Yup for form validation

import { useFilterStore } from '../../store'

import Input from '../forms/InputWrapper' // Import InputWrapper component
import Submit from '../forms/SubmitWrapper' // Import SubmitWrapper component
import { CitySelect } from '../CitySelect' // Import CitySelect component
import DriverSelect from '../DriverSelect' // Import DriverSelect component
import { 
    convertToHourTz, 
    converToUTC, 
    createWeekShift, 
    updateWeekShift, 
    deleteWeekShift 
} from '../../utils/schedule-status'

dayjs.extend(utc)
dayjs.extend(timezone)

const { useToken } = theme
const { Text, Title, Link } = Typography

const shiftSchema = object().shape({
    capacity: number().min(10, 'Shift driver capacity must be greater than or equal to 10.').required('Required'),
    start_time: string().required('Required'),
    end_time: string().required('Required'),
    city_id: mixed().required('Required'),
    hasGuarantee: boolean().notRequired(),
    guarantee: number().when('hasGuarantee', {
        is: true,
        then: number().min(10, 'Guarantee amount must be greater than or equal to 10.').required('Required'),
        otherwise: number().notRequired()
    }),
    driver_ids: array().of(number().nullable()).notRequired(),
    is_recurring: boolean().notRequired(),
    pattern: string().when('is_recurring', {
        is: true,
        then: string().required('Required'),
        otherwise: string().notRequired()
    }),
    ends: string().when('pattern', {
        is: 'custom',
        then: string().required('Required'),
        otherwise: string().notRequired()
    }),
    end_date: mixed().when('ends', {
        is: 'on' || 'never',
        then: mixed().required('Required'),
        otherwise: mixed().notRequired()
    }),
    max_occurrences: number().when('ends', {
        is: 'after',
        then: number().required('Required'),
        otherwise: number().notRequired()
    }),
})

const ShiftCard = ({record, cardStyle, handleEdit, setEdit, handleDelete }) => {

    const items = [
        {
            key: 1,
            onClick: () => {
                handleEdit()
                setEdit(true)
            },
            label: 'Edit',
        },
        {
            key: 2,
            label: 'Send to Draft',
            disabled: true,
        },
        {
            key: 3,
            danger: true,
            onClick: () => {
                handleDelete()
            },
            label: 'Delete',
        },
    ]

    return (
        <div className="floating-component" style={{ position: 'absolute', top: -1, left: -1, zIndex: 999, width: 'calc(100% + 2px)' }}>
            <Card 
                style={cardStyle}
                bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 'calc(100%)', padding: 8 }}
            >
                <Row justify="end">
                    <Dropdown menu={{items}} >
                        <Link onClick={(e) => e.preventDefault()}>
                        <Space>
                            <MoreOutlined />
                        </Space>
                        </Link>
                    </Dropdown>
                </Row>
                <Row style={{ display: 'flex', height: '100%'}}>
                    <Space direction="vertical" style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                        <Space style={{ display: 'flex', columnGap: 2, alignItems: 'baseline' }}>
                            <Title level={1} style={{ margin: 0 }}>0</Title>
                            <Title level={4} type="secondary" style={{ margin: 0 }}>{`/ ${record?.drivers}`}</Title>
                        </Space>
                        { record.guarantee !== 0 && <Text>${record.guarantee}</Text>}
                        <Space>
                            <Text strong style={{ color: 'inherit', fontSize: 12 }}>{record?.start}</Text>
                            <SwapRightOutlined />
                            <Text strong style={{ color: 'inherit', fontSize: 12 }}>{record?.end}</Text>
                        </Space>
                        <Space>
                            <Tooltip title="Present">
                                <Tag color="cyan">0</Tag>
                            </Tooltip>
                            <Tooltip title="Absent">
                                <Tag color="magenta">0</Tag>
                            </Tooltip>
                            <Tooltip title="Late">
                                <Tag color="gold">0</Tag>
                            </Tooltip>
                        </Space>
                    </Space>
                </Row>
            </Card>
        </div>
    )
}

const CellShift = ({display, record, day, setHoveredCell, isCellFilled, selectedDay, refetch, city}) => {
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const [edit, setEdit] = useState(false) // State to hold edit mode
    const { token } = useToken()
    const [hours, setHours] = useState({
        start: record.start,
        end: record.end,
        diff: record.duration ? record.duration : 4
    });
    const [isHovering, setIsHovering] = useState( false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [shift, setShift] = useState({
        drivers: record.capacity || 0,
        start: record.start_time ? convertToHourTz(record.start_time, scheduleFilter.tz) : record.time,
        end: record.end_time ? convertToHourTz(record.end_time, scheduleFilter.tz) : null,
        day: record.start_time ? dayjs(record.start_time).tz(scheduleFilter.tz).utc().format('YYYY-MM-DD') : selectedDay,
        shift_id: record.id || null,
        hasGuarantee: false,
        guarantee: record.guarantee || 0,
        hasRecurrency: false,
        pattern: 'weekly', // once, daily, weekly
        ends: 'after', // never, after, on
        recurrency: {
            pattern: 'weekly', // once, daily, weekly
            end_date: null,
            occurrences: null,
        }
    })
    const floatingComponentHeight = hours.diff * 57 + 2

    const cardStyleConfig = {
        backgroundColor: token.colorSuccessBg,
        borderColor: token.colorSuccessBorder,
        height: floatingComponentHeight,
    }

    /* const errorStyleConfig = {
        backgroundColor: token.colorErrorBg,
        borderColor: token.colorErrorBorder,
        color: token.colorErrorText,
        height: '100%',
    } */
  
    const handleClick = () => {
        setIsHovering(true)
        showModal()
    }

    const handleDelete = async () => {
        await deleteWeekShift(shift.shift_id)
        .then((res) => {
            if(res.status === 400) {
                message.error(res.message)
            } else {
                message.success(res.message)
            }
            refetch()
        })
    }

    const handleHoursChange = (timeString) => {
        setShift({
            ...shift,
            start: timeString[0],
            end: timeString[1],
        })
        const hoursDiff = dayjs(timeString[1], 'HH:mm').diff(dayjs(timeString[0], 'HH:mm'), 'hour', true)
        setHours({start: timeString[0], end: timeString[1], diff: hoursDiff})
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
                    <ShiftCard cardStyle={cardStyleConfig} record={shift} handleEdit={handleClick} setEdit={setEdit} handleDelete={handleDelete} />
                ) : (
                <>
                    {  display && (
                    <Tooltip title="Add shift">
                        <Button type="text" style={{ width: '100%', height: '100%', padding: 16 }} size="small" onClick={handleClick} icon={<PlusOutlined />} />
                    </Tooltip> 
                    )}
                        { isHovering && (
                            <ShiftCard cardStyle={cardStyleConfig} record={shift} handleEdit={handleClick} setEdit={setEdit} handleDelete={handleDelete} />
                        )}
                </>
                )}
            </div>
            <Formik
                initialValues={{
                    start_time: shift.start,
                    end_time: shift.end,
                    capacity: shift.drivers,
                    city_id: !edit ? [Number(city)] : Number(city),
                    guarantee: shift.guarantee,
                    hasGuarantee: shift.hasGuarantee,
                    'driver_ids': [],
                    is_recurring: shift.hasRecurrency,
                    pattern: shift.pattern !== 'custom' ? shift.pattern : shift.recurrency.pattern,
                    ends: shift.ends,
                    end_date: shift.recurrency.end_date || shift.day,
                    max_occurrences: shift.recurrency.occurrences || 3,
                }}
                enableReinitialize
                validationSchema={shiftSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                    console.log(values)
                    values.start_time = converToUTC( shift.day, values.start_time, scheduleFilter.tz)
                    values.end_time = converToUTC(shift.day, values.end_time, scheduleFilter.tz)
                    //values.is_recurring = false
                    values.capacity = Number(values.capacity)
                    values.guarantee = Number(values.guarantee)
                    !values.hasGuarantee && delete values.guarantee
                    values.driver_ids.length === 0 && delete values.driver_ids
                    if (!values.is_recurring) {
                        delete values.pattern 
                        delete values.ends 
                        delete values.end_date 
                        delete values.max_occurrences
                    }
                    delete values.hasGuarantee
                    /* !edit ? // If edit mode is true, update shift
                    await createWeekShift(values)
                    .then(() => {
                        message.success('Shift created successfully')
                        setSubmitting(false)
                        resetForm()
                        setIsModalOpen(false)
                        refetch()
                    })
                    : await updateWeekShift(values, shift.shift_id)
                    .then(() => {
                        message.success('Shift updated successfully')
                        setSubmitting(false)
                        resetForm()
                        setIsModalOpen(false)
                        refetch()
                    }) */
                }}
            >
                {props => (
                    <FormikForm>
                        <Modal 
                            title={`New Shift: ${dayjs(shift.day).format(' MMM, dddd DD - YYYY')}`}
                            open={isModalOpen} 
                            onCancel={handleCancel}
                            destroyOnClose
                            footer={[
                                <Button key="back" onClick={handleCancel}>
                                    Cancel
                                </Button>,
                                <Submit key="submit" type="primary">
                                    {!edit ? 'Create Shift' : 'Update Shift'}
                                </Submit>,
                            ]}
                        >
                            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                {/* TODO: Example for global shift creator
                                * <Checkbox 
                                    onChange={() => {
                                        props.setFieldValue('start_time', '00:00')
                                        props.setFieldValue('end_time', '23:59')
                                        handleHoursChange(['00:00', '23:59'])
                                    }}
                                >
                                    All Day
                                </Checkbox> */}
                                <TimePicker.RangePicker 
                                    name="end"
                                    style={{ width: '100%' }} 
                                    format="HH:mm" 
                                    defaultValue={[dayjs(props.values.start_time, 'HH:mm'), props.values.end_time ? dayjs(props.values.end_time, 'HH:mm') : null]} 
                                    allowClear={false}
                                    disabled={[true, false]} 
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
                                                    if (i < (record.start_time ? dayjs(shift.start, 'HH:mm').hour() : dayjs(record.time, 'HH:mm').hour()) + 1) {
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
                                <CitySelect 
                                    defaultValue={props.values.city_id}    
                                    style={{ width: '100%' }}
                                    disabled
                                />
                                <DriverSelect 
                                    onChange={(value) => {
                                        props.setFieldValue('driver_ids', value)
                                    }}
                                />
                                <Input 
                                    name="capacity" 
                                    prefix={<UserOutlined />} 
                                    placeholder="Driver Limit" 
                                    type="number" 
                                    min={10} max={999} 
                                    defaultValue={props.values.capacity}  
                                    onChange={(e) => {
                                        props.setFieldValue('capacity', e.target.value)
                                        setShift({...shift, drivers: e.target.value})
                                    }}
                                />
                                <Divider>
                                <Checkbox
                                    onChange={() => {
                                        setShift({ ...shift, hasGuarantee: !shift.hasGuarantee })
                                    }}
                                >
                                    Guarantee?
                                </Checkbox>
                                </Divider>
                                { shift.hasGuarantee && (
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
                                <Divider>
                                <Checkbox
                                    name="is_recurring"
                                    onChange={(e) => {
                                        props.setFieldValue('is_recurring', e.target.checked)
                                        setShift({ ...shift, hasRecurrency: !shift.hasRecurrency })
                                    }}
                                >
                                    Recurring Shift?
                                </Checkbox>
                                </Divider>
                                {  shift.hasRecurrency && (
                                    <Radio.Group style={{ width: '100%' }} onChange={(e) => setShift({...shift, pattern: e.target.value })} value={shift.pattern}>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Radio value={'daily'}>Daily</Radio>
                                            <Radio value={'weekly'}>Weekly</Radio>
                                            <Radio value={'custom'}>Custom</Radio>
                                        { shift.pattern === 'custom' && (
                                            <>
                                            <Divider orientation="left" plain>Custom Recurrence</Divider>
                                            <Radio.Group value={props.values.pattern} buttonStyle="solid" onChange={(e) => setShift({...shift, recurrency: {...shift.recurrency, pattern: e.target.value }})}>
                                                <Radio.Button value="once">Once</Radio.Button>
                                                <Radio.Button value="daily">Daily</Radio.Button>
                                                <Radio.Button value="weekly">Weekly</Radio.Button>
                                            </Radio.Group>
                                            <Divider orientation="left" plain>Ends</Divider>
                                            <Radio.Group 
                                                name="ends"
                                                value={props.values.ends}
                                                onChange={(e) => {
                                                    props.setFieldValue('ends', e.target.value)
                                                    setShift({...shift, ends: e.target.value })
                                                }}
                                            >
                                            <Space direction="vertical">
                                                <Radio value="never">Never</Radio>
                                                <Radio value="on">
                                                    On
                                                    <DatePicker disabled={shift.ends !== 'on' } style={{ marginLeft: 16 }} onChange={(date, dateString) => props.setFieldValue('end_date', dateString)} />
                                                </Radio>
                                                <Radio value="after">
                                                    After
                                                    <InputNumber name="max_occurrences" disabled={shift.ends !== 'after' } style={{ width: 180, marginLeft: 8 }} addonAfter="occurrences" min={1} value={props.values.max_occurrences} onChange={(value) => props.setFieldValue('max_occurrences', Number(value))} />
                                                </Radio>
                                            </Space>
                                            </Radio.Group>
                                            </>
                                        )}
                                        </Space>
                                    </Radio.Group>
                                )}
                            </Space>
                        </Modal>
                    </FormikForm>
                )}
            </Formik>
        </>
    )
}

export default CellShift