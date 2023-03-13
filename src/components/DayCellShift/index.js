import { useState } from 'react'
import { 
    Card, 
    theme, 
    Space, 
    Row, 
    Typography, 
    Modal, 
    Input, 
    Button, 
    TimePicker, 
    Checkbox, 
    Select, 
    Tooltip, 
    Dropdown 
} from 'antd'
import { ArrowRightOutlined, PlusOutlined, MoreOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { useToken } = theme
const { Text, Title } = Typography
//const { Group } = Avatar

//const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

const getFilledHours = (end, start) => {
    const hoursDiff = dayjs(end, 'HH:mm').diff(dayjs(start, 'HH:mm'), 'hour', true)
    return hoursDiff
}

const items = [
    {
        key: 1,
        label: 'No Show',
    },
    {
        key: 2,
        label: 'Early In',
    },
    {
        key: 3,
        label: 'Early Out',
    },
    {
        key: 4,
        label: 'Late Out',
    },
    {
        key: 5,
        label: 'Edit',
    }
]

const ShiftCard = ({ record, cardStyle }) => {
    return (
        <div className="floating-component" style={{ position: 'absolute', top: -1, left: -1, zIndex: 999, height: '100%' }}>
            <Card 
                style={cardStyle}
                bodyStyle={{ display: 'flex', height: '100%', flexDirection: 'column', justifyContent: 'flex-end', padding: 4 }}
            >
                <Row style={{ display: 'flex', height: '100%'}}>
                <Space style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                        <Text strong style={{ color: 'inherit' }}>{record?.start}</Text>
                        <ArrowRightOutlined />
                        <Text strong style={{ color: 'inherit' }}>{record?.end}</Text>
                    </Space>
                    <Dropdown menu={{items}} >
                        <a onClick={(e) => e.preventDefault()}>
                        <Space>
                            <MoreOutlined />
                        </Space>
                        </a>
                    </Dropdown>
                </Space>
                </Row>
            </Card>
        </div>
    )
}

const DayCellShift = ({display, record, day, setHoveredCell, isCellFilled, hour}) => {
    const { token } = useToken()
    const [hours, setHours] = useState(record.start ? getFilledHours(record.end, record.start) : 4);
    const [isHovering, setIsHovering] = useState( false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [shift, setShift] = useState({
        drivers: 10,
        start: record.start || '00:00',
        end: record.end || '00:00',
    })
//console.log(hour)
    const floatingComponentWidth = hours * 60.45 

    const cardStyleConfig = {
        backgroundColor: token.colorSuccessBg,
        borderColor: token.colorSuccessBorder,
        width: floatingComponentWidth,
        height: 'calc(100% + 2px)'
    }
  
    const handleClick = () => {
        setIsHovering(!isHovering)
        showModal()
    }

    const handleHoursChange = (time, timeString) => {
        setShift({
            ...shift,
            start: timeString[0],
            end: timeString[1],
        })
        const hoursDiff = dayjs(timeString[1], 'HH:mm').diff(dayjs(timeString[0], 'HH:mm'), 'hour', true)
        setHours(hoursDiff)
        setHoveredCell({ time: timeString[0], day: day })
    }

    const showModal = () => {
      setIsModalOpen(true)
    }

    const handleOk = () => {
      setIsModalOpen(false)
    }

    const handleCancel = () => {
      setIsModalOpen(false)
      setIsHovering(!isHovering)
    }

    return (
        <>
        <div className="container" style={{ minHeight: 24}}>
            { isCellFilled ? (
                    <ShiftCard cardStyle={cardStyleConfig} record={record}/>
            ) : (
            <>
                { display && (
                    <Tooltip title="Add shift">
                        <Button type="text" style={{ width: '100%', height: '100%', padding: 8 }} size="small" onClick={handleClick} icon={<PlusOutlined />} />
                    </Tooltip>
                )}
                { isHovering && (
                    <ShiftCard cardStyle={cardStyleConfig} record={shift}/>
                )}
            </>
            )}
                </div>
            <Modal title="New Shift" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <Space direction="vertical" size={16}>
                    <Input.Group compact>
                    <TimePicker.RangePicker 
                        style={{ width: '100%' }} 
                        format="HH:mm" 
                        defaultValue={[dayjs(hour, 'HH:mm'), null]} 
                        disabled={[true, false]} 
                        onChange={handleHoursChange}
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
                    </Input.Group>
                    <Checkbox>All Day</Checkbox>
                    <Select
                        placeholder="Frequency"
                        optionFilterProp="children"
                        style={{ width: '100%' }}
                        options={[
                            { label: 'Does not repeat', value: 'Does not repeat' },
                            { label: 'Daily', value: 'Daily' },
                            { label: 'Weekly on Friday', value: 'Weekly on Friday' },
                            { label: 'Montly on the second Friday', value: 'Montly on the second Friday' },
                            { label: 'Annualy on February 24', value: 'Annualy on February 24' },
                            { label: 'Every weekday (Mon to Fri)', value: 'Every weekday (Mon to Fri)' },
                            { label: 'Custom...', value: 'Custom...' },
                        ]}
                    />
                    <Select
                        placeholder="City"
                        optionFilterProp="children"
                        style={{ width: '100%' }}
                        options={[
                            { label: 'Thunder Bay', value: 'Thunder Bay' },
                            { label: 'Toronto', value: 'Toronto' },
                        ]}
                    />
                    <Select
                        placeholder="Drivers"
                        optionFilterProp="children"
                        style={{ width: '100%' }}
                        options={[
                            { label: 'Thunder Bay', value: 'Thunder Bay' },
                            { label: 'Toronto', value: 'Toronto' },
                        ]}
                    />
                    <Input placeholder="Driver Limit" type="number" min={10} max={50} defaultValue={shift?.drivers} onChange={(event) => {setShift({...shift, drivers: event.target.value})}} />
                </Space>
            </Modal>
        </>
    )
}

export default DayCellShift