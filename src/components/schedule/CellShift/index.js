import { useState } from 'react'
import { 
    theme, 
    Space, 
    Typography, 
    Modal, 
    Button, 
    Checkbox, 
    Tooltip,
    message,
    Divider,
    Radio,
    DatePicker,
    InputNumber,
    Input,
    Switch,
} from 'antd'
import { UserOutlined, PlusOutlined, CheckOutlined, CloseOutlined  } from '@ant-design/icons'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin
import { Formik, Form as FormikForm } from 'formik'   // Import Formik form components
import { object, string, number, boolean, array, mixed } from 'yup' // Import Yup for form validation

import { useFilterStore } from '../../../store'

import InputWrapper from '../../forms/InputWrapper' // Import InputWrapper component
import TimePickerWrapper from '../../forms/TimePickerWrapper'
import Submit from '../../forms/SubmitWrapper' // Import SubmitWrapper component
import { CitySelect } from '../../CitySelect' // Import CitySelect component
import DriverSelect from '../../DriverSelect' // Import DriverSelect component
import { 
    convertToHourTz, 
    converToUTC, 
    createWeekShift, 
    updateWeekShift, 
    deleteWeekShift 
} from '../../../utils/schedule-status'
import useFetch from '../../../hooks/use-new-fetch'
import WeekShiftCard from '../WeekShiftCard'

dayjs.extend(utc)
dayjs.extend(timezone)

const { useToken } = theme
const { Text, Title } = Typography

