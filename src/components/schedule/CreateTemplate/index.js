import { useState } from 'react'
import { Button, Modal, Input, TimePicker, Checkbox, Space, DatePicker, Divider, Radio, InputNumber, message, Popconfirm } from "antd"
import { UserOutlined, EditOutlined, SendOutlined } from '@ant-design/icons'
import { Formik, Form as FormikForm } from 'formik'   // Import Formik form components
import { object, string, number, boolean, array } from 'yup' // Import Yup for form validation

import InputWrapper from '../../forms/InputWrapper'
import SubmitWrapper from '../../forms/SubmitWrapper'
import { createShiftTemplate } from '../../../utils/schedule-status'
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
    start_time: string().required('Required'),
    end_time: string().required('Required'),
    hasGuarantee: boolean().notRequired(),
    guarantee: number().when('hasGuarantee', {
        is: true,
        then: number().min(1, 'Shift driver guarantee must be greater than or equal to 1.').required('Required'),
        otherwise: number().notRequired(),
    }),
    guarantee_specs: string().notRequired(),
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
    drivers: array().of(number().nullable()).notRequired(),
})

const EditTemplate = ({refetch, template_id }) => {
    //const { data, isLoading, error } = useFetch(`v1/shifts-templates/${template_id}`)
    const data = {}
    const DEFAULT_DAY = dayjs()
    const [open, setOpen] = useState(false)
    
    const handleModalOk = () => { // Asynchronous function to handle feeding DB with new shift data
        setOpen(false)
    }

    const handleModalCancel = () => {
        setOpen(false)
        refetch()
    }

    //if (isLoading) { return <>Loading...</> }
    //if (error) {return <>Error...</>}
 
    return (
        <>
            <Button 
                ghost 
                type="primary" 
                key="edit" 
                icon={<EditOutlined />} 
                onClick={() => setOpen(true)}
            />
            <Formik
                initialValues={{
                    title: data.title || '',
                    day: DEFAULT_DAY,
                    start_time: data.start_time || '',
                    end_time: data.end_time || '',
                    capacity: data.capacity || 0,
                    guarantee: data.capacity || 0,
                    guarantee_specs: data.guarantee_spec || '',
                    hasGuarantee: Boolean(data.guarantee),
                    is_recurring: data.is_recurring,
                    days_of_week: [DEFAULT_DAY.day()],
                    template: Boolean(data.recurrence?.max_occurrences) || Boolean(data.recurrence?.end_date) ? 'custom' : 'weekly',
                    pattern: data.recurrence?.pattern || 'weekly',
                    max_occurrences: data.recurrence?.max_occurrences || 0,
                    ends: data.never_ends ? 'never' : data.recurrence?.end_date ? 'on' : 'after',
                    end_date: data.recurrence?.end_date || DEFAULT_DAY,
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
                    console.table(payload)
                    handleModalOk()
                   /*  await createShiftTemplate(payload)
                    .then(() => {
                        message.success('Shift template created successfully!')
                        setSubmitting(false)
                        resetForm()
                        handleModalCancel()
                    }) */
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
                                    Submit
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
                            <Input.Group compact>
                            <TimePicker.RangePicker 
                                style={{ width: '100%' }} 
                                format="HH:mm" 
                                allowClear={false}
                                onChange={(time, timeString) => {
                                    props.setFieldValue('start_time', timeString[0])
                                    props.setFieldValue('end_time', timeString[1])
                                }}
                                hideDisabledOptions
                                disabledTime={() => {
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
                            </Input.Group>
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
                                                props.setFieldValue('days_of_week', [DEFAULT_DAY.day()])
                                            : props.setFieldValue('days_of_week', [DEFAULT_DAY.day()])
                                            
                                            if (e.target.value === 'custom') {
                                                props.setFieldValue('pattern', 'weekly')
                                            }
                                            } 
                                        } 
                                        value={props.values.template}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Radio value={'daily'}>{`Daily (Mon to Sun)`}</Radio>
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
                                                <Radio.Group name='days_of_week' value={props.values.days_of_week[0]} defaultValue={props.values.days_of_week[0]} onChange={e => props.setFieldValue('days_of_week', [Number(e.target.value)])}>
                                                    { weeklyDaysReccurence.map((day, index) => (
                                                        <Radio key={index} value={index}>{day.label}</Radio>
                                                    ))}
                                                </Radio.Group>
                                                </>
                                            )}
                                            { props.values.pattern === 'daily'  && (
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
                                                            value={props.values.ends === 'on' ? 0 : props.values.max_occurrences} 
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

const CreateTemplate = ({refetch}) => {
    const DEFAULT_DAY = dayjs()
    const [open, setOpen] = useState(false)
    
    const handleModalOk = () => { // Asynchronous function to handle feeding DB with new shift data
        setOpen(false)
    }

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
                    //console.table(payload)
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
                                    Submit
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
                            <Input.Group compact>
                            <TimePicker.RangePicker 
                                style={{ width: '100%' }} 
                                format="HH:mm" 
                                allowClear={false}
                                onChange={(time, timeString) => {
                                    props.setFieldValue('start_time', timeString[0])
                                    props.setFieldValue('end_time', timeString[1])
                                }}
                                hideDisabledOptions
                                disabledTime={() => {
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
                            </Input.Group>
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
                                                props.setFieldValue('days_of_week', [DEFAULT_DAY.day()])
                                            : props.setFieldValue('days_of_week', [DEFAULT_DAY.day()])
                                            
                                            if (e.target.value === 'custom') {
                                                props.setFieldValue('pattern', 'weekly')
                                            }
                                            } 
                                        } 
                                        value={props.values.template}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Radio value={'daily'}>{`Daily (Mon to Sun)`}</Radio>
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
                                                <Radio.Group name='days_of_week' value={props.values.days_of_week[0]} defaultValue={props.values.days_of_week[0]} onChange={e => props.setFieldValue('days_of_week', [Number(e.target.value)])}>
                                                    { weeklyDaysReccurence.map((day, index) => (
                                                        <Radio key={index} value={index}>{day.label}</Radio>
                                                    ))}
                                                </Radio.Group>
                                                </>
                                            )}
                                            { props.values.pattern === 'daily'  && (
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
                                                            value={props.values.ends === 'on' ? 0 : props.values.max_occurrences} 
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
    const DEFAULT_DAY = dayjs()
    const [open, setOpen] = useState(false)
    
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
            <Formik
                initialValues={{
                    day: DEFAULT_DAY,
                    city_id: null,
                    drivers: [],
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
                                    props.setFieldValue('drivers', value)
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

export { CreateTemplate, EditTemplate, PublishTemplate }