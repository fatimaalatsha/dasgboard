import { useState } from 'react'
import { Button, Modal, Input, Checkbox, Space, DatePicker, Divider, Radio, InputNumber, message, Popconfirm } from "antd"
import { UserOutlined, EditOutlined, SendOutlined } from '@ant-design/icons'
import { Formik, Form as FormikForm } from 'formik'   // Import Formik form components
import { object, string, number, boolean, array, mixed } from 'yup' // Import Yup for form validation

import InputWrapper from '../../forms/InputWrapper'
import SubmitWrapper from '../../forms/SubmitWrapper'
import TimePickerWrapper from '../../forms/TimePickerWrapper'
import { createWeekShift, createShiftTemplate, updateShiftTemplate } from '../../../utils/schedule-status'
import { CitySelect } from '../../CitySelect'
import DriverSelect from '../../DriverSelect'
import useFetch from '../../../hooks/use-new-fetch'

import dayjs from 'dayjs' // Import date handlers
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

dayjs.extend(utc)
dayjs.extend(timezone)

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

const templateSchema = object().shape({
    title: string().required('Required'),
    capacity: number().min(1, 'Shift driver capacity must be greater than or equal to 1.').required('Required'),
    day: string().required('Required'),
    start_time: string().required('A start time is required to create a shift.'),
    end_time: string().required('An end time is required to create a shift.'),
    hasGuarantee: boolean().notRequired(),
    guarantee: number().when('hasGuarantee', {
        is: true,
        then: number().min(1, 'Shift driver guarantee must be greater than or equal to 1.').required('Required'),
        otherwise: number().notRequired(),
    }),
    guarantee_specs: string().notRequired(),
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
        otherwise: string().notRequired(),
    }),
    template: string().notRequired(),
    days_of_week: array().when('is_recurring', {
        is: true,
        then: array().required('Required'),
        otherwise: array().notRequired(),
    }),
    ends: string().when('template', {
        is: 'custom',
        then: string().required('Required'),
        otherwise: string().notRequired(),
    }),
    end_date: string().when('ends', {
        is: 'on' || 'never',
        then: string().required('Required'),
        otherwise: string().notRequired(),
    }),
    max_occurrences: number().when('ends', {
        is: 'after',
        then: number().min(1, 'Shift max occurrences must be greater than or equal to 1.').required('Required'),
        otherwise: number().notRequired(),
    }),
})

const publishSchema = object().shape({
    city_id: number().required('Required'),
    day: string().required('Required'),
    drivers: array().of(mixed().nullable()).notRequired(),
})

const WEEK_PATTERNS = {
    work_week: [1, 2, 3, 4, 5],
    weekend: [6, 0],
    full_week: [...Array(7)].map((_,idx) => idx),
}

