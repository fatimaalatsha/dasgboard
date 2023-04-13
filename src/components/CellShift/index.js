import { useState } from 'react'
import { 
    Card, 
    theme, 
    Space, 
    Row, 
    Typography, 
    Tag, 
    Modal, 
    Input, 
    Button, 
    TimePicker, 
    Checkbox, 
    Select,
    Dropdown,
    Tooltip,
} from 'antd'
import { SwapRightOutlined, UserOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin
import { Formik, Form as FormikForm } from 'formik'   // Import Formik form components
import { object, string, number } from 'yup' // Import Yup for form validation

import { useFilterStore } from '../../store'

import Submit from '../forms/SubmitWrapper' // Import SubmitWrapper component
import { CitySelect } from '../CitySelect' // Import CitySelect component
import generateName from '../../utils/name-creation' // Dummy name array generator
import { convertToHourTz, converToUTC, createWeekShift } from '../../utils/schedule-status'

dayjs.extend(utc)
dayjs.extend(timezone)

const { useToken } = theme
const { Text, Title, Link } = Typography

const getFilledHours = (end, start) => {
    const hoursDiff = dayjs(end, 'HH:mm').diff(dayjs(start, 'HH:mm'), 'hour', true)
    return hoursDiff
}

const shiftSchema = object().shape({
    capacity: number().required('Required'),
    start_time: string().required('Required'),
    end_time: string().required('Required'),
    city_id: number().required('Required'),
})

const items = [
    {
        key: 1,
        label: 'Edit',
    },
    {
        key: 2,
        label: 'Send to Draft',
    },
    {
        key: 3,
        danger: true,
        label: 'Delete',
    },
]

const generateNames = (numNames) => {
    const names = [];
    for (let i = 0; i < numNames; i++) {
      names.push(generateName());
    }
    return names;
  }
  
const namesArray = generateNames(30)

const ShiftCard = ({record, cardStyle, handleEdit, setEdit}) => {

    const onClick = ({ key }) => {
        if (key === '1') {
            handleEdit()
            setEdit(true)
        }
    }

    return (
        <div className="floating-component" style={{ position: 'absolute', top: -1, left: -1, zIndex: 999, width: 'calc(100% + 2px)' }}>
            <Card 
                style={cardStyle}
                bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 'calc(100%)', padding: 8 }}
            >
                <Row justify="end">
                    <Dropdown menu={{items, onClick }} >
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

const CellShift = ({display, record, day, setHoveredCell, isCellFilled, selectedDay}) => {
    //isCellFilled && console.log(record)
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const [selectedItems, setSelectedItems] = useState([]) // State to hold selected options
    const [edit, setEdit] = useState(false) // State to hold edit mode
    const filteredOptions = namesArray.filter((o) => !selectedItems.includes(o)) // Options to show in the dropdown
    const { token } = useToken()
    const [hours, setHours] = useState({
        start: record.start,
        end: record.end,
        diff: record.duration ? record.duration : 4
    });
    const [isHovering, setIsHovering] = useState( false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    //dayjs(record.start_time).tz(scheduleFilter.tz).format('HH:mm')
    //dayjs(record.end_time).tz(scheduleFilter.tz).format('HH:mm')
    //convertToHourTz(record.start_time, scheduleFilter.tz)
    //convertToHourTz(record.end_time, scheduleFilter.tz)
    const [shift, setShift] = useState({
        drivers: record.capacity || 0,
        start: record.start_time ? convertToHourTz(record.start_time, scheduleFilter.tz) : record.time,
        end: record.end_time ? convertToHourTz(record.end_time, scheduleFilter.tz) : null,
        city: Number(record.city_id) || Number(scheduleFilter.filter.city_id.replace('in|', '')),
        day: record.start_time ? dayjs(record.start_time).tz(scheduleFilter.tz).format('YYYY-MM-DD') : selectedDay,
    })
    const floatingComponentHeight = hours.diff * 57 + 2
//record.title && console.log(shift.start)
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
        //console.log(record)
        setIsHovering(true)
        showModal()
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
    console.log('Selected Day: ', shift)
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
                    <ShiftCard cardStyle={cardStyleConfig} record={shift} handleEdit={handleClick} setEdit={setEdit} />
                ) : (
                <>
                    {  display && (
                    <Tooltip title="Add shift">
                        <Button type="text" style={{ width: '100%', height: '100%', padding: 16 }} size="small" onClick={handleClick} icon={<PlusOutlined />} />
                    </Tooltip> 
                    )}
                        { isHovering && (
                            <ShiftCard cardStyle={cardStyleConfig} record={shift} handleEdit={handleClick} setEdit={setEdit} />
                        )}
                </>
                )}
            </div>
            <Formik
                initialValues={{
                    start_time: shift.start,
                    end_time: shift.end,
                    capacity: shift.drivers,
                    city_id: shift.city,
                }}
                validationSchema={shiftSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    values.start_time = converToUTC( shift.day, values.start_time, scheduleFilter.tz)
                    values.end_time = converToUTC(shift.day, values.end_time, scheduleFilter.tz)
                    values.is_recurring = false
                    values.capacity = Number(values.capacity)

                    console.log("payload: " , values)
                    /* await createWeekShift(values)
                    .then(() => {
                        setSubmitting(false)
                        setIsModalOpen(false)
                    }) */
                    setSubmitting(false)
                    setIsModalOpen(false)
                }}
            >
                {props => (
                    <FormikForm>
                        <Modal 
                            title="New Shift" 
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
                                <TimePicker.RangePicker 
                                    name="end"
                                    style={{ width: '100%' }} 
                                    format="HH:mm" 
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
                                <Checkbox 
                                    onChange={() => {
                                        props.setFieldValue('start_time', '00:00')
                                        props.setFieldValue('end_time', '23:59')
                                        handleHoursChange(['00:00', '23:59'])
                                    }}
                                >
                                    All Day
                                </Checkbox>
                                <CitySelect 
                                    defaultValue={props.values.city_id}    
                                    style={{ width: '100%' }}
                                    disabled
                                />
                                <Select
                                  mode="multiple"
                                  placeholder="Drivers"
                                  value={selectedItems}
                                  onChange={setSelectedItems}
                                  style={{
                                    width: '100%',
                                  }}
                                  options={filteredOptions.map((item) => ({
                                    value: item,
                                    label: item,
                                  }))}
                                />
                                <Input 
                                    name="capacity" 
                                    prefix={<UserOutlined />} 
                                    placeholder="Driver Limit" 
                                    type="number" 
                                    min={10} max={999} 
                                    defaultValue={props.values.capacity} 
                                    //onChange={(event) => {setShift({...shift, capacity: event.target.value})}} 
                                    onChange={(e) => {
                                        props.setFieldValue('capacity', e.target.value)
                                        setShift({...shift, drivers: e.target.value})
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

export default CellShift