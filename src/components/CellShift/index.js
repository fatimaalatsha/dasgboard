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

const CellShift = ({display, record, day, setHoveredCell, isCellFilled}) => {
    const { token } = useToken()
    const [hours, setHours] = useState(record.start ? getFilledHours(record.end, record.start) : 4);
    const [isHovering, setIsHovering] = useState( false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [shift, setShift] = useState({
        drivers: 10,
        start: record.start || '00:00',
        end: record.end || '00:00',
    })
   /*  Object.entries(record).forEach(([key, value]) => {
        if (daysOfWeek.includes(key) && value.day === day.toString()) {
            console.log('here')
        }
    }) */
    const floatingComponentHeight = hours * 57 + 47

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
        setIsHovering(!isHovering)
        showModal()
    }

    const handleHoursChange = (time, timeString) => {
        //console.log(timeString[0])
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
                        bodyStyle={{ display: 'flex', gap: 16, flexDirection: 'column', justifyContent: 'flex-end', height: 'calc(100% - 10px)', padding: 8 }}
                    >
                        <Row style={{ display: 'flex', height: '100%'}}>
                        <Space direction="vertical" style={{ display: 'flex', width: '100%', alignItems: 'flex-end' }}>
                            <Title level={4} style={{ margin: 0, color: 'inherit' }}>{`0 / ${record?.drivers}`}</Title>
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
            {/* <div className="clickable-div" style={{ width: '100%', height: 10, }} ></div> */}
            {display && <Button size="small" onClick={handleClick}>New Shift</Button>}
            {isHovering && (
                <>
                <div className="floating-component" style={{ position: 'absolute', top: 5, left: 5, zIndex: 999, width: 'calc(100% - 10px)' }}>
                    {/* <div className="content" style={{ height: floatingComponentHeight, float: 'left', border: "1px solid green", width: '50%' }}>
                        <p>Shift</p>
                        <input type="number" value={hours} min={1} max={8} onChange={handleHoursChange} />
                    </div>
                    <div className="content" style={{ height: floatingComponentHeight, float: 'left', border: "1px solid blue", width: '50%' }}>
                        <p>Shift</p>
                    </div> */}
                    <Card 
                        style={cardStyleConfig}
                        bodyStyle={{ display: 'flex', gap: 16, flexDirection: 'column', justifyContent: 'flex-end', height: 'calc(100% - 10px)', padding: 8 }}
                    >
                        <Row style={{ display: 'flex', height: '100%'}}>
                        <Space direction="vertical" style={{ display: 'flex', width: '100%', alignItems: 'flex-end' }}>
                            <Title level={4} style={{ margin: 0, color: 'inherit' }}>{`0 / ${shift?.drivers}`}</Title>
                            <Space>
                                <Text strong style={{ color: 'inherit' }}>{shift?.start}</Text>
                                <ArrowRightOutlined />
                                <Text strong style={{ color: 'inherit' }}>{shift?.end}</Text>
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
                        {/* <Row>
                            <Group>
                                <Avatar src="https://joesch.moe/api/v1/random" />
                                <Avatar style={{ backgroundColor: '#f56a00' }}>K</Avatar>
                                <Avatar style={{ backgroundColor: '#87d068' }}>U</Avatar>
                                <Avatar style={{ backgroundColor: '#1890ff', }}>A</Avatar>
                            </Group>
                        </Row> */}
                    </Card>
                </div>
                </>
            )}
            </>
            )}
                </div>
            <Modal title="New Shift" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <Space direction="vertical" size={16}>
                    <Input.Group compact>
                    {/* <DatePicker style={{ width: '30%' }} defaultValue={dayjs()} format="ddd D MMM" /> */}
                    <TimePicker.RangePicker 
                        style={{ width: '100%' }} 
                        format="HH:mm" 
                        defaultValue={[dayjs(record.time, 'HH:mm'), null]} 
                        disabled={[true, false]} 
                        onChange={handleHoursChange} 
                        disabledTime={(current) => {
                            return {
                                disabledHours: () => {
                                    const hours = []
                                    for (let i = 0; i < 24; i++) {
                                        if (i < dayjs(record.time, 'HH:mm').hour()) {
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

export default CellShift