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
    InputNumber,
    Input,
    Switch,
} from 'antd'
import { SwapRightOutlined, UserOutlined, MoreOutlined, PlusOutlined, DeleteOutlined, CheckOutlined, CloseOutlined  } from '@ant-design/icons'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin
import { Formik, Form as FormikForm } from 'formik'   // Import Formik form components
import { object, string, number, boolean, array, mixed } from 'yup' // Import Yup for form validation

import { useFilterStore } from '../../../store'

import InputWrapper from '../../forms/InputWrapper' // Import InputWrapper component
import Submit from '../../forms/SubmitWrapper' // Import SubmitWrapper component
import EditableText from '../../EditableText' // EditableText component for inline editing capacity
import { CitySelect } from '../../CitySelect' // Import CitySelect component
import DriverSelect from '../../DriverSelect' // Import DriverSelect component
import { 
    convertToHourTz, 
    converToUTC, 
    createWeekShift, 
    updateWeekShift, 
    deleteWeekShift 
} from '../../../utils/schedule-status'

dayjs.extend(utc)
dayjs.extend(timezone)

const { useToken } = theme
const { Text, Title, Link } = Typography

const shiftSchema = object().shape({
    capacity: number().min(1, 'Shift driver capacity must be greater than or equal to 1.').required('Required'),
    start_time: string().required('Required'),
    end_time: string().required('Required'),
    city_id: mixed().required('Required'),
    hasGuarantee: boolean().notRequired(),
    status: boolean().notRequired(),
    guarantee: number().when('hasGuarantee', {
        is: true,
        then: number().min(10, 'Guarantee amount must be greater than or equal to 10.').required('Required'),
        otherwise: number().notRequired()
    }),
    guarantee_specs: string().notRequired(),
    driver_ids: array().of(number().nullable()).notRequired(),
    is_recurring: boolean().notRequired(),
    pattern: string().when('is_recurring', {
        is: true,
        then: string().required('Required'),
        otherwise: string().notRequired()
    }),
    template: string().notRequired(),
    days_of_week: mixed().when('pattern', {
        is: 'custom',
        then: mixed().required('Required'),
        otherwise: mixed().notRequired()
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

const weeklyDaysReccurence = [
    {
        label: 'Sun',
        value: 0,
    }, 
    {
        label: 'Mon',
        value: 1,
    }, 
    {
        label: 'Tue',
        value: 2,
    }, 
    {
        label: 'Wed',
        value: 3,
    }, 
    {
        label: 'Thu',
        value: 4,
    }, 
    {
        label: 'Fri',
        value: 5,
    }, 
    {
        label: 'Sat',
        value: 6,
    }
]

const ShiftCard = ({record, cardStyle, handleEdit, handleDelete, handleStatus, refetch }) => {

    const items = [
        {
            key: 1,
            onClick: () => {
                handleEdit(true)
            },
            label: 'Edit',
        },
        {
            key: 2,
            label: record.status === 'active' ? 'Deactivate' : 'Activate',
            onClick: () => {
                handleStatus(record.status === 'active' ? 'inactive' : 'active')
            },
        },
        {
            type: 'divider',
        },
        {
            key: 3,
            danger: true,
            onClick: () => {
                handleDelete()
            },
            icon: (<DeleteOutlined />),
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
                                 <Title level={4}>/</Title>
                                <EditableText
                                    value={record?.drivers}
                                    heading={true}
                                    name="capacity"
                                    updateCallback={ async (values) => {
                                        await updateWeekShift(values, record.shift_id)
                                        refetch()
                                    }}
                                />
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
    const DEFAULT_DAY = dayjs(selectedDay).tz(scheduleFilter.tz).utc().day()
    const [shift, setShift] = useState({
        status: record.status,
        drivers: record.capacity || 0,
        start: record.start_time ? convertToHourTz(record.start_time, scheduleFilter.tz) : record.time,
        end: record.end_time ? convertToHourTz(record.end_time, scheduleFilter.tz) : null,
        day: record.start_time ? dayjs(record.start_time).tz(scheduleFilter.tz).utc().format('YYYY-MM-DD') : selectedDay,
        shift_id: record.id || null,
        hasGuarantee: Boolean(record.guarantee),
        guarantee: record.guarantee || 0,
        guarantee_specs: record.guarantee_specs || '',
        hasRecurrency: record.is_recurring || false,
        pattern: 'weekly', // once, daily, weekly
        ends: 'never', // never, after, on
        recurrency: {
            pattern: 'weekly', // once, daily, weekly
            end_date: null,
            occurrences: 0,
            days_of_week: [DEFAULT_DAY],
        }
    })

    const floatingComponentHeight = hours.diff * 57 + 2

    const cardStyleConfig = {
        backgroundColor: shift.status === 'active' ? token.colorSuccessBg : token.colorWarningBg,
        borderColor: shift.status === 'active' ? token.colorSuccessBorder : token.colorWarningBorder,
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

    const handleEdit = (value) => {
        setEdit(value)
        handleClick()
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

    const handleStatusChange = async (value) => {
        const payload = {
            status: value,
        }
        await updateWeekShift(payload, shift.shift_id)
        .then(() => {
            message.success('Shift status updated')
            refetch()
        })
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
                    <ShiftCard cardStyle={cardStyleConfig} record={shift} handleEdit={(value) => handleEdit(value)} handleDelete={handleDelete} handleStatus={(value) => handleStatusChange(value)} refetch={refetch} />
                ) : (
                <>
                    {  display && (
                    <Tooltip title="Add shift">
                        <Button type="text" style={{ width: '100%', height: '100%', padding: 16 }} size="small" onClick={handleClick} icon={<PlusOutlined />} />
                    </Tooltip> 
                    )}
                        { isHovering && (
                            <ShiftCard cardStyle={cardStyleConfig} record={shift} handleEdit={(value) => handleEdit(value)} handleDelete={handleDelete} handleStatus={(value) => handleStatusChange(value)} refetch={refetch} />
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
                    guarantee_specs: shift.guarantee_specs,
                    hasGuarantee: shift.hasGuarantee,
                    'driver_ids': [],
                    is_recurring: shift.hasRecurrency,
                    template: 'weekly',
                    pattern: shift.pattern,
                    ends: shift.ends,
                    end_date: shift.recurrency.end_date || shift.day,
                    max_occurrences: shift.recurrency.occurrences,
                    'days_of_week': shift.recurrency.days_of_week,
                    status: false,
                }}
                validationSchema={shiftSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                    
                    const payload = {
                        'start_time': converToUTC( shift.day, values.start_time, scheduleFilter.tz),
                        'end_time': converToUTC(shift.day, values.end_time, scheduleFilter.tz),
                        'capacity': Number(values.capacity),
                        'city_id': !edit ? [Number(city)] : Number(city),
                        'is_recurring': values.is_recurring,
                        ...(values.status && {
                            'status': 'inactive',
                            }),
                        ...(values.driver_ids.length > 0 && {
                            'driver_ids': values.driver_ids,
                            }),
                        ...(values.hasGuarantee && {
                            'guarantee': Number(values.guarantee),
                            'guarantee_specs': values.guarantee_specs,
                        }),
                        ...(values.is_recurring && {
                            'pattern': values.pattern,
                            'days_of_week': values.days_of_week,
                            ...(values.ends === 'never' && {
                                'never_ends': true,
                            }),
                            ...((values.pattern === 'once' || values.ends === 'after') && {
                                'max_occurrences': values.max_occurrences,
                            }),
                            ...(values.ends === 'on' && {
                                'end_date': values.end_date,
                            }),
                        }),
                    }
                    !edit ? // If edit mode is true, update shift
                    await createWeekShift(payload)
                    .then(() => {
                        message.success('Shift created successfully')
                        setSubmitting(false)
                        resetForm()
                        setIsModalOpen(false)
                        refetch()
                    })
                    : await updateWeekShift(payload, shift.shift_id)
                    .then(() => {
                        message.success('Shift updated successfully')
                        setSubmitting(false)
                        resetForm()
                        setIsModalOpen(false)
                        refetch()
                    })
                }}
            >
                {props => (
                    <FormikForm>
                        <Modal 
                            title={
                                <Space direction="vertical">
                                    <Title level={5} style={{ marginTop: 4 }}>{`New Shift: ${dayjs(shift.day).format(' MMM, dddd DD - YYYY')}`}</Title>
                                    {!edit && (<Space>
                                        <Text>Save for later?</Text>
                                        <Switch
                                            checkedChildren={<CheckOutlined />}
                                            unCheckedChildren={<CloseOutlined />}
                                            checked={props.values.status}
                                            onChange={(value) => {
                                                props.setFieldValue('status', value)
                                                props.setFieldValue('is_recurring', false)
                                            }}
                                        />
                                    </Space>)}
                                </Space>
                            }
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
                                <InputWrapper 
                                    name="capacity" 
                                    prefix={<UserOutlined />} 
                                    placeholder="Shift Capacity" 
                                    type="number" 
                                    min={1} max={999} 
                                    value={props.values.capacity}  
                                    onChange={(e) => {
                                        props.setFieldValue('capacity', Number(e.target.value))
                                    }}
                                />
                                <Divider>
                                <Checkbox
                                    name="hasGuarantee"
                                    checked={props.values.hasGuarantee}
                                    onChange={(e) => {
                                        props.setFieldValue('hasGuarantee', e.target.checked)
                                    }}
                                >
                                    Guarantee?
                                </Checkbox>
                                </Divider>
                                { props.values.hasGuarantee && (
                                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                        <InputWrapper 
                                            name="guarantee"
                                            placeholder="Guarantee amount"
                                            type="number"
                                            min={0}
                                            max={1000}
                                            prefix="$" 
                                            suffix="CAD" 
                                            value={props.values.guarantee}
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
                                <Divider>
                                <Checkbox
                                    name="is_recurring"
                                    disabled={props.values.status}
                                    checked={props.values.is_recurring}
                                    onChange={(e) => {
                                        props.setFieldValue('is_recurring', e.target.checked)
                                    }}
                                >
                                    Recurring Shift?
                                </Checkbox>
                                </Divider>
                                {  props.values.is_recurring && (
                                    <Radio.Group 
                                        style={{ width: '100%' }} 
                                        onChange={ (e) => {
                                                props.setFieldValue('template', e.target.value)
                                                props.setFieldValue('pattern', e.target.value)
                                                e.target.value === 'daily' ? 
                                                    props.setFieldValue('days_of_week', [...Array(7)].map((_,idx) => idx))
                                                : e.target.value === 'weekly' ?
                                                    props.setFieldValue('days_of_week', [DEFAULT_DAY])
                                                : props.setFieldValue('days_of_week', [DEFAULT_DAY])
                                                
                                                if (e.target.value === 'custom') {
                                                    props.setFieldValue('pattern', 'weekly')
                                                }
                                            } 
                                        } 
                                        value={props.values.template}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Radio value={'daily'}>{`Daily (Mon to Sun)`}</Radio>
                                            <Radio value={'weekly'}>{`Weekly on: ${dayjs(shift.day).format('dddd')}`}</Radio>
                                            <Radio value={'custom'}>Custom</Radio>
                                        { props.values.template === 'custom' && (
                                            <>
                                            <Divider orientation="left" plain>Custom Recurrence</Divider>
                                            <Radio.Group 
                                                value={props.values.pattern} 
                                                buttonStyle="solid" 
                                                onChange={(e) => {
                                                    props.setFieldValue('pattern', e.target.value)
                                                    e.target.value === 'once' && props.setFieldValue('max_occurrences', 1)
                                                }}
                                            >
                                                <Radio.Button value="once">Once</Radio.Button>
                                                <Radio.Button value="daily">Daily</Radio.Button>
                                                <Radio.Button value="weekly">Weekly</Radio.Button>
                                            </Radio.Group>
                                            { props.values.pattern === 'weekly' && (
                                                <>
                                                <Divider orientation="left" plain>Repeat On</Divider>
                                                <Radio.Group name='days_of_week' value={props.values.days_of_week[0]} onChange={e =>props.setFieldValue('days_of_week', [Number(e.target.value)])}>
                                                    { weeklyDaysReccurence.map((day, index) => (
                                                        <Radio key={index} value={index}>{day.label}</Radio>
                                                    ))}
                                                </Radio.Group>
                                                </>
                                            )}
                                            { props.values.pattern === 'daily' && (
                                                <>
                                                <Divider orientation="left" plain>Repeat On</Divider>
                                                <Checkbox.Group options={weeklyDaysReccurence} defaultValue={dayjs(shift.day).format('d')} onChange={(value) => props.setFieldValue('days_of_week', value)} />
                                                </>
                                            )}
                                            <Divider orientation="left" plain>Ends</Divider>
                                            <Radio.Group 
                                                name="ends"
                                                value={props.values.ends}
                                                onChange={(e) => {
                                                    props.setFieldValue('ends', e.target.value)
                                                }}
                                            >
                                                <Space direction="vertical">
                                                    <Radio disabled={props.values.ends === 'once'} value="never">Never</Radio>
                                                    <Radio disabled={props.values.ends === 'once'} value="on">
                                                        On
                                                        <DatePicker 
                                                            disabled={props.values.ends !== 'on' } 
                                                            style={{ marginLeft: 16 }} 
                                                            value={dayjs(props.values.end_date)}
                                                            onChange={(date, dateString) => props.setFieldValue('end_date', dateString)} 
                                                            allowClear={false}
                                                        />
                                                    </Radio>
                                                    <Radio disabled={props.values.pattern === 'once'} value="after">
                                                        After
                                                        <InputNumber 
                                                            name="max_occurrences" 
                                                            disabled={props.values.ends !== 'after' || props.values.pattern === 'once'} 
                                                            style={{ width: 180, marginLeft: 8 }} 
                                                            addonAfter="occurrences" 
                                                            min={1} 
                                                            value={props.values.ends === 'on' ? 0 : props.values.max_occurrences} 
                                                            onChange={(value) => {
                                                                props.setFieldValue('max_occurrences', Number(value))
                                                                }
                                                            } 
                                                        />
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