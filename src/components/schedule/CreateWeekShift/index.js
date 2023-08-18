import { useState } from "react"
import { 
    Space, 
    Typography, 
    Modal, 
    Button, 
    Checkbox, 
    message,
    Divider,
    Radio,
    DatePicker,
    InputNumber,
    Input,
    Switch,
} from 'antd'
import { UserOutlined, CheckOutlined, CloseOutlined  } from '@ant-design/icons'
import { Formik, Form as FormikForm } from 'formik'   // Import Formik form components
import { object, string, number, boolean, array, mixed } from 'yup' // Import Yup for form validation

import { useFilterStore } from '../../../store'


import InputWrapper from '../../forms/InputWrapper' // Import InputWrapper component
import DatePickerWrapper from '../../forms/DatePickerWrapper'
import TimePickerWrapper from '../../forms/TimePickerWrapper'
import Submit from '../../forms/SubmitWrapper' // Import SubmitWrapper component
import { CitySelect } from '../../CitySelect' // Import CitySelect component
import DriverSelect from '../../DriverSelect' // Import DriverSelect component
import {  
    converToUTC, 
    createWeekShift, 
} from '../../../utils/schedule-status'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

dayjs.extend(utc)
dayjs.extend(timezone)

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

const WEEK_PATTERNS = {
    work_week: [1, 2, 3, 4, 5],
    end_week: [5, 6],
    weekend: [6, 0],
    full_week: [...Array(7)].map((_,idx) => idx),
}

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
const { Text, Title } = Typography

const CreateWeekShift = ({city, refetch}) => {
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const DEFAULT_DAY = dayjs().tz(scheduleFilter.tz).utc().day()

    const handleOpen = () => setIsModalOpen(true)
    const handleCancel = () => setIsModalOpen(false)

    return (
        <>
            <Button type="primary" onClick={handleOpen}>Create Shift</Button>
                {/* Shift Modal for Creation */}
                { isModalOpen && (
                    <Formik
                        initialValues={{
                            day: dayjs().tz(scheduleFilter.tz).utc(),
                            start_time: '',
                            end_time: '',
                            capacity: 0,
                            city_id: [Number(city)],
                            guarantee: 0,
                            guarantee_specs: '',
                            hasGuarantee: false,
                            'drivers': [],
                            hasEarlyAccess: false,
                            early_access: 0,
                            is_recurring: false,
                            template: 'weekly',
                            pattern: 'weekly',
                            ends: 'never',
                            end_date: dayjs().tz(scheduleFilter.tz).utc(),
                            max_occurrences: 0,
                            'days_of_week': [DEFAULT_DAY],
                            status: false,
                        }}
                        validationSchema={shiftSchema}
                        onSubmit={async (values, { setSubmitting, resetForm }) => {
                            
                            const payload = {
                                'start_time': converToUTC( dayjs(values.day).tz(scheduleFilter.tz).utc().format('YYYY-MM-DD'), values.start_time, scheduleFilter.tz),
                                'end_time': converToUTC(dayjs(values.day).tz(scheduleFilter.tz).utc().format('YYYY-MM-DD'), values.end_time, scheduleFilter.tz),
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
                                window.location.reload() // reload page to update schedule
                            })
                        }}
                    >
                        {props => (
                            <FormikForm>
                                <Modal 
                                    title={
                                        <Space direction="vertical">
                                            <Title level={5} style={{ marginTop: 4 }}>New Shift</Title>
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
                                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                            <DatePickerWrapper 
                                                name="day"
                                                style={{ width: '100%' }} 
                                                value={props.values.day} 
                                            />
                                            <TimePickerWrapper 
                                                name="start_time"
                                                style={{ width: '100%' }} 
                                                value={props.values.start_time ? dayjs(props.values.start_time, 'HH:mm') : ''}
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
                                                                if (i < (dayjs(props.values.start_time, 'HH:mm').hour()) + 1) {
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
                                                            case '4':
                                                                props.setFieldValue('days_of_week', WEEK_PATTERNS.end_week)
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
                                                    <Radio value="4">{`Friday and Saturday`}</Radio>
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
                                                        <Checkbox.Group options={weeklyDaysReccurence} defaultValue={dayjs().format('d')} onChange={(value) => props.setFieldValue('days_of_week', value)} />
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
                )}
        </>
    )
}

export default CreateWeekShift