const shiftSchema = object().shape({
    capacity: number().min(1, 'Shift driver capacity must be greater than or equal to 1.').required('Required'),
    start_time: string().required('A start time is required to create a shift.'),
    end_time: string().required('An end time is required to create a shift.'),
    city_id: mixed().required('Required'),
    hasGuarantee: boolean().notRequired(),
    status: boolean().notRequired(),
    guarantee: number().when('hasGuarantee', {
        is: true,
        then: number().min(10, 'Guarantee amount must be greater than or equal to 10.').required('Required'),
        otherwise: number().notRequired()
    }),
    guarantee_specs: string().notRequired(),
    drivers: array().of(mixed().nullable()).notRequired(),
    hasEarlyAccess: boolean().notRequired(),
    early_access: number().when('hasEarlyAccess', {
        is: true,
        then: number().min(1, 'Shift driver early access must be greater than or equal to 1.').required('Required'),
        otherwise: number().notRequired(),
    }),
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

const editRecurringSchema = object().shape({
    affects_to: string().required('Required'),
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

const WEEK_PATTERNS = {
    work_week: [1, 2, 3, 4, 5],
    weekend: [6, 0],
    full_week: [...Array(7)].map((_,idx) => idx),
}

const EditShiftModal = ({shift_id, parent_id ,open, tz, refetch, record}) => {
    const { data, isLoading, error } = useFetch(`v1/shifts/${shift_id || parent_id}`)
    const DEFAULT_DAY = dayjs().tz(tz).utc().day()
    const [isModalOpen, setIsModalOpen] = useState(open)
    const [isAffected, setIsAffected] = useState(false)
    const [editPayload, setEditPayload] = useState({})

    const handleCancel = () => {
        setIsModalOpen(false)
        refetch()
    }

    const selectedTemplate = (days_arr) => {
        switch(true) {
            case days_arr.length === 1:
                return 'weekly'
            case days_arr.every(day => WEEK_PATTERNS.weekend.includes(day)):
                return '3'
            case days_arr.every(day => WEEK_PATTERNS.work_week.includes(day)):
                return '2'
            case days_arr.every(day => WEEK_PATTERNS.full_week.includes(day)):
                return '1'
            default:
                return 'custom'
        }
    }

    if (isLoading) { return <>Loading...</> }
    if (error) {return <>Error...</>}

    return (
        <>
        <Formik
            initialValues={{
                start_time: convertToHourTz(shift_id ? data.start_time : record.start_time, tz),
                end_time: convertToHourTz(shift_id ? data.end_time : record.end_time, tz),
                capacity: data.capacity,
                city_id: Number(data?.city_id),
                guarantee: data.guarantee || 0,
                guarantee_specs: data.guarantee_specs || '',
                hasGuarantee: Boolean(data.guarantee),
                'drivers': data.drivers || [],
                hasEarlyAccess: false,
                early_access: 0,
                is_recurring: data.is_recurring,
                template: data.is_recurring ? Boolean(data.recurrence?.max_occurrences) || Boolean(data.recurrence?.end_date) || (data.recurrence?.days_of_week?.length === 1 && dayjs().day(data.recurrence?.days_of_week?.length) !== DEFAULT_DAY) ? 'custom' : selectedTemplate(data.recurrence?.days_of_week) : 'weekly',
                pattern: data.recurrence?.pattern,
                ends: data.recurrence?.never_ends ? 'never' : data.recurrence?.end_date ? 'on' : 'after',
                end_date: data.recurrence?.end_date || dayjs(data.start_time).tz(tz).utc().format('YYYY-MM-DD'),
                max_occurrences: data.recurrence?.max_occurrences || 0,
                'days_of_week': data.recurrence?.days_of_week || [],
                status: false,
            }}
            validationSchema={shiftSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
                const payload = {
                    'start_time': converToUTC( dayjs(shift_id ? data.start_time : record.start_time).tz(tz).utc().format('YYYY-MM-DD'), values.start_time, tz),
                    'end_time': converToUTC( dayjs(shift_id ? data.start_time : record.start_time).tz(tz).utc().format('YYYY-MM-DD'), values.end_time, tz),
                    'capacity': Number(values.capacity),
                    'city_id': Number(values.city_id),
                    'is_recurring': values.is_recurring,
                    ...(!Boolean(shift_id) && {
                        'exists': false,
                    }),
                    ...(values.drivers.length > 0 && {
                        'drivers': values.drivers,
                        }),
                    ...(values.hasGuarantee && {
                        'guarantee': Number(values.guarantee),
                        'guarantee_specs': values.guarantee_specs,
                    }),
                    ...(values.hasEarlyAccess && !values.is_recurring && {
                        'early_access': Number(values.early_access),
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
                        affects_to: values.affects_to,
                    }),
                }
                if (data.is_recurring) {
                    setSubmitting(false)
                    resetForm()
                    setIsModalOpen(false)
                    setEditPayload(payload)
                    setIsAffected(true)
                } else {
                    await updateWeekShift(payload, shift_id)
                    .then(() => {
                        message.success('Shift updated successfully')
                        setSubmitting(false)
                        resetForm()
                        handleCancel()
                    })
                }
            }}
        >
            {props => (
                <FormikForm>
                    <Modal 
                        title={
                            <Title level={5} style={{ marginTop: 4 }}>
                                {`Edit Shift: ${dayjs(shift_id ? data.start_time : record.start_time).utc().format(' MMM, dddd DD - YYYY')}`}
                            </Title>
                        }
                        open={isModalOpen} 
                        onCancel={handleCancel}
                        destroyOnClose
                        footer={[
                            <Button key="back" onClick={handleCancel}>
                                Cancel
                            </Button>,
                            <Submit key="submit" type="primary">
                                Update Shift
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
                            </div>
                            <CitySelect 
                                defaultValue={props.values.city_id}    
                                style={{ width: '100%' }}
                                disabled
                            />
                            <DriverSelect 
                                onChange={(value, label) => {
                                    const driverFormatted = label.map((item) => { // format driver object to match payload
                                        const { label, value, ...rest } = item
                                        return {...rest, driver_id: value}
                                      
                                    })
                                    props.setFieldValue('drivers', driverFormatted)
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
                                disabled={props.values.is_recurring}
                                checked={props.values.hasEarlyAccess}
                                onChange={(e) => {
                                    props.setFieldValue('hasEarlyAccess', e.target.checked)
                                }}
                            >
                                Early Access?
                            </Checkbox>
                            </Divider>
                            { props.values.hasEarlyAccess && (
                                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                    <InputWrapper 
                                        name="early_access"
                                        placeholder="Early Access amount"
                                        type="number"
                                        min={0}
                                        max={1000}
                                        suffix="Days" 
                                        value={props.values.guarantee}
                                        onChange={(e) => {
                                            props.setFieldValue('early_access', Number(e.target.value))
                                        }}
                                    />
                                </Space>
                            )}
                            <Divider>
                            <Checkbox
                                name="is_recurring"
                                disabled={props.values.is_recurring}
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
                                            props.setFieldValue('pattern', 'weekly')
                                            props.setFieldValue('ends', 'never')

                                            switch (e.target.value) {
                                                case '1':
                                                    props.setFieldValue('days_of_week', WEEK_PATTERNS.full_week)
                                                    break
                                                case '2':
                                                    props.setFieldValue('days_of_week', WEEK_PATTERNS.work_week)
                                                    break
                                                case '3':
                                                    props.setFieldValue('days_of_week', WEEK_PATTERNS.weekend)
                                                    break
                                                case 'weekly':
                                                    props.setFieldValue('days_of_week', [DEFAULT_DAY])
                                                    break
                                                case 'custom':
                                                    props.setFieldValue('days_of_week', [DEFAULT_DAY])
                                                    break
                                                default:
                                                    props.setFieldValue('days_of_week', [DEFAULT_DAY])
                                                    break
                                            }
                                        } 
                                    } 
                                    value={props.values.template}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Radio value="1">{`Monday to Sunday`}</Radio>
                                        <Radio value="2">{`Monday to Friday`}</Radio>
                                        <Radio value="3">{`Saturday and Sunday`}</Radio>
                                        <Radio value={'weekly'}>{`Weekly on: ${dayjs().format('dddd')}`}</Radio>
                                        <Radio value={'custom'}>Custom</Radio>
                                    { props.values.template === 'custom' && (
                                        <>
                                        <Divider orientation="left" plain>Custom Recurrence</Divider>
                                        <Radio.Group 
                                            value={props.values.pattern} 
                                            buttonStyle="solid" 
                                            onChange={(e) => {
                                                props.setFieldValue('pattern', e.target.value)
                                                if (e.target.value === 'once') { 
                                                    props.setFieldValue('ends', 'after')
                                                    props.setFieldValue('max_occurrences', 1)
                                                }
                                            }}
                                        >
                                            <Radio.Button value="once">Once</Radio.Button>
                                            <Radio.Button value="weekly">Weekly</Radio.Button>
                                        </Radio.Group>
                                        { props.values.pattern === 'weekly' && (
                                            <>
                                            <Divider orientation="left" plain>Repeat On</Divider>
                                            <Checkbox.Group options={weeklyDaysReccurence} defaultValue={props.values.days_of_week} onChange={(value) => props.setFieldValue('days_of_week', value)} />
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
                                                <Radio disabled={props.values.pattern === 'once'} value="never">Never</Radio>
                                                <Radio disabled={props.values.pattern === 'once'} value="on">
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
                                                        value={props.values.ends !== 'after' ? 0 : props.values.max_occurrences} 
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
        <Formik
            initialValues={{
                affects_to: 'current',
            }}
            validationSchema={editRecurringSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
                console.log({...editPayload, affects_to: values.affects_to}, shift_id || parent_id)
                await updateWeekShift({...editPayload, affects_to: values.affects_to}, shift_id || parent_id)
                .then(() => {
                    message.success('Shift updated successfully')
                    setSubmitting(false)
                    resetForm()
                    handleCancel()
                })
            }}
        >
            {props => (
                <FormikForm>
                    <Modal
                        title="Edit recurring shift"
                        open={isAffected}
                        destroyOnClose
                        onCancel={() => {
                            setIsAffected(false)
                            props.resetForm()
                            refetch()
                        }}
                        footer={[
                            <Button key="back" onClick={handleCancel}>
                                Cancel
                            </Button>,
                            <Submit key="submit" type="primary">
                                OK
                            </Submit>,
                        ]}
                    >
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <Radio.Group
                                style={{ width: '100%' }} 
                                value={props.values.affects_to}
                                onChange={(e) => props.setFieldValue('affects_to', e.target.value)}
                            >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Radio value="current">{`This shift`}</Radio>
                                <Radio value="future">{`This and following shifts`}</Radio>
                                <Radio value="all">{`All Shifts`}</Radio>
                            </Space>
                        </Radio.Group>
                        </Space>
                    </Modal>
                </FormikForm>
            )}
        </Formik>
        </>
    )
}

const CellShift = ({display, record, day, setHoveredCell, isCellFilled, selectedDay, refetch, city, overlap, index}) => {
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const [edit, setEdit] = useState({ // State to hold edit mode
        editMode: false,
        editRecord: record.id,
    })
    const [deleteModal, setDeleteModal] = useState({ // State to hold delete modal
        open: false,
        shift_id: record.id || record.parent_id,
    })
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
        count: record.count,
        drivers: record.capacity || 0,
        start: record.start_time ? convertToHourTz(record.start_time, scheduleFilter.tz) : record.time,
        end: record.end_time ? convertToHourTz(record.end_time, scheduleFilter.tz) : '',
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
        backgroundColor: record.status === 'active' ? token.colorSuccessBg : token.colorWarningBg,
        borderColor: record.status === 'active' ? token['green-4'] : token['gold-4'],
        height: floatingComponentHeight,
        cursor: 'pointer',
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
        setDeleteModal({ ...deleteModal, open: true })
    }

    const handleEdit = (value) => {
        setEdit({
            ...edit,
            editMode: value,
        })
    }

    const handleStatusChange = async (value) => {
        const payload = {
            status: value,
            affects_to: 'current',
            ...( !record.exists && {
                exists: false,
                start_time: record.start_time,
                end_time: record.end_time,
            })
        }
        await updateWeekShift(payload, record.id || record.parent_id)
        .then(() => {
            message.success('Shift status updated')
            refetch()
        })
    }

    const showModal = () => { 
      setIsModalOpen(true)
    }

    const handleCancel = () => {
        setIsModalOpen(false)
        refetch()
    }

    return (
        <>
                { isCellFilled ? (
                    <WeekShiftCard overlap={overlap} index={index} cardStyle={cardStyleConfig} record={shift} status={record.status} handleEdit={(value) => handleEdit(value)} handleDelete={handleDelete} handleStatus={(value) => handleStatusChange(value)} refetch={refetch} day={selectedDay} />
                ) : (
                <>
                    {  display && (
                    <Tooltip title="Add shift">
                        <Button type="text" style={{ width: '100%', height: '100%', padding: 16 }} size="small" onClick={handleClick} icon={<PlusOutlined />} />
                    </Tooltip> 
                    )}
                        { isHovering && (
                            <WeekShiftCard overlap={overlap} index={index} cardStyle={cardStyleConfig} record={shift} status={record.status} handleEdit={(value) => handleEdit(value)} handleDelete={handleDelete} handleStatus={(value) => handleStatusChange(value)} refetch={refetch} day={selectedDay} />
                        )}
                </>
                )}
            <Formik
                initialValues={{
                    start_time: shift.start,
                    end_time: shift.end,
                    capacity: shift.drivers,
                    city_id: [Number(city)],
                    guarantee: shift.guarantee,
                    guarantee_specs: shift.guarantee_specs,
                    hasGuarantee: shift.hasGuarantee,
                    'drivers': [],
                    hasEarlyAccess: false,
                    early_access: 0,
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
                        'city_id': [Number(city)],
                        'is_recurring': values.is_recurring,
                        ...(values.status && {
                            'status': 'inactive',
                            }),
                        ...(values.drivers.length > 0 && {
                            'drivers': values.drivers,
                            }),
                        ...(values.hasGuarantee && {
                            'guarantee': Number(values.guarantee),
                            'guarantee_specs': values.guarantee_specs,
                        }),
                        ...(values.hasEarlyAccess && !values.is_recurring && {
                            'early_access': Number(values.early_access),
                        }),
                        ...(values.is_recurring && !values.hasEarlyAccess && {
                            'pattern': values.pattern,
                            ...(values.pattern !== 'once' && {'days_of_week': values.days_of_week}),
                            'never_ends': Boolean(values.ends === 'never'),
                            ...((values.pattern === 'once' || values.ends === 'after') && {
                                'max_occurrences': values.max_occurrences,
                            }),
                            ...(values.ends === 'on' && {
                                'end_date': values.end_date,
                            }),
                        }),
                    }
                    await createWeekShift(payload)
                    .then(() => {
                        message.success('Shift created successfully')
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
                                    <Space>
                                        <Text>Hide shift?</Text>
                                        <Switch
                                            checkedChildren={<CheckOutlined />}
                                            unCheckedChildren={<CloseOutlined />}
                                            checked={props.values.status}
                                            onChange={(value) => {
                                                props.setFieldValue('status', value)
                                            }}
                                        />
                                    </Space>
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
                                    Create Shift
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
                                </div>
                                <CitySelect 
                                    defaultValue={props.values.city_id}    
                                    style={{ width: '100%' }}
                                    disabled
                                />
                                <DriverSelect 
                                    onChange={(value, label) => {
                                        const driverFormatted = label.map((item) => { // format driver object to match payload
                                            const { label, value, ...rest } = item
                                            return {...rest, driver_id: value}
                                          
                                        })
                                        props.setFieldValue('drivers', driverFormatted)
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
                                    disabled={props.values.is_recurring}
                                    checked={props.values.hasEarlyAccess}
                                    onChange={(e) => {
                                        props.setFieldValue('hasEarlyAccess', e.target.checked)
                                    }}
                                >
                                    Early Access?
                                </Checkbox>
                                </Divider>
                                    { props.values.hasEarlyAccess && (
                                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                            <InputWrapper 
                                                name="early_access"
                                                placeholder="Early Access amount"
                                                type="number"
                                                min={0}
                                                max={1000}
                                                suffix="Days" 
                                                value={props.values.guarantee}
                                                onChange={(e) => {
                                                    props.setFieldValue('early_access', Number(e.target.value))
                                                }}
                                            />
                                        </Space>
                                    )}
                                <Divider>
                                <Checkbox
                                    name="is_recurring"
                                    checked={props.values.is_recurring}
                                    disabled={props.values.hasEarlyAccess}
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
                                                props.setFieldValue('pattern', 'weekly')

                                                switch (e.target.value) {
                                                    case '1':
                                                        props.setFieldValue('days_of_week', WEEK_PATTERNS.full_week)
                                                        break
                                                    case '2':
                                                        props.setFieldValue('days_of_week', WEEK_PATTERNS.work_week)
                                                        break
                                                    case '3':
                                                        props.setFieldValue('days_of_week', WEEK_PATTERNS.weekend)
                                                        break
                                                    case 'weekly':
                                                        props.setFieldValue('days_of_week', [DEFAULT_DAY])
                                                        break
                                                    case 'custom':
                                                        props.setFieldValue('days_of_week', [DEFAULT_DAY])
                                                        break
                                                    default:
                                                        props.setFieldValue('days_of_week', [DEFAULT_DAY])
                                                        break
                                                }
                                            } 
                                        } 
                                        value={props.values.template}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Radio value="1">{`Monday to Sunday`}</Radio>
                                            <Radio value="2">{`Monday to Friday`}</Radio>
                                            <Radio value="3">{`Saturday and Sunday`}</Radio>
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
                                                    if (e.target.value === 'once') {
                                                        props.setFieldValue('ends', 'after')
                                                        props.setFieldValue('max_occurrences', 1)
                                                    }
                                                }}
                                            >
                                                <Radio.Button value="once">Once</Radio.Button>
                                                <Radio.Button value="weekly">Weekly</Radio.Button>
                                            </Radio.Group>
                                            { props.values.pattern === 'weekly' && (
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
                                                    <Radio disabled={props.values.pattern === 'once'} value="never">Never</Radio>
                                                    <Radio disabled={props.values.pattern === 'once'} value="on">
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
                                                            value={props.values.ends !== 'after' ? 0 : props.values.max_occurrences} 
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
            {/* Shift Modal for Edit Mode */}
            { edit.editMode &&  (
                <EditShiftModal shift_id={edit.editRecord} parent_id={record.parent_id} open={edit.editMode} tz={scheduleFilter.tz} refetch={refetch} record={record}/>
            )}
            
        { deleteModal.open && (
        <Formik
            initialValues={{
                affects_to: 'current',
            }}
            validationSchema={editRecurringSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
                await deleteWeekShift({'affects_to': values.affects_to}, deleteModal.shift_id)
                .then((res) => {
                    if(res.status === 400) {
                        message.error(res.message)
                    } else {
                        message.success(res.message)
                    }
                    setSubmitting(false)
                    resetForm()
                    setDeleteModal({ ...deleteModal, open: false})
                    refetch()
                })
            }}
        >
            {props => (
                <FormikForm>
                    <Modal
                        title={`Delete ${record.is_recurring ? 'recurring' : ''} shift`}
                        open={deleteModal.open}
                        destroyOnClose
                        onCancel={() => {
                            setDeleteModal({ ...deleteModal, open: false})
                            props.resetForm()
                            refetch()
                        }}
                        footer={[
                            <Button key="back" onClick={() => {
                                setDeleteModal({ ...deleteModal, open: false})
                                props.resetForm()
                                refetch()
                            }}>
                                Cancel
                            </Button>,
                            <Submit key="submit" type="primary">
                                OK
                            </Submit>,
                        ]}
                    >
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            {record.is_recurring ? (
                            <Radio.Group
                                style={{ width: '100%' }} 
                                value={props.values.affects_to}
                                onChange={(e) => props.setFieldValue('affects_to', e.target.value)}
                            >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Radio value="current">{`This shift`}</Radio>
                                <Radio value="future">{`This and following shifts`}</Radio>
                                <Radio value="all">{`All Shifts`}</Radio>
                            </Space>
                        </Radio.Group>) : (
                        <Text>{`Are you sure you want to delete this shift?`}</Text>)
                        }
                        </Space>
                    </Modal>
                </FormikForm>
            )}
        </Formik>
        )}
        </>
    )
}

export default CellShift