const EditTemplate = ({refetch, template_id }) => {
    const [open, setOpen] = useState(false)

    const handleModalCancel = () => {
        setOpen(false)
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

    const EditForm = () => {
        const { data, isLoading, error } = useFetch(`v1/shifts-templates/${template_id}`)
        const DEFAULT_DAY = dayjs()

        if (isLoading) { return <>Loading...</> }
        if (error) {return <>Error...</>}

        return (
            <Formik
                initialValues={{
                    title: data.title,
                    day: DEFAULT_DAY,
                    start_time: data.start_time.substring(0, 5),
                    end_time: data.end_time.substring(0, 5),
                    capacity: data.capacity ,
                    guarantee: data.guarantee,
                    guarantee_specs: data.guarantee_specs || '',
                    hasGuarantee: Boolean(data.guarantee),
                    is_recurring: data.is_recurring,
                    hasEarlyAccess: false,
                    early_access: 0,
                    days_of_week: data.days_of_week || [],
                    template: data.is_recurring ? Boolean(data.max_occurrences) || Boolean(data.end_date) || (data.days_of_week.length === 1 && dayjs().day(data.days_of_week.length) !== DEFAULT_DAY.day())  ? 'custom' : selectedTemplate(data.days_of_week) : 'weekly',
                    pattern: data.pattern,
                    max_occurrences: data.max_occurrences || 0,
                    ends: data.never_ends ? 'never' : data.end_date ? 'on' : data.max_occurrences ? 'after' : 'never',
                    end_date: data.end_date || DEFAULT_DAY,
                }}
                validationSchema={templateSchema}
                onSubmit={ async (values, { setSubmitting, resetForm }) => {
                    const payload = {
                        'title': values.title,
                        'start_time': values.start_time + ':00',
                        'end_time': values.end_time + ':00',
                        'capacity': Number(values.capacity),
                        'is_recurring': values.is_recurring,
                        ...(values.hasGuarantee && {
                            'guarantee': Number(values.guarantee),
                            'guarantee_specs': values.guarantee_specs,
                        }),
                        ...(values.hasEarlyAccess && !values.is_recurring && {
                            'early_access': Number(values.early_access),
                        }),
                        ...(values.is_recurring && {
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
                    await updateShiftTemplate(payload, data.id)
                    .then(() => {
                        message.success('Shift template updated successfully!')
                        setSubmitting(false)
                        resetForm()
                        handleModalCancel()
                    })
                }}
            >
                {props => (
                    <FormikForm>
                        <Modal 
                            title="Edit Template"
                            open={open} 
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
                                    Update
                                </SubmitWrapper>,
                            ]}
                         >
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <InputWrapper 
                                name="title" 
                                placeholder="Template Title" 
                                type="text" 
                                value={props.values.title}  
                                onChange={(e) => {
                                    props.setFieldValue('title', e.target.value)
                                }}
                            />
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
                                disabled={props.values.is_recurring || props.values.hasEarlyAccess}
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
                                                    props.setFieldValue('days_of_week', [DEFAULT_DAY.day()])
                                                    break
                                                case 'custom':
                                                    props.setFieldValue('days_of_week', [DEFAULT_DAY.day()])
                                                    break
                                                default:
                                                    props.setFieldValue('days_of_week', [DEFAULT_DAY.day()])
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
                                            <Radio value="weekly">{`Weekly on: ${dayjs().format('dddd')}`}</Radio>
                                            <Radio value="custom">Custom</Radio>
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
                                                            onChange={(value) => props.setFieldValue('max_occurrences', Number(value))} 
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
        )
    }
 
    return (
        <>
            <Button 
                ghost 
                type="primary" 
                key="edit" 
                icon={<EditOutlined />} 
                onClick={() => setOpen(true)}
            />
            { open && ( <EditForm /> )}
        </>
    )
}

const CreateTemplate = ({refetch}) => {
    const DEFAULT_DAY = dayjs()
    const [open, setOpen] = useState(false)

    const handleModalCancel = () => {
        setOpen(false)
        refetch()
    }
 
    return (
        <>
            <Button onClick={() => setOpen(true)} type="primary">Create Template</Button>
            <Formik
                initialValues={{
                    title: '',
                    day: DEFAULT_DAY,
                    start_time: '',
                    end_time: '',
                    capacity: 0,
                    guarantee: 0,
                    guarantee_specs: '',
                    hasGuarantee: false,
                    is_recurring: false,
                    hasEarlyAccess: false,
                    early_access: 0,
                    days_of_week: [DEFAULT_DAY.day()],
                    template: 'weekly',
                    pattern: 'weekly',
                    max_occurrences: 0,
                    ends: 'never',
                    end_date: DEFAULT_DAY,
                }}
                validationSchema={templateSchema}
                onSubmit={ async (values, { setSubmitting, resetForm }) => {
                    const payload = {
                        'title': values.title,
                        'start_time': values.start_time + ':00',
                        'end_time': values.end_time + ':00',
                        'capacity': Number(values.capacity),
                        'is_recurring': values.is_recurring,
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
                    await createShiftTemplate(payload)
                    .then(() => {
                        message.success('Shift template created successfully!')
                        setSubmitting(false)
                        resetForm()
                        handleModalCancel()
                    })
                }}
            >
                {props => (
                    <FormikForm>
                        <Modal 
                            title="New Template"
                            open={open} 
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
                                    Create
                                </SubmitWrapper>,
                            ]}
                         >
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <InputWrapper 
                                name="title" 
                                placeholder="Template Title" 
                                type="text" 
                                value={props.values.title}  
                                onChange={(e) => {
                                    props.setFieldValue('title', e.target.value)
                                }}
                            />
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                <TimePickerWrapper 
                                    name="start_time"
                                    style={{ width: '100%' }} 
                                    value={props.values.start_time ? dayjs(props.values.start_time, 'HH:mm') : ''}
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
                                                    props.setFieldValue('days_of_week', [DEFAULT_DAY.day()])
                                                    break
                                                case 'custom':
                                                    props.setFieldValue('days_of_week', [DEFAULT_DAY.day()])
                                                    break
                                                default:
                                                    props.setFieldValue('days_of_week', [DEFAULT_DAY.day()])
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
                                                            onChange={(value) => props.setFieldValue('max_occurrences', Number(value))} 
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

const PublishTemplate = ({refetch, template_id }) => {
    const [open, setOpen] = useState(false)

    const handleModalCancel = () => {
        setOpen(false)
        refetch()
    }

    const handleModalOpen = () => {
        setOpen(true)
    }

    const PublishForm = () => {
        const { data, isLoading, error } = useFetch(`v1/shifts-templates/${template_id}`)
        const DEFAULT_DAY = dayjs()

        if (isLoading) { return <>Loading...</> }
        if (error) {return <>Error...</>}

        return (
            <Formik
                initialValues={{
                    day: DEFAULT_DAY,
                    city_id: null,
                    drivers: [],
                }}
                validationSchema={publishSchema}
                onSubmit={ async (values, { setSubmitting, resetForm }) => {
                    const payload = {
                        'start_time':  values.day.utc().format('YYYY-MM-DD') + 'T' + data.start_time + '.00Z',
                        'end_time': values.day.utc().format('YYYY-MM-DD') + 'T' + data.end_time + '.00Z',
                        'capacity': data.capacity,
                        'city_id': [Number(values.city_id)],
                        'is_recurring': data.is_recurring,
                        'status': data.status,
                        ...(values.drivers.length > 0 && {
                            'drivers': values.drivers,
                            }),
                        ...(Boolean(data.guarantee) && {
                            'guarantee': Number(values.guarantee),
                            'guarantee_specs': values.guarantee_specs,
                        }),
                        ...(data.is_recurring && {
                            'pattern': data.pattern,
                            'days_of_week': data.days_of_week,
                            'never_ends': data.never_ends,
                            ...(Boolean(data.max_occurrences) && {
                                'max_occurrences': data.max_occurrences,
                            }),
                            ...(Boolean(data.end_date) && {
                                'end_date': data.end_date,
                            }),
                        }),
                    }
                    await createWeekShift(payload)
                    .then(() => {
                        message.success('Shift created successfully')
                        setSubmitting(false)
                        resetForm()
                        setOpen(false)
                        refetch()
                    })
                }}
            >
                {props => (
                    <FormikForm>
                        <Modal 
                            title="Publish Template"
                            open={open} 
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
                                    props.setFieldValue('city_id', Number(value))
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
                                onChange={(value, label) => {
                                    const driverFormatted = label.map((item) => { // format driver object to match payload
                                        const { label, value, ...rest } = item
                                        return {...rest, driver_id: value}
                                      
                                    })
                                    props.setFieldValue('drivers', driverFormatted)
                                }}
                            />
                        </Space>
                        </Modal>
                    </FormikForm>
                )}
            </Formik>
        )
    }

    return (
        <>
            <Popconfirm
            title="Publish template"
            description="Are you sure to publish this template?"
            onConfirm={handleModalOpen}
            onCancel={() => refetch()}
            okText="Yes, Publish it"
            cancelText="Cancel"
            >
                <Button icon={<SendOutlined />} type="primary"> Publish </Button>
            </Popconfirm>
            {open && <PublishForm />}
        </>
    )
}

export { CreateTemplate, EditTemplate, PublishTemplate }