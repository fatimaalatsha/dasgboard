import { useState } from 'react'
import { Card, Space, Row, Col, Typography, Tag, Tooltip, Popover, Button, theme } from 'antd'
import { DeleteOutlined, EditOutlined, FlagOutlined, LikeOutlined, DislikeOutlined, CalendarOutlined, ExceptionOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons'
import EditableText from '../../EditableText' // EditableText component for inline editing capacity
import { updateWeekShift } from '../../../utils/schedule-status'
import dayjs from 'dayjs'

const { Text, Title } = Typography
const { useToken } = theme

const WeekShiftCard = ({record, cardStyle, handleEdit, handleDelete, handleStatus, refetch }) => {
    const { token } = useToken()
    const [open, setOpen] = useState(false)

    const handleOpenChange = (newOpen) => {
      setOpen(newOpen);
    }

    const iconStyle = { 
        style: { color: token.colorTextDisabled, fontSize: 16 }
    }

    const content = (
        <Card 
            title={<Title level={4} style={{ marginTop: 10 }}>Shift Details</Title>}
            size="small"
            style={{ boxShadow: 'none' }}
            bordered={false} 
            extra={
                <Space>
                    <Tooltip title="Edit">
                        <Button 
                            onClick={() => {
                                setOpen(false)
                                handleEdit(true)
                            }} 
                            type="link" 
                            icon={<EditOutlined />} 
                        />
                    </Tooltip>
                    <Tooltip title={record.status === 'active' ? 'Deactivate' : 'Activate'}>
                        <Button 
                            onClick={() => handleStatus(record.status === 'active' ? 'inactive' : 'active')} 
                            type="link" 
                            icon={record.status === 'active' ? <DislikeOutlined /> : <LikeOutlined />} 
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button 
                            onClick={() => handleDelete()} 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                        />
                    </Tooltip>
                </Space>
            }
            headStyle={{ borderBottom: 'none' }}
        >
            <Space direction="vertical">
                <Row gutter={[16, 0]}>
                    <Col span={2}>
                        <CalendarOutlined {...iconStyle} />
                    </Col>
                    <Col span={22}>
                        <Text style={{ whiteSpace: 'nowrap' }}>{`${dayjs(record.day).format('dddd, MMMM DD')} ⋅ ${record.start} ➡ ${record.end}`}</Text>
                    </Col>
                </Row>
                <Row gutter={[16, 0]}>
                    <Col span={2}>
                        <UserOutlined  {...iconStyle} />
                    </Col>
                    <Col span={22}>
                        <Space style={{ display: 'flex', columnGap: 2, alignItems: 'baseline' }}>
                            <Text style={{ margin: 0 }}>{record.count}</Text>
                            <Text>/</Text>
                            <EditableText
                                value={record?.drivers}
                                name="capacity"
                                strong
                                updateCallback={ async (values) => {
                                    await updateWeekShift(values, record.shift_id)
                                    refetch()
                                }}
                            />
                        </Space>
                    </Col>
                </Row>
                <Row gutter={[16, 0]}>
                    <Col span={2}>
                        <DollarOutlined  {...iconStyle} />
                    </Col>
                    <Col span={22}>
                        <Text>{record.guarantee ? `$ ${record.guarantee}` : `No guarantee`}</Text>
                    </Col>
                </Row>
                {record.guarantee_specs && (
                    <Row gutter={[16, 0]}>
                        <Col span={2}>
                            <ExceptionOutlined  {...iconStyle} />
                        </Col>
                        <Col span={22}>
                            <Text style={{ whiteSpace: 'nowrap' }}>{record.guarantee_specs}</Text>
                        </Col>
                    </Row>
                )}
                <Row gutter={[16, 0]}>
                    <Col span={2}>
                        <FlagOutlined {...iconStyle} />
                    </Col>
                    <Col span={22}>
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
                    </Col>
                </Row>
            </Space>
        </Card>
    )

    return (
        <div className="floating-component" style={{ position: 'absolute', top: -1, left: -1, zIndex: 999, width: 'calc(100% + 2px)' }}>
            <Popover open={open} onOpenChange={handleOpenChange} content={content} trigger="click">
                <Card 
                    style={cardStyle}
                    bodyStyle={{ padding: '4px 8px' }}
                    onClick={() => setOpen(true)}
                >
                    <Space direction="vertical" style={{ display: 'flex', width: '100%', alignItems: 'flex-start', rowGap: 2 }}>
                        <Text strong style={{ fontSize: 16 }}>{`${record.count || 0} \/ ${record.drivers}`}</Text>
                        { record.guarantee !== 0 && <Text>${record.guarantee}</Text>}
                        <Text>{`${record.start} ➡ ${record.end}`}</Text>
                    </Space>
                </Card>
            </Popover>
        </div>
    )
}

export default WeekShiftCard