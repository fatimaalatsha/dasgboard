import { useState } from 'react'
import { Card, theme, Space, Row, Typography, Tag, Modal, Input, Button, TimePicker, Checkbox, Select } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { useToken } = theme
const { Text, Title } = Typography
//const { Group } = Avatar

//const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

const getFilledHours = (end, start) => {
    const hoursDiff = dayjs(end, 'HH:mm').diff(dayjs(start, 'HH:mm'), 'hour')
    return hoursDiff
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
    const floatingComponentWidth = hours * 60.45 + 55.45

    const cardStyleConfig = {
        backgroundColor: token.colorSuccessBg,
        borderColor: token.colorSuccessBorder,
        width: floatingComponentWidth,
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
        const hoursDiff = dayjs(timeString[1], 'HH:mm').diff(dayjs(timeString[0], 'HH:mm'), 'hour')
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
                <div className="floating-component" style={{ position: 'absolute', top: 5, left: 5, zIndex: 999, width: 'calc(100% - 10px)' }}>
                    <Card 
                        style={cardStyleConfig}
                        bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 'calc(100% - 10px)', padding: 4 }}
                    >
                        <Row style={{ display: 'flex', height: '100%'}}>
                        <Space direction="vertical" style={{ display: 'flex', width: '100%', alignItems: 'flex-end' }}>
                            <Space>
                                <Text strong style={{ color: 'inherit' }}>{record?.start}</Text>
                                <ArrowRightOutlined />
                                <Text strong style={{ color: 'inherit' }}>{record?.end}</Text>
                            </Space>
                        </Space>
                        </Row>
                        <Row>
                            <Space>
                                <Tag color="cyan">0</Tag>
                                <Tag color="magenta">0</Tag>
                                <Tag color="gold">0</Tag>
                            </Space>
                        </Row>
                    </Card>
                </div>
            ) : (
            <>
                {display && <Button size="small" onClick={handleClick}>New Shift</Button>}
                {isHovering && (
                    <div className="floating-component" style={{ position: 'absolute', top: 5, left: 5, zIndex: 999, width: 'calc(100% - 10px)' }}>
                        <Card 
                            style={cardStyleConfig}
                            bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 'calc(100% - 10px)', padding: 4 }}
                        >
                            <Row style={{ display: 'flex', height: '100%'}}>
                            <Space direction="vertical" style={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
                                <Space>
                                    <Text strong style={{ color: 'inherit' }}>{shift?.start}</Text>
                                    <ArrowRightOutlined />
                                    <Text strong style={{ color: 'inherit' }}>{shift?.end}</Text>
                                </Space>
                            </Space>
                            </Row>
                        </Card>
                    </div>
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
                        disabledTime={(current) => {
                            return {
                                disabledHours: () => {
                                    const hours = []
                                    for (let i = 0; i < 24; i++) {
                                        if (i < dayjs(hour, 'HH:mm').hour()) {
                                            hours.push(i)
                                        }
                                    }
                                    return hours
                                }
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