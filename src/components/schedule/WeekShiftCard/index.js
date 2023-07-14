import { Card, Space, Row, Typography, Tag, Dropdown, Tooltip, Popover } from 'antd'
import { SwapRightOutlined, MoreOutlined, DeleteOutlined, CloseOutlined  } from '@ant-design/icons'
import EditableText from '../../EditableText' // EditableText component for inline editing capacity
import { updateWeekShift } from '../../../utils/schedule-status'

const { Text, Title, Link } = Typography

const WeekShiftCard = ({record, cardStyle, handleEdit, handleDelete, handleStatus, refetch }) => {

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

    const content = (
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
                        <Title level={1} style={{ margin: 0 }}>{record.count}</Title>
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
    )

    return (
        <div className="floating-component" style={{ position: 'absolute', top: -1, left: -1, zIndex: 999, width: 'calc(100% + 2px)' }}>
            <Popover content={content} trigger="click">
                <Card 
                    style={cardStyle}
                    bodyStyle={{ padding: '4px 8px' }}